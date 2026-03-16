import { useState, useRef } from "react";
import { useAuth, SignIn, UserButton } from "@clerk/react";

function startCheckout() {
  window.location.href = 'https://buy.stripe.com/3cI00k9554iL5Na4APf7i00';
}

const COLORS = {
  bg: "#0a0a0f", surface: "#111118", border: "#1e1e2e",
  accent: "#f0b429", accentDim: "#f0b42920", accentBorder: "#f0b42940",
  green: "#22c55e", greenDim: "#22c55e18", red: "#ef4444", redDim: "#ef444418",
  text: "#e8e8f0", muted: "#6b6b80", subtle: "#2a2a3a",
  blue: "#6366f1", blueDim: "#6366f118",
};

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const T = {
  en: {
    tabAnalyze: "Analyze", tabJournal: "Journal",
    analyzeTitle: "Trade Analysis", analyzeSubtitle: "Fill in all fields — AI checks if you followed the rules",
    date: "Date", pair: "Pair", direction: "Direction", session: "Session",
    htfBias: "HTF Bias", htfTimeframe: "Timeframe", sweepPresent: "Liquidity Sweep present?",
    sweepType: "Type of Sweep", bosConfirmed: "BOS confirmed on M5?",
    entryZone: "Entry Zone", slPlacement: "SL Placement", result: "Result",
    rr: "R:R (e.g. 2.5)", pnl: "P&L (Pips/$)", notes: "Notes (optional)",
    notesPlaceholder: "What did you see? What was unclear? Special conditions?",
    analyzeBtn: "⚡ Analyze Trade", fillAll: "Please fill in all fields",
    saveBtn: "✓ Save trade & update Journal",
    ruleCheck: "Rule Check", rules: "Rules",
    aiAnalysis: "✦ AI Analysis", loading: "AI is analyzing your trade...", loadingMsg: "One moment",
    strengths: "✓ Strengths", mistakes: "✗ Mistakes", ruleViolations: "Rule Violations",
    mainLesson: "Key Lesson", nextTime: "Next time:",
    noTrades: "No trades saved yet", noTradesMsg: "Analyze your first trade to get started",
    trades: "Trades", winRate: "Win Rate", wins: "Wins", avgScore: "Avg Score",
    long: "↑ Long", short: "↓ Short", bullish: "↑ Bullish", bearish: "↓ Bearish",
    yes: "✓ Yes", no: "✗ No", choose: "— select —", chooseTf: "— Timeframe —", chooseSweep: "— Sweep Type —",
    screenshot: "Chart Screenshot (optional but recommended)",
    screenshotHint: "Upload your TradingView chart — AI will analyze the actual setup",
    screenshotDrop: "Drop chart screenshot here or click to upload",
    screenshotAdded: "Screenshot added — AI will analyze your chart",
    screenshotRemove: "Remove",
    chartAnalysis: "📊 Chart Analysis",
    feedbackError: "Analysis could not be loaded.", feedbackRetry: "Please try again.",
    aiLang: "English",
    strategy: "Strategy",
    // PO3 specific
    po3Time: "10:00 AM EST 4H Candle?", po3FVG: "15M FVG formed after accumulation?",
    po3Manipulation: "Price manipulated into FVG?", po3Entry: "Entry confirmations (IFVG / CISD / 4H Open close)",
    po3EntryCount: "How many confirmations?", po3News: "Red/Orange news at 10AM?",
    po3HTFBias: "HTF Bias confluences stacked?", po3TP: "TP at previous day high/low?",
    confirmations: ["0", "1", "2", "3"],
  },
  de: {
    tabAnalyze: "Analyse", tabJournal: "Journal",
    analyzeTitle: "Trade Analyse", analyzeSubtitle: "Füll alle Felder aus — die KI prüft ob du die Regeln befolgt hast",
    date: "Datum", pair: "Pair", direction: "Richtung", session: "Session",
    htfBias: "HTF Bias", htfTimeframe: "Timeframe", sweepPresent: "Liquidity Sweep vorhanden?",
    sweepType: "Art des Sweeps", bosConfirmed: "BOS auf M5 bestätigt?",
    entryZone: "Entry Zone", slPlacement: "SL Platzierung", result: "Resultat",
    rr: "R:R (z.B. 2.5)", pnl: "P&L (Pips/CHF)", notes: "Notizen (optional)",
    notesPlaceholder: "Was hast du gesehen? Was war unklar? Besondere Bedingungen?",
    analyzeBtn: "⚡ Trade analysieren", fillAll: "Bitte alle Felder ausfüllen",
    saveBtn: "✓ Trade speichern & Journal aktualisieren",
    ruleCheck: "Regel-Check", rules: "Regeln",
    aiAnalysis: "✦ KI Analyse", loading: "KI analysiert deinen Trade...", loadingMsg: "Einen Moment",
    strengths: "✓ Stärken", mistakes: "✗ Fehler", ruleViolations: "Regel-Verletzungen",
    mainLesson: "Wichtigste Lektion", nextTime: "Nächstes Mal:",
    noTrades: "Noch keine Trades gespeichert", noTradesMsg: "Analysiere deinen ersten Trade um zu starten",
    trades: "Trades", winRate: "Win Rate", wins: "Wins", avgScore: "Ø Score",
    long: "↑ Long", short: "↓ Short", bullish: "↑ Bullish", bearish: "↓ Bearish",
    yes: "✓ Ja", no: "✗ Nein", choose: "— wählen —", chooseTf: "— Timeframe —", chooseSweep: "— Art des Sweeps —",
    screenshot: "Chart Screenshot (optional, aber empfohlen)",
    screenshotHint: "Lade deinen TradingView Chart hoch — die KI analysiert das echte Setup",
    screenshotDrop: "Chart Screenshot hier ablegen oder klicken",
    screenshotAdded: "Screenshot hinzugefügt — KI analysiert deinen Chart",
    screenshotRemove: "Entfernen",
    chartAnalysis: "📊 Chart Analyse",
    feedbackError: "Analyse konnte nicht geladen werden.", feedbackRetry: "Bitte versuche es erneut.",
    aiLang: "Deutsch",
    strategy: "Strategie",
    po3Time: "10:00 AM EST 4H Candle?", po3FVG: "15M FVG nach Akkumulation gebildet?",
    po3Manipulation: "Preis in FVG manipuliert?", po3Entry: "Entry-Bestätigungen (IFVG / CISD / 4H Open)",
    po3EntryCount: "Wie viele Bestätigungen?", po3News: "Rote/Orange News um 10AM?",
    po3HTFBias: "HTF Bias Konfluenzen gestapelt?", po3TP: "TP bei Previous Day High/Low?",
    confirmations: ["0", "1", "2", "3"],
  }
};

