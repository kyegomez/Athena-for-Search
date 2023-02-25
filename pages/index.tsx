import { Answer } from "@/components/Answer";
import { Search } from "@/components/Search";
import { SearchQuery } from "@/types";
import { IconBrandGithub, IconBrandTwitter, IconBrandDiscord } from "@tabler/icons-react";
import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({ query: "", sourceLinks: [] });
  const [answer, setAnswer] = useState<string>("");
  const [done, setDone] = useState<boolean>(false);

  return (
    <>
      <Head>
        <title>Athena AI</title>
        <meta
          name="description"
          content="AI-powered search."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/favicon.png"
        />
      </Head>
      <div className="h-screen overflow-auto bg-[#091E2F] text-[#D4D4D8]">
        <a
          className="absolute top-0 right-12 p-4 cursor-pointer"
          href="https://twitter.com/kyegomezb"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandTwitter />
        </a>

        <a
          className="absolute top-0 right-2 p-4 cursor-pointer"
          href="https://discord.gg/xaf799wp"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandDiscord />
        </a>

        {answer ? (
          <Answer
            searchQuery={searchQuery}
            answer={answer}
            done={done}
            onReset={() => {
              setAnswer("");
              setSearchQuery({ query: "", sourceLinks: [] });
              setDone(false);
            }}
          />
        ) : (
          <Search
            onSearch={setSearchQuery}
            onAnswerUpdate={(value) => setAnswer((prev) => prev + value)}
            onDone={setDone}
          />
        )}
      </div>
    </>
  );
}
