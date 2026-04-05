import { useState, useRef, useEffect } from "react"
import axios from "axios"

export default function ChatWindow({ sourceId, sourceType, onReset }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Ready! Ask me anything about this ${sourceType === "youtube" ? "video" : "PDF"}.`
    }
  ])
  const [question, setQuestion] = useState("")
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSend = async () => {
    if (!question.trim() || loading) return
    const q = question
    setQuestion("")
    setMessages(prev => [...prev, { role: "user", content: q }])
    setLoading(true)

    try {
      const endpoint = sourceType === "youtube"
        ? "http://127.0.0.1:8000/chat/youtube"
        : "http://127.0.0.1:8000/chat/pdf"
      const payload = sourceType === "youtube"
        ? { video_id: sourceId, question: q }
        : { pdf_id: sourceId, question: q }

      const res = await axios.post(endpoint, payload)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.data.answer,
        citations: res.data.citations
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Something went wrong. Please try again."
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.wrap}>

      {/* header */}
      <div style={S.header}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
          <span style={{
            ...S.badge,
            background: sourceType === "youtube"
              ? "rgba(255,60,60,0.15)"  : "rgba(91,78,255,0.15)",
            color:       sourceType === "youtube" ? "#ff6b6b" : "#9d8fff",
            border:      `1px solid ${sourceType === "youtube" ? "rgba(255,60,60,0.25)" : "rgba(91,78,255,0.25)"}`,
          }}>
            {sourceType === "youtube" ? "▶ YouTube" : "📄 PDF"}
          </span>
          <span style={{ color:"#444", fontSize:"0.8rem", fontFamily:"monospace" }}>
            {sourceId}
          </span>
        </div>
        <button className="btn-ghost" style={{ padding:"0.35rem 0.85rem", fontSize:"0.8rem" }} onClick={onReset}>
          ← New source
        </button>
      </div>

      {/* messages */}
      <div style={S.messages}>
        {messages.map((msg, i) => (
          <div key={i} className="msg-enter" style={{
            display:"flex",
            flexDirection:"column",
            alignItems: msg.role === "user" ? "flex-end" : "flex-start",
            animationDelay: `${i * 0.04}s`
          }}>
            {/* label */}
            <span style={{ fontSize:"0.7rem", color:"#444", marginBottom:"0.3rem", paddingLeft:4 }}>
              {msg.role === "user" ? "You" : "ContextIQ"}
            </span>

            {/* bubble */}
            <div style={{
              ...S.bubble,
              background:   msg.role === "user" ? "linear-gradient(135deg,#5b4eff,#7c5cff)" : "#0e0e1a",
              border:       msg.role === "user" ? "none" : "1px solid #1e1e30",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              alignSelf:    msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <p style={{ fontSize:"0.92rem", lineHeight:1.65, color: msg.role === "user" ? "#fff" : "#d8d8e8" }}>
                {msg.content}
              </p>
            </div>

            {/* citations */}
            {msg.citations?.length > 0 && (
              <div style={S.citations}>
                <p style={S.citLabel}>Sources used</p>
                {msg.citations.map((c, j) => (
                  <div key={j} style={S.citation}>
                    <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.35rem", flexWrap:"wrap" }}>
                      {c.timestamp && (
                        <span style={S.citBadge}>⏱ {c.timestamp}</span>
                      )}
                      {c.page_number && (
                        <span style={S.citBadge}>📄 Page {c.page_number}</span>
                      )}
                    </div>
                    <p style={S.citPreview}>{c.text_preview}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* typing indicator */}
        {loading && (
          <div className="msg-enter" style={{ display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
            <span style={{ fontSize:"0.7rem", color:"#444", marginBottom:"0.3rem", paddingLeft:4 }}>ContextIQ</span>
            <div style={{ ...S.bubble, background:"#0e0e1a", border:"1px solid #1e1e30", borderRadius:"18px 18px 18px 4px" }}>
              <div style={{ display:"flex", gap:5, alignItems:"center", padding:"0.1rem 0.2rem" }}>
                <span className="dot1" style={S.dot}/>
                <span className="dot2" style={S.dot}/>
                <span className="dot3" style={S.dot}/>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* input */}
      <div style={S.inputRow}>
        <input
          className="input-field"
          style={{ padding:"0.8rem 1rem", fontSize:"0.92rem" }}
          placeholder="Ask a question..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button
          className="btn-primary"
          style={{ padding:"0.8rem 1.4rem", fontSize:"0.9rem", whiteSpace:"nowrap" }}
          onClick={handleSend}
          disabled={loading || !question.trim()}
        >
          Send
        </button>
      </div>

    </div>
  )
}

const S = {
  wrap: {
    display:"flex", flexDirection:"column",
    height:"72vh",
    background:"#08080f",
    border:"1px solid #1a1a2e",
    borderRadius:16,
    overflow:"hidden",
  },
  header: {
    display:"flex", alignItems:"center", justifyContent:"space-between",
    padding:"0.9rem 1.25rem",
    borderBottom:"1px solid #12121e",
    background:"#0a0a14",
  },
  badge: {
    fontSize:"0.75rem", fontWeight:600,
    padding:"0.25rem 0.65rem", borderRadius:20,
  },
  messages: {
    flex:1, overflowY:"auto",
    padding:"1.25rem",
    display:"flex", flexDirection:"column", gap:"1.1rem",
  },
  bubble: {
    maxWidth:"78%",
    padding:"0.75rem 1rem",
  },
  citations: {
    marginTop:"0.5rem",
    width:"78%",
  },
  citLabel: {
    fontSize:"0.7rem", color:"#444",
    marginBottom:"0.4rem", paddingLeft:2,
    textTransform:"uppercase", letterSpacing:"0.06em",
  },
  citation: {
    background:"#0a0a14",
    border:"1px solid #1a1a2e",
    borderRadius:10,
    padding:"0.6rem 0.8rem",
    marginBottom:"0.35rem",
  },
  citBadge: {
    background:"#131320",
    border:"1px solid #2a2a40",
    color:"#666",
    fontSize:"0.72rem",
    padding:"0.15rem 0.5rem",
    borderRadius:6,
  },
  citPreview: {
    color:"#555",
    fontSize:"0.78rem",
    lineHeight:1.5,
  },
  inputRow: {
    display:"flex", gap:"0.75rem",
    padding:"1rem 1.25rem",
    borderTop:"1px solid #12121e",
    background:"#0a0a14",
  },
  dot: {
    width:7, height:7,
    borderRadius:"50%",
    background:"#5b4eff",
    display:"inline-block",
  },
}