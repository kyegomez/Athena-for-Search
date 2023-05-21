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







// import { OpenAIModel, Source } from "@/types";
// import { Readability } from "@mozilla/readability";
// import * as cheerio from "cheerio";
// import { JSDOM } from "jsdom";
// import type { NextApiRequest, NextApiResponse } from "next";
// import { cleanSourceText } from "../../utils/sources";
// import NodeCache from "node-cache";
// import { WorkerPool } from "@/utils/workerpool";
// import { htmlToText } from "html-to-text";

// type Data = {
//   sources: Source[];
// };

// async function fetchAndProcessLink(link: string): Promise<Source | undefined> {
//   try {
//     const response = await fetch(link);
//     if (!response.ok) {
//       console.log(`Error fetching link: ${link}, status: ${response.status}`);
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

// const searchHandler: any = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
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

//     const response = await fetch(`https://www.google.com/search?q=${query}`);
//     const html = await response.text();
//     const $ = cheerio.load(html);
//     const linkTags = $("a");

//     let links: string[] = [];

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

//     // Fallback mechanism when we can't fetch enough sources
//     while (filteredSources.length < sourceCount) {
//       const fallbackSource = getRandomFallbackSource();
//       if (!filteredSources.find(source => source.url === fallbackSource.url)) {
//         filteredSources.push(fallbackSource);
//       }
//     }

//     cache.set(query, { sources: filteredSources });
//     res.status(200).json({ sources: filteredSources });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ sources: predefinedSources.slice(0, sourceCount) }); // Use predefined sources as fallback when an error occurs
//   }
// };

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

//     const response = await fetch(`https://www.google.com/search?q=${query}`);
//     const html = await response.text();
//     const $ = cheerio.load(html);
//     const linkTags = $("a");

//     let links: string[] = [];

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

//     cache.set(query, { sources: filteredSources });
//     res.status(200).json({ sources: filteredSources });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ sources: [] });
//   }
// };

// export default searchHandler;










// /////V2
// import { OpenAIModel, Source } from "@/types";
// import { Readability } from "@mozilla/readability";
// import * as cheerio from "cheerio";
// import { JSDOM } from "jsdom";
// import type { NextApiRequest, NextApiResponse } from "next";
// import { cleanSourceText } from "../../utils/sources";
// import NodeCache from "node-cache";
// import { WorkerPool } from "@/utils/workerpool";
// import { htmlToText } from "html-to-text";

// // Predefined list of sources as fallback
// // Predefined list of sources as fallback
// const predefinedSources: Source[] = [
//   {
//     url: "https://www.nature.com",
//     text: "Nature is a British multidisciplinary scientific journal, first published on 4 November 1869.",
//   },
//   {
//     url: "https://www.jstor.org",
//     text: "JSTOR is a digital library for scholars, researchers, and students. JSTOR provides access to more than 12 million academic journal articles, books, and primary sources in 75 disciplines.",
//   },
//   {
//     url: "https://www.stackoverflow.com",
//     text: "Stack Overflow is a question and answer site for professional and enthusiast programmers.",
//   },
//   {
//     url: "https://www.ncbi.nlm.nih.gov/pubmed",
//     text: "PubMed is a free search engine accessing primarily the MEDLINE database of references and abstracts on life sciences and biomedical topics.",
//   },
//   {
//     url: "https://www.khanacademy.org",
//     text: "Khan Academy offers practice exercises, instructional videos, and a personalized learning dashboard that empower learners to study at their own pace in and outside of the classroom.",
//   },
// ];

// type Data = {
//   sources: Source[];
// };



// async function fetchAndProcessLink(link: string): Promise<Source | undefined> {
//   try {
//     const response = await fetch(link);
//     if (!response.ok) {
//       console.log(`Error fetching link: ${link}, status: ${response.status}`);
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

// function extractText(doc: Document): string {
//   const html = doc.documentElement.outerHTML;
//   const text = htmlToText(html, {
//     baseElements: {
//       selectors: ["body"],
//       orderBy: "selectors",
//       returnDomByDefault: true,
//     },
//     decodeEntities: true,
//     encodeCharacters: {
//       "<": "&lt;",
//       ">": "&gt;",
//       "&": "&amp;",
//       "'": "&apos;",
//       '"': "&quot;",
//     },
//     wordwrap: null,
//     selectors: [
//       { selector: "a", options: { linkBrackets: false } },
//       { selector: "img", format: "skip" },
//     ],
//   });
//   return text;
// }

// const cache = new NodeCache();
// const workerPool = new WorkerPool(4);

// const searchEngines = ['https://www.google.com/search?q=', 'https://www.bing.com/search?q=', 'https://search.yahoo.com/search?p=', 'https://duckduckgo.com/html/?q='];


