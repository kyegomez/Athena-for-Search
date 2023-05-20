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

    // const sources = (await Promise.allSettled(
    //   finalLinks.map(async (link) => {
    //     try {
    //       const response = await fetch(link);
    //       const html = await response.text();
    //       const dom = new JSDOM(html);
    //       const doc = dom.window.document;
    //       const parsed = new Readability(doc).parse();

    //       if (parsed) {
    //         let sourceText = cleanSourceText(parsed.textContent, 1500);
    //         return { url: link, text: sourceText };
    //       }
    //     } catch (err) {
    //       console.log(err);
    //       return undefined;
    //     }
    //   })
    // )) as PromiseSettledResult<Source | undefined>[];

    // Replace the Promise.allSettled block with the following code
    
    const tasks = finalLinks.map((link) => () => fetchAndProcessLink(link));
    const sources = (await workerPool.execute(tasks)) as Source[];

    // const filteredSources = sources
    //   .filter((source) => source.status === "fulfilled")
    //   .map((source) => (source as PromiseFulfilledResult<Source | undefined>).value as Source);

    const filteredSources = sources.filter((source) => source !== undefined);


    cache.set(query, { sources: filteredSources });
    res.status(200).json({ sources: filteredSources });
  } catch (err) {
    console.log(err);
    res.status(500).json({ sources: [] });
  }
};

export default searchHandler;


//////////////


// //////////////===================================v2
// import { OpenAIModel, Source } from "@/types";
// import { Readability } from "@mozilla/readability";
// import { JSDOM } from "jsdom";
// import type { NextApiRequest, NextApiResponse } from "next";
// import { cleanSourceText } from "../../utils/sources";
// import NodeCache from "node-cache";
// import { WorkerPool } from "@/utils/workerpool";
// import { htmlToText } from "html-to-text";
// import { google } from "googleapis";

// type Data = {
//   sources: Source[];
// };
// async function searchAPI(query: string): Promise<any> {
//   const apiKey = process.env.GOOGLE_API_KEY;
//   const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

//   const customsearch = google.customsearch("v1");

//   const response = await customsearch.cse.list({
//     cx: searchEngineId,
//     q: query,
//     auth: apiKey,
//     num: 50,
//   });

//   return response.data;
// }

// function extractLinks(searchResults: any): string[] {
//   const links: string[] = [];
//   if (searchResults.items) {
//     searchResults.items.forEach((result: any) => {
//       links.push(result.link);
//     });
//   }
//   return links;
// }

// async function fetchAndProcessLink(link: string): Promise<Source | undefined> {
//   try {
//     const response = await fetch(link);
//     const html = await response.text();
//     const dom = new JSDOM(html);
//     const doc = dom.window.document;
//     const parsed = new Readability(doc).parse();

//     if (parsed) {
//       const extractedText = extractText(doc);
//       let sourceText = cleanSourceText(extractedText, 1500);
//       return { url: link, text: sourceText };
//     }
//   } catch (err) {
//     console.log(err);
//     return undefined;
//   }
// }

// function extractText(doc: Document): string {
//   const html = doc.documentElement.outerHTML;
//   const text = htmlToText(html, {
//     baseElements: {
//       selectors: ['body'],
//       orderBy: 'selectors',
//       returnDomByDefault: true,
//     },
//     decodeEntities: true,
//     encodeCharacters: {
//       '<': '&lt;',
//       '>': '&gt;',
//       '&': '&amp;',
//       '\'': '&apos;',
//       '"': '&quot;',
//     },
//     wordwrap: null,
//     selectors: [
//       { selector: 'a', options: { linkBrackets: false } },
//       { selector: 'img', format: 'skip' },
//     ],
//   });
//   return text;
// }

// const cache = new NodeCache();
// const workerPool = new WorkerPool(4);
// const searchHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
//   try {
//     const { query, model } = req.body as {
//       query: string;
//       model: OpenAIModel;
//     };

//     const sourceCount = 4;

