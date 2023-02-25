import { OpenAIModel, SearchQuery, Source } from "@/types";
import { createPrompt } from "@/utils/answer";
import { IconArrowRight, IconBolt, IconSearch } from "@tabler/icons-react";
import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";

interface SearchProps {
  onSearch: (searchResult: SearchQuery) => void;
  onAnswerUpdate: (answer: string) => void;
  onDone: (done: boolean) => void;
}



export const Search: FC<SearchProps> = ({ onSearch, onAnswerUpdate, onDone }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState<string>("");
  const [model, setModel] = useState<OpenAIModel>(OpenAIModel.DAVINCI_CODE);
  const [apiKey, setApiKey] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!query) {
      alert("Please enter a query");
      return;
    }

    setLoading(true);
    const sources = await fetchSources();
    await handleStream(sources);
  };

  const fetchSources = async () => {
    const response = await fetch("/api/sources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, model })
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error(response.statusText);
    }

    const { sources }: { sources: Source[] } = await response.json();
    // ////////////////---------------------> mongoose

    // const doc = {
    //   query: query,
    //   athenaResponse: response,
    //   sources: sources
    // }
    // const docInserted = new eventData(doc);
    // docInserted.save();
    ////////////////---------------------> mongoose


    return sources;
  };

  const handleStream = async (sources: Source[]) => {
    try {
      let prompt = createPrompt(query, sources, model);
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt, model, apiKey })
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error(response.statusText);
      }

      setLoading(false);
      onSearch({ query, sourceLinks: sources.map((source) => source.url) });


      const data = response.body;

      if (!data) {
        return;
      }

      /////////////////////////+==========>
      const text = data

      const insertResponse = await fetch("/api/insert", {
        method: "POST",
        headers: {
          "Content-Type": "applications/json"
        },
        body: JSON.stringify({ sources, query, text})
      })

      if (!insertResponse.ok) {
        throw new Error(insertResponse.statusText);
      }

      const insertData = await insertResponse.json();
      /////////////////////////+==========>
      

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        onAnswerUpdate(chunkValue);
      }

      onDone(true);
    } catch (err) {
      onAnswerUpdate("Error");
    }
  };

  // const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter") {
  //     handleSearch();
  //   }
  // };


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
            <IconBolt size={36} />
            <div className="ml-1 text-center text-4xl ">Athena</div>
          </div>

            <div className="relative w-full">
              <IconSearch className="text=[#D4D4D8] absolute top-3 w-10 left-1 h-6 rounded-full opacity-50 sm:left-3 sm:top-4 sm:h-8" />

              <input
                ref={inputRef}
                className="h-12 w-full rounded-full border border-zinc-600 bg-[#2A2A31] pr-12 pl-11 focus:border-zinc-800 focus:bg-[#18181C] focus:outline-none focus:ring-2 focus:ring-zinc-800 sm:h-16 sm:py-2 sm:pr-16 sm:pl-16 sm:text-lg font-sans"
                type="text"
                placeholder="Ask Anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <button>
                <IconArrowRight
                  onClick={handleSearch}
                  className="absolute right-2 top-2.5 h-7 w-7 rounded-full bg-blue-500 p-1 hover:cursor-pointer hover:bg-blue-600 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
                />
              </button>
            </div>


        </div>
      )}
    </>
  );
};
