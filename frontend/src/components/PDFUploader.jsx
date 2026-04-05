import { useState } from "react"
import axios from "axios"

function PDFUploader({ onIngested }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected && selected.type === "application/pdf") {
      setFile(selected)
      setError(null)
    }
    else {
      setError("Please select a valid PDF file.")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await axios.post("http://127.0.0.1:8000/ingest/pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

      onIngested(response.data.pdf_id)
    }
    catch (error) {
      setError("Failed to process PDF. Try again later.")
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>PDF Document</h2>
      <p style={styles.description}>
        Upload a PDF to chat with its contents
      </p>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="pdf-input"
      />

      <label htmlFor="pdf-input" style={styles.fileLabel}>
        {file ? file.name : "Choose PDF file"}
      </label>

      <button
        style={{
          ...styles.button,
          opacity: loading || !file ? 0.6 : 1,
          cursor: loading || !file ? "not-allowed" : "pointer"
        }}
        onClick={handleUpload}
        disabled={loading || !file}
      >
        {loading ? "Processing PDF..." : "Upload PDF"}
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
  fileLabel: {
    display: "block",
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "1px dashed #444",
    background: "#0f0f0f",
    color: "#888",
    fontSize: "0.9rem",
    marginBottom: "0.75rem",
    cursor: "pointer",
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    background: "#4444ff",
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

export default PDFUploader