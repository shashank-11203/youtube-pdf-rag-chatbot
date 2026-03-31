from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.llm import get_llm

app = FastAPI(title="RAG Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "RAG Chatbot API is run"}

@app.get("/test-llm")
def test_llm():
    llm = get_llm()
    response = llm.invoke("Say hello in one sentence")
    return {"response": response.content}