// ─── STRATEGY CONFIGS ────────────────────────────────────────────────────────
const SESSIONS = ["London", "New York", "London/NY Overlap", "Asia"];
const HTF_TF = ["Weekly", "Daily", "H4", "H1"];
const ENTRY_ZONES = ["FVG", "Order Block", "EQ (Equilibrium)", "FVG + OB", "Other"];
const SL_PLACEMENTS = ["Under Sweep Wick", "Under Order Block", "Under Last Low/High", "Other"];
const RESULTS = ["Win", "Loss", "Breakeven"];
const SWEEP_TYPES = ["Equal Highs Swept", "Equal Lows Swept", "Previous High Swept", "Previous Low Swept", "Session High Swept", "Session Low Swept"];

const TJR_RULES = {
  en: ["Correct Session (London/NY)", "HTF Bias determined", "Entry aligned with HTF Bias", "Liquidity Sweep present", "BOS confirmed on M5", "Entry in FVG / OB / EQ", "SL correctly placed"],
  de: ["Korrekte Session (London/NY)", "HTF Bias bestimmt", "Entry stimmt mit HTF Bias überein", "Liquidity Sweep vorhanden", "BOS auf M5 bestätigt", "Entry in FVG / OB / EQ", "SL korrekt platziert"],
};

const PO3_RULES = {
  en: ["10:00 AM EST 4H candle traded", "HTF bias confluences stacked (2+)", "15M FVG formed after accumulation", "Price manipulated into 15M FVG", "2+ entry confirmations (IFVG/CISD/4H open)", "SL under manipulation wick", "TP at next liquidity (prev day high/low)"],
  de: ["10:00 AM EST 4H Candle getradet", "HTF Bias Konfluenzen gestapelt (2+)", "15M FVG nach Akkumulation gebildet", "Preis in 15M FVG manipuliert", "2+ Entry-Bestätigungen (IFVG/CISD/4H Open)", "SL unter Manipulations-Wick", "TP bei nächster Liquidität (Prev Day High/Low)"],
};

const initialTJRForm = {
  date: new Date().toISOString().slice(0, 10),
  pair: "XAU/USD", direction: "", session: "", htfBias: "", htfTimeframe: "",
  liquiditySweep: "", sweepType: "", bosConfirmed: "", entryZone: "",
  slPlacement: "", result: "", pnl: "", rr: "", notes: "",
};

const initialPO3Form = {
  date: new Date().toISOString().slice(0, 10),
  pair: "NQ/ES", direction: "", session: "New York",
  htfBias: "", htfBiasConfluences: "",
  po3Time: "", po3FVG: "", po3Manipulation: "",
  po3EntryConfirmations: "", po3News: "", po3TP: "",
  slPlacement: "", result: "", pnl: "", rr: "", notes: "",
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function ScoreBar({ score, max = 7 }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? COLORS.green : pct >= 50 ? COLORS.accent : COLORS.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 6, background: COLORS.subtle, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 36 }}>{pct}%</span>
    </div>
  );
}

