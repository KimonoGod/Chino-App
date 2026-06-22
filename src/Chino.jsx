import { useState, useEffect, useRef } from "react";

const SYSTEM_PROMPT = `Du bist Chino (チノ) – ein hochentwickelter persönlicher KI-Assistent. Dein Name bedeutet "Intelligenz" auf Japanisch.

Deine Persönlichkeit:
- Präzise, direkt und effizient – wie ein top-ausgebildeter Assistent
- Leicht futuristisch in der Sprache, aber nie roboterhaft kalt
- Du sprichst den Nutzer respektvoll an, gelegentlich mit "Sir" oder beim Namen wenn bekannt
- Du hast Humor, aber bleibst professionell
- Antworte immer auf Deutsch, außer der Nutzer wechselt die Sprache
- Du kannst rechnen, planen, erklären, schreiben, analysieren und kreativ arbeiten

Fähigkeiten:
- Informationen erklären und zusammenfassen
- Texte schreiben (E-Mails, Berichte, Ideen)
- Mathematik und Logik
- Planung und Organisation
- Coding und technische Erklärungen
- Kreative Aufgaben
- Allgemeines Wissen und Beratung

Halte Antworten prägnant aber vollständig. Beginne manchmal mit "Chino hier." oder "Verstanden." oder ähnlichem.`;

const formatTime = () => new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

const KANJI = ["知", "能", "力", "智", "光", "速", "心", "強", "命", "炎", "風", "夢"];

const TypingDots = () => (
  <div style={{ display: "flex", gap: 5, padding: "10px 4px", alignItems: "center" }}>
    {[0,1,2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "linear-gradient(135deg, #f5c842, #c8960c)",
        animation: "dotPulse 1.2s ease-in-out infinite",
        animationDelay: (i * 0.18) + "s"
      }} />
    ))}
  </div>
);