//     const cachedSources = cache.get<Data>(query);
//     if (cachedSources) {
//       res.status(200).json(cachedSources);
//       return;
//     }

//     const searchResults = await searchAPI(query);
//     const links = extractLinks(searchResults);

//     const uniqueLinks = new Set<string>();

//     for (const link of links) {
//       const domain = new URL(link).hostname;
//       const excludeList = ["google", "facebook", "twitter", "instagram", "youtube", "tiktok"];

//       if (excludeList.some((site) => domain.includes(site))) continue;
//       if (!uniqueLinks.has(link)) {
//         uniqueLinks.add(link);
//         if (uniqueLinks.size >= sourceCount) {
//           break;
//         }
//       }
//     }

//     const finalLinks = Array.from(uniqueLinks);

//     const tasks = finalLinks.map((link) => () => fetchAndProcessLink(link));
//     const sources = (await workerPool.execute(tasks)) as Source[];

//     const filteredSources = sources.filter((source) => source !== undefined);

//     cache.set(query, { sources: filteredSources });
//     res.status(200).json({ sources: filteredSources });
//   } catch (err) {
//     console.error("Error in searchHandler:", err);
//     res.status(500).json({ sources: []});
//   }
// };
// export default searchHandler;



// /////////////===================================> v3
// import { OpenAIModel, Source } from "@/types";
// import { Readability } from "@mozilla/readability";
// import * as cheerio from "cheerio";
// import { JSDOM } from "jsdom";
// import type { NextApiRequest, NextApiResponse } from "next";
// import { cleanSourceText } from "../../utils/sources";
// import NodeCache from "node-cache";
// import { WorkerPool } from "@/utils/workerpool";
// import { htmlToText } from "html-to-text";
// // import { WebSearchClient } from "@azure/cognitiveservices-websearch";
// // import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";


// type Data = {
//   sources: Source[];
// };


// function extractText(doc: Document): string {
//   const html = doc.documentElement.outerHTML;
//   const text = htmlToText(html, {
//     baseElements: {
//       selectors: ['body'],
//       orderBy: 'selectors',
//       returnDomByDefault: true,
//     },
//     decodeEntities: true,
//     encodeCharacters: {
//       '<': '&lt;',
//       '>': '&gt;',
//       '&': '&amp;',
//       '\'': '&apos;',
//       '"': '&quot;',
//     },
//     wordwrap: null,
//     selectors: [
//       { selector: 'a', options: { linkBrackets: false } },
//       { selector: 'img', format: 'skip' },
//     ],
//   });
//   return text;
// }
// async function fetchWithRetry(link: string, retries: number, delay: number): Promise<Response | undefined> {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const response = await fetch(link, { signal: new AbortController().signal });
//       if (response.ok) {
//         return response;
//       }
//     } catch (err) {
//       console.log(`Error fetching link: ${link}, attempt: ${i + 1}, error: ${err}`);
//       if (i < retries - 1) {
//         await new Promise((resolve) => setTimeout(resolve, delay));
//       }
//     }
//   }
//   return undefined;
// }

// async function fetchAndProcessLink(link: string, retries: number = 3, delay: number = 1000): Promise<Source | undefined> {
//   try {
//     const response = await fetchWithRetry(link, retries, delay);
//     if (!response) {
//       console.log(`Failed to fetch link after ${retries} attempts: ${link}`);
//       return undefined;
//     }
//     const html = await response.text();
//     const dom = new JSDOM(html);
//     const doc = dom.window.document;
//     const parsed = new Readability(doc).parse();

//     if (parsed) {
//       const extractedText = extractText(doc);
//       let sourceText = cleanSourceText(extractedText, 1500);
//       return { url: link, text: sourceText };
//     }
//   } catch (err) {
//     console.log(`Error processing link: ${link}, error: ${err}`);
//     return undefined;
//   }
// }

// // ... (rest of the code remains unchanged)
// const cache = new NodeCache();

// const workerPool = new WorkerPool(4);

// const searchHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
//   try {
//     const { query, model } = req.body as {
//       query: string;
//       model: OpenAIModel;
//     };

