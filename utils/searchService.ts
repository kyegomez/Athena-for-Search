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
