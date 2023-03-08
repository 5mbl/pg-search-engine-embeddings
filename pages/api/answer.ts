/**
 * responsible for handling requests related to generating answers 
 * using the OpenAI API and returning the results to the client
 */

import { OpenAIStream } from "@/utils";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { prompt, apiKey } = (await req.json()) as {
      prompt: string;
      apiKey: string;
    };

    const stream = await OpenAIStream(prompt, apiKey);

    // returns Object as a HTTP response
    return new Response(stream);

  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
