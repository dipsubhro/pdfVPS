from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

@app.route("/embed", methods=["POST"])
def embed():
    data = request.json
    texts = data.get("texts", [])
    
    vectors = model.encode(texts).tolist()
    return jsonify({"embeddings": vectors})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005)