function Badge({ label, ok }) {
  const color = ok ? COLORS.green : COLORS.red;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
      borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: ok ? COLORS.greenDim : COLORS.redDim, color, border: `1px solid ${color}30`
    }}>{ok ? "✓" : "✗"} {label}</span>
  );
}

function ScreenshotUpload({ screenshot, setScreenshot, lang }) {
  const t = T[lang];
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 1280;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
        setScreenshot({ base64, preview: canvas.toDataURL("image/jpeg", 0.5) });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); };

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block" }}>{t.screenshot}</label>
      <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 10px" }}>{t.screenshotHint}</p>
      {!screenshot ? (
        <div onClick={() => fileRef.current.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}
          style={{ border: `2px dashed ${dragging ? COLORS.accent : COLORS.border}`, borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: dragging ? COLORS.accentDim : COLORS.surface }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
          <div style={{ fontSize: 13, color: COLORS.muted }}>{t.screenshotDrop}</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => processFile(e.target.files[0])} />
        </div>
      ) : (
        <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: `1px solid ${COLORS.green}40` }}>
          <img src={screenshot.preview} alt="chart" style={{ width: "100%", display: "block", maxHeight: 220, objectFit: "cover" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "8px 12px", background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: COLORS.green, fontWeight: 700 }}>✓ {t.screenshotAdded}</span>
            <button onClick={() => setScreenshot(null)} style={{ background: COLORS.redDim, border: `1px solid ${COLORS.red}40`, color: COLORS.red, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{t.screenshotRemove}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AIFeedback({ feedback, loading, t }) {
  if (loading) return (
    <div style={{ marginTop: 20, padding: 20, background: COLORS.surface, borderRadius: 12, border: `1px solid ${COLORS.accentBorder}`, textAlign: "center" }}>
      <div style={{ color: COLORS.accent, fontSize: 14, fontWeight: 600 }}>✦ {t.loading}</div>
      <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 6 }}>{t.loadingMsg}</div>
    </div>
  );

  if (!feedback) return null;

  return (
    <div style={{ marginTop: 20, padding: 20, background: COLORS.surface, borderRadius: 12, border: `1px solid ${COLORS.accentBorder}` }}>
      <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: COLORS.accent }}>{t.aiAnalysis}</h3>
      <p style={{ margin: "0 0 16px", color: COLORS.text, fontSize: 14, lineHeight: 1.6 }}>{feedback.overallVerdict}</p>

      {feedback.chartObservations && (
        <div style={{ marginBottom: 16, padding: 14, background: "#1a1a2e", borderRadius: 8, border: `1px solid #3a3a5e` }}>
          <div style={{ fontSize: 12, color: "#8888ff", fontWeight: 700, marginBottom: 6 }}>{t.chartAnalysis}</div>
          <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.7 }}>{feedback.chartObservations}</div>
        </div>
      )}

      {feedback.strengths?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.strengths}</div>
          {feedback.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: COLORS.text, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}`, lineHeight: 1.5 }}>• {s}</div>)}
        </div>
      )}

      {feedback.mistakes?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: COLORS.red, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.mistakes}</div>
          {feedback.mistakes.map((m, i) => <div key={i} style={{ fontSize: 13, color: COLORS.text, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}`, lineHeight: 1.5 }}>• {m}</div>)}
        </div>
      )}

      {feedback.ruleViolations?.length > 0 && (
        <div style={{ marginBottom: 14, padding: 12, background: COLORS.redDim, borderRadius: 8, border: `1px solid ${COLORS.red}30` }}>
          <div style={{ fontSize: 12, color: COLORS.red, fontWeight: 700, marginBottom: 6 }}>{t.ruleViolations}</div>
          {feedback.ruleViolations.map((v, i) => <div key={i} style={{ fontSize: 13, color: COLORS.text }}>⚠ {v}</div>)}
        </div>
      )}

      <div style={{ padding: 14, background: COLORS.accentDim, borderRadius: 8, border: `1px solid ${COLORS.accentBorder}` }}>
        <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, marginBottom: 6 }}>{t.mainLesson}</div>
        <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>{feedback.mainLesson}</div>
      </div>

      {feedback.nextTimeAdvice && (
        <div style={{ marginTop: 12, fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>
          <span style={{ color: COLORS.text, fontWeight: 600 }}>{t.nextTime} </span>{feedback.nextTimeAdvice}
        </div>
      )}
    </div>
  );
}

// ─── LOCAL ANALYZERS ─────────────────────────────────────────────────────────
function localAnalyzeTJR(trade, lang) {
  const labels = TJR_RULES[lang];
  const checks = []; let score = 0;
  const add = (label, ok) => { checks.push({ label, ok }); if (ok) score++; };
  add(labels[0], ["London", "New York", "London/NY Overlap"].includes(trade.session));
  add(labels[1], !!(trade.htfBias && trade.htfTimeframe));
  add(labels[2], (trade.direction === "Long" && trade.htfBias === "Bullish") || (trade.direction === "Short" && trade.htfBias === "Bearish"));
  add(labels[3], trade.liquiditySweep === "yes");
  add(labels[4], trade.bosConfirmed === "yes");
  add(labels[5], ["FVG", "Order Block", "FVG + OB", "EQ (Equilibrium)"].includes(trade.entryZone));
  add(labels[6], ["Under Sweep Wick", "Under Order Block"].includes(trade.slPlacement));
  return { checks, score, max: 7 };
}

function localAnalyzePO3(trade, lang) {
  const labels = PO3_RULES[lang];
  const checks = []; let score = 0;
  const add = (label, ok) => { checks.push({ label, ok }); if (ok) score++; };
  add(labels[0], trade.po3Time === "yes");
  add(labels[1], trade.htfBiasConfluences === "yes");
  add(labels[2], trade.po3FVG === "yes");
  add(labels[3], trade.po3Manipulation === "yes");
  add(labels[4], parseInt(trade.po3EntryConfirmations) >= 2);
  add(labels[5], trade.slPlacement === "Under Sweep Wick" || trade.slPlacement === "Under Manipulation Wick");
  add(labels[6], trade.po3TP === "yes");
  return { checks, score, max: 7 };
}

// ─── AI ANALYZER ─────────────────────────────────────────────────────────────
function analyzeWithAI(trade, screenshot, lang, strategy, setFeedback, setLoading) {
  setLoading(true);
  setFeedback(null);
  const t = T[lang];

  const isTJR = strategy === "TJR";

  const strategyContext = isTJR
    ? `TJR (TJRTrades) Smart Money Concepts strategy rules:
1. HTF Bias from Weekly/Daily → H4/H1
2. Liquidity Sweep MUST occur
3. BOS on M5 after sweep
4. Entry in FVG / Order Block / EQ
5. SL under sweep wick or OB
6. London or NY session only
7. 1 trade/day, 1-3% risk`
    : `PO3 (Power of Three / JackTrades) strategy rules:
1. Trade the 10:00 AM EST 4H candle open
2. Stack 2+ HTF bias confluences (Daily/Weekly profile, HTF PD arrays, ERL to IRL)
3. 15M FVG must form during accumulation phase
4. Price must manipulate INTO the 15M FVG (forming 4H wick)
5. Need 2+ entry confirmations: IFVG close, CISD close above, or close above 4H open price
6. SL under manipulation wick
7. TP at previous day high/low (next liquidity)
8. Avoid trading if red/orange news at 10AM
9. 1 trade/day, 0.5% risk`;

  const tradeData = isTJR
    ? `Direction: ${trade.direction}, Session: ${trade.session}, HTF Bias: ${trade.htfBias} on ${trade.htfTimeframe}, Sweep: ${trade.liquiditySweep} (${trade.sweepType}), BOS M5: ${trade.bosConfirmed}, Entry: ${trade.entryZone}, SL: ${trade.slPlacement}, Result: ${trade.result}, R:R: ${trade.rr}`
    : `Direction: ${trade.direction}, 10AM 4H candle: ${trade.po3Time}, HTF Bias stacked: ${trade.htfBiasConfluences}, 15M FVG formed: ${trade.po3FVG}, Manipulation into FVG: ${trade.po3Manipulation}, Entry confirmations: ${trade.po3EntryConfirmations}, News at 10AM: ${trade.po3News}, TP at liquidity: ${trade.po3TP}, SL: ${trade.slPlacement}, Result: ${trade.result}, R:R: ${trade.rr}`;

  const prompt = `You are an expert trading coach for the ${isTJR ? "TJR" : "PO3/JackTrades"} strategy.
Analyze this trade in ${t.aiLang}.
${screenshot ? "A chart screenshot is provided — analyze the actual chart structure visible." : "No chart provided."}

${strategyContext}

Trade: ${tradeData}
Notes: ${trade.notes || "none"}

Respond ONLY in JSON (no markdown):
{"overallVerdict":"string","strengths":["string"],"mistakes":["string"],"chartObservations":${screenshot ? '"string"' : 'null'},"mainLesson":"string","ruleViolations":["string"],"score":0,"nextTimeAdvice":"string"}`;

  const userContent = screenshot
    ? [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: screenshot } }, { type: "text", text: prompt }]
    : prompt;

  fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, messages: [{ role: "user", content: userContent }] })
  })
    .then(r => r.json())
    .then(data => {
      const text = data.content?.map(i => i.text || "").join("") || "";
      setFeedback(JSON.parse(text.replace(/```json|```/g, "").trim()));
    })
    .catch(() => setFeedback({ overallVerdict: t.feedbackError, strengths: [], mistakes: [], chartObservations: null, mainLesson: t.feedbackRetry, ruleViolations: [], score: 0, nextTimeAdvice: "" }))
    .finally(() => setLoading(false));
}

// ─── TJR FORM ────────────────────────────────────────────────────────────────
function TJRForm({ onSave, lang }) {
  const [form, setForm] = useState(initialTJRForm);
  const [screenshot, setScreenshot] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localResult, setLocalResult] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const t = T[lang];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isComplete = form.direction && form.session && form.htfBias && form.htfTimeframe && form.liquiditySweep && form.bosConfirmed && form.entryZone && form.slPlacement && form.result;

  const handleAnalyze = () => {
    setLocalResult(localAnalyzeTJR(form, lang));
    analyzeWithAI(form, screenshot?.base64 || null, lang, "TJR", setFeedback, setLoading);
    setAnalyzed(true);
  };

  const handleSave = () => {
    onSave({ ...form, id: Date.now(), localScore: localResult?.score || 0, hasScreenshot: !!screenshot, strategy: "TJR" });
    setForm(initialTJRForm); setScreenshot(null); setFeedback(null); setLocalResult(null); setAnalyzed(false);
  };

  const inp = { width: "100%", padding: "10px 14px", borderRadius: 8, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lbl = { fontSize: 12, color: COLORS.muted, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block" };

  const TwoBtn = ({ field, val, opts }) => (
    <div style={{ display: "flex", gap: 8 }}>
      {opts.map(o => (
        <button key={o.v} onClick={() => set(field, o.v)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid", borderColor: val === o.v ? o.color : COLORS.border, background: val === o.v ? o.bg : COLORS.surface, color: val === o.v ? o.color : COLORS.muted, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>{o.label}</button>
      ))}
    </div>
  );

  return (
    <div>
      <ScreenshotUpload screenshot={screenshot} setScreenshot={setScreenshot} lang={lang} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
        <div>
          <div style={{ marginBottom: 16 }}><label style={lbl}>{t.date}</label><input style={inp} type="date" value={form.date} onChange={e => set("date", e.target.value)} /></div>
          <div style={{ marginBottom: 16 }}><label style={lbl}>{t.pair}</label><input style={inp} value={form.pair} onChange={e => set("pair", e.target.value)} /></div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.direction}</label>
            <TwoBtn field="direction" val={form.direction} opts={[{ v: "Long", label: t.long, color: COLORS.green, bg: COLORS.greenDim }, { v: "Short", label: t.short, color: COLORS.red, bg: COLORS.redDim }]} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.session}</label>
            <select style={{ ...inp, cursor: "pointer" }} value={form.session} onChange={e => set("session", e.target.value)}>
              <option value="">{t.choose}</option>{SESSIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.entryZone}</label>
            <select style={{ ...inp, cursor: "pointer" }} value={form.entryZone} onChange={e => set("entryZone", e.target.value)}>
              <option value="">{t.choose}</option>{ENTRY_ZONES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.slPlacement}</label>
            <select style={{ ...inp, cursor: "pointer" }} value={form.slPlacement} onChange={e => set("slPlacement", e.target.value)}>
              <option value="">{t.choose}</option>{SL_PLACEMENTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.htfBias}</label>
            <div style={{ marginBottom: 8 }}>
              <TwoBtn field="htfBias" val={form.htfBias} opts={[{ v: "Bullish", label: t.bullish, color: COLORS.green, bg: COLORS.greenDim }, { v: "Bearish", label: t.bearish, color: COLORS.red, bg: COLORS.redDim }]} />
            </div>
            <select style={{ ...inp, cursor: "pointer" }} value={form.htfTimeframe} onChange={e => set("htfTimeframe", e.target.value)}>
              <option value="">{t.chooseTf}</option>{HTF_TF.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.sweepPresent}</label>
            <div style={{ marginBottom: form.liquiditySweep === "yes" ? 8 : 0 }}>
              <TwoBtn field="liquiditySweep" val={form.liquiditySweep} opts={[{ v: "yes", label: t.yes, color: COLORS.green, bg: COLORS.greenDim }, { v: "no", label: t.no, color: COLORS.red, bg: COLORS.redDim }]} />
            </div>
            {form.liquiditySweep === "yes" && (
              <select style={{ ...inp, cursor: "pointer", marginTop: 8 }} value={form.sweepType} onChange={e => set("sweepType", e.target.value)}>
                <option value="">{t.chooseSweep}</option>{SWEEP_TYPES.map(o => <option key={o}>{o}</option>)}
              </select>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.bosConfirmed}</label>
            <TwoBtn field="bosConfirmed" val={form.bosConfirmed} opts={[{ v: "yes", label: t.yes, color: COLORS.green, bg: COLORS.greenDim }, { v: "no", label: t.no, color: COLORS.red, bg: COLORS.redDim }]} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>{t.result}</label>
              <select style={{ ...inp, cursor: "pointer" }} value={form.result} onChange={e => set("result", e.target.value)}>
                <option value="">{t.choose}</option>{RESULTS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>{t.rr}</label>
              <input style={inp} value={form.rr} onChange={e => set("rr", e.target.value)} placeholder="2.5" />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}><label style={lbl}>{t.pnl}</label><input style={inp} value={form.pnl} onChange={e => set("pnl", e.target.value)} placeholder="+45" /></div>
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>{t.notes}</label>
        <textarea style={{ ...inp, minHeight: 72, resize: "vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder={t.notesPlaceholder} />
      </div>
      {!analyzed && (
        <button onClick={handleAnalyze} disabled={!isComplete} style={{ width: "100%", padding: "14px", borderRadius: 10, background: isComplete ? COLORS.accent : COLORS.subtle, color: isComplete ? "#000" : COLORS.muted, border: "none", fontSize: 15, fontWeight: 800, cursor: isComplete ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
          {isComplete ? (screenshot ? `⚡ ${t.analyzeBtn} + Chart` : t.analyzeBtn) : t.fillAll}
        </button>
      )}
      {localResult && (
        <div style={{ marginTop: 24, padding: 20, background: COLORS.surface, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.text }}>{t.ruleCheck} — TJR</h3>
            <span style={{ fontSize: 13, color: COLORS.muted }}>{localResult.score}/{localResult.max} {t.rules}</span>
          </div>
          <ScoreBar score={localResult.score} max={localResult.max} />
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {localResult.checks.map((c, i) => <Badge key={i} label={c.label} ok={c.ok} />)}
          </div>
        </div>
      )}
      <AIFeedback feedback={feedback} loading={loading} t={t} />
      {analyzed && (
        <button onClick={handleSave} style={{ width: "100%", marginTop: 16, padding: "14px", borderRadius: 10, background: COLORS.greenDim, color: COLORS.green, border: `1px solid ${COLORS.green}40`, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{t.saveBtn}</button>
      )}
    </div>
  );
}

// ─── PO3 FORM ────────────────────────────────────────────────────────────────
function PO3Form({ onSave, lang }) {
  const [form, setForm] = useState(initialPO3Form);
  const [screenshot, setScreenshot] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localResult, setLocalResult] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const t = T[lang];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isComplete = form.direction && form.po3Time && form.htfBiasConfluences && form.po3FVG && form.po3Manipulation && form.po3EntryConfirmations && form.slPlacement && form.result;

  const handleAnalyze = () => {
    setLocalResult(localAnalyzePO3(form, lang));
    analyzeWithAI(form, screenshot?.base64 || null, lang, "PO3", setFeedback, setLoading);
    setAnalyzed(true);
  };

  const handleSave = () => {
    onSave({ ...form, id: Date.now(), localScore: localResult?.score || 0, hasScreenshot: !!screenshot, strategy: "PO3" });
    setForm(initialPO3Form); setScreenshot(null); setFeedback(null); setLocalResult(null); setAnalyzed(false);
  };

  const inp = { width: "100%", padding: "10px 14px", borderRadius: 8, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lbl = { fontSize: 12, color: COLORS.muted, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block" };

  const TwoBtn = ({ field, val, opts }) => (
    <div style={{ display: "flex", gap: 8 }}>
      {opts.map(o => (
        <button key={o.v} onClick={() => set(field, o.v)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid", borderColor: val === o.v ? o.color : COLORS.border, background: val === o.v ? o.bg : COLORS.surface, color: val === o.v ? o.color : COLORS.muted, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>{o.label}</button>
      ))}
    </div>
  );

  const yesNoOpts = [{ v: "yes", label: t.yes, color: COLORS.green, bg: COLORS.greenDim }, { v: "no", label: t.no, color: COLORS.red, bg: COLORS.redDim }];

  return (
    <div>
      <ScreenshotUpload screenshot={screenshot} setScreenshot={setScreenshot} lang={lang} />

      {/* PO3 Info Banner */}
      <div style={{ marginBottom: 24, padding: 14, background: COLORS.blueDim, borderRadius: 10, border: `1px solid ${COLORS.blue}30` }}>
        <div style={{ fontSize: 12, color: COLORS.blue, fontWeight: 700, marginBottom: 4 }}>PO3 — 10:00 AM EST Setup</div>
        <div style={{ fontSize: 12, color: COLORS.muted }}>Accumulation → Manipulation into 15M FVG → Distribution</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
        <div>
          <div style={{ marginBottom: 16 }}><label style={lbl}>{t.date}</label><input style={inp} type="date" value={form.date} onChange={e => set("date", e.target.value)} /></div>
          <div style={{ marginBottom: 16 }}><label style={lbl}>{t.pair}</label><input style={inp} value={form.pair} onChange={e => set("pair", e.target.value)} /></div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.direction}</label>
            <TwoBtn field="direction" val={form.direction} opts={[{ v: "Long", label: t.long, color: COLORS.green, bg: COLORS.greenDim }, { v: "Short", label: t.short, color: COLORS.red, bg: COLORS.redDim }]} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.po3Time}</label>
            <TwoBtn field="po3Time" val={form.po3Time} opts={yesNoOpts} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.po3News}</label>
            <TwoBtn field="po3News" val={form.po3News} opts={[{ v: "no", label: t.no, color: COLORS.green, bg: COLORS.greenDim }, { v: "yes", label: t.yes, color: COLORS.red, bg: COLORS.redDim }]} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.slPlacement}</label>
            <select style={{ ...inp, cursor: "pointer" }} value={form.slPlacement} onChange={e => set("slPlacement", e.target.value)}>
              <option value="">{t.choose}</option>
              {["Under Manipulation Wick", "Under Sweep Wick", "Under Order Block", "Other"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.htfBias}</label>
            <div style={{ marginBottom: 8 }}>
              <TwoBtn field="htfBias" val={form.htfBias} opts={[{ v: "Bullish", label: t.bullish, color: COLORS.green, bg: COLORS.greenDim }, { v: "Bearish", label: t.bearish, color: COLORS.red, bg: COLORS.redDim }]} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.po3HTFBias}</label>
            <TwoBtn field="htfBiasConfluences" val={form.htfBiasConfluences} opts={yesNoOpts} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.po3FVG}</label>
            <TwoBtn field="po3FVG" val={form.po3FVG} opts={yesNoOpts} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.po3Manipulation}</label>
            <TwoBtn field="po3Manipulation" val={form.po3Manipulation} opts={yesNoOpts} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.po3EntryCount}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["0","1","2","3"].map(v => (
                <button key={v} onClick={() => set("po3EntryConfirmations", v)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid", borderColor: form.po3EntryConfirmations === v ? (parseInt(v) >= 2 ? COLORS.green : COLORS.red) : COLORS.border, background: form.po3EntryConfirmations === v ? (parseInt(v) >= 2 ? COLORS.greenDim : COLORS.redDim) : COLORS.surface, color: form.po3EntryConfirmations === v ? (parseInt(v) >= 2 ? COLORS.green : COLORS.red) : COLORS.muted, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>{v}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.po3TP}</label>
            <TwoBtn field="po3TP" val={form.po3TP} opts={yesNoOpts} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>{t.result}</label>
              <select style={{ ...inp, cursor: "pointer" }} value={form.result} onChange={e => set("result", e.target.value)}>
                <option value="">{t.choose}</option>{RESULTS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>{t.rr}</label>
              <input style={inp} value={form.rr} onChange={e => set("rr", e.target.value)} placeholder="2.5" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>{t.notes}</label>
        <textarea style={{ ...inp, minHeight: 72, resize: "vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder={t.notesPlaceholder} />
      </div>

      {!analyzed && (
        <button onClick={handleAnalyze} disabled={!isComplete} style={{ width: "100%", padding: "14px", borderRadius: 10, background: isComplete ? COLORS.accent : COLORS.subtle, color: isComplete ? "#000" : COLORS.muted, border: "none", fontSize: 15, fontWeight: 800, cursor: isComplete ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
          {isComplete ? (screenshot ? `⚡ ${t.analyzeBtn} + Chart` : t.analyzeBtn) : t.fillAll}
        </button>
      )}

      {localResult && (
        <div style={{ marginTop: 24, padding: 20, background: COLORS.surface, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.text }}>{t.ruleCheck} — PO3</h3>
            <span style={{ fontSize: 13, color: COLORS.muted }}>{localResult.score}/{localResult.max} {t.rules}</span>
          </div>
          <ScoreBar score={localResult.score} max={localResult.max} />
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {localResult.checks.map((c, i) => <Badge key={i} label={c.label} ok={c.ok} />)}
          </div>
        </div>
      )}

      <AIFeedback feedback={feedback} loading={loading} t={t} />

      {analyzed && (
        <button onClick={handleSave} style={{ width: "100%", marginTop: 16, padding: "14px", borderRadius: 10, background: COLORS.greenDim, color: COLORS.green, border: `1px solid ${COLORS.green}40`, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{t.saveBtn}</button>
      )}
    </div>
  );
}

// ─── JOURNAL ─────────────────────────────────────────────────────────────────
function Journal({ trades, lang }) {
  const t = T[lang];
  if (trades.length === 0) return (
    <div style={{ textAlign: "center", padding: 60, color: COLORS.muted }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{t.noTrades}</div>
      <div style={{ fontSize: 13, marginTop: 6 }}>{t.noTradesMsg}</div>
    </div>
  );

  const wins = trades.filter(tr => tr.result === "Win").length;
  const winRate = Math.round((wins / trades.length) * 100);
  const avgScore = Math.round(trades.reduce((a, tr) => a + (tr.localScore || 0), 0) / trades.length * 100 / 7);
  const tjrTrades = trades.filter(tr => tr.strategy === "TJR").length;
  const po3Trades = trades.filter(tr => tr.strategy === "PO3").length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: t.trades, value: trades.length, color: COLORS.text },
          { label: t.winRate, value: `${winRate}%`, color: winRate >= 50 ? COLORS.green : COLORS.red },
          { label: t.wins, value: wins, color: COLORS.green },
          { label: t.avgScore, value: `${avgScore}%`, color: avgScore >= 70 ? COLORS.green : COLORS.accent },
          { label: "TJR / PO3", value: `${tjrTrades} / ${po3Trades}`, color: COLORS.muted },
        ].map((s, i) => (
          <div key={i} style={{ padding: 16, background: COLORS.surface, borderRadius: 10, border: `1px solid ${COLORS.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...trades].reverse().map(tr => (
          <div key={tr.id} style={{ padding: 16, background: COLORS.surface, borderRadius: 10, border: `1px solid ${tr.result === "Win" ? COLORS.green + "30" : tr.result === "Loss" ? COLORS.red + "30" : COLORS.border}`, display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 16, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: tr.result === "Win" ? COLORS.greenDim : tr.result === "Loss" ? COLORS.redDim : COLORS.subtle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {tr.result === "Win" ? "✓" : tr.result === "Loss" ? "✗" : "—"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{tr.pair} · {tr.direction}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: tr.strategy === "PO3" ? COLORS.blueDim : COLORS.accentDim, color: tr.strategy === "PO3" ? COLORS.blue : COLORS.accent, fontWeight: 700 }}>{tr.strategy}</span>
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>{tr.date} · {tr.session}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: COLORS.muted }}>R:R</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.accent }}>{tr.rr || "—"}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: COLORS.muted }}>Score</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{tr.localScore}/7</div>
            </div>
            <div style={{ fontSize: 16 }}>{tr.hasScreenshot ? "📸" : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("analyze");
  const [trades, setTrades] = useState([]);
  const [lang, setLang] = useState("en");
  const [strategy, setStrategy] = useState("TJR");
  const { isSignedIn, isLoaded } = useAuth();
  const t = T[lang];

  const saveTrade = (trade) => { setTrades(prev => [...prev, trade]); setTab("journal"); };

  const tabStyle = (active) => ({ padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", background: active ? COLORS.accent : "transparent", color: active ? "#000" : COLORS.muted, transition: "all 0.2s" });

  if (!isLoaded) return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: COLORS.accent, fontSize: 14 }}>Loading...</div>
    </div>
  );

  if (!isSignedIn) return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace" }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "#000", margin: "0 auto 16px" }}>F</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, margin: 0, fontFamily: "'DM Mono', monospace" }}>FlowCheck</h1>
        <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 8 }}>Sign in to access your trade analyzer</p>
      </div>
      <SignIn />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'DM Mono', 'Fira Code', monospace", color: COLORS.text }}>
      <style>{`* { box-sizing: border-box; } select option { background: #16161f; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }`}</style>

      {/* Navbar */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, background: COLORS.bg, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000" }}>F</div>
          <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text }}>FlowCheck</span>
          <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: 4 }}>powered by AI</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={startCheckout} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: COLORS.accent, color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Subscribe $19/mo</button>

          {/* Language Toggle */}
          <div style={{ display: "flex", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 3, gap: 2 }}>
            {["en", "de"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: lang === l ? COLORS.accent : "transparent", color: lang === l ? "#000" : COLORS.muted, fontSize: 11, fontWeight: 700, fontFamily: "inherit" }}>{l.toUpperCase()}</button>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            <button style={tabStyle(tab === "analyze")} onClick={() => setTab("analyze")}>{t.tabAnalyze}</button>
            <button style={tabStyle(tab === "journal")} onClick={() => setTab("journal")}>
              {t.tabJournal}{trades.length > 0 && <span style={{ marginLeft: 6, background: COLORS.accentDim, color: COLORS.accent, borderRadius: 10, padding: "1px 6px", fontSize: 11 }}>{trades.length}</span>}
            </button>
          </div>

          <UserButton />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "analyze" && (
          <>
            {/* Header + Strategy Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.02em" }}>{t.analyzeTitle}</h2>
                <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>{t.analyzeSubtitle}</p>
              </div>
              {/* Strategy Toggle */}
              <div style={{ display: "flex", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 4, gap: 4 }}>
                {["TJR", "PO3"].map(s => (
                  <button key={s} onClick={() => setStrategy(s)} style={{
                    padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit",
                    fontSize: 13, fontWeight: 800,
                    background: strategy === s ? (s === "PO3" ? COLORS.blue : COLORS.accent) : "transparent",
                    color: strategy === s ? (s === "PO3" ? "#fff" : "#000") : COLORS.muted,
                    transition: "all 0.2s"
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {strategy === "TJR" ? <TJRForm onSave={saveTrade} lang={lang} /> : <PO3Form onSave={saveTrade} lang={lang} />}
          </>
        )}
        {tab === "journal" && <Journal trades={trades} lang={lang} />}
      </div>
    </div>
  );
}
