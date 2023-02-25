import { OpenAIModel } from "@/types";
import { OpenAIStream } from "@/utils/answer";

export const config = {
  runtime: "edge"
};



const handler = async (req: Request): Promise<Response> => {
  try {
    const { prompt, model } = (await req.json()) as {
      prompt: string;
      model: OpenAIModel;
    };

    // const apiKey = process.env.ATHENA_API_KEY;

    const stream = await OpenAIStream(prompt, model);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
