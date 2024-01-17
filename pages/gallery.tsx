
import { useState, useEffect } from "react";
import { Search } from "../components/Search";
import { IconBrandGithub, IconBrandTwitter, IconBrandDiscord } from "@tabler/icons-react";
import { Answer } from "@/components/Answer";

interface QueryData {
  _id: string;
  Query: string;
  Answer: string;
  Sources: string;
}

interface SearchQuery {
  query: string;
  sourceLinks: string[];
}

const GalleryPage: React.FC = () => {
  const [data, setData] = useState<QueryData[]>([]);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    query: "",
    sourceLinks: [],
  });
  const [answer, setAnswer] = useState<string>("");
  const [done, setDone] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/getAll`);
      const data: QueryData[] = await res.json();
      setData(data);
    };

    fetchData();
  }, []);

  return (
    <div className="h-screen overflow-auto bg-[#01012B] text-[#D4D4D8]">
      <div className="container mx-auto px-4 py-8">
        <div className="text-left mb-8">
          <h1 className="text-5xl font-bold text-white">
            The Domain, Humanitys Knowledge Simplified
          </h1>
        </div>
        {!answer && (
          <div className="grid grid-cols-5 gap-4">
            {data &&
              data.map((queryData) => {
                if (!queryData.Query || !queryData.Answer) return null;
                return (
                  <div
                    key={queryData._id}
                    className="bg-cyan-500 border-violet-500 p-4 rounded-lg flex flex-col"
                  >
                    <h3 className="text-white text-base font-semibold ">{queryData.Query}</h3>
                    <p className="text-white text-sm mt-2">
                      {queryData.Answer.slice(0, 100)}...
                    </p>
                    <button
                      className="mt-auto bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-400 transition-colors duration-200"
                      onClick={() => {
                        // Redirect to the query details page
                        window.location.href = `/post/${queryData._id}`;
                      }}
                    >
                      Learn More
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;