// // const searchHandler = async (
// //   req: NextApiRequest,
// //   res: NextApiResponse<Data>
// // ) => {
// //   const start = process.hrtime.bigint(); // Start the timer
// //   try {
// //     const { query, model } = req.body as {
// //       query: string;
// //       model: OpenAIModel;
// //     };

// //     const sourceCount: any = 4;

// //     const cachedSources = cache.get<Data>(query);
// //     if (cachedSources) {
// //       res.status(200).json(cachedSources);
// //       return;
// //     }

// //     const response = await fetch(`https://www.google.com/search?q=${query}`);
// //     const html = await response.text();
// //     const $ = cheerio.load(html);
// //     const linkTags = $("a");

// //     let links: string[] = [];

// //     linkTags.each((i, link) => {
// //       const href = $(link).attr("href");

// //       if (href && href.startsWith("/url?q=")) {
// //         const cleanedHref = href.replace("/url?q=", "").split("&")[0];

// //         if (!links.includes(cleanedHref)) {
// //           links.push(cleanedHref);
// //         }
// //       }
// //     });

// //     const uniqueLinks: any = new Set<string>();

// //     for (const link of links) {
// //       const domain = new URL(link).hostname;
// //       const excludeList = [
// //         "google",
// //         "facebook",
// //         "twitter",
// //         "instagram",
// //         "youtube",
// //         "tiktok",
// //       ];

// //       if (excludeList.some((site) => domain.includes(site))) continue;
// //       if (!uniqueLinks.has(link)) {
// //         uniqueLinks.add(link);
// //         if (uniqueLinks.size >= sourceCount) {
// //           break;
// //         }
// //       }
// //     }

// //     const finalLinks = Array.from(uniqueLinks);
// //     //@ts-ignore
// //     const tasks: any = finalLinks.map(
// //       (link: any) => () => fetchAndProcessLink(link)
// //     );
// //     const sources = (await workerPool.execute(tasks)) as Source[];

// //     let filteredSources: any = sources.filter((source) => source !== undefined);

// //     if (filteredSources.length === 0) {
// //       filteredSources = predefinedSources.slice(0, sourceCount);
// //     }

// //     cache.set(query, { sources: filteredSources });
// //     const end = process.hrtime.bigint(); // End the timer
// //     console.log(`Execution time: ${Number(end - start) / 1e6} ms`);
// //     res.status(200).json({ sources: filteredSources });
// //   } catch (err: any) {
// //     const end = process.hrtime.bigint(); // End the timer
// //     console.log(`Execution time: ${Number(end - start) / 1e6} ms`);
// //     console.error(err);
// //     //@ts-ignore
// //     res.status(500).json({ sources: predefinedSources.slice(0, sourceCount) });
// //   }
// // };

// // export default searchHandler;

// const searchHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
//   const start = process.hrtime.bigint();
//   try {
//     const { query, model } = req.body as {
//       query: string;
//       model: OpenAIModel;
//     };

//     const sourceCount: any = 4;

//     const cachedSources = cache.get<Data>(query);
//     if (cachedSources) {
//       res.status(200).json(cachedSources);
//       return;
//     }

//     let links: string[] = [];

//     for (const engine of searchEngines) {
//       const response = await fetch(`${engine}${query}`);
//       const html = await response.text();
//       const $ = cheerio.load(html);
//       const linkTags = $("a");

//       linkTags.each((i, link) => {
//         const href = $(link).attr("href");

//         if (href && href.startsWith("/url?q=")) {
//           const cleanedHref = href.replace("/url?q=", "").split("&")[0];

//           if (!links.includes(cleanedHref)) {
//             links.push(cleanedHref);
//           }
//         }
//       });
//     }

//     const uniqueLinks: any = new Set<string>();

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
//     const tasks: any = finalLinks.map((link: any) => () => {
//       let retries = 3;
//       while (retries > 0) {
//         try {
//           return fetchAndProcessLink(link);
//         } catch (err) {
//           retries--;
//           if (retries === 0) {
//             console.log(`Error processing link: ${link}, error: ${err}`);
//             return undefined;
//           }
//         }
//       }
//     });
//     const sources = (await workerPool.execute(tasks)) as Source[];

//     let filteredSources: any = sources.filter((source) => source !== undefined);

//     if (filteredSources.length === 0) {
//       filteredSources = predefinedSources.slice(0, sourceCount);
//     }

//     cache.set(query, { sources: filteredSources });
//     const end = process.hrtime.bigint();
//     console.log(`Execution time: ${Number(end - start) / 1e6} ms`);
//     res.status(200).json({ sources: filteredSources });
//   } catch (err: any) {
//     const end = process.hrtime.bigint();
//     console.log(`Execution time: ${Number(end - start) / 1e6} ms`);
//     console.error(err);
//     //@ts-ignore
//     res.status(500).json({ sources: predefinedSources.slice(0, sourceCount) });
//   }
// };

// export default searchHandler;