//     const sourceCount = 4;

//     const cachedSources = cache.get<Data>(query);
//     if (cachedSources) {
//       res.status(200).json(cachedSources);
//       return;
//     }

//     const response = await fetchWithRetry(`https://www.google.com/search?q=${query}`, 3, 1000);
//     if (!response) {
//       console.log(`Failed to fetch search results after 3 attempts: ${query}`);
//       res.status(500).json({ sources: [] });
//       return;
//     }
//     const html = await response.text();
//     const $ = cheerio.load(html);
//     const linkTags = $("a");

//      let links: string[] = [];

//     linkTags.each((i, link) => {
//       const href = $(link).attr("href");

//       if (href && href.startsWith("/url?q=")) {
//         const cleanedHref = href.replace("/url?q=", "").split("&")[0];

//         if (!links.includes(cleanedHref)) {
//           links.push(cleanedHref);
//         }
//       }
//     });

//     const uniqueLinks = new Set<string>();

//     for (const link of links) {
//       const domain = new URL(link).hostname;
//       const excludeList = ["google", "facebook", "twitter", "instagram", "youtube", "tiktok"];

//       if (excludeList.some((site) => domain.includes(site))) continue;
//       if (!uniqueLinks.has(link)) {
//         uniqueLinks.add(link);
//         if (uniqueLinks.size >= sourceCount) {
//           break;
//         }
//       }
//     }

//     const finalLinks = Array.from(uniqueLinks);



//     const tasks = finalLinks.map((link) => () => fetchAndProcessLink(link));
//     const sources = (await workerPool.execute(tasks)) as Source[];

//     const filteredSources = sources.filter((source) => source !== undefined);

//     // // Add fallback sources if not enough sources are found
    // if (filteredSources.length < sourceCount) {
    //   const fallbackSources: Source[] = [
    //     // Add your fallback sources here
    //   ];
    //   filteredSources.push(...fallbackSources.slice(0, sourceCount - filteredSources.length));
    // }

//     cache.set(query, { sources: filteredSources });
//     res.status(200).json({ sources: filteredSources });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ sources: [] });
//   }
// };

// export default searchHandler;








///////-----------------------------v4 

/////////////===================================> v3
// import { OpenAIModel, Source } from "@/types";
// import { Readability } from "@mozilla/readability";
// import * as cheerio from "cheerio";
// import { JSDOM } from "jsdom";
// import type { NextApiRequest, NextApiResponse } from "next";
// import { cleanSourceText } from "../../utils/sources";
// import NodeCache from "node-cache";
// import { WorkerPool } from "@/utils/workerpool";
// import { htmlToText } from "html-to-text";
// // import { WebSearchClient } from "@azure/cognitiveservices-websearch";
// // import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
// import https from "https";

// type Data = {
//   sources: Source[];
// };

// const BING_API_KEY: any = process.env.BING_API_KEY; // Replace with your Bing API key


// function extractText(doc: Document): string {
//   const html = doc.documentElement.outerHTML;
//   const text = htmlToText(html, {
//     baseElements: {
//       selectors: ['body'],
//       orderBy: 'selectors',
//       returnDomByDefault: true,
//     },
//     decodeEntities: true,
//     encodeCharacters: {
//       '<': '&lt;',
//       '>': '&gt;',
//       '&': '&amp;',
//       '\'': '&apos;',
//       '"': '&quot;',
//     },
//     wordwrap: null,
//     selectors: [
//       { selector: 'a', options: { linkBrackets: false } },
//       { selector: 'img', format: 'skip' },
//     ],
//   });
//   return text;
// }
// async function fetchWithRetry(link: string, retries: number, delay: number): Promise<Response | undefined> {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const response = await fetch(link, { signal: new AbortController().signal });
//       if (response.ok) {
//         return response;
//       }
//     } catch (err) {
//       console.log(`Error fetching link: ${link}, attempt: ${i + 1}, error: ${err}`);
//       if (i < retries - 1) {
//         await new Promise((resolve) => setTimeout(resolve, delay));
//       }
//     }
//   }
//   return undefined;
// }

