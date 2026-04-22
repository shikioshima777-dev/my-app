import { useState, useEffect, useCallback } from "react";

// ─── LocalStorage helpers ────────────────────────────────────────────────────
const NOTES_KEY   = "braindump_notes";
const HISTORY_KEY = "braindump_history";

const loadNotes   = () => { try { return JSON.parse(localStorage.getItem(NOTES_KEY)   || "[]"); } catch { return []; } };
const loadHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } };
const saveNotes   = (n) => localStorage.setItem(NOTES_KEY, JSON.stringify(n));
const appendHistory = (record) => {
  const h = loadHistory();
  h.unshift(record); // newest first
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
};

// ─── Star data — generated ONCE at module level, never re-computed ────────────
// Uses golden-angle distribution so stars spread evenly without randomness on render
const STAR_DATA = Array.from({ length: 70 }, (_, i) => ({
  id:    i,
  top:   `${(i * 137.508) % 100}%`,
  left:  `${(i * 97.371 + 13) % 100}%`,
  size:  i % 3 === 0 ? 2.5 : i % 3 === 1 ? 1.5 : 1,
  delay: `${(i * 0.37) % 4}s`,
  dur:   `${2 + (i * 0.23) % 3}s`,
}));

// StarField reads only STAR_DATA (constant) — will never re-render due to state changes above it
const StarField = () => (
  <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
    {STAR_DATA.map((s) => (
      <div
        key={s.id}
        style={{
          position: "absolute",
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          borderRadius: "50%",
          background: "#fff",
          animation: `twinkle ${s.dur} ${s.delay} ease-in-out infinite alternate`,
        }}
      />
    ))}
  </div>
);

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ message, visible, dark = true }) => (
  <div
    style={{
      position: "fixed", bottom: 32, left: "50%", zIndex: 50,
      maxWidth: 300, width: "calc(100% - 48px)",
      transform: `translateX(-50%) translateY(${visible ? "0" : "100px"})`,
      opacity: visible ? 1 : 0,
      transition: "all 0.45s cubic-bezier(0.34,1.56,0.64,1)",
      background: dark ? "rgba(15,27,61,0.88)" : "rgba(255,255,255,0.88)",
      backdropFilter: "blur(20px)",
      border: `1px solid ${dark ? "rgba(122,163,212,0.25)" : "rgba(180,83,9,0.2)"}`,
      color: dark ? "#c8d9f0" : "#78350f",
      borderRadius: 18, padding: "14px 20px",
      fontSize: 13, letterSpacing: "0.03em", textAlign: "center",
      pointerEvents: "none",
      fontFamily: "'Noto Serif JP', Georgia, serif",
    }}
  >
    {message}
  </div>
);

