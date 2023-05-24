import { IconArrowRight, IconBolt, IconSearch } from "@tabler/icons-react";
import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import { SearchQuery, Source } from "@/types";
// import { posthog } from "posthog-js";
// import { initializePostHog } from "@/utils/posthog_init";
import endent from "endent";
import posthog  from "posthog-js";
// import searchService from "@/utils/searchService";
// import { SearchService } from "@/utils/searchService";



interface SearchProps {
  onSearch: (searchResult: SearchQuery) => void;
  onAnswerUpdate: (answer: string) => void;
  onDone: (done: boolean) => void;
}

//

export const Search: FC<SearchProps> = ({ onSearch, onAnswerUpdate, onDone }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // const searchService = new SearchService();


  const handleSave = async (query: string, answer: string, sources: any) => {
    try {
      console.log('Data being sent:', { query, answer, sources });
      const res = await fetch('/api/insert', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({query, answer, sources})
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


  const handleSearch = async () => {
    if (!query || query.trim() === '') {
      alert("Please enter a query");
      return;
    }
  
    setLoading(true);
    try {
      // Calling the new API endpoint
      const response = await fetch("/api/sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const { sources }: { sources: Source[] } = await response.json();
      console.log("Received sources:", sources); // Log the received sources
      await handleStream(sources);
    } catch (error) {
      console.error("Error while searching:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleSearch = async () => {
  //   if (!query || query.trim() === '') {
  //     alert("Please enter a query");
  //     return;
  //   }

  //   setLoading(true);
  //   const sources = await fetchSources();
  //   await handleStream(sources);
  // };
    

  const fetchSources = async () => {
    try {
      const cleanedResponse = JSON.stringify({query});
  
      const response: any = await fetch('/api/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: cleanedResponse,
      });
  
      console.log(`response ${response}`);
  
      if (!response.ok) {
        const errorResponse = response;
        console.error("Error Response:", errorResponse);
        setLoading(false);
        throw new Error(response.statusText);
      }
  
      const { sources }: { sources: Source[] } = await response.json();
  
      return sources;
    } catch (error) {
      console.error("Error while fetching sources:", error);
      throw error;
    }
  };
  
  const handleStream = async (sources: Source[]) => {
    try {
      const prompt = endent`Provide a 2-3 sentence answer to the query based on the followin sources. Be original, concise, accurate, and helpful. Cite sources as [1] or [2] or [3] after each sentence (not just the very end) to back up your answer (Ex: Correct: [1], Correct: [2][3], Incorrect: [1, 2]).
      
      ${sources.map((source, idx) => `Source [${idx + 1}]:\n${source.text}`).join("\n\n")}
      `;
  
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt, apiKey })
      });
  
      if (!response.ok) {
        setLoading(false);
        console.log(`Error: ${response.status} ${response.statusText}`);
        throw new Error(response.statusText);
      }
  
      setLoading(false);
      onSearch({ query, sourceLinks: sources.map((source) => source.url) });
  
      if (!response.body) {
        console.log("Error: response.body is null");
        onAnswerUpdate("Error");
        return;
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
  
      let answerChunks = [];
  
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        answerChunks.push(chunkValue);
        onAnswerUpdate(chunkValue);
      }
  
      const answer = answerChunks.join('');
      onDone(true);
      handleSave(query, answer, sources); // Save the accumulated answer to the database
  
    } catch (err) {
      onAnswerUpdate("Error");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Search query entered:", query); // Log the search query
      handleSearch();
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
                onKeyDown={handleKeyDown}
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

