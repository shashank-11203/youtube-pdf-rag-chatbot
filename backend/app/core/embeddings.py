from langchain_huggingface import HuggingFaceEmbeddings

def get_embeddings():
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLm-L6-v2"
    )
    return embeddings