
// /pages/api/sources.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Source } from "@/types";
import { cleanSourceText } from "@/utils/sources";
import { google } from "googleapis";
import cheerio from "cheerio";
import { OpenAIModel } from "@/types";
import { WorkerPool } from "@/utils/workerpool";
import fetch from "node-fetch"
import pLimit from "p-limit";

const customsearch = google.customsearch("v1");

const workerPool = new WorkerPool(5);
const concurrencyLimit = pLimit(5);

type Data = {
  sources: Source[];
};
const searchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const { query, model } = req.body as {
    query: string;
    model: OpenAIModel;
  };

  const api_key: any = process.env.GOOGLE_API_KEY;
  const cx: any = process.env.GOOGLE_SEARCH_ENGINE_ID;
  const sourceCount = 5;

  try {
    let links: string[] = [];

    const result = await customsearch.cse.list({
      auth: api_key,
      cx: cx,
      q: query,
      num: sourceCount,
      fields: "items(title,htmlSnippet,link)",
      safe: "active",
    });

    console.log(`result: ${JSON.stringify(result)}`);

    console.log("Request url", result.config.url);

    const items: any = result.data.items;

    if (!items || items.length === 0) {
      throw new Error("No results found");
    }

    // Create tasks for fetching and parsing the data from the URLs using cheerio.
    const tasks = items.map(
      (item: { title: string; htmlSnippet: string; link: string }) => {
        return concurrencyLimit(async () => {
          const link = item.link;

          // Clean the HTML snippet from the item
          let snippetText = item.htmlSnippet.replace(/<\/?[^>]+(>|$)/g, "");

          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => {
              controller.abort();
            }, 1000); // Set a 5-second timeout for fetch requests

            const response = await fetch(link, { signal: controller.signal });
            clearTimeout(timeout);

            const html = await response.text();
            const $ = cheerio.load(html);

            // Extract the text content and header using cheerio
            const bodyText = $("body").text();
            const header = $("h1").text();

            // Clean the text content and header
            const cleanedBodyText = cleanSourceText(bodyText);
            const cleanedHeader = cleanSourceText(header);

            // Concatenate the snippet, header and the body text
            const combinedText = snippetText + " " + cleanedHeader + " " + cleanedBodyText;

            return { url: link, text: combinedText };
          } catch (err) {
            console.log(`Error fetching URL: ${link}`);
            // Return snippetText in case of a fetch error
            return { url: link, text: snippetText };
          }
        });
      }
    );

    // Use Promise.all() to execute the tasks concurrently.
    const sources = await Promise.all(tasks);

    console.log(`Sources: ${JSON.stringify(sources)}`);

    const filteredSources = sources.filter((source) => source !== undefined);

    for (const source of filteredSources) {
      source.text = source.text.slice(0, 300);
    }

    console.log(`Sources: ${JSON.stringify(filteredSources)}`);

    res.status(200).json({ sources: filteredSources });
  } catch (err) {
    console.log(err);
    res.status(500).json({ sources: [] });
  }
};

export default searchHandler;