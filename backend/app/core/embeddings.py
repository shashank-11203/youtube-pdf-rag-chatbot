from langchain_huggingface import HuggingFaceEndpointEmbeddings
from app.config import HF_TOKEN

def get_embeddings():
    embeddings = HuggingFaceEndpointEmbeddings(
        model="sentence-transformers/all-MiniLM-L6-v2",
        huggingfacehub_api_token=HF_TOKEN
    )
    return embeddings