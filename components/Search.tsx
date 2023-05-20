import { IconArrowRight, IconBolt, IconSearch } from "@tabler/icons-react";
import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import { SearchQuery, Source } from "@/types";
// import { posthog } from "posthog-js";
// import { initializePostHog } from "@/utils/posthog_init";
import { OpenAI } from "langchain/llms/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { WebBrowser } from "langchain/tools/webbrowser";


import endent from "endent";
import posthog from "posthog-js";

interface SearchProps {
  onSearch: (searchResult: SearchQuery) => void;
  onAnswerUpdate: (answer: string) => void;
  onDone: (done: boolean) => void;
}

//

export const Search: FC<SearchProps> =  ({ onSearch, onAnswerUpdate, onDone }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [executor, setExecutor] = useState<any>(null);



  useEffect(() => {
    const initExecutor = async () => {
      const key: any = process.env.OPENAI_API_KEY;
      const serpkey: any =  process.env.SERPAPI_API_KEY;
      const model = new OpenAI({ temperature: 0, openAIApiKey: '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' });
      const embeddings = new OpenAIEmbeddings({openAIApiKey: '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'});
      const tools = [
        new SerpAPI("4fcae7f729b1409fae47c9c1e1c4ca48bc155cbe8d90cae4cb4497098f458bd1", {
          location: "Austin,Texas,United States",
          hl: "en",
          gl: "us",
        }),
        new Calculator(),
        new WebBrowser({ model, embeddings }),
      ];

      const newExecutor = await initializeAgentExecutorWithOptions(tools, model, {
        agentType: "zero-shot-react-description",
        verbose: true,
      });

      setExecutor(newExecutor);
    };

    initExecutor();
  }, []);



  const handleSave = async (query: string, answer: string, sources: any) => {
    try {
      console.log('Data being sent:', { query, answer, sources });
      const res = await fetch('/api/insert', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, answer, sources })
      });

      const responseBodyText = await res.text();
      console.log("Response body:", responseBodyText);

      if (!res.ok) {
        console.log("Failed to insert document");
      } else {
        const responseBody = JSON.parse(responseBodyText);
        if (responseBody.error) {
          throw new Error(`Server error: ${responseBody.error}`);
        }
      }
    } catch (error) {
      console.log(`Error inserting document: ${error}`);
    }
  };

  const posthogKey: any = process.env.POSTHOG_API_KEY;
  const apiHost: any = process.env.POSTHOG_INSTANCE_URL;



  const handleSearch = async () => {
    try {
      if (!query) {
        alert("Please enter a query");
        return;
      }
    
      posthog.capture('search_performed', { query });
      
      setLoading(true);
      if (executor) {
        setLoading(true);
        const result: any = await executor.call({ query });
        console.log(`Result: ${result}`)
        return result
      }
    } catch (error: any) {
      console.error(`Error in handleSearch: ${error.message}`);
      setLoading(false); // Set loading to false to handle UI state
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center pt-64 sm:pt-72 flex-col">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <div className="mt-8 text-2xl">Getting answer...</div>
        </div>
      ) : (
        <div className="mx-auto flex h-full w-full max-w-[750px] flex-col items-center space-y-6 px-3 pt-32 sm:pt-64">
          <div className="flex items-center">
            <div className="ml-1 text-center font-sans text-5xl	">Athena</div>
          </div>

          <div className="relative w-full">
            <IconSearch className="text=[#D4D4D8] absolute top-3 w-10 left-1 h-6 rounded-full opacity-50 sm:left-3 sm:top-4 sm:h-8" />

            <input
              ref={inputRef}
              className="h-12 w-full rounded-md border border-cyan-400 bg-[#4f46e5] pr-12 pl-11 focus:border-cyan-800 focus:bg-[#4338ca] focus:outline-none focus:ring-2 focus:ring-cyan-800 sm:h-16 sm:py-2 sm:pr-16 sm:pl-16 sm:text-lg font-sans"
              type="text"
              // onSubmit={handleSubmit}
              placeholder="Ask Anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button>
              <IconArrowRight
                onClick={handleSearch}
                // onSubmit={handleSubmit}
                className="absolute right-2 top-2.5 h-7 w-7 rounded-full bg-blue-500 p-1 hover:cursor-pointer hover:bg-blue-600 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

