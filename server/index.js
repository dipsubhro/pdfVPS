// import express from 'express'
// import cors from 'cors'
// import multer from 'multer';

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, '/uploads')
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//       cb(null,`${uniqueSuffix}-${file.filename}`)
//     }
//   })

// const upload = multer({ storage:storage });

// const app = express();

// app.use(cors());

// app.get('/', (req , res) => {
//    return res.json({status : "All good"})
// })

// app.post('/upload/pdf', upload.single('pdf'), (req , res) => {
//     return res.json({ message:'uploaded' });
// });

// const PORT = 8000;

// app.listen(PORT,()=> {
//     console.log(`server started on port ${PORT}`)
// });

import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Queue } from "bullmq";
import { CustomLocalEmbeddings } from "./custom-embedding.js";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();


const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: "6379",
  },
});

const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// app.get("/chat", async (req, res) => {
//   const userquery = "what is GST";
//   const embeddings = new CustomLocalEmbeddings();
//   const vectorStore = await QdrantVectorStore.fromExistingCollection(
//     embeddings,
//     {
//       url: "http://localhost:6333",
//       collectionName: "langchainjs-testing",
//     }
//   );
//   const retriever = vectorStore.asRetriever({
//     k: 2,
//   });

//   const result = await retriever.invoke("userquery");

//   const SYSTEM_PROMPT = `You are a helpful AI assisstant who answers the user query based on the available context from pdf file, Context: ${JSON.stringify(result)}`;

//   const chatresult = await ai.models.generateContent({
//     model: 'gemini-2.0-flash',
//     messages: [
//       {role:"system",content:SYSTEM_PROMPT},
//       {role:"user",content:userquery }
//     ]
//   })

//   return res.json({ message: chatresult.choices[0].message.content, docs: result });
// });

app.get("/chat", async (req, res) => {
  // const userquery = "what is this pdf about? give me a brief summary";
  const userquery = req.query;
  const embeddings = new CustomLocalEmbeddings();
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "langchainjs-testing",
    }
  );

  const retriever = vectorStore.asRetriever({
    k: 2,
  });

  const result = await retriever.invoke("userquery");
  console.log(result);
  const SYSTEM_PROMPT = `You are a helpful AI assistant. Answer concisely in 1-3 sentences based on the provided PDF context. Do not use bold, italic, lists, or other formatting. If the context is insufficient, answer briefly using your general knowledge. Context: ${JSON.stringify(
    result
  )}`;

  // Normalize user query into a string
  let userInput = "";
  if (typeof req.query === "string") {
    userInput = req.query;
  } else if (req.query && Object.keys(req.query).length > 0) {
    // Prefer common keys, otherwise stringify
    userInput = req.query.q || req.query.query || JSON.stringify(req.query);
  }

  // The GenAI node client doesn't support a separate system role in this SDK,
  // so pass the system prompt concatenated into the user content (previous working approach).
  const combinedQuery = `${SYSTEM_PROMPT}\n\n${userInput}`;

  const chatresult = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: combinedQuery }] }],
  });

  // const chatresult = await ai.models.generateContent({
  //   model: "gemini-2.0-flash",
  //   contents: [
  //     { role: "system", parts: [{ text: "SYSTEM_PROMPT" }] },
  //     { role: "user", parts: [{ text: "userquery" }] },
  //   ],
  // });

  console.log("Chat Result:", chatresult);

  let messageContent = "";
  if (
    chatresult &&
    chatresult.candidates &&
    chatresult.candidates.length > 0 &&
    chatresult.candidates[0].content &&
    chatresult.candidates[0].content.parts &&
    chatresult.candidates[0].content.parts.length > 0 &&
    chatresult.candidates[0].content.parts[0].text
  ) {
    messageContent = chatresult.candidates[0].content.parts[0].text;
  } else {
    messageContent =
      "Error: Could not retrieve a response or the response format was unexpected.";
    console.error("Gemini API returned an unexpected response:", chatresult);
  }
  // Post-process: enforce concise output as a safety net (max 3 sentences)
  const truncateToSentences = (txt, maxSentences = 3) => {
    if (!txt) return txt;
    // Split on sentence-ending punctuation followed by space/newline
    const parts = txt.split(/(?<=[.!?])\s+/);
    if (parts.length <= maxSentences) return txt.trim();
    return parts.slice(0, maxSentences).join(" ").trim();
  };

  messageContent = truncateToSentences(messageContent, 3);
  return res.json({ message: messageContent, docs: result });
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  await queue.add(
    "file-ready",
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );
  return res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
  });
});

// Endpoint to clear Qdrant collection used by the app. Client will call this on page load/reload.
app.post("/clear-qdrant", async (req, res) => {
  const collectionName = "langchainjs-testing";
  const qdrantUrl = `http://localhost:6333/collections/${collectionName}`;
  try {
    // Use native fetch (Node 18+) to delete the collection. If it doesn't exist, Qdrant returns 404.
    const response = await fetch(qdrantUrl, { method: "DELETE" });
    if (response.ok) {
      return res.json({ status: "deleted", collection: collectionName });
    }

    const text = await response.text();
    // If 404 (collection not found), treat as success (already clear)
    if (response.status === 404) {
      return res.json({ status: "not_found", collection: collectionName });
    }

    console.error("Failed to delete Qdrant collection", response.status, text);
    return res.status(500).json({
      error: "qdrant_delete_failed",
      status: response.status,
      detail: text,
    });
  } catch (err) {
    console.error("Error deleting Qdrant collection:", err);
    return res
      .status(500)
      .json({ error: "exception", message: err?.message || String(err) });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke on the server!" });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
