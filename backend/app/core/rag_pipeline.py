from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from app.core.vector_store import get_vector_store
from app.core.llm import get_llm

chat_histories = {}

def get_history(session_id:str)->list:
    """Get or create history for this session"""
    if session_id not in chat_histories:
        chat_histories[session_id] = []
    return chat_histories[session_id]

def clear_history(session_id:str):
    """Clear history for this session"""
    if session_id in chat_histories:
        del chat_histories[session_id]

def run_rag(collection_name:str, question:str, source_type:str, session_id:str)->dict:
    """
    Single reusable RAG function for both YouTube and PDF
    source_type = "youtube" or "pdf"
    with conversation memory
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
    
    history = get_history(session_id)
    
    history_text = ""
    if history:
        for msg in history[-6:]:
            if isinstance(msg, HumanMessage):
                history_text += f"User: {msg.content}\n"
            elif isinstance(msg, AIMessage):
                history_text += f"Assistant: {msg.content}\n"
    
    source_label = "YouTube video transcript" if source_type == "youtube" else "PDF document"
    
    prompt = f"""You are helpful assistant that answers questions about a {source_label}. Answer the questions based ONLY on the provided context below.
    If the answer is not in the context, say "This topic was not covered in the {source_label}." Do not makeup any information.Use the conversation history to understand follow-up questions.
    Keep your answer clear and consice.
    
    Conversation History:
    {history_text if history_text else "No previous messages."}
    
    Relavant Context:
    {context}
    
    Current Question: {question}
    
    Answer:"""
    
    llm = get_llm()
    response = llm.invoke(prompt)
    answer = response.content
    
    history.append(HumanMessage(content=question))
    history.append(AIMessage(content=answer))
    
    return {
        "answer": answer,
        "citations": citations,
        "source_type": source_type
    }