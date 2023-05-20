// /* eslint-disable react-hooks/rules-of-hooks */
// import { GetServerSideProps } from "next";
// import { Answer } from "@/components/Answer";
// // import { SearchQuery } from "@/types";
// // import { useState } from "react";

// interface QueryData {
//   query: string;
//   athenaResponse: string;
//   sources: string[];
// }

// interface QueryPageProps {
//   data: QueryData;
// }

// interface SearchQuery {
//     query: string;
//     sourceLinks: string[];
// }
  
// //ss

// export const getServerSideProps: GetServerSideProps = async (context: any) => {
//     // const [searchQuery, setSearchQuery] = useState<SearchQuery>({
//     //     query: "",
//     //     sourceLinks: [],
//     // });  
//     const { id } = context.params;
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/${id}`);
//     const data: QueryData = await res.json();

//   return {
//     props: {
//       data,
//     },
//   };
// };

// const QueryPage: React.FC<QueryPageProps> = ({ data }) => {
//     console.log("Data received:", data); // Log the received data
//     const searchQuery: SearchQuery = {
//       query: data.query,
//       sourceLinks: data.sources.map((source) => source.toString()), // Ensure sources are strings
//     };
  
//     const handleReset = () => {
//       console.log("Reset clicked");
//     };
  
//     return (
//       <Answer
//         searchQuery={searchQuery}
//         answer={data.athenaResponse}
//         done={true}
//         onReset={handleReset}
//       />
//     );
//   };

// export default QueryPage;










// // ===============================================================

// import { useState, useEffect } from "react";
// import { GetServerSideProps } from "next";
// import { SearchQuery } from "@/types";
// import { IconReload } from "@tabler/icons-react";
// // import { useState } from "react";
// import { useRouter } from "next/router";

// interface QueryData {
//   query: string;
//   athenaResponse: string;
//   sources: string[];
// }

// interface QueryPageProps {
//   data: QueryData;
// }

// interface AnswerProps {
//   searchQuery: SearchQuery;
//   answer: string;
//   done: boolean;
//   onReset: () => void;
// }

// const replaceSourcesWithLinks = (answer: string, sourceLinks: string[]) => {
//   const elements = answer.split(/(\[[0-9]+\])/).map((part, index) => {
//     if (/\[[0-9]+\]/.test(part)) {
//       const link = sourceLinks[parseInt(part.replace(/[\[\]]/g, "")) - 1];

//       return (
//         <a
//           key={index}
//           className="hover:cursor-pointer text-blue-500"
//           href={link}
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           {part}
//         </a>
//       );
//     } else {
//       return part;
//     }
//   });

//   return elements;
// };

// const QueryPage: React.FC = () => {
//   const router = useRouter();
//   const { id } = router.query;
//   const [data, setData] = useState<QueryData>({
//     query: "",
//     athenaResponse: "",
//     sources: [],
//   });
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>("");
  

//   const searchQuery: SearchQuery = {
//     query: data.query,
//     sourceLinks: data.sources.map((source) => source.toString()), // Ensure sources are strings
//   };

//   const handleReset = () => {
//     console.log("Reset clicked");
//   };

//   // const [sourceLinks, setSourceLinks] = useState<string[]>(
//   //   searchQuery.sourceLinks.map((source) => source.split("?")[0])
//   // );

//   const handleResetAndSave = () => {
//     handleReset();
//   };

//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     if (id) {
//   //       try {
//   //         const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/${id}`);
//   //         if (res.status === 429) {
//   //           setError("Rate limit exceeded. Please try again later.");
//   //           setLoading(false);
//   //           return;
//   //         }
//   //         const data: QueryData = await res.json();
//   //         setData(data);
//   //         setLoading(false);
//   //       } catch (err) {
//   //         setError("An error occurred while fetching data.");
//   //         setLoading(false);
//   //       }
//   //     }
//   //   };

//   //   fetchData();
//   // }, [id]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   if (!data.sources) {
//     return <div>No data available</div>;
//   }

// const QueryPage: React.FC<QueryPageProps> = ({ data }) => {
//   const router = useRouter();
//   const { id } = router.query;

//   const searchQuery: SearchQuery = {
//     query: data.query,
//     sourceLinks: data.sources.map((source) => source.toString()), // Ensure sources are strings
//   };

//   const handleReset = () => {
//     console.log("Reset clicked");
//   };

//   const handleResetAndSave = () => {
//     handleReset();
//   };

//   if (!data || !data.sources) {
//     return <div>No data available</div>;
//   }