// ─── History Drawer ───────────────────────────────────────────────────────────
const HistoryDrawer = ({ open, onClose, dark = true }) => {
  const [history, setHistory]           = useState([]);
  const [pendingNotes, setPendingNotes] = useState([]);

  useEffect(() => {
    if (open) {
      setHistory(loadHistory());
      setPendingNotes(loadNotes());
    }
  }, [open]);

  const c = {
    panel:   dark ? "rgba(8,18,48,0.97)"        : "rgba(255,252,247,0.97)",
    border:  dark ? "rgba(122,163,212,0.18)"     : "rgba(180,83,9,0.14)",
    title:   dark ? "#7aa3d4"                    : "#b45309",
    body:    dark ? "#b8cde8"                    : "#78350f",
    sub:     dark ? "#3d5a80"                    : "#d4a26a",
    card:    dark ? "rgba(255,255,255,0.04)"     : "rgba(255,255,255,0.7)",
    accent:  dark ? "rgba(122,163,212,0.1)"      : "rgba(245,158,11,0.08)",
    close:   dark ? "#5a82aa"                    : "#c4813a",
  };

  const fmt = (iso) =>
    new Date(iso).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });

  const totalCount = history.length + (pendingNotes.length > 0 ? 1 : 0);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50,
          width: "min(380px, 92vw)",
          background: c.panel,
          borderLeft: `1px solid ${c.border}`,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.32,0.72,0,1)",
          display: "flex", flexDirection: "column",
          fontFamily: "'Noto Serif JP', Georgia, serif",
          overflowY: "auto",
        }}
      >
        {/* Sticky header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "22px 18px 14px",
            borderBottom: `1px solid ${c.border}`,
            position: "sticky", top: 0, zIndex: 1,
            background: c.panel,
          }}
        >
          <div>
            <p style={{ color: c.title, fontSize: 13, letterSpacing: "0.14em", fontWeight: 600 }}>
              📖 これまでのメモ
            </p>
            <p style={{ color: c.sub, fontSize: 11, marginTop: 3, letterSpacing: "0.06em" }}>
              {totalCount === 0 ? "まだ記録がありません" : `${totalCount} 件の記録`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: c.close, fontSize: 24, lineHeight: 1, padding: "4px 8px",
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, padding: "14px 14px 40px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Pending (not yet used in morning review) */}
          {pendingNotes.length > 0 && (
            <div>
              <p style={{ color: c.title, fontSize: 11, letterSpacing: "0.12em", fontWeight: 600, marginBottom: 8 }}>
                🌙 今夜のメモ（朝モード未確認）
              </p>
              {pendingNotes.map((n, i) => (
                <div
                  key={i}
                  style={{
                    background: c.accent,
                    border: `1px solid ${c.border}`,
                    borderRadius: 14, padding: "11px 14px", marginBottom: 8,
                  }}
                >
                  <p style={{ color: c.body, fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", letterSpacing: "0.02em" }}>
                    {n.text}
                  </p>
                  <p style={{ color: c.sub, fontSize: 10, marginTop: 6, letterSpacing: "0.05em" }}>
                    {new Date(n.savedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })} に記録
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {totalCount === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: c.sub, fontSize: 13, lineHeight: 2.2, letterSpacing: "0.05em" }}>
              ここに、これまでの記録が<br />積み重なっていきます。<br />
              <span style={{ fontSize: 11 }}>✦ 一歩ずつで大丈夫 ✦</span>
            </div>
          )}

          {/* History entries */}
          {history.map((entry, i) => (
            <div
              key={i}
              style={{
                background: c.card,
                border: `1px solid ${c.border}`,
                borderRadius: 16, overflow: "hidden",
              }}
            >
              {/* Date / stats row */}
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 14px 7px",
                  borderBottom: `1px solid ${c.border}`,
                }}
              >
                <span style={{ color: c.title, fontSize: 12, letterSpacing: "0.1em", fontWeight: 600 }}>
                  {fmt(entry.date)}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {entry.sleepHours && (
                    <span style={{ color: c.sub, fontSize: 11, letterSpacing: "0.04em" }}>
                      😴 {entry.sleepHours}h
                    </span>
                  )}
                  {entry.mood && (
                    <span title={entry.mood.label} style={{ fontSize: 16 }}>{entry.mood.emoji}</span>
                  )}
                </div>
              </div>

              {/* Note texts */}
              <div style={{ padding: "10px 14px 12px" }}>
                {entry.notes && entry.notes.length > 0 ? (
                  entry.notes.map((n, j) => (
                    <p
                      key={j}
                      style={{
                        color: c.body, fontSize: 13, lineHeight: 1.8,
                        whiteSpace: "pre-wrap", letterSpacing: "0.02em",
                        paddingBottom: j < entry.notes.length - 1 ? 8 : 0,
                        borderBottom: j < entry.notes.length - 1 ? `1px solid ${c.border}` : "none",
                        marginBottom: j < entry.notes.length - 1 ? 8 : 0,
                      }}
                    >
                      {n.text}
                    </p>
                  ))
                ) : (
                  <p style={{ color: c.sub, fontSize: 12, fontStyle: "italic", letterSpacing: "0.04em" }}>
                    メモなし
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// ─── NIGHT VIEW ──────────────────────────────────────────────────────────────
const NightView = ({ onModeSwitch }) => {
  const [text, setText]               = useState("");
  const [fading, setFading]           = useState(false);
  const [toast, setToast]             = useState({ msg: "", visible: false });
  const [historyOpen, setHistoryOpen] = useState(false);

  const showToast = (msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const handleDiscard = () => {
    if (!text.trim()) return;
    setFading(true);
    setTimeout(() => { setText(""); setFading(false); }, 600);
    showToast("手放せました。大丈夫 ✦");
  };

  const handleSave = () => {
    if (!text.trim()) { showToast("何か書いてみてください 🌙"); return; }
    const notes = loadNotes();
    notes.push({ text: text.trim(), savedAt: new Date().toISOString() });
    saveNotes(notes);
    setText("");
    showToast("おやすみなさい。明日の準備は整いました ✦");
  };

  return (
    <div
      style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
        background: "radial-gradient(ellipse at 30% 20%, #0f1b3d 0%, #060d1f 50%, #010408 100%)", fontFamily: "'Noto Serif JP', Georgia, serif",
      }}
    >
      {/* StarField is outside the re-render boundary of text state */}
      <StarField />

      {/* Header */}
      <header style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "32px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌙</span>
          <span style={{ color: "#7aa3d4", fontSize: 12, letterSpacing: "0.15em", fontWeight: 500 }}>NIGHT MODE</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setHistoryOpen(true)}
            style={{ background: "rgba(122,163,212,0.08)", border: "1px solid rgba(122,163,212,0.2)", color: "#5a82aa", fontSize: 11, letterSpacing: "0.1em", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit" }}
          >
            📖 履歴
          </button>
          <button
            onClick={onModeSwitch}
            style={{ background: "rgba(122,163,212,0.12)", border: "1px solid rgba(122,163,212,0.25)", color: "#7aa3d4", fontSize: 11, letterSpacing: "0.08em", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit" }}
          >
            ☀ 朝モード
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", padding: "16px 24px 32px", gap: 24, maxWidth: 480, margin: "0 auto", width: "100%" }}>

        <div style={{ paddingTop: 16 }}>
          <h1 style={{ fontSize: 24, color: "#c8d9f0", fontWeight: 300, letterSpacing: "0.04em", lineHeight: 1.6 }}>
            今夜の脳を、<br />
            <span style={{ color: "#7aa3d4" }}>休め</span>ましょう。
          </h1>
          <p style={{ color: "#4a6080", fontSize: 13, letterSpacing: "0.05em", lineHeight: 1.8, marginTop: 8 }}>
            不安も、焦りも、ここに出してしまえば大丈夫。
          </p>
        </div>

        {/* Textarea wrapper */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 20, pointerEvents: "none", background: "rgba(91,131,201,0.04)", border: "1px solid rgba(91,131,201,0.15)", boxShadow: "0 0 40px rgba(91,131,201,0.06)" }} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"明日が怖い、やることが多すぎる…\nどんな言葉でも、ここに置いていってください。"}
            rows={8}
            style={{
              display: "block", width: "100%", position: "relative", zIndex: 1,
              background: "transparent", border: "none", outline: "none", resize: "none",
              color: "#b8cde8", caretColor: "#7aa3d4",
              fontSize: 15, lineHeight: 1.9, letterSpacing: "0.03em",
              padding: 20, borderRadius: 20,
              opacity: fading ? 0 : 1,
              transition: fading ? "opacity 0.5s ease" : "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={handleSave}
            style={{
              width: "100%", padding: "16px 0", borderRadius: 18,
              background: "linear-gradient(135deg, #1e3a6e 0%, #2a5298 100%)",
              border: "1px solid rgba(122,163,212,0.3)", color: "#c8d9f0",
              fontSize: 15, letterSpacing: "0.06em", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(42,82,152,0.3)", fontFamily: "inherit",
            }}
          >
            🌙　明日の自分に預ける
          </button>
          <button
            onClick={handleDiscard}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 18,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#4a6080", fontSize: 13, letterSpacing: "0.08em", cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            この思いを手放す
          </button>
        </div>

        <p style={{ color: "#2d4060", fontSize: 12, letterSpacing: "0.08em", lineHeight: 2, textAlign: "center" }}>
          ✦ &nbsp; 書けなくてもいいです。ここにいるだけで十分。 &nbsp; ✦
        </p>
      </main>

      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} dark={true} />
      <Toast message={toast.msg} visible={toast.visible} dark={true} />
    </div>
  );
};

// ─── Morning trivia — shown instead of static subtext ────────────────────────
const TRIVIA = [
  "🧠 脳は睡眠中に記憶を整理・定着させています。昨夜の勉強、ちゃんと吸収されてますよ。",
  "☕ 起きてすぐのコーヒーより、30分後のほうがカフェインの効果が高まるそうです。",
  "🌅 朝日を浴びると体内時計がリセットされ、夜の睡眠の質が上がります。",
  "💧 人は眠っている間にコップ1杯分の水分を失います。起きたら水を一口どうぞ。",
  "🐦 朝型の鳥が早起きなのは、虫が朝に最も活発だから。理由があって早起きしてるんです。",
  "🌿 植物は夜間に成長ホルモンを分泌します。人間も同じ、睡眠は成長の時間です。",
  "✏️ ノーベル賞受賞者の多くは「朝に難しい問題を考える」習慣があったと言われています。",
  "🎵 好きな音楽を聴きながら起きると、脳のドーパミン分泌が促されるそうです。",
  "🦁 ライオンは1日に最大20時間眠ります。よく眠ることは強さのあかしです。",
  "📖 読んだ内容は睡眠後のほうが25%以上よく記憶されるという研究があります。",
  "🌙 人間の体は夜3時頃に最も体温が下がり、そこから徐々に目覚めの準備をします。",
  "🍌 バナナに含まれるトリプトファンは、気分を整えるセロトニンの材料になります。",
  "🚶 5分間の軽い散歩が、30分の運動と同等の気分改善効果をもつ研究もあります。",
  "💡 エジソンは昼寝の名人で、椅子に座ったまま短い仮眠をよく取っていたそうです。",
  "🧘 深呼吸を3回するだけで、自律神経のバランスが整い始めます。今すぐできます。",
];

const getRandomTrivia = () => TRIVIA[Math.floor(Math.random() * TRIVIA.length)];

// ─── MORNING VIEW ─────────────────────────────────────────────────────────────
const MOODS = [
  { emoji: "😖", label: "つらい" },
  { emoji: "😔", label: "しんどい" },
  { emoji: "😐", label: "まあまあ" },
  { emoji: "😌", label: "落ち着いてる" },
  { emoji: "🌤", label: "いい感じ" },
];

const MorningView = ({ onModeSwitch }) => {
  const [notes, setNotes]             = useState([]);
  const [sleepHours, setSleepHours]   = useState("");
  const [mood, setMood]               = useState(null);
  const [done, setDone]               = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toast, setToast]             = useState({ msg: "", visible: false });
  const [trivia]                      = useState(getRandomTrivia);

  useEffect(() => { setNotes(loadNotes()); }, []);

  const showToast = (msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const handleStart = () => {
    if (!sleepHours && mood === null) { showToast("睡眠か気分だけでも教えてね ☀"); return; }
    appendHistory({ date: new Date().toISOString(), notes, sleepHours: sleepHours || null, mood: mood !== null ? MOODS[mood] : null });
    saveNotes([]);
    setDone(true);
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", background: "linear-gradient(160deg, #fff8f0 0%, #ffecd2 50%, #e8f4fd 100%)", fontFamily: "'Noto Serif JP', Georgia, serif" }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🌅</div>
          <h2 style={{ fontSize: 22, color: "#b45309", fontWeight: 300, letterSpacing: "0.04em", lineHeight: 1.6, marginBottom: 16 }}>
            今日も一日、<br />マイペースでいきましょう。
          </h2>
          <p style={{ color: "#92700a", fontSize: 13, letterSpacing: "0.06em", lineHeight: 2, marginBottom: 32 }}>
            {new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </p>
          <button
            onClick={() => { setDone(false); setNotes([]); setSleepHours(""); setMood(null); }}
            style={{ padding: "12px 32px", borderRadius: 24, background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, letterSpacing: "0.08em", boxShadow: "0 4px 20px rgba(245,158,11,0.3)", fontFamily: "inherit" }}
          >
            もう一度記録する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(160deg, #fff8f0 0%, #fef3e2 40%, #e8f4fd 100%)", fontFamily: "'Noto Serif JP', Georgia, serif" }}>

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "32px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>☀️</span>
          <span style={{ color: "#b45309", fontSize: 12, letterSpacing: "0.15em", fontWeight: 500 }}>MORNING MODE</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setHistoryOpen(true)} style={{ background: "rgba(180,83,9,0.07)", border: "1px solid rgba(180,83,9,0.18)", color: "#b45309", fontSize: 11, letterSpacing: "0.1em", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit" }}>
            📖 履歴
          </button>
          <button onClick={onModeSwitch} style={{ background: "rgba(180,83,9,0.08)", border: "1px solid rgba(180,83,9,0.2)", color: "#b45309", fontSize: 11, letterSpacing: "0.08em", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit" }}>
            🌙 夜モード
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: "8px 24px 48px", maxWidth: 480, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>

        <div style={{ paddingTop: 8 }}>
          <h1 style={{ fontSize: 22, color: "#92400e", fontWeight: 300, letterSpacing: "0.04em", lineHeight: 1.6 }}>
            おはようございます。<br /><span style={{ color: "#d97706" }}>昨夜の自分</span>が待ってます。
          </h1>
          <p style={{ color: "#c4813a", fontSize: 13, letterSpacing: "0.04em", lineHeight: 1.8, marginTop: 6 }}>
            {trivia}
          </p>
        </div>

        {notes.length > 0 ? (
          <section>
            <p style={{ color: "#b45309", fontSize: 11, letterSpacing: "0.12em", fontWeight: 600, marginBottom: 10 }}>🌙 昨夜のあなたから</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
              {notes.map((n, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(180,83,9,0.12)", borderRadius: 16, padding: "12px 16px" }}>
                  <p style={{ color: "#78350f", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap", letterSpacing: "0.02em" }}>{n.text}</p>
                  <p style={{ color: "#d4a26a", fontSize: 11, marginTop: 4, letterSpacing: "0.05em" }}>
                    {new Date(n.savedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })} に記録
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.5)", border: "1px dashed rgba(180,83,9,0.2)", borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
            <p style={{ color: "#c4813a", fontSize: 13, letterSpacing: "0.05em", lineHeight: 1.8 }}>昨夜のメモはありません。<br />今日も新しい気持ちでいきましょう ✦</p>
          </div>
        )}

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(180,83,9,0.15), transparent)" }} />

        <section>
          <p style={{ color: "#92400e", fontSize: 14, letterSpacing: "0.06em", fontWeight: 500, marginBottom: 12 }}>昨晩は何時間眠れましたか？</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[4, 5, 6, 7, 8].map((h) => (
              <button key={h} onClick={() => setSleepHours(h === sleepHours ? "" : h)}
                style={{ flex: 1, minWidth: 48, padding: "12px 0", background: sleepHours === h ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.6)", color: sleepHours === h ? "#fff" : "#92400e", border: sleepHours === h ? "1px solid transparent" : "1px solid rgba(180,83,9,0.15)", borderRadius: 12, cursor: "pointer", fontSize: 13, letterSpacing: "0.04em", boxShadow: sleepHours === h ? "0 4px 12px rgba(245,158,11,0.3)" : "none", transition: "all 0.2s", fontFamily: "inherit" }}>
                {h}h
              </button>
            ))}
            <div style={{ flex: 1, minWidth: 60, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(180,83,9,0.15)", borderRadius: 12, display: "flex", alignItems: "center", padding: "0 8px" }}>
              <input type="number" min={1} max={12} step={0.5} placeholder="他"
                value={typeof sleepHours === "number" && ![4,5,6,7,8].includes(sleepHours) ? sleepHours : ""}
                onChange={(e) => setSleepHours(e.target.value ? parseFloat(e.target.value) : "")}
                style={{ width: "100%", outline: "none", background: "transparent", textAlign: "center", color: "#92400e", fontSize: 13, border: "none", padding: "12px 0", fontFamily: "inherit" }} />
            </div>
          </div>
        </section>

        <section>
          <p style={{ color: "#92400e", fontSize: 14, letterSpacing: "0.06em", fontWeight: 500, marginBottom: 12 }}>今朝の気分はどうですか？</p>
          <div style={{ display: "flex", gap: 8 }}>
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => setMood(i === mood ? null : i)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 0", background: mood === i ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)", border: mood === i ? "2px solid #f59e0b" : "1px solid rgba(180,83,9,0.12)", borderRadius: 14, cursor: "pointer", boxShadow: mood === i ? "0 4px 16px rgba(245,158,11,0.25)" : "none", transform: mood === i ? "scale(1.06)" : "scale(1)", transition: "all 0.2s" }}>
                <span style={{ fontSize: 20 }}>{m.emoji}</span>
                <span style={{ fontSize: 9, color: "#b45309", letterSpacing: "0.03em" }}>{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        <button onClick={handleStart}
          style={{ width: "100%", padding: "16px 0", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)", color: "#fff", border: "none", borderRadius: 18, cursor: "pointer", fontSize: 15, letterSpacing: "0.08em", boxShadow: "0 6px 28px rgba(245,158,11,0.35)", fontFamily: "inherit" }}>
          🌅　今日を始める
        </button>
      </main>

      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} dark={false} />
      <Toast message={toast.msg} visible={toast.visible} dark={false} />
    </div>
  );
};

// ─── APP ROOT ────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode]                   = useState("night");
  const [transitioning, setTransitioning] = useState(false);

  const switchMode = useCallback((next) => {
    setTransitioning(true);
    setTimeout(() => { setMode(next); setTransitioning(false); }, 280);
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { min-height: 100%; width: 100%; }
body { -webkit-font-smoothing: antialiased; }
textarea::placeholder { color: #2d4a6e; opacity: 0.65; }
@keyframes twinkle {
  from { opacity: 0.1;  transform: scale(0.85); }
  to   { opacity: 0.55; transform: scale(1.2); }
}
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(122,163,212,0.2); border-radius: 3px; }
button { transition: transform 0.15s, box-shadow 0.15s; }
button:active { transform: scale(0.95) !important; }
      `}</style>

      <div style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.28s ease" }}>
        {mode === "night"
          ? <NightView   onModeSwitch={() => switchMode("morning")} />
          : <MorningView onModeSwitch={() => switchMode("night")}   />
        }
      </div>
    </>
  );
}