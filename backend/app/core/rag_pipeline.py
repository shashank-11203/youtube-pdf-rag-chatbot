from app.core.vector_store import get_vector_store
from app.core.llm import get_llm

def run_rag(collection_name:str, question:str, source_type:str)->dict:
    """
    Single reusable RAG function for both YouTube and PDF
    source_type = "youtube" or "pdf"
    """
    
    vector_store = get_vector_store(collection_name=collection_name)
    
    results = vector_store.similarity_search(question, k=3)
    
    if not results:
        return {
            "answer": "I could not find relavant information",
            "citations": [],
            "source_type": source_type
        }
        
    context = "\n\n".join([doc.page_content for doc in results])
    
    citations = []
    for doc in results:
        if source_type == "youtube":
            citations.append({
                "timestamp": doc.metadata.get("timestamp", "unknown"),
                "start_time": doc.metadata.get("start_time", 0),
                "video_id": doc.metadata.get("video_id", ""),
                "text_preview": doc.page_content[:150] + "..."
            })
        else:
            citations.append({
                "page_number": doc.metadata.get("page_number", "unknown"),
                "filename": doc.metadata.get("filename", "unknown"),
                "text_preview": doc.page_content[:150] + "..."
            })
        
    
    source_label = "YouTube video transcript" if source_type == "youtube" else "PDF document"
    
    prompt = f"""You are helpful assistant that answers questions about a {source_label}. Answer the questions based ONLY on the provided context below.
    If the answer is not in the context, say "This topic was not covered in the {source_label}." Do not makeup any information.
    Keep your answer clear and consice.
    
    Context:
    {context}
    
    Question: {question}
    
    Answer:"""
    
    llm = get_llm()
    response = llm.invoke(prompt)
    
    return {
        "answer": response.content,
        "citations": citations,
        "source_type": source_type
    }