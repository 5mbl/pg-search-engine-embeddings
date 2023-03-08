/**
 * this code snippet is a crucial part of the search functionality 
 * in this project, as it allows the user to perform a search based on 
 * the query's text embedding using the Supabase database and OpenAI API.
 */

import { supabaseAdmin } from "@/utils";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { query, apiKey, matches } = (await req.json()) as {
      query: string;
      apiKey: string;
      matches: number;
    };

    // clear input
    const input = query.replace(/\n/g, " ");

    // POST request is made to the OpenAI embeddings API to retrieve the embedding vector for the user's search query
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      method: "POST",
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input
      })
    });

    // response is parsed as JSON.
    const json = await res.json();

    // accessing the embedding property of that object
    const embedding = json.data[0].embedding;

    // make a remote procedure call (RPC) to the Supabase database to perform a search, based on the query's text embedding
    const { data: chunks, error } = await supabaseAdmin.rpc("pg_search", {
      query_embedding: embedding,
      similarity_threshold: 0.01,
      match_count: matches
    });

    if (error) {
      console.error(error);
      return new Response("Error", { status: 500 });
    }

    /**This code creates a new Response object with the HTTP status code 200 
     * and the response body set to the stringified chunks object. The chunks 
     * object contains the results of a database search operation */
    return new Response(JSON.stringify(chunks), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
