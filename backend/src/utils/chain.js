import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RetrievalQAChain } from "langchain/chains";
import dotenv from "dotenv";
dotenv.config();

export const answerQuestion = async (question) => {
  // Reconnect to Chroma collection
  const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: "my_docs",
    url: "http://localhost:8000",
  });

  // Initialize LLM
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.3,
    apiKey: process.env.OPENAI_API_KEY
  });

  // Create RAG chain: Retrieve relevant chunks → Generate answer
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    returnSourceDocuments: true
  });

  console.log("🧠 Retrieving and generating answer...");
  const response = await chain.invoke({ query: question });
  return response.text;
};
