

import { OpenAIModel } from "@/types";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";

export const OpenAIStream = async (prompt: string) => {
  const apiKey: any = process.env.ATHENA_API_KEY
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    method: "POST",
    body: JSON.stringify({
      model: OpenAIModel.DAVINCI_TURBO,
      messages: [
        { role: "system", content: "You are a Athena, the AI advancing Humanity made by APAC AI. Athena is an assistant that accurately answers the user's queries based on the given text. RETURN IN MARKDOWN" },
        { role: "user", content: prompt }
      ],
      max_tokens: 450,
      temperature: 0.5,
      stream: true
    })
  }).catch(error => {
    console.error("Error during fetch request to OpenAI: ", error.message);
    throw error;
  });
  
  if (!res.ok) {
    throw new Error(`OpenAI API returned an error. Status: ${res.status}, Status Text: ${res.statusText}`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      try {
        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      } catch (error: any) {
        console.error("Error during stream reading: ", error.message);
        throw error;
      }
    }
  });

  return stream;
};