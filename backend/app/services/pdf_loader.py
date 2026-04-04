from pypdf import PdfReader
from app.core.vector_store import get_vector_store
from io import BytesIO
import uuid

def extract_text_from_pdf(file_bytes: bytes) -> list:
    """
    Read PDF from bytes and extract text page by page
    Returns list of dicts with text and page number
    """
    pdf_file = BytesIO(file_bytes)
    reader = PdfReader(pdf_file)
    pages = []
    
    for page_num, page in enumerate(reader.pages):
        text = page.extract_text()
        
        if text and text.strip():
            pages.append({
                "text": text,
                "page_number": page_num + 1
            })
            
    return pages

def chunk_pages(pages: list, chunk_size: int = 500, overlap:int = 50) -> list:
    """
    Read PDF from bytes and extract text page by page
    Returns list of dicts with text and page number
    """
    chunks = []
    
    for page in pages:
        text = page["text"]
        page_number = page["page_number"]
        
        if len(text) <=chunk_size:
            chunks.append({
                "text": text,
                "page_number": page_number
            })
        else:
            start = 0
            while start < len(text):
                end = start + chunk_size
                chunk_text = text[start:end]
                
                chunks.append({
                    "text": chunk_text,
                    "page_number": page_number
                })
                
                start = end - overlap
    return chunks

def ingest_pdf(file_bytes:bytes, filename: str)-> dict:
    """
    Full pipeline:
    PDF bytes → extract pages → chunk → embeddings → ChromaDB
    """
    pdf_id = str(uuid.uuid4())[:8]
    
    pages = extract_text_from_pdf(file_bytes)
    if not pages:
        return ValueError("Could not extract text from PDF")
    
    chunks = chunk_pages(pages)
    
    vector_store = get_vector_store(collection_name=f"pdf_{pdf_id}")
    texts = [chunk["text"] for chunk in chunks]
    metadatas = [
        {
            "source": filename,
            "file_name": filename,
            "pdf_id": pdf_id,
            "page_number": chunk["page_number"]
        }
        for chunk in chunks
    ] 
    
    vector_store.add_texts(texts=texts, metadatas=metadatas)
    
    return {
        "pdf_id": pdf_id,
        "filename": filename,
        "total_pages": len(pages),
        "total_chunks": len(chunks),
        "message": f"Successfully ingested {len(chunks)} chunks from {filename}"
    }