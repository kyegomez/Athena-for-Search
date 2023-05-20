import { OpenAIModel, Source } from "@/types";
import { Readability } from "@mozilla/readability";
import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";
import type { NextApiRequest, NextApiResponse } from "next";
import { cleanSourceText } from "../../utils/sources";
import NodeCache from "node-cache";
import { WorkerPool } from "@/utils/workerpool";
import { htmlToText } from "html-to-text";


type Data = {
  sources: Source[];
};

async function fetchAndProcessLink(link: string): Promise<Source | undefined> {
  try {
    const response = await fetch(link);
    if (!response.ok) {
      console.log(`Error fetching link: ${link}, status: ${response.status}`);
      return undefined;
    }
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const parsed = new Readability(doc).parse();

    if (parsed) {
      const extractedText = extractText(doc);
      let sourceText = cleanSourceText(extractedText, 1500);
      return { url: link, text: sourceText };
    }
  } catch (err) {
    console.log(`Error processing link: ${link}, error: ${err}`);
    return undefined;
  }
}


function extractText(doc: Document): string {
  const html = doc.documentElement.outerHTML;
  const text = htmlToText(html, {
    baseElements: {
      selectors: ['body'],
      orderBy: 'selectors',
      returnDomByDefault: true,
    },
    decodeEntities: true,
    encodeCharacters: {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '\'': '&apos;',
      '"': '&quot;',
    },
    wordwrap: null,
    selectors: [
      { selector: 'a', options: { linkBrackets: false } },
      { selector: 'img', format: 'skip' },
    ],
  });
  return text;
}

const cache = new NodeCache();
const workerPool = new WorkerPool(4);

const searchHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  try {
    const { query, model } = req.body as {
      query: string;
      model: OpenAIModel;
    };

    const sourceCount = 4;

    const cachedSources = cache.get<Data>(query);
    if (cachedSources) {
      res.status(200).json(cachedSources);
      return;
    }

    const response = await fetch(`https://www.google.com/search?q=${query}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    const linkTags = $("a");

    let links: string[] = [];

    linkTags.each((i, link) => {
      const href = $(link).attr("href");

      if (href && href.startsWith("/url?q=")) {
        const cleanedHref = href.replace("/url?q=", "").split("&")[0];

        if (!links.includes(cleanedHref)) {
          links.push(cleanedHref);
        }
      }
    });

    const uniqueLinks = new Set<string>();

    for (const link of links) {
      const domain = new URL(link).hostname;
      const excludeList = ["google", "facebook", "twitter", "instagram", "youtube", "tiktok"];

      if (excludeList.some((site) => domain.includes(site))) continue;
      if (!uniqueLinks.has(link)) {
        uniqueLinks.add(link);
        if (uniqueLinks.size >= sourceCount) {
          break;
        }
      }
    }

    const finalLinks = Array.from(uniqueLinks);

    
    const tasks = finalLinks.map((link) => () => fetchAndProcessLink(link));
    const sources = (await workerPool.execute(tasks)) as Source[];

    const filteredSources = sources.filter((source) => source !== undefined);


    cache.set(query, { sources: filteredSources });
    res.status(200).json({ sources: filteredSources });
  } catch (err) {
    console.log(err);
    res.status(500).json({ sources: [] });
  }
};

export default searchHandler;

