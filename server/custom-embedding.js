import { Embeddings } from "@langchain/core/embeddings";

export class CustomLocalEmbeddings extends Embeddings {
  async embedDocuments(texts) {
    const res = await fetch(process.env.EMBEDDING_MODEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
    });

    const data = await res.json();
    return data.embeddings;
  }

  async embedQuery(text) {
    const [embedding] = await this.embedDocuments([text]);
    return embedding;
  }
}
