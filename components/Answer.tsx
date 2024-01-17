import { SearchQuery } from "@/types";
import { IconReload } from "@tabler/icons-react";
import { useState } from "react";
import { FC } from "react";
import { posthog } from "posthog-js";

interface AnswerProps {
  searchQuery: SearchQuery;
  answer: string;
  done: boolean;
  onReset: () => void;
}

export const Answer: FC<AnswerProps> = ({ searchQuery, answer, done, onReset }) => {
  console.log("Search query received:", searchQuery); // Log the received searchQuery

  const [sourceLinks, setSourceLinks] = useState<string[]>(
    searchQuery.sourceLinks.map((source) => source.split("?")[0])
  );

  const handleResetAndSave = () => {
    posthog.capture('new_question_asked');
    onReset();
  };

  return (
    <div className="max-w-[800px] space-y-4 py-16 px-8 sm:px-24 sm:pt-16 pb-32">
      <div className="overflow-auto text-2xl sm:text-4xl">{searchQuery.query}</div>

      <div className="border-b border-zinc-800 pb-4">
        <div className="text-md text-violet-500">Answer</div>

        <div className="mt-2 overflow-auto">{replaceSourcesWithLinks(answer, searchQuery.sourceLinks)}</div>
      </div>

      {done && (
        <>
          <div className="border-b border-zinc-800 pb-4">
            <div className="text-md text-violet-500">Sources</div>

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
            className="flex h-10 w-52 items-center justify-center rounded-md bg-gradient-to-r bg-violet-500 p-2 hover:cursor-pointer hover:bg-yellow-500"
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
/**
 * Replaces the placeholders in the answer string with corresponding source links.
 * 
 * @param answer - The answer string with placeholders.
 * @param sourceLinks - An array of source links.
 * @returns An array of React elements with placeholders replaced by clickable links.
 */
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