from langchain_groq import ChatGroq
from app.config import GROQ_API_KEY

def get_llm():
    llm=ChatGroq(
        api_key=GROQ_API_KEY,
        model="llama-3.3-70b-versatile",
        temperature=0.3
    )
    return llm