// async function fetchAndProcessLink(link: string, retries: number = 3, delay: number = 1000): Promise<Source | undefined> {
//   try {
//     const response = await fetchWithRetry(link, retries, delay);
//     if (!response) {
//       console.log(`Failed to fetch link after ${retries} attempts: ${link}`);
//       return undefined;
//     }
//     const html = await response.text();
//     const dom = new JSDOM(html);
//     const doc = dom.window.document;
//     const parsed = new Readability(doc).parse();

//     if (parsed) {
//       const extractedText = extractText(doc);
//       let sourceText = cleanSourceText(extractedText, 1500);
//       return { url: link, text: sourceText };
//     }
//   } catch (err) {
//     console.log(`Error processing link: ${link}, error: ${err}`);
//     return undefined;
//   }
// }

// //sdsd
// function bingWebSearch(query: string): Promise<any> {
//   return new Promise((resolve, reject) => {
//     https.get(
//       {
//         hostname: "api.cognitive.microsoft.com",
//         path: "/bing/v7.0/search?q=" + encodeURIComponent(query),
//         headers: { "Ocp-Apim-Subscription-Key": BING_API_KEY },
//       },
//       (res) => {
//         if (res.statusCode !== 200) {
//           console.log(`Bing API request failed with status code: ${res.statusCode}`);
//           reject(new Error(`Bing API request failed with status code: ${res.statusCode}`));
//           return;
//         }

//         let body = "";
//         res.on("data", (part) => (body += part));
//         res.on("end", () => {
//           resolve(JSON.parse(body));
//         });
//         res.on("error", (e) => {
//           console.log("Error: " + e.message);
//           reject(e);
//         });
//       }
//     ).on("error", (e) => {
//       console.log("Error: " + e.message);
//       reject(e);
//     });
//   });
// }


// // ... (rest of the code remains unchanged)
// const cache = new NodeCache();

// const workerPool = new WorkerPool(4);

// const searchHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
//   try {
//     const { query, model } = req.body as {
//       query: string;
//       model: OpenAIModel;
//     };

//     const sourceCount = 4;

    
//     const cachedSources = cache.get<Data>(query);
//     if (cachedSources) {
//       res.status(200).json(cachedSources);
//       return;
//     }

//     // Replace Google search with Bing API call
//     const bingResponse = await bingWebSearch(query);
//     const bingResults = bingResponse.webPages?.value;

//     if (!bingResults) {
//       console.log(`Failed to fetch search results: ${query}`);
//       res.status(500).json({ sources: [] });
//       return;
//     }

//     const uniqueLinks = new Set<string>();

//     for (const result of bingResults) {
//       const link = result.url;
//       const domain = new URL(link).hostname;
//       const excludeList = ["google", "facebook", "twitter", "instagram", "youtube", "tiktok"];

//       if (excludeList.some((site) => domain.includes(site))) continue;
//       if (!uniqueLinks.has(link)) {
//         uniqueLinks.add(link);
//         if (uniqueLinks.size >= sourceCount) {
//           break;
//         }
//       }
//     }

//     const finalLinks = Array.from(uniqueLinks);


//     const tasks = finalLinks.map((link) => () => fetchAndProcessLink(link));
//     const sources = (await workerPool.execute(tasks)) as Source[];

//     const filteredSources = sources.filter((source) => source !== undefined);

//     // // Add fallback sources if not enough sources are found
//     // if (filteredSources.length < sourceCount) {
//     //   const fallbackSources: Source[] = [
//     //     // Add your fallback sources here
//     //   ];
//     //   filteredSources.push(...fallbackSources.slice(0, sourceCount - filteredSources.length));
//     // }

//     cache.set(query, { sources: filteredSources });
//     res.status(200).json({ sources: filteredSources });
//   } catch (err) {
//     console.log(`errorrrrrrr ${err}`);
//     res.status(500).json({ sources: [] });
//   }
// };

// export default searchHandler;