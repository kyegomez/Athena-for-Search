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




