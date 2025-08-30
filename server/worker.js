import { Worker } from "bullmq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { CustomLocalEmbeddings } from "/home/subhradip-sinha/Desktop/rag_pdf/server/custom-embedding.js";

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log("job:", job.data);
    const data = JSON.parse(job.data);
    /*jobs needed
      to read path
      chunk the pdf
      call the openai embedding model
      store the chunk in qdrant db    
    */

    // load the pdf
    const loader = new PDFLoader(data.path);
    const docs = await loader.load();
    docs[0];
    // const textSplitter = new CharacterTextSplitter({
    //   chunkSize: 300,
    //   chunkOverlap: 0,
    // });
    // const texts = await textSplitter.splitText(docs);
    const embeddings = new CustomLocalEmbeddings();
    
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "langchainjs-testing",
      }
    );

    await vectorStore.addDocuments(docs);
    console.log("All docs are added to vector store");
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: "6379",
    },
  }
);
