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

/////////////////////// -> v1 end

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

// ///
// import { OpenAIModel, Source } from "@/types";
// import { Readability } from "@mozilla/readability";
// import * as cheerio from "cheerio";
// import { JSDOM } from "jsdom";
// import type { NextApiRequest, NextApiResponse } from "next";
// import { cleanSourceText } from "../../utils/sources";

// type Data = {
//   sources: Source[];
// };

// const searchHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
//   try {
//     const { query, model } = req.body as {
//       query: string;
//       model: OpenAIModel;
//     };

//     const sourceCount = 4;

//     // GET LINKS
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

//     const filteredLinks = links.filter((link, idx) => {
//       const domain = new URL(link).hostname;

//       const excludeList = ["google", "facebook", "twitter", "instagram", "youtube", "tiktok"];
//       if (excludeList.some((site) => domain.includes(site))) return false;

//       return links.findIndex((link) => new URL(link).hostname === domain) === idx;
//     });

//     const finalLinks = filteredLinks.slice(0, sourceCount);

//     // SCRAPE TEXT FROM LINKS
//     const sources = (await Promise.all(
//       finalLinks.map(async (link) => {
//         const response = await fetch(link);
//         const html = await response.text();
//         const dom = new JSDOM(html);
//         const doc = dom.window.document;
//         const parsed = new Readability(doc).parse();

//         if (parsed) {
//           let sourceText = cleanSourceText(parsed.textContent);

//           return { url: link, text: sourceText };
//         }
//       })
//     )) as Source[];

//     const filteredSources = sources.filter((source) => source !== undefined);

//     for (const source of filteredSources) {
//       source.text = source.text.slice(0, 1500);
//     }

//     res.status(200).json({ sources: filteredSources });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ sources: [] });
//   }
// };

// export default searchHandler;

// pages/api/search.ts
// /pages/api/sources.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { Source } from '@/types';
// import { cleanSourceText } from '@/utils/sources';

// async function search(query: string): Promise<Source[]> {
//   const api_key = "AIzaSyAdutQxcp8DmkQ7JYKpULo5kZPZy9bGU_c";
//   const cx = "409b709ef3a1f4110";
//   const sourceCount = 4;

//   const fields = "items(title,link,snippet)";
//   const url = `https://www.googleapis.com/customsearch/v1?key=${api_key}&cx=${cx}&q=${query}&fields=${fields}`;

//   const response = await fetch(url);
//   if (!response.ok) {
//     console.error('Error in search function:', response); // Log the error for debugging
//     throw new Error(`Error: ${response.status} ${response.statusText}`);
//   }

//   const data = await response.json();

//   if (!data.items || data.items.length === 0) {
//     throw new Error("No results found");
//   }

//   const items = data.items.slice(0, sourceCount);

//   const sources = await Promise.all(items.map(async (item: { link: string; }) => {
//     const response = await fetch(item.link);
//     const pageData = await response.text();

//     let sourceText = cleanSourceText(pageData);

//     return { url: item.link, text: sourceText };
//   }));

//   const filteredSources = sources.filter((source) => source !== undefined);

//   for (const source of filteredSources) {
//     source.text = source.text.slice(0, 1500);
//   }

//   return filteredSources;
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     const { query } = req.body;

//     try {
//       const sources = await search(query);
//       res.status(200).json(sources);
//     } catch (error: any) {
//       console.error('Error in /api/sources:', error); // Log the error for debugging
//       res.status(500).json({ error: error.message });
//     }
//   } else {
//     res.setHeader('Allow', ['POST']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

//v2

// // /pages/api/sources.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { Source } from '@/types';
// import { cleanSourceText } from '@/utils/sources';
// import { google } from 'googleapis';

// const customsearch = google.customsearch('v1');

// async function search(query: string): Promise<Source[]> {
//   const api_key = process.env.GOOGLE_API_KEY;
//   const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
//   const sourceCount = 4;

//   try {
//     const result = await customsearch.cse.list({
//       auth: api_key,
//       cx: cx,
//       q: query,
//       num: sourceCount,
//     });

//     const items: any = result.data.items;

//     if (!items || items.length === 0) {
//       throw new Error("No results found");
//     }

//     const sources = (await Promise.all(items.map(async (item: { link: string; }) => {
//       const response = await fetch(item.link, { redirect: 'manual' });
//       if (!response.ok) {
//         console.warn(`Error fetching content for ${item.link}: ${response.status} ${response.statusText}`);
//         return undefined;
//       }
//       const pageData = await response.text();

//       let sourceText = cleanSourceText(pageData);

//       return { url: item.link, text: sourceText };
//     }))).filter((source) => source !== undefined);

//     const filteredSources = sources.filter((source: undefined) => source !== undefined);

//     for (const source of filteredSources) {
//       source.text = source.text.slice(0, 1500);
//     }

//     return filteredSources;
//   } catch (error) {
//     console.error('Error in search function:', error);
//     throw error;
//   }
// }
// // /pages/api/sources.ts

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     const { query } = req.body;

//     if (!query || query.trim() === '') {
//       res.status(400).json({ error: 'Empty query is not allowed' });
//       return;
//     }

//     try {
//       const sources = await search(query);
//       res.status(200).json(sources);
//     } catch (error: any) {
//       console.error('Error in /api/sources:', error);
//       res.status(500).json({ error: error.message });
//     }
//   } else {
//     res.setHeader('Allow', ['POST']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

// // /pages/api/sources.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { Source } from '@/types';
// import { cleanSourceText } from '@/utils/sources';
// import { google } from 'googleapis';
// import cheerio from 'cheerio';
// import { Readability } from '@mozilla/readability';
// import { JSDOM } from 'jsdom';
// import puppeteer from 'puppeteer';

