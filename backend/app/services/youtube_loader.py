from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import WebshareProxyConfig
from app.core.vector_store import get_vector_store
import os

def extract_video_id(url: str)->str:
    if "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    elif "v=" in url:
        return url.split("v=")[1].split("&")[0]
    else: 
        raise ValueError("Invalid YouTube URL")
    
import requests

def get_transcript(video_id: str) -> list:
    url = "https://api.supadata.ai/v1/youtube/transcript"
    headers = {"x-api-key": os.getenv("SUPADATA_API_KEY")}
    params = {"videoId": video_id, "lang": "en"}
    
    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    
    content = data.get("content", [])
    
    if not content:
        raise ValueError("No transcript found for this video")
    
    transcript = []
    for item in content:
        # handle both text and segment types
        if isinstance(item, dict) and item.get("text"):
            transcript.append({
                "text": item["text"],
                "start": item.get("offset", 0) / 1000,
                "duration": item.get("duration", 0) / 1000
            })
    
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