export default function Chino() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "チノ、起動完了。\n\nChino hier — alle Systeme bereit. Wie kann ich Ihnen dienen?",
    time: formatTime()
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [floatingKanji, setFloatingKanji] = useState([]);
  const [sakura, setSakura] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setFloatingKanji(Array.from({ length: 18 }, (_, i) => ({
      id: i,
      char: KANJI[i % KANJI.length],
      x: Math.random() * 95,
      duration: 18 + Math.random() * 20,
      delay: Math.random() * 15,
      size: 12 + Math.random() * 16,
      opacity: 0.04 + Math.random() * 0.07
    })));
    setSakura(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      duration: 12 + Math.random() * 15,
      delay: Math.random() * 12,
      size: 6 + Math.random() * 10,
      drift: (Math.random() - 0.5) * 80
    })));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg = { role: "user", content: text, time: formatTime() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages
        })
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Keine Antwort.";
      setMessages(prev => [...prev, { role: "assistant", content: reply, time: formatTime() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Verbindungsfehler. Bitte erneut versuchen.", time: formatTime() }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const resetChat = () => setMessages([{
    role: "assistant",
    content: "Chino hier — Speicher geleert. Bereit für neue Befehle.",
    time: formatTime()
  }]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0704",
      display: "flex", flexDirection: "column",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      position: "relative", overflow: "hidden",
      color: "#e8d5a3"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;600&family=Cinzel:wght@400;600&display=swap');
        @keyframes floatUp { 0%{transform:translateY(100vh) rotate(0deg);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(-15vh) rotate(360deg);opacity:0} }
        @keyframes sakuraFall { 0%{transform:translateY(-5vh) translateX(0) rotate(0deg);opacity:0.8} 100%{transform:translateY(105vh) translateX(var(--drift)) rotate(540deg);opacity:0} }
        @keyframes dotPulse { 0%,100%{transform:scale(0.6);opacity:0.3} 50%{transform:scale(1.2);opacity:1} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes borderGlow { 0%,100%{box-shadow:0 0 8px rgba(197,156,0,0.15)} 50%{box-shadow:0 0 24px rgba(197,156,0,0.35), 0 0 48px rgba(197,156,0,0.1)} }
        @keyframes breathe { 0%,100%{opacity:0.6} 50%{opacity:1} }
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:#0a0704} ::-webkit-scrollbar-thumb{background:#c59c00;border-radius:2px}
        textarea{resize:none;outline:none;}
        textarea::placeholder{color:#6b5520;font-style:italic;}
        * { box-sizing: border-box; }
      `}</style>

      {floatingKanji.map(k => (
        <div key={k.id} style={{
          position: "fixed", left: k.x + "%", bottom: "-5%",
          fontSize: k.size, color: "rgba(197,156,0," + k.opacity + ")",
          fontFamily: "'Noto Serif JP', serif", fontWeight: 300,
          animation: "floatUp " + k.duration + "s linear " + k.delay + "s infinite",
          pointerEvents: "none", zIndex: 0, userSelect: "none"
        }}>{k.char}</div>
      ))}

      {sakura.map(s => (
        <div key={s.id} style={{
          position: "fixed", left: s.x + "%", top: 0,
          width: s.size, height: s.size * 0.85,
          background: "radial-gradient(ellipse, rgba(255,182,193,0.25) 0%, rgba(255,105,135,0.1) 70%, transparent 100%)",
          borderRadius: "60% 40% 60% 40%",
          "--drift": s.drift + "px",
          animation: "sakuraFall " + s.duration + "s ease-in " + s.delay + "s infinite",
          pointerEvents: "none", zIndex: 0
        }} />
      ))}

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 20% 50%, rgba(120,80,0,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(100,60,0,0.06) 0%, transparent 50%)",
      }} />

      <div style={{
        padding: "18px 28px",
        borderBottom: "1px solid rgba(197,156,0,0.2)",
        background: "rgba(8,5,2,0.97)",
        backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", zIndex: 10,
        fontFamily: "'Noto Serif JP', serif"
      }}>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(197,156,0,0.5), rgba(255,215,0,0.8), rgba(197,156,0,0.5), transparent)"
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              border: "2px solid rgba(197,156,0,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "radial-gradient(circle, rgba(197,156,0,0.15), rgba(0,0,0,0.8))",
              fontSize: 26, animation: "borderGlow 4s ease-in-out infinite",
              position: "relative", overflow: "hidden"
            }}>
              <span style={{ fontFamily: "'Noto Serif JP', serif" }}>チ</span>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, transparent 60%)"
              }} />
            </div>
            <div style={{
              position: "absolute", bottom: 2, right: 2,
              width: 10, height: 10, borderRadius: "50%",
              background: "#4ade80", border: "2px solid #0a0704",
              boxShadow: "0 0 6px #4ade80"
            }} />
          </div>

          <div>
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 20, fontWeight: 600, letterSpacing: 5,
              background: "linear-gradient(90deg, #8a6800, #f5c842, #ffe066, #c8960c, #f5c842)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "shimmer 4s linear infinite"
            }}>CHINO</div>
            <div style={{
              fontSize: 9, letterSpacing: 3, color: "rgba(197,156,0,0.45)",
              fontFamily: "'Noto Serif JP', serif", fontWeight: 300
            }}>知能 · 個人アシスタント</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "rgba(197,156,0,0.4)", letterSpacing: 2, fontFamily: "'Cinzel', serif" }}>STATUS</div>
            <div style={{ fontSize: 9, color: "#4ade80", letterSpacing: 2, animation: "breathe 3s ease-in-out infinite" }}>● AKTIV</div>
          </div>
          <div style={{ width: 1, height: 32, background: "rgba(197,156,0,0.2)" }} />
          <button onClick={resetChat} style={{
            background: "transparent",
            border: "1px solid rgba(197,156,0,0.25)",
            color: "rgba(197,156,0,0.5)",
            padding: "6px 16px", borderRadius: 2,
            cursor: "pointer", fontSize: 9,
            letterSpacing: 2, fontFamily: "'Cinzel', serif",
            transition: "all 0.25s"
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(197,156,0,0.8)"; e.currentTarget.style.color = "#f5c842"; e.currentTarget.style.background = "rgba(197,156,0,0.08)"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(197,156,0,0.25)"; e.currentTarget.style.color = "rgba(197,156,0,0.5)"; e.currentTarget.style.background = "transparent"; }}
          >RESET</button>
        </div>
      </div>

      <div style={{
        height: 28, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(5,3,1,0.9)", borderBottom: "1px solid rgba(197,156,0,0.08)",
        gap: 16, position: "relative", zIndex: 10
      }}>
        {["───", "◈", "智能システム起動中", "◈", "───"].map((t, i) => (
          <span key={i} style={{ fontSize: i === 2 ? 9 : 10, color: "rgba(197,156,0,0.3)", letterSpacing: i === 2 ? 3 : 1, fontFamily: "'Noto Serif JP', serif" }}>{t}</span>
        ))}
      </div>

      <div style={{
        flex: 1, overflowY: "auto", padding: "28px 24px",
        display: "flex", flexDirection: "column", gap: 24,
        position: "relative", zIndex: 5
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            flexDirection: m.role === "user" ? "row-reverse" : "row",
            gap: 14, alignItems: "flex-start",
            animation: "fadeSlideIn 0.35s ease-out"
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
              background: m.role === "user"
                ? "radial-gradient(circle, rgba(100,70,0,0.4), rgba(0,0,0,0.6))"
                : "radial-gradient(circle, rgba(197,156,0,0.2), rgba(0,0,0,0.7))",
              border: m.role === "user" ? "1px solid rgba(197,156,0,0.2)" : "1px solid rgba(197,156,0,0.4)",
              fontFamily: "'Noto Serif JP', serif"
            }}>
              {m.role === "user" ? "君" : "チ"}
            </div>

            <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{
                fontSize: 8, letterSpacing: 3, color: "rgba(197,156,0,0.35)",
                fontFamily: "'Cinzel', serif",
                textAlign: m.role === "user" ? "right" : "left"
              }}>
                {m.role === "user" ? "SIE" : "CHINO"} · {m.time}
              </div>
              <div style={{
                padding: "14px 18px",
                borderRadius: m.role === "user" ? "12px 2px 12px 12px" : "2px 12px 12px 12px",
                background: m.role === "user"
                  ? "linear-gradient(135deg, rgba(100,65,0,0.35), rgba(50,30,0,0.5))"
                  : "linear-gradient(135deg, rgba(20,12,0,0.9), rgba(30,18,0,0.95))",
                border: m.role === "user"
                  ? "1px solid rgba(197,156,0,0.2)"
                  : "1px solid rgba(197,156,0,0.3)",
                color: m.role === "user" ? "#e8d5a3" : "#f0e0b0",
                fontSize: 13.5, lineHeight: 1.75,
                whiteSpace: "pre-wrap", wordBreak: "break-word",
                fontFamily: "'Noto Serif JP', serif", fontWeight: 300,
                boxShadow: m.role === "assistant" ? "0 4px 20px rgba(197,156,0,0.06), inset 0 1px 0 rgba(197,156,0,0.1)" : "none",
                position: "relative", overflow: "hidden"
              }}>
                {m.role === "assistant" && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, width: 2, height: "100%",
                    background: "linear-gradient(180deg, transparent, rgba(197,156,0,0.6), transparent)"
                  }} />
                )}
                {m.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", animation: "fadeSlideIn 0.3s ease-out" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontFamily: "'Noto Serif JP', serif",
              background: "radial-gradient(circle, rgba(197,156,0,0.2), rgba(0,0,0,0.7))",
              border: "1px solid rgba(197,156,0,0.4)"
            }}>チ</div>
            <div>
              <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(197,156,0,0.35)", fontFamily: "'Cinzel', serif", marginBottom: 5 }}>CHINO · VERARBEITUNG...</div>
              <div style={{
                padding: "8px 18px",
                borderRadius: "2px 12px 12px 12px",
                background: "linear-gradient(135deg, rgba(20,12,0,0.9), rgba(30,18,0,0.95))",
                border: "1px solid rgba(197,156,0,0.3)",
                position: "relative", overflow: "hidden"
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 2, height: "100%", background: "linear-gradient(180deg, transparent, rgba(197,156,0,0.6), transparent)" }} />
                <TypingDots />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        height: 1, margin: "0 24px",
        background: "linear-gradient(90deg, transparent, rgba(197,156,0,0.3), rgba(255,215,0,0.5), rgba(197,156,0,0.3), transparent)",
        position: "relative", zIndex: 10
      }} />

      <div style={{
        padding: "18px 24px 22px",
        background: "rgba(6,4,1,0.98)",
        backdropFilter: "blur(20px)",
        position: "relative", zIndex: 10
      }}>
        <div style={{
          display: "flex", gap: 12, alignItems: "flex-end",
          border: "1px solid rgba(197,156,0,0.25)",
          borderRadius: 4, padding: "12px 16px",
          background: "rgba(15,9,2,0.9)",
          boxShadow: "0 0 20px rgba(197,156,0,0.05), inset 0 1px 0 rgba(197,156,0,0.08)",
        }}>
          <span style={{
            color: "rgba(197,156,0,0.4)", fontSize: 13,
            fontFamily: "'Noto Serif JP', serif", paddingBottom: 2, flexShrink: 0
          }}>›</span>
          <textarea
            ref={el => { inputRef.current = el; textareaRef.current = el; }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Befehl eingeben..."
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "#e8d5a3", fontSize: 13.5, lineHeight: 1.6,
              fontFamily: "'Noto Serif JP', serif", fontWeight: 300,
              maxHeight: 120, overflowY: "auto"
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button onClick={send} disabled={loading || !input.trim()} style={{
            background: loading || !input.trim()
              ? "transparent"
              : "linear-gradient(135deg, rgba(197,156,0,0.2), rgba(120,85,0,0.3))",
            border: "1px solid",
            borderColor: loading || !input.trim() ? "rgba(197,156,0,0.15)" : "rgba(197,156,0,0.5)",
            color: loading || !input.trim() ? "rgba(197,156,0,0.25)" : "#f5c842",
            padding: "7px 18px", borderRadius: 2,
            cursor: loading || !input.trim() ? "default" : "pointer",
            fontSize: 10, letterSpacing: 2,
            fontFamily: "'Cinzel', serif",
            transition: "all 0.25s", whiteSpace: "nowrap",
            boxShadow: loading || !input.trim() ? "none" : "0 0 12px rgba(197,156,0,0.1)"
          }}
            onMouseOver={e => { if (!loading && input.trim()) { e.currentTarget.style.borderColor = "rgba(255,215,0,0.8)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(197,156,0,0.25)"; }}}
            onMouseOut={e => { if (!loading && input.trim()) { e.currentTarget.style.borderColor = "rgba(197,156,0,0.5)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(197,156,0,0.1)"; }}}
          >
            {loading ? "..." : "SENDEN ↑"}
          </button>
        </div>

        <div style={{
          textAlign: "center", marginTop: 10,
          color: "rgba(197,156,0,0.18)", fontSize: 8, letterSpacing: 3,
          fontFamily: "'Cinzel', serif"
        }}>
          CHINO AI · ENTER ZUM SENDEN · SHIFT+ENTER FÜR NEUE ZEILE
        </div>
      </div>
    </div>
  );
}