// const customsearch = google.customsearch('v1');

// async function fetchPageContent(url: string): Promise<string> {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'networkidle2' });
//   const content = await page.content();
//   await browser.close();
//   return content;
// }

// async function search(query: string): Promise<Source[]> {
//   const api_key = process.env.GOOGLE_API_KEY;
//   const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
//   const sourceCount = 4;

//   try {
//     const result = await customsearch.cse.list({
//       auth: api_key,
//       cx: cx,
//       q: encodeURIComponent(query),
//       num: sourceCount,
//       fields: "items(title, htmlSnippet, formattedUrl)"
//     });

//     console.log(`result: ${result}`)

//     console.log('Request url', result.config.url);

//     const items: any = result.data.items;

//     if (!items || items.length === 0) {
//       throw new Error("No results found");
//     }

//     const sources: any = items.map((item: { link: string; htmlSnippet: string; }) => {
//       try {
//         let sourceText = cleanSourceText(item.htmlSnippet);
//         return { url: item.link, text: sourceText };
//       } catch (error: any) {
//         console.warn(`Error processing content for ${item.link}: ${error.message}`);
//         return undefined;
//       }
//     }).filter((source: any) => source !== undefined);

//     console.log(`Sources: ${sources}`)

//     for (const source of sources) {
//       source.text = source.text.slice(0, 1500);
//     }

//     return sources;
//   } catch (error) {
//     console.error('Error in search function:', error);
//     throw error;
//   }
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     const { query } = req.body;

//     if (!query || query.trim() === '') {
//       res.status(400).json({ error: 'Empty query is not allowed' });
//       return;
//     }

//     try {
//       const sources = await search(query);
//       res.status(200).json(sources);
//     } catch (error: any) {
//       console.error('Error in /api/sources:', error);
//       res.status(500).json({ error: error.message });
//     }
//   } else {
//     res.setHeader('Allow', ['POST']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

// /pages/api/sources.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Source } from "@/types";
import { cleanSourceText } from "@/utils/sources";
import { google } from "googleapis";
import cheerio from "cheerio";
import { OpenAIModel } from "@/types";
const customsearch = google.customsearch("v1");
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { WorkerPool } from "@/utils/workerpool";

//create an all-new workerpool
const workerPool = new WorkerPool(6);

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

  const api_key: any = process.env.GOOGLE_API_KEY ;
  const cx: any= process.env.GOOGLE_SEARCH_ENGINE_ID;
  const sourceCount = 6;

  try {
    let links: string[] = [];

    const result = await customsearch.cse.list({
      auth: encodeURIComponent(api_key),
      cx: encodeURIComponent(cx),
      q: encodeURIComponent(query),
      num: sourceCount,
      fields: "items(title,htmlSnippet,link)",
      safe: "active", //filters bad stuff,
      // exactTerms: encodeURIComponent(query)
      // fileType: "html",
      // fileType: "pdf|docx|txt", // Filter search results by file type
      // highRange: "highRange",
      // hl: "en", // Set the language of the search results
      // gl: "us", // Set the country of the search results
      // sort: "date-sdate:d:s",

    });

    console.log(`result: ${JSON.stringify(result)}`);

    console.log("Request url", result.config.url);

    const items: any = result.data.items;

    if (!items || items.length === 0) {
      throw new Error("No results found");
    }

    // const sources = items.map((item: { title: string; htmlSnippet: string; link: string; }) => {
    //   return item.link;
    // }) as Source[];
    // const sources = await Promise.all(
    //   items.map(async (item: { title: string; htmlSnippet: string; link: string }) => {
    //     const link = item.link;
    //     const response = await fetch(link);
    //     const html = await response.text();
    //     const dom = new JSDOM(html);
    //     const doc = dom.window.document;
    //     const parsed = new Readability(doc).parse();

    //     if (parsed) {
    //       let sourceText = cleanSourceText(parsed.textContent);
    //       return { url: link, text: sourceText };
    //     }
    //   })
    // );

    // Create tasks for fetching and parsing the data from the URLs.
    const tasks = items.map(
      (item: { title: string; htmlSnippet: string; link: string }) => {
        return async () => {
          const link = item.link;
          const response = await fetch(link);
          const html = await response.text();
          const dom = new JSDOM(html);
          const doc = dom.window.document;
          const parsed = new Readability(doc).parse();

          if (parsed) {
            let sourceText = cleanSourceText(parsed.textContent);
            return { url: link, text: sourceText };
          }
        };
      }
    );

    // Use the worker pool to execute the tasks.
    const sources = await workerPool.execute(tasks);

    console.log(`Sources: ${JSON.stringify(sources)}`);

    const filteredSources = sources.filter((source) => source !== undefined);

    for (const source of filteredSources) {
      source.text = source.text.slice(0, 1500);
    }

    console.log(`Sources: ${JSON.stringify(filteredSources)}`);

    // const filteredSources = sources.filter((source) => source !== undefined);

    // return sources;
    res.status(200).json({ sources: filteredSources });
  } catch (err) {
    console.log(err);
    res.status(500).json({ sources: [] });
  }
};

export default searchHandler;

// // ...
// export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
//   if (req.method === 'POST') {
//     const { query } = req.body;

//     if (!query || query.trim() === '') {
//       res.status(400).json({ error: 'Empty query is not allowed' });
//       return;
//     }

//     try {
//       const sources = await search(query);
//       res.status(200).json(sources);
//     } catch (error: any) {
//       console.error('Error in /api/sources:', error);
//       res.status(500).json({ error: error.message });
//     }
//   } else {
//     res.setHeader('Allow', ['POST']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