//   return (
//     <div className="max-w-[800px] space-y-4 py-16 px-8 sm:px-24 sm:pt-16 pb-32">
//       <div className="overflow-auto text-2xl sm:text-4xl">{searchQuery.query}</div>

//       <div className="border-b border-zinc-800 pb-4">
//         <div className="text-md text-blue-500">Answer</div>

//         <div className="mt-2 overflow-auto">
//           {replaceSourcesWithLinks(data.athenaResponse, searchQuery.sourceLinks)}
//         </div>
//       </div>

//       <div className="border-b border-zinc-800 pb-4">
//         <div className="text-md text-blue-500">Sources</div>

//         {searchQuery.sourceLinks.map((source, index) => (
//           <div
//             key={index}
//             className="mt-1 overflow-auto"
//           >
//             {`[${index + 1}] `}
//             <a
//               className="hover:cursor-pointer hover:underline"
//               target="_blank"
//               rel="noopener noreferrer"
//               href={source}
//             >
//               {source.split("//")[1].split("/")[0].replace("www.", "")}
//             </a>
//           </div>
//         ))}
//       </div>

//       <button
//         className="flex h-10 w-52 items-center justify-center rounded-full bg-blue-500 p-2 hover:cursor-pointer hover:bg-blue-600"
//         onClick={handleResetAndSave}
//       >
//         <IconReload size={18} />
//         <div className="ml-2">Ask New Question</div>
//       </button>
//     </div>
//   );
// };

// export default QueryPage;

// // export const getServerSideProps: GetServerSideProps = async (context: any) => {
// //   const { id } = context.params;
// //   const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/${id}`);
// //   const data: QueryData = await res.json();

// //   return {
// //     props: {
// //       data,
// //     },
// //   };
// // };



// export const getServerSideProps: GetServerSideProps = async (context: any) => {
//   const { id } = context.params;
//   let data: QueryData;

//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/${id}`);
//     if (!res.ok) {
//       console.error(`Error fetching data: ${res.status} ${res.statusText}`);
//       return {
//         notFound: true,
//       };
//     }
//     data = await res.json();
//   } catch (err) {
//     console.error("Error fetching data:", err);
//     return {
//       notFound: true,
//     };
//   }

//   return {
//     props: {
//       data,
//     },
//   };
// };


import { GetServerSideProps } from "next";
import { SearchQuery } from "@/types";
import { IconReload } from "@tabler/icons-react";
import { useRouter } from "next/router";

// ... (rest of the imports and code)
interface QueryData {
  query: string;
  athenaResponse: string;
  sources: string[];
}

interface QueryPageProps {
  data: QueryData;
}

interface AnswerProps {
  searchQuery: SearchQuery;
  answer: string;
  done: boolean;
  onReset: () => void;
}

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

const QueryPage: React.FC<QueryPageProps> = ({ data }) => {
  const router = useRouter();
  const { id } = router.query;

  const searchQuery: SearchQuery = {
    query: data.query,
    sourceLinks: data.sources.map((source) => source.toString()), // Ensure sources are strings
  };

  const handleReset = () => {
    console.log("Reset clicked");
  };

  const handleResetAndSave = () => {
    handleReset();
  };

  if (!data || !data.sources) {
    return <div>No data available</div>;
  }

  return (
    <div className="max-w-[800px] space-y-4 py-16 px-8 sm:px-24 sm:pt-16 pb-32">
      <div className="overflow-auto text-2xl sm:text-4xl">{searchQuery.query}</div>

      <div className="border-b border-zinc-800 pb-4">
        <div className="text-md text-blue-500">Answer</div>

        <div className="mt-2 overflow-auto">
          {replaceSourcesWithLinks(data.athenaResponse, searchQuery.sourceLinks)}
        </div>
      </div>

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
        className="flex h-10 w-52 items-center justify-center rounded-full bg-blue-500 p-2 hover:cursor-pointer hover:bg-blue-600"
        onClick={handleResetAndSave}
      >
        <IconReload size={18} />
        <div className="ml-2"> Question</div>
      </button>
    </div>
  );
};

export default QueryPage;

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const { id } = context.params;
  let data: QueryData;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/${id}`);
    if (!res.ok) {
      console.error(`Error fetching data: ${res.status} ${res.statusText}`);
      return {
        notFound: true,
      };
    }
    data = await res.json();
  } catch (err) {
    console.error("Error fetching data:", err);
    return {
      notFound: true,
    };
  }

  return {
    props: {
      data,
    },
  };
};