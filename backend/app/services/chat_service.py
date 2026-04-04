from app.core.vector_store import get_vector_store
from app.core.llm import get_llm
from app.core.rag_pipeline import run_rag

def chat_with_video(video_id:str, question:str)->dict:
    return run_rag (
        collection_name=f"video_{video_id}",
        question=question,
        source_type="youtube"
    )

def chat_with_pdf(pdf_id:str, question:str) -> dict:
   return run_rag(
       collection_name=f"pdf_{pdf_id}",
       question=question,
       source_type="pdf"
   )