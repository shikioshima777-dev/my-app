import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  ja: {
    nightMode: "NIGHT MODE", morningMode: "MORNING MODE",
    history: "📖 履歴", toMorning: "☀ 朝モード", toNight: "🌙 夜モード",
    nightTitle1: "今夜の脳を、", nightTitle2: "休め", nightTitle3: "ましょう。",
    nightSub: "不安も、焦りも、ここに出してしまえば大丈夫。",
    placeholder: "明日が怖い、やることが多すぎる…\nどんな言葉でも、ここに置いていってください。",
    savBtn: "🌙　明日の自分に預ける",
    discardBtn: "この思いを手放す",
    nightFooter: "✦ \u00a0 書けなくてもいいです。ここにいるだけで十分。 \u00a0 ✦",
    toastSaved: "おやすみなさい。明日の準備は整いました ✦",
    toastDiscarded: "手放せました。大丈夫 ✦",
    toastEmpty: "何か書いてみてください 🌙",
    morningTitle1: "おはようございます。", morningTitle2: "昨夜の自分", morningTitle3: "が待ってます。",
    fromLastNight: "🌙 昨夜のあなたから",
    noNotes: "昨夜のメモはありません。\n今日も新しい気持ちでいきましょう ✦",
    sleepQ: "昨晩は何時間眠れましたか？",
    sleepOther: "他",
    moodQ: "今朝の気分はどうですか？",
    startBtn: "🌅　今日を始める",
    toastMorning: "睡眠か気分だけでも教えてね ☀",
    doneTitle: "今日も一日、\nマイペースでいきましょう。",
    doneBtn: "もう一度記録する",
    historyTitle: "📖 これまでのメモ",
    historyEmpty: "まだ記録がありません",
    historyCount: (n) => `${n} 件の記録`,
    pendingLabel: "🌙 今夜のメモ（朝モード未確認）",
    noMemo: "メモなし",
    drawerEmpty: "ここに、これまでの記録が\n積み重なっていきます。\n✦ 一歩ずつで大丈夫 ✦",
    moods: [
      { emoji: "😖", label: "つらい" }, { emoji: "😔", label: "しんどい" },
      { emoji: "😐", label: "まあまあ" }, { emoji: "😌", label: "落ち着いてる" },
      { emoji: "🌤", label: "いい感じ" },
    ],
    trivia: [
      "🧠 脳は睡眠中に記憶を整理・定着させています。昨夜の勉強、ちゃんと吸収されてますよ。",
      "☕ 起きてすぐのコーヒーより、30分後のほうがカフェインの効果が高まるそうです。",
      "🌅 朝日を浴びると体内時計がリセットされ、夜の睡眠の質が上がります。",
      "💧 人は眠っている間にコップ1杯分の水分を失います。起きたら水を一口どうぞ。",
      "🌿 植物は夜間に成長ホルモンを分泌します。人間も同じ、睡眠は成長の時間です。",
      "🦁 ライオンは1日に最大20時間眠ります。よく眠ることは強さのあかしです。",
      "📖 読んだ内容は睡眠後のほうが25%以上よく記憶されるという研究があります。",
      "🧘 深呼吸を3回するだけで、自律神経のバランスが整い始めます。今すぐできます。",
    ],
    recordedAt: (time) => `${time} に記録`,
  },
  en: {
    nightMode: "NIGHT MODE", morningMode: "MORNING MODE",
    history: "📖 History", toMorning: "☀ Morning", toNight: "🌙 Night",
    nightTitle1: "Let your mind ", nightTitle2: "rest", nightTitle3: " tonight.",
    nightSub: "Whatever worries you, leave them here. It's okay.",
    placeholder: "Scared about tomorrow, too much on your plate…\nAny words are fine. Just let it out.",
    savBtn: "🌙　Hand it to tomorrow's you",
    discardBtn: "Let this go",
    nightFooter: "✦ \u00a0 You don't have to write anything. Being here is enough. \u00a0 ✦",
    toastSaved: "Good night. Tomorrow is ready for you ✦",
    toastDiscarded: "Let go. You're okay ✦",
    toastEmpty: "Try writing something 🌙",
    morningTitle1: "Good morning. ", morningTitle2: "Last night's you", morningTitle3: " is waiting.",
    fromLastNight: "🌙 From last night",
    noNotes: "No notes from last night.\nStart today fresh ✦",
    sleepQ: "How many hours did you sleep?",
    sleepOther: "Other",
    moodQ: "How are you feeling this morning?",
    startBtn: "🌅　Start today",
    toastMorning: "Please share at least sleep or mood ☀",
    doneTitle: "Take today\nat your own pace.",
    doneBtn: "Record again",
    historyTitle: "📖 Your notes",
    historyEmpty: "No records yet",
    historyCount: (n) => `${n} record${n > 1 ? "s" : ""}`,
    pendingLabel: "🌙 Tonight's notes (unreviewed)",
    noMemo: "No notes",
    drawerEmpty: "Your records will\naccumulate here.\n✦ One step at a time ✦",
    moods: [
      { emoji: "😖", label: "Rough" }, { emoji: "😔", label: "Tired" },
      { emoji: "😐", label: "Okay" }, { emoji: "😌", label: "Calm" },
      { emoji: "🌤", label: "Good" },
    ],
    trivia: [
      "🧠 Your brain consolidates memories during sleep. Last night's study is sinking in.",
      "☕ Caffeine works better 30 minutes after waking than immediately upon rising.",
      "🌅 Morning sunlight resets your body clock, improving tonight's sleep quality.",
      "💧 You lose a cup of water while sleeping. Drink a sip of water first thing.",
      "🌿 Plants release growth hormones at night. Humans do too — sleep is growth time.",
      "🦁 Lions sleep up to 20 hours a day. Sleeping well is a sign of strength.",
      "📖 Studies show memory retention improves by 25%+ after a good night's sleep.",
      "🧘 Just 3 deep breaths begin to rebalance your autonomic nervous system.",
    ],
    recordedAt: (time) => `Recorded at ${time}`,
  },
  zh: {
    nightMode: "夜间模式", morningMode: "早晨模式",
    history: "📖 历史", toMorning: "☀ 早晨", toNight: "🌙 夜间",
    nightTitle1: "让大脑今晚", nightTitle2: "休息", nightTitle3: "一下吧。",
    nightSub: "不安也好，焦虑也好，写出来就好了。",
    placeholder: "明天好可怕，事情太多了…\n什么都可以写，就放在这里吧。",
    savBtn: "🌙　交给明天的自己",
    discardBtn: "放下这份心情",
    nightFooter: "✦ \u00a0 写不出来也没关系，在这里就够了。 \u00a0 ✦",
    toastSaved: "晚安。明天已经准备好了 ✦",
    toastDiscarded: "放下了。没关系 ✦",
    toastEmpty: "试着写点什么吧 🌙",
    morningTitle1: "早上好。", morningTitle2: "昨晚的自己", morningTitle3: "在等你。",
    fromLastNight: "🌙 来自昨晚",
    noNotes: "没有昨晚的备忘。\n以全新的心情开始今天 ✦",
    sleepQ: "昨晚睡了几个小时？",
    sleepOther: "其他",
    moodQ: "今天早上心情怎么样？",
    startBtn: "🌅　开始今天",
    toastMorning: "请告诉我睡眠或心情 ☀",
    doneTitle: "今天也按自己的\n节奏来吧。",
    doneBtn: "再次记录",
    historyTitle: "📖 过往备忘",
    historyEmpty: "还没有记录",
    historyCount: (n) => `共 ${n} 条记录`,
    pendingLabel: "🌙 今晚的备忘（未确认）",
    noMemo: "无备忘",
    drawerEmpty: "你的记录会\n慢慢积累在这里。\n✦ 一步一步来 ✦",
    moods: [
      { emoji: "😖", label: "很难受" }, { emoji: "😔", label: "很累" },
      { emoji: "😐", label: "还好" }, { emoji: "😌", label: "平静" },
      { emoji: "🌤", label: "不错" },
    ],
    trivia: [
      "🧠 大脑在睡眠中整理记忆。昨晚的学习内容正在被好好吸收。",
      "☕ 起床30分钟后喝咖啡比立刻喝效果更好哦。",
      "🌅 早晨阳光能重置生物钟，提升今晚的睡眠质量。",
      "💧 睡眠中会失去约一杯水分。起床后先喝一口水吧。",
      "🌿 植物在夜间分泌生长激素，人类也一样——睡眠是成长的时间。",
      "🦁 狮子每天最多睡20小时。好好睡觉是强大的象征。",
      "📖 研究显示，睡一觉后记忆留存率提升超过25%。",
      "🧘 只需深呼吸3次，自律神经就开始趋于平衡。",
    ],
    recordedAt: (time) => `记录于 ${time}`,
  },
};

const LangContext = createContext("ja");

// ─── Language picker component ───────────────────────────────────────────────
const LangPicker = ({ lang, setLang, dark }) => {
  const langs = ["ja", "en", "zh"];
  const labels = { ja: "日本語", en: "EN", zh: "中文" };
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: "4px 10px", borderRadius: 14, fontSize: 10,
            letterSpacing: "0.05em", cursor: "pointer", fontFamily: "inherit",
            background: lang === l
              ? (dark ? "rgba(122,163,212,0.3)" : "rgba(180,83,9,0.18)")
              : "transparent",
            border: `1px solid ${dark ? "rgba(122,163,212,0.2)" : "rgba(180,83,9,0.15)"}`,
            color: dark
              ? (lang === l ? "#c8d9f0" : "#4a6080")
              : (lang === l ? "#78350f" : "#c4813a"),
            fontWeight: lang === l ? 600 : 400,
          }}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
};

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

// ─── Constellation data — real star patterns, subtly blended ─────────────────
// Each constellation is positioned fixed on the viewport. Stars & lines use
// viewBox 0-100 coordinates. We show several so that 1-3 are always visible.
const CONSTELLATIONS = [
  { // Orion (オリオン座)
    id: "orion",
    top: "10%", left: "5%", size: 170,
    stars: [[25,10],[72,18],[36,48],[50,50],[64,52],[18,88],[82,82],[50,66]],
    lines: [[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[3,7]],
  },
  { // Ursa Major / Big Dipper (北斗七星)
    id: "ursa-major",
    top: "52%", right: "6%", size: 200,
    stars: [[6,34],[22,48],[42,58],[60,52],[72,68],[88,74],[54,28]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[3,6]],
  },
  { // Cassiopeia (カシオペア座)
    id: "cassiopeia",
    top: "18%", right: "18%", size: 140,
    stars: [[8,52],[28,28],[50,56],[72,28],[92,52]],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  { // Cygnus (はくちょう座)
    id: "cygnus",
    top: "60%", left: "8%", size: 150,
    stars: [[50,6],[50,38],[18,40],[82,40],[50,78]],
    lines: [[0,1],[1,2],[1,3],[1,4]],
  },
  { // Lyra (こと座)
    id: "lyra",
    top: "32%", left: "48%", size: 75,
    stars: [[50,8],[28,38],[72,38],[32,82],[68,82]],
    lines: [[0,1],[0,2],[1,3],[2,4],[3,4]],
  },
  { // Corona Borealis (かんむり座)
    id: "corona",
    top: "78%", left: "42%", size: 110,
    stars: [[10,60],[22,38],[38,26],[55,22],[72,28],[85,42],[92,60]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
];

const ConstellationField = () => (
  <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
    {CONSTELLATIONS.map((c) => (
      <svg
        key={c.id}
        width={c.size} height={c.size}
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          top: c.top, left: c.left, right: c.right, bottom: c.bottom,
          opacity: 0.45,
        }}
      >
        {c.lines.map(([a, b], i) => (
          <line
            key={`l${i}`}
            x1={c.stars[a][0]} y1={c.stars[a][1]}
            x2={c.stars[b][0]} y2={c.stars[b][1]}
            stroke="rgba(122,163,212,0.35)"
            strokeWidth={0.25}
          />
        ))}
        {c.stars.map(([x, y], i) => (
          <circle
            key={`s${i}`}
            cx={x} cy={y} r={1}
            fill="rgba(200,217,240,0.9)"
            style={{
              filter: "drop-shadow(0 0 1.5px rgba(200,217,240,0.6))",
            }}
          />
        ))}
      </svg>
    ))}
  </div>
);

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
const HistoryDrawer = ({ open, onClose, dark = true, lang }) => {
  const t = T[lang];
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
              {t.historyTitle}
            </p>
            <p style={{ color: c.sub, fontSize: 11, marginTop: 3, letterSpacing: "0.06em" }}>
              {totalCount === 0 ? t.historyEmpty : t.historyCount(totalCount)}
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
                {t.pendingLabel}
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
            <div style={{ textAlign: "center", padding: "48px 0", color: c.sub, fontSize: 13, lineHeight: 2.2, letterSpacing: "0.05em", whiteSpace: "pre-line" }}>
              {t.drawerEmpty}
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
                    {t.noMemo}
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
const NightView = ({ onModeSwitch, lang, setLang }) => {
  const t = T[lang];
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
    showToast(t.toastDiscarded);
  };

  const handleSave = () => {
    if (!text.trim()) { showToast(t.toastEmpty); return; }
    const notes = loadNotes();
    notes.push({ text: text.trim(), savedAt: new Date().toISOString() });
    saveNotes(notes);
    setText("");
    showToast(t.toastSaved);
  };

  return (
    <div
      style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
        background: "radial-gradient(ellipse at 30% 20%, #0f1b3d 0%, #060d1f 50%, #010408 100%)", fontFamily: "'Noto Serif JP', Georgia, serif",
      }}
    >
      <ConstellationField />
      <StarField />

      <header style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "32px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌙</span>
          <span style={{ color: "#7aa3d4", fontSize: 12, letterSpacing: "0.15em", fontWeight: 500 }}>{t.nightMode}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LangPicker lang={lang} setLang={setLang} dark={true} />
          <button onClick={() => setHistoryOpen(true)} style={{ background: "rgba(122,163,212,0.08)", border: "1px solid rgba(122,163,212,0.2)", color: "#5a82aa", fontSize: 11, letterSpacing: "0.1em", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit" }}>
            {t.history}
          </button>
          <button onClick={onModeSwitch} style={{ background: "rgba(122,163,212,0.12)", border: "1px solid rgba(122,163,212,0.25)", color: "#7aa3d4", fontSize: 11, letterSpacing: "0.08em", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit" }}>
            {t.toMorning}
          </button>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", padding: "16px 24px 32px", gap: 24, maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <div style={{ paddingTop: 16 }}>
          <h1 style={{ fontSize: 24, color: "#c8d9f0", fontWeight: 300, letterSpacing: "0.04em", lineHeight: 1.6 }}>
            {t.nightTitle1}<br />
            <span style={{ color: "#7aa3d4" }}>{t.nightTitle2}</span>{t.nightTitle3}
          </h1>
          <p style={{ color: "#4a6080", fontSize: 13, letterSpacing: "0.05em", lineHeight: 1.8, marginTop: 8 }}>
            {t.nightSub}
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 20, pointerEvents: "none", background: "rgba(91,131,201,0.04)", border: "1px solid rgba(91,131,201,0.15)", boxShadow: "0 0 40px rgba(91,131,201,0.06)" }} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
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
          <button onClick={handleSave} style={{ width: "100%", padding: "16px 0", borderRadius: 18, background: "linear-gradient(135deg, #1e3a6e 0%, #2a5298 100%)", border: "1px solid rgba(122,163,212,0.3)", color: "#c8d9f0", fontSize: 15, letterSpacing: "0.06em", cursor: "pointer", boxShadow: "0 4px 24px rgba(42,82,152,0.3)", fontFamily: "inherit" }}>
            {t.savBtn}
          </button>
          <button onClick={handleDiscard} style={{ width: "100%", padding: "12px 0", borderRadius: 18, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#4a6080", fontSize: 13, letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit" }}>
            {t.discardBtn}
          </button>
        </div>

        <p style={{ color: "#2d4060", fontSize: 12, letterSpacing: "0.08em", lineHeight: 2, textAlign: "center" }}>
          {t.nightFooter}
        </p>
      </main>

      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} dark={true} lang={lang} />
      <Toast message={toast.msg} visible={toast.visible} dark={true} />
    </div>
  );
};

// ─── MORNING VIEW ─────────────────────────────────────────────────────────────
const MorningView = ({ onModeSwitch, lang, setLang }) => {
  const t = T[lang];
  const [notes, setNotes]             = useState([]);
  const [sleepHours, setSleepHours]   = useState("");
  const [mood, setMood]               = useState(null);
  const [done, setDone]               = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toast, setToast]             = useState({ msg: "", visible: false });
  const [trivia]                      = useState(() => t.trivia[Math.floor(Math.random() * t.trivia.length)]);

  useEffect(() => { setNotes(loadNotes()); }, []);

  const showToast = (msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const handleStart = () => {
    if (!sleepHours && mood === null) { showToast(t.toastMorning); return; }
    appendHistory({ date: new Date().toISOString(), notes, sleepHours: sleepHours || null, mood: mood !== null ? t.moods[mood] : null });
    saveNotes([]);
    setDone(true);
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", background: "linear-gradient(160deg, #fff8f0 0%, #ffecd2 50%, #e8f4fd 100%)", fontFamily: "'Noto Serif JP', Georgia, serif" }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🌅</div>
          <h2 style={{ fontSize: 22, color: "#b45309", fontWeight: 300, letterSpacing: "0.04em", lineHeight: 1.6, marginBottom: 16, whiteSpace: "pre-line" }}>
            {t.doneTitle}
          </h2>
          <p style={{ color: "#92700a", fontSize: 13, letterSpacing: "0.06em", lineHeight: 2, marginBottom: 32 }}>
            {new Date().toLocaleDateString(lang === "en" ? "en-US" : lang === "zh" ? "zh-CN" : "ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </p>
          <button
            onClick={() => { setDone(false); setNotes([]); setSleepHours(""); setMood(null); }}
            style={{ padding: "12px 32px", borderRadius: 24, background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, letterSpacing: "0.08em", boxShadow: "0 4px 20px rgba(245,158,11,0.3)", fontFamily: "inherit" }}
          >
            {t.doneBtn}
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
          <span style={{ color: "#b45309", fontSize: 12, letterSpacing: "0.15em", fontWeight: 500 }}>{t.morningMode}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LangPicker lang={lang} setLang={setLang} dark={false} />
          <button onClick={() => setHistoryOpen(true)} style={{ background: "rgba(180,83,9,0.07)", border: "1px solid rgba(180,83,9,0.18)", color: "#b45309", fontSize: 11, letterSpacing: "0.1em", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit" }}>
            {t.history}
          </button>
          <button onClick={onModeSwitch} style={{ background: "rgba(180,83,9,0.08)", border: "1px solid rgba(180,83,9,0.2)", color: "#b45309", fontSize: 11, letterSpacing: "0.08em", padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit" }}>
            {t.toNight}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: "8px 24px 48px", maxWidth: 480, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ paddingTop: 8 }}>
          <h1 style={{ fontSize: 22, color: "#92400e", fontWeight: 300, letterSpacing: "0.04em", lineHeight: 1.6 }}>
            {t.morningTitle1}<br /><span style={{ color: "#d97706" }}>{t.morningTitle2}</span>{t.morningTitle3}
          </h1>
          <p style={{ color: "#c4813a", fontSize: 13, letterSpacing: "0.04em", lineHeight: 1.8, marginTop: 6 }}>
            {trivia}
          </p>
        </div>

        {notes.length > 0 ? (
          <section>
            <p style={{ color: "#b45309", fontSize: 11, letterSpacing: "0.12em", fontWeight: 600, marginBottom: 10 }}>{t.fromLastNight}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
              {notes.map((n, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(180,83,9,0.12)", borderRadius: 16, padding: "12px 16px" }}>
                  <p style={{ color: "#78350f", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap", letterSpacing: "0.02em" }}>{n.text}</p>
                  <p style={{ color: "#d4a26a", fontSize: 11, marginTop: 4, letterSpacing: "0.05em" }}>
                    {t.recordedAt(new Date(n.savedAt).toLocaleTimeString(lang === "en" ? "en-US" : lang === "zh" ? "zh-CN" : "ja-JP", { hour: "2-digit", minute: "2-digit" }))}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.5)", border: "1px dashed rgba(180,83,9,0.2)", borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
            <p style={{ color: "#c4813a", fontSize: 13, letterSpacing: "0.05em", lineHeight: 1.8, whiteSpace: "pre-line" }}>{t.noNotes}</p>
          </div>
        )}

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(180,83,9,0.15), transparent)" }} />

        <section>
          <p style={{ color: "#92400e", fontSize: 14, letterSpacing: "0.06em", fontWeight: 500, marginBottom: 12 }}>{t.sleepQ}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[4, 5, 6, 7, 8].map((h) => (
              <button key={h} onClick={() => setSleepHours(h === sleepHours ? "" : h)}
                style={{ flex: 1, minWidth: 48, padding: "12px 0", background: sleepHours === h ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.6)", color: sleepHours === h ? "#fff" : "#92400e", border: sleepHours === h ? "1px solid transparent" : "1px solid rgba(180,83,9,0.15)", borderRadius: 12, cursor: "pointer", fontSize: 13, letterSpacing: "0.04em", boxShadow: sleepHours === h ? "0 4px 12px rgba(245,158,11,0.3)" : "none", transition: "all 0.2s", fontFamily: "inherit" }}>
                {h}h
              </button>
            ))}
            <div style={{ flex: 1, minWidth: 60, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(180,83,9,0.15)", borderRadius: 12, display: "flex", alignItems: "center", padding: "0 8px" }}>
              <input type="number" min={1} max={12} step={0.5} placeholder={t.sleepOther}
                value={typeof sleepHours === "number" && ![4,5,6,7,8].includes(sleepHours) ? sleepHours : ""}
                onChange={(e) => setSleepHours(e.target.value ? parseFloat(e.target.value) : "")}
                style={{ width: "100%", outline: "none", background: "transparent", textAlign: "center", color: "#92400e", fontSize: 13, border: "none", padding: "12px 0", fontFamily: "inherit" }} />
            </div>
          </div>
        </section>

        <section>
          <p style={{ color: "#92400e", fontSize: 14, letterSpacing: "0.06em", fontWeight: 500, marginBottom: 12 }}>{t.moodQ}</p>
          <div style={{ display: "flex", gap: 8 }}>
            {t.moods.map((m, i) => (
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
          {t.startBtn}
        </button>
      </main>

      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} dark={false} lang={lang} />
      <Toast message={toast.msg} visible={toast.visible} dark={false} />
    </div>
  );
};

// ─── APP ROOT ────────────────────────────────────────────────────────────────
// Auto-switches: 06:00-20:59 = morning, 21:00-05:59 = night
const getTimeBasedMode = () => {
  const h = new Date().getHours();
  return (h >= 6 && h < 21) ? "morning" : "night";
};

export default function App() {
  const [mode, setMode]                   = useState(getTimeBasedMode);
  const [transitioning, setTransitioning] = useState(false);
  const [lang, setLang]                   = useState("ja");

  // Schedule switch at the next 6am or 9pm boundary
  useEffect(() => {
    let timer;
    const scheduleNext = () => {
      const now = new Date();
      const next = new Date(now);
      const h = now.getHours();
      if (h < 6) {
        next.setHours(6, 0, 0, 0);
      } else if (h < 21) {
        next.setHours(21, 0, 0, 0);
      } else {
        next.setDate(next.getDate() + 1);
        next.setHours(6, 0, 0, 0);
      }
      timer = setTimeout(() => {
        setTransitioning(true);
        setTimeout(() => {
          setMode(getTimeBasedMode());
          setTransitioning(false);
          scheduleNext();
        }, 280);
      }, next - now);
    };
    scheduleNext();
    return () => clearTimeout(timer);
  }, []);

  const switchMode = useCallback((next) => {
    setTransitioning(true);
    setTimeout(() => { setMode(next); setTransitioning(false); }, 280);
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`
        #root { width: 100%; max-width: none; padding: 0; margin: 0; }
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
          ? <NightView   onModeSwitch={() => switchMode("morning")} lang={lang} setLang={setLang} />
          : <MorningView onModeSwitch={() => switchMode("night")}   lang={lang} setLang={setLang} />
        }
      </div>
    </>
  );
}