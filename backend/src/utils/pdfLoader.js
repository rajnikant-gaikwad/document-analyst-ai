// This file loads PDF, splits into chunks, and stores in Chroma vector DB.

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import dotenv from "dotenv";
dotenv.config();

export const loadPDFandStore = async (filePath) => {
  console.log("🧩 Loading PDF...");
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  // Split large text into smaller pieces (~1000 chars)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });
  const splitDocs = await splitter.splitDocuments(docs);

  console.log(`📄 Created ${splitDocs.length} chunks`);

  // Convert text into embeddings and store in Chroma
  const embeddings = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });
  const vectorStore = await Chroma.fromDocuments(splitDocs, embeddings, {
    collectionName: "my_docs",
    url: "http://localhost:8000" // Chroma server (run separately)
  });

  console.log("✅ PDF embedded and stored in Chroma");
  return vectorStore;
};
