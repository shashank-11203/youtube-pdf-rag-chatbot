from app.core.embeddings import get_embeddings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File
from app.core.llm import get_llm
from app.core.embeddings import get_embeddings
from app.core.vector_store import get_vector_store
from app.services.youtube_loader import ingest_youtube_video
from app.services.chat_service import chat_with_video, chat_with_pdf, reset_session
from app.services.pdf_loader import ingest_pdf

app = FastAPI(title="RAG Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://youtube-pdf-rag-chatbot.vercel.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "RAG Chatbot API is run"}

# test
@app.get("/test-llm")
def test_llm():
    llm = get_llm()
    response = llm.invoke("Say hello in one sentence")
    return {"response": response.content}

@app.get("/test-embeddings")
def test_embeddings():
    embeddings = get_embeddings()
    vector = embeddings.embed_query("Hello this is a test")
    
    return {
        "vector": len(vector),
        "first_5_embeddings": vector[:5]
    }
    
@app.get("/test-vectorstore")
def test_vector_store():
    vector_store = get_vector_store()
    
    vector_store.add_texts(
        texts=["FastAPI is a modern Python web framework"],
        metadatas=[{"source":"test", "page": 1}]
    )
    
    results = vector_store.similarity_search(
        "what is FastAPI?",
        k=1
    )
    
    return {
        "query": "what is FastAPI?",
        "results": results[0].page_content,
        "metadata": results[0].metadata
    }

@app.post("/ingest/youtube")
def ingest_youtube(data: dict):
    url = data.get("url")
    if not url:
        return {"error": "URL is required"}
    
    result = ingest_youtube_video(url)
    return result

@app.post("/chat/youtube")
def chat_youtube(data: dict):
    video_id = data.get("video_id")
    question = data.get("question")
    session_id = data.get("session_id", "default")
    
    if not video_id or not question:
        return {"error": "video_id and question are required"}
    
    result = chat_with_video(video_id, question, session_id)
    return result

@app.post("/ingest/pdf")
async def ingest_pdf_route(file: UploadFile = File(...)):
    file_bytes = await file.read()
    
    result = ingest_pdf(
        file_bytes=file_bytes,
        filename=file.filename
    )
    return result

@app.post("/chat/pdf")    
def chat_pdf(data: dict):
    pdf_id = data.get("pdf_id")
    question = data.get("question")
    session_id = data.get("session_id", "default")
    
    if not pdf_id or not question:
        return {
            "error": "pdf_id and question are required"
        }
    
    result = chat_with_pdf(pdf_id, question, session_id)
    return result

@app.post("/reset")
def reset(data:dict):
    session_id = data.get("session_id", "default")
    reset_session(session_id)
    return {"message" : "Session cleared"}