import { useState } from "react"
import axios from "axios"

function YoutubeInput({ onIngested }) {
    const [url, setUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async () => {
        if (!url.trim()) return

        setLoading(true)
        setError(null)

        try {
            const response = await axios.post("http://127.0.0.1:8000/ingest/youtube",
                { url }
            )

            onIngested(response.data.video_id)
        } catch (err) {
            setError("Failed to load video. Check the URL and try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>YouTube Video</h2>
            <p style={styles.description}>
                Paste a YouTube URL to chat with its transcript
            </p>

            <input
                style={styles.input}
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            <button
                style={{
                    ...styles.button,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer"
                }}
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Loading transcript..." : "Load Video"}
            </button>

            {error && <p style={styles.error}>{error}</p>}
        </div>
    )
}

const styles = {
    container: {
        width: "100%",
        background: "#1a1a1a",
        borderRadius: "12px",
        padding: "1.5rem",
        border: "1px solid #2a2a2a",
    },
    heading: {
        fontSize: "1.1rem",
        fontWeight: "600",
        marginBottom: "0.4rem",
        color: "#fff",
    },
    description: {
        color: "#888",
        fontSize: "0.85rem",
        marginBottom: "1rem",
    },
    input: {
        width: "100%",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        border: "1px solid #333",
        background: "#0f0f0f",
        color: "#fff",
        fontSize: "0.9rem",
        marginBottom: "0.75rem",
        outline: "none",
    },
    button: {
        width: "100%",
        padding: "0.75rem",
        borderRadius: "8px",
        border: "none",
        background: "#ff4444",
        color: "#fff",
        fontSize: "0.95rem",
        fontWeight: "600",
        cursor: "pointer",
    },
    error: {
        color: "#ff6b6b",
        fontSize: "0.85rem",
        marginTop: "0.5rem",
    }
}

export default YoutubeInput