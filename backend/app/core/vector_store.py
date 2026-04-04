import chromadb
from langchain_chroma import Chroma
from app.core.embeddings import get_embeddings
import os

Chroma_PATH = os.path.join(os.path.dirname(__file__), '..','..','vectorstore')

def get_vector_store(collection_name: str = "rag_collection"):
    embeddings = get_embeddings()
    
    vectore_store = Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory=Chroma_PATH
    )
    return vectore_store