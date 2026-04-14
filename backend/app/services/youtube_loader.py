from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import WebshareProxyConfig
from app.core.vector_store import get_vector_store

def extract_video_id(url: str)->str:
    if "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    elif "v=" in url:
        return url.split("v=")[1].split("&")[0]
    else: 
        raise ValueError("Invalid YouTube URL")
    
def get_transcript(video_id: str) -> list:
    ytt = YouTubeTranscriptApi(
        proxy_config=WebshareProxyConfig(
            proxy_username="",
            proxy_password="",
        )
    )
    fetched = ytt.fetch(video_id)
    
    transcript = [
        {
            "text": snippet.text,
            "start": snippet.start,
            "duration": snippet.duration
        }
        for snippet in fetched
    ]
    return transcript

def format_transcript(transcript: list) -> list:
    """
    Convert transcript list into text chunks with timestamps
    Each chunk = 30 seconds of transcript combined together
    We keep timestamp so we can cite exact moment in video
    """
    chunks = []
    current_text = ""
    current_start = 0
    
    for entry in transcript:
        current_text += entry["text"]
        
        if entry["start"] - current_start >= 30:
            chunks.append({
                "text": current_text,
                "start_time": int(current_start),
                "timestamp": f"{int(current_start//60)}:{int(current_start%60):02d}"
            })
            current_text = ""
            current_start = entry["start"]
    
    if current_text.strip():
        chunks.append({
            "text": current_text.strip(),
            "start_time": int(current_start),
            "timestamp": f"{int(current_start//60)}:{int(current_start%60):02d}"
        })
    
    return chunks

def ingest_youtube_video(url: str) -> dict:
    """
    Full pipeline:
    URL → transcript → chunks → embeddings → ChromaDB
    """

    video_id = extract_video_id(url)
    
    transcript = get_transcript(video_id)
    
    chunks = format_transcript(transcript)
    
    vectore_store = get_vector_store(collection_name=f"video_{video_id}")
    
    texts = [chunk["text"] for chunk in chunks]
    metadatas = [
        {
            "source": "youtube",
            "video_id": video_id,
            "url": url,
            "timestamp": chunk["timestamp"],
            "start_time": chunk["start_time"]
        }
        for chunk in chunks
    ]
    
    vectore_store.add_texts(texts=texts, metadatas=metadatas)
    
    return {
        "video_id": video_id,
        "total_chunks": len(chunks),
        "message": f"Successfully ingested {len(chunks)} chunks from video"
       }