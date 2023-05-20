/* eslint-disable react-hooks/exhaustive-deps */
import { SearchQuery } from "@/types";
import { IconReload } from "@tabler/icons-react";
import { useState } from "react";
import { useEffect } from "react";
import { FC } from "react";
import { posthog } from "posthog-js";

interface AnswerProps {
  searchQuery: SearchQuery;
  answer: string;
  done: boolean;
  onReset: () => void;
  // sources: string[]
  // onSubmit: (handleSave)
}

export const Answer: FC<AnswerProps> = ({ searchQuery, answer, done, onReset }) => {
  const query: any = searchQuery.query.toString();
  // const answer: any = answer;
  const sources = searchQuery.sourceLinks.toString()
  const athenaResponse: string = answer.toString();

  console.log("Search query received:", searchQuery); // Log the received searchQuery

  const [sourceLinks, setSourceLinks] = useState<string[]>(
    searchQuery.sourceLinks.map((source) => source.split("?")[0])
  );


  const handleResetAndSave = () => {
    posthog.capture('new_question_asked');
    onReset();
    // handleSave();
  };



    return (
      <div className="max-w-[800px] space-y-4 py-16 px-8 sm:px-24 sm:pt-16 pb-32">
        <div className="overflow-auto text-2xl sm:text-4xl">{searchQuery.query}</div>

        <div className="border-b border-zinc-800 pb-4">
          <div className="text-md text-blue-500">Answer</div>

          <div className="mt-2 overflow-auto">{replaceSourcesWithLinks(answer, searchQuery.sourceLinks)}</div>
        </div>

        {done && (
          <>
            <div className="border-b border-zinc-800 pb-4">
              <div className="text-md text-blue-500">Sources</div>

              {searchQuery.sourceLinks.map((source, index) => (
                <div
                  key={index}
                  className="mt-1 overflow-auto"
                >
                  {`[${index + 1}] `}
                  <a
                    className="hover:cursor-pointer hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={source}
                  >
                    {source.split("//")[1].split("/")[0].replace("www.", "")}
                  </a>
                </div>
              ))}
            </div>

            <button
              className="flex h-10 w-52 items-center justify-center rounded-md bg-gradient-to-r bg-sky-500 p-2 hover:cursor-pointer hover:bg-violet-500"
              onClick={handleResetAndSave}
            >
              <IconReload size={18} />
              <div className="ml-2">Ask New Question</div>
            </button>
          </>
        )}
      </div>
    );
  };

  const replaceSourcesWithLinks = (answer: string, sourceLinks: string[]) => {
    const elements = answer.split(/(\[[0-9]+\])/).map((part, index) => {
      if (/\[[0-9]+\]/.test(part)) {
        const link = sourceLinks[parseInt(part.replace(/[\[\]]/g, "")) - 1];

        return (
          <a
            key={index}
            className="hover:cursor-pointer text-blue-500"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {part}
          </a>
        );
      } else {
        return part;
      }
    });

    return elements;
  };
  // function setInsertData(data: any) {
  //   throw new Error("Function not implemented.");
  // }

