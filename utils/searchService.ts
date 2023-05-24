// import axios from 'axios';

// class SearchService {
//   private BASE_URL = 'https://www.googleapis.com/customsearch/v1';
//   private API_KEY = process.env.GOOGLE_API_KEY; 
//   private CX = process.env.GOOGLE_CX;

//   public async getSearchResults(query: string): Promise<any> {
//     try {
//       const response = await axios.get(this.BASE_URL, {
//         params: {
//           key: this.API_KEY,
//           cx: this.CX,
//           q: query,
//         },
//       });

//       // Parse the response
//       const parsedResults = this.parseResponse(response.data);
      
//       return parsedResults;

//     } catch (error) {
//       console.error(error);
//     }
//   }

//   private parseResponse(data: any) {
//     const searchResults = data.items;

//     if (!searchResults) {
//       return [];
//     }

//     // Loop through the search results and extract the required data
//     return searchResults.map((result: { link: any; title: any; snippet: any; }) => ({
//       url: result.link,
//       title: result.title,
//       snippet: result.snippet,
//     }));
//   }
// }

// export default new SearchService();


// import { Source } from "../types";

// export class SearchService {
//     private apiKey = 'YOUR_API_KEY'; // Replace with your API key
//     private searchEngineId = 'YOUR_SEARCH_ENGINE_ID'; // Replace with your search engine ID

//     public async getSources(query: string): Promise<Source[]> {
//         const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.searchEngineId}&q=${encodeURIComponent(query)}`;
        
//         const response = await fetch(googleSearchUrl);
//         const data = await response.json();

//         if (data.items) {
//             return data.items.map((item: any) => {
//                 return {
//                     url: item.link,
//                     text: item.snippet,
//                 };
//             });
//         }

//         return [];
//     }
// }



// import { OpenAIModel, Source } from "@/types";
// // import { cleanSourceText } from "../../utils/sources";
// import { cleanSourceText } from "./sources";

// import axios from 'axios';

// class SearchService {
//   public async search(query: string): Promise<Source[]> {

//     const api_key = "AIzaSyAdutQxcp8DmkQ7JYKpULo5kZPZy9bGU_c";  // replace with your actual key
//     const cx = "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";  // replace with your actual Programmable Search Engine ID
//     const sourceCount = 4;
  

//     const fields = ["title", "url", "text"];
    
//     const url = `https://www.googleapis.com/customsearch/v1?key=${api_key}&cx=${cx}&q=${query}&fields=${fields}`;

//     const response = await axios.get(url);
//     const data = response.data;

//     if (!data.items || data.items.length === 0) {
//       throw new Error("No results found");
//     }

//     // Get the first four results
//     const items = data.items.slice(0, sourceCount);

//     // Fetch and clean text from each link
//     const sources = await Promise.all(items.map(async (item: { link: string; }) => {
//       const response = await axios.get(item.link);
//       let sourceText = cleanSourceText(response.data);

//       return { url: item.link, text: sourceText };
//     }));

//     const filteredSources = sources.filter((source) => source !== undefined);

//     for (const source of filteredSources) {
//       source.text = source.text.slice(0, 1500);
//     }

//     return filteredSources;
//   }
//     sourceCount(arg0: number, sourceCount: any) {
//         throw new Error("Method not implemented.");
//     }
// }

// export default new SearchService();



import { OpenAIModel, Source } from "@/types";
import { cleanSourceText } from "./sources";

class SearchService {
  public async search(query: string): Promise<Source[]> {

    const api_key = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
    const sourceCount = 4;

    const fields = "items(title,link,snippet)";
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${api_key}&cx=${cx}&q=${query}&fields=${fields}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("No results found");
    }

    const items = data.items.slice(0, sourceCount);

    const sources = await Promise.all(items.map(async (item: { link: string; }) => {
      const response = await fetch(item.link);
      const pageData = await response.text();

      let sourceText = cleanSourceText(pageData);

      return { url: item.link, text: sourceText };
    }));

    const filteredSources = sources.filter((source) => source !== undefined);

    for (const source of filteredSources) {
      source.text = source.text.slice(0, 1500);
    }

    return filteredSources;
  }
}

export default new SearchService();
