import { OpenAIStream } from "@/utils/answer";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { prompt, apiKey } = (await req.json()) as {
      prompt: string;
      apiKey: string;
    };

    const stream = await OpenAIStream(prompt);

    return new Response(stream);
  } catch (error: any) {
    console.error("Error in handler function: ", error.message);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};

export default handler;







// import { NextApiRequest, NextApiResponse } from 'next';
// import { OpenAIStream } from '@/utils/answer';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     // Ensure the request method is POST
//     if (req.method !== 'POST') {
//       res.status(405).json({ message: 'Method Not Allowed. Only POST requests are accepted.' });
//       return;
//     }

//     // Ensure the required data exists in the body
//     const { prompt, apiKey } = (await req.json()) as {
//       prompt: string;
//       apiKey: string;
//     };    
    
//     if (!prompt || !apiKey) {
//       res.status(400).json({ message: 'Bad Request. Prompt and API key are required.' });
//       return;
//     }

//     const stream = await OpenAIStream(prompt);

//     res.status(200).json(stream);
//   } catch (error: any) {
//     console.error('Error in handler function: ', error.message);
//     res.status(500).json({ message: `Server error: ${error.message}` });
//   }
// }



// import { OpenAIModel } from "@/types";
// import { OpenAIStream } from "@/utils/answer";

// export const config = {
//   runtime: "edge"
// };



// const handler = async (req: Request): Promise<Response> => {
//   try {
//     const { prompt, model } = (await req.json()) as {
//       prompt: string;
//       model: OpenAIModel;
//     };

//     // const apiKey = process.env.ATHENA_API_KEY;

//     const stream = await OpenAIStream(prompt, model);

//     return new Response(stream);
//   } catch (error) {
//     console.error(error);
//     return new Response("Error", { status: 500 });
//   }
// };

// export default handler;



// import { NextApiRequest, NextApiResponse } from 'next';
// import { OpenAIStream } from '@/utils/answer';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     // Ensure the request method is POST
//     if (req.method !== 'POST') {
//       res.status(405).json({ message: 'Method Not Allowed. Only POST requests are accepted.' });
//       return;
//     }

//     // Ensure the required data exists in the body
//     const { prompt, apiKey } = req.body as {
//       prompt: string;
//       apiKey: string;
//     };

//     if (!prompt || !apiKey) {
//       res.status(400).json({ message: 'Bad Request. Prompt and API key are required.' });
//       return;
//     }

//     const stream = await OpenAIStream(prompt);

//     res.status(200).json(stream);
//   } catch (error: any) {
//     console.error('Error in handler function: ', error.message);
//     res.status(500).json({ message: `Server error: ${error.message}` });
//   }
// }
