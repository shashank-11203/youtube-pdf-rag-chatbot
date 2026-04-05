import { useState, useEffect } from "react"
import ChatWindow from "./components/ChatWindow"
import PDFUploader from "./components/PDFuploader"
import YoutubeInput from "./components/YoutubeInput"

const BRAND = {
  name: "ContextIQ",         
  tagline: "Chat with any YouTube video or PDF — instantly.",
  author: "Shashank",         
  authorFull: "Built by Shashank Solanki",
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #080810;
    color: #e8e8f0;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50%       { opacity: 1;   transform: scale(1.08); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }

  .fade-up   { animation: fadeUp  0.5s ease both; }
  .fade-in   { animation: fadeIn  0.4s ease both; }
  .slide-in  { animation: slideIn 0.35s ease both; }

  .card {
    background: #0e0e1a;
    border: 1px solid #1e1e30;
    border-radius: 16px;
    transition: border-color 0.25s, box-shadow 0.25s;
  }
  .card:hover {
    border-color: #3a3a5c;
    box-shadow: 0 0 28px rgba(100, 80, 255, 0.08);
  }

  .btn-primary {
    background: linear-gradient(135deg, #5b4eff, #8b5cf6);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
  }
  .btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-primary:active:not(:disabled){ transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .btn-ghost {
    background: transparent;
    border: 1px solid #2a2a40;
    border-radius: 8px;
    color: #888;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-ghost:hover { border-color: #5b4eff; color: #c0b8ff; }

  .input-field {
    width: 100%;
    background: #06060f;
    border: 1px solid #1e1e30;
    border-radius: 10px;
    color: #e8e8f0;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input-field:focus {
    border-color: #5b4eff;
    box-shadow: 0 0 0 3px rgba(91,78,255,0.12);
  }
  .input-field::placeholder { color: #444; }

  /* grid bg */
  .grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(91,78,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(91,78,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* glow orb */
  .orb {
    position: fixed;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(91,78,255,0.07) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
    top: -100px; left: 50%; transform: translateX(-50%);
    animation: pulse 6s ease-in-out infinite;
  }

  /* typing dots */
  @keyframes dot { 0%,80%,100%{opacity:0;transform:scale(0.7)} 40%{opacity:1;transform:scale(1)} }
  .dot1{animation:dot 1.2s infinite 0s}
  .dot2{animation:dot 1.2s infinite 0.2s}
  .dot3{animation:dot 1.2s infinite 0.4s}

  /* message bubble entrance */
  .msg-enter {
    animation: fadeUp 0.3s ease both;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a2a40; border-radius: 4px; }
`


function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="url(#lg)"/>
      <path d="M9 16 L14 11 L19 16 L14 21 Z" fill="white" opacity="0.9"/>
      <path d="M15 16 L20 11 L25 16 L20 21 Z" fill="white" opacity="0.5"/>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b4eff"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function App() {
  const [activeSource, setActiveSource] = useState(null)
  const [sourceId, setSourceId]         = useState(null)
  const [sourceType, setSourceType]     = useState(null)
  const [mounted, setMounted]           = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleYouTubeIngested = (videoId) => {
    setSourceId(videoId); setSourceType("youtube"); setActiveSource("chat")
  }
  const handlePDFIngested = (pdfId) => {
    setSourceId(pdfId); setSourceType("pdf"); setActiveSource("chat")
  }
  const handleReset = () => {
    setActiveSource(null); setSourceId(null); setSourceType(null)
  }

  return (
    <>
      <style>{css}</style>
      <div className="grid-bg"/>
      <div className="orb"/>

      <div style={{ position:"relative", zIndex:1, maxWidth:780, margin:"0 auto", padding:"2rem 1.25rem", minHeight:"100vh", display:"flex", flexDirection:"column" }}>

        {/* ── NAV ── */}
        <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"3rem" }}
             className={mounted ? "fade-in" : ""}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
            <Logo/>
            <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:"1.2rem", letterSpacing:"-0.02em", color:"#e8e8f0" }}>
              {BRAND.name}
            </span>
          </div>
          <span style={{ fontSize:"0.78rem", color:"#555", fontWeight:500 }}>
            {BRAND.authorFull}
          </span>
        </nav>

        {/* ── HERO (only on landing) ── */}
        {!activeSource && (
          <div style={{ textAlign:"center", marginBottom:"3rem" }}
               className={mounted ? "fade-up" : ""}>
            <div style={{ display:"inline-block", background:"rgba(91,78,255,0.12)", border:"1px solid rgba(91,78,255,0.25)", borderRadius:20, padding:"0.3rem 0.9rem", fontSize:"0.75rem", color:"#9d8fff", marginBottom:"1.25rem", fontWeight:500 }}>
              Powered by RAG + Groq
            </div>
            <h1 style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:"clamp(2rem, 5vw, 3rem)", lineHeight:1.1, letterSpacing:"-0.03em", color:"#fff", marginBottom:"1rem" }}>
              Ask anything.<br/>
              <span style={{ background:"linear-gradient(90deg,#5b4eff,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Get answers.
              </span>
            </h1>
            <p style={{ color:"#666", fontSize:"1rem", maxWidth:480, margin:"0 auto" }}>
              {BRAND.tagline}
            </p>
          </div>
        )}

        {/* ── SOURCE SELECTOR ── */}
        {!activeSource && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem", flex:1 }}
               className={mounted ? "fade-up" : ""}>
            <YoutubeInput onIngested={handleYouTubeIngested}/>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
              <div style={{ flex:1, height:1, background:"#1a1a2e" }}/>
              <span style={{ color:"#444", fontSize:"0.78rem", fontWeight:600, letterSpacing:"0.08em" }}>OR</span>
              <div style={{ flex:1, height:1, background:"#1a1a2e" }}/>
            </div>
            <PDFUploader onIngested={handlePDFIngested}/>
          </div>
        )}

        {/* ── CHAT ── */}
        {activeSource === "chat" && (
          <div style={{ flex:1, display:"flex", flexDirection:"column" }}
               className="fade-up">
            <ChatWindow sourceId={sourceId} sourceType={sourceType} onReset={handleReset}/>
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer style={{ textAlign:"center", marginTop:"2.5rem", paddingTop:"1.5rem", borderTop:"1px solid #12121e" }}>
          <p style={{ color:"#333", fontSize:"0.78rem" }}>
            {BRAND.name} · {BRAND.authorFull} · {new Date().getFullYear()}
          </p>
        </footer>

      </div>
    </>
  )
}