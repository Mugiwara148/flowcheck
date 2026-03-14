import { useState, useRef } from "react";

async function startCheckout() {
  const res = await fetch('/api/checkout', { method: 'POST' });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

const COLORS = {
  bg: "#0a0a0f", surface: "#111118", card: "#16161f", border: "#1e1e2e",
  accent: "#f0b429", accentDim: "#f0b42920", accentBorder: "#f0b42940",
  green: "#22c55e", greenDim: "#22c55e18", red: "#ef4444", redDim: "#ef444418",
  text: "#e8e8f0", muted: "#6b6b80", subtle: "#2a2a3a",
};

const T = {
  en: {
    appName: "TJR Analyzer",
    tabAnalyze: "Analyze", tabJournal: "Journal",
    analyzeTitle: "Trade Analysis",
    analyzeSubtitle: "Fill in all fields — AI checks if you followed the TJR rules",
    date: "Date", pair: "Pair", direction: "Direction", session: "Session",
    htfBias: "HTF Bias", htfTimeframe: "Timeframe", sweepPresent: "Liquidity Sweep present?",
    sweepType: "Type of Sweep", bosConfirmed: "BOS confirmed on M5?",
    entryZone: "Entry Zone", slPlacement: "SL Placement", result: "Result",
    rr: "R:R (e.g. 2.5)", pnl: "P&L (Pips/$)", notes: "Notes (optional)",
    notesPlaceholder: "What did you see? What was unclear? Special conditions?",
    analyzeBtn: "⚡ Analyze Trade", fillAll: "Please fill in all fields",
    saveBtn: "✓ Save trade & update Journal",
    ruleCheck: "TJR Rule Check", rules: "Rules",
    aiAnalysis: "✦ AI Analysis", loading: "AI is analyzing your trade...", loadingMsg: "One moment",
    strengths: "✓ Strengths", mistakes: "✗ Mistakes", ruleViolations: "Rule Violations",
    mainLesson: "Key Lesson", nextTime: "Next time:",
    noTrades: "No trades saved yet", noTradesMsg: "Analyze your first trade to get started",
    trades: "Trades", winRate: "Win Rate", wins: "Wins", avgScore: "Avg Score",
    long: "↑ Long", short: "↓ Short", bullish: "↑ Bullish", bearish: "↓ Bearish",
    yes: "✓ Yes", no: "✗ No", choose: "— select —", chooseTf: "— Timeframe —", chooseSweep: "— Sweep Type —",
    checks: [
      "Correct Session (London/NY)",
      "HTF Bias determined",
      "Entry aligned with HTF Bias",
      "Liquidity Sweep present",
      "BOS confirmed on M5",
      "Entry in FVG / OB / EQ",
      "SL correctly placed",
    ],
    feedbackError: "Analysis could not be loaded.", feedbackRetry: "Please try again.",
    aiLang: "English",
  },
  de: {
    appName: "TJR Analyzer",
    tabAnalyze: "Analyse", tabJournal: "Journal",
    analyzeTitle: "Trade Analyse",
    analyzeSubtitle: "Füll alle Felder aus — die KI prüft ob du die TJR-Regeln befolgt hast",
    date: "Datum", pair: "Pair", direction: "Richtung", session: "Session",
    htfBias: "HTF Bias", htfTimeframe: "Timeframe", sweepPresent: "Liquidity Sweep vorhanden?",
    sweepType: "Art des Sweeps", bosConfirmed: "BOS auf M5 bestätigt?",
    entryZone: "Entry Zone", slPlacement: "SL Platzierung", result: "Resultat",
    rr: "R:R (z.B. 2.5)", pnl: "P&L (Pips/CHF)", notes: "Notizen (optional)",
    notesPlaceholder: "Was hast du gesehen? Was war unklar? Besondere Bedingungen?",
    analyzeBtn: "⚡ Trade analysieren", fillAll: "Bitte alle Felder ausfüllen",
    saveBtn: "✓ Trade speichern & Journal aktualisieren",
    ruleCheck: "TJR Regel-Check", rules: "Regeln",
    aiAnalysis: "✦ KI Analyse", loading: "KI analysiert deinen Trade...", loadingMsg: "Einen Moment",
    strengths: "✓ Stärken", mistakes: "✗ Fehler", ruleViolations: "Regel-Verletzungen",
    mainLesson: "Wichtigste Lektion", nextTime: "Nächstes Mal:",
    noTrades: "Noch keine Trades gespeichert", noTradesMsg: "Analysiere deinen ersten Trade um zu starten",
    trades: "Trades", winRate: "Win Rate", wins: "Wins", avgScore: "Ø Score",
    long: "↑ Long", short: "↓ Short", bullish: "↑ Bullish", bearish: "↓ Bearish",
    yes: "✓ Ja", no: "✗ Nein", choose: "— wählen —", chooseTf: "— Timeframe —", chooseSweep: "— Art des Sweeps —",
    checks: [
      "Korrekte Session (London/NY)",
      "HTF Bias bestimmt",
      "Entry stimmt mit HTF Bias überein",
      "Liquidity Sweep vorhanden",
      "BOS auf M5 bestätigt",
      "Entry in FVG / OB / EQ",
      "SL korrekt platziert",
    ],
    feedbackError: "Analyse konnte nicht geladen werden.", feedbackRetry: "Bitte versuche es erneut.",
    aiLang: "Deutsch",
  }
};

const SESSIONS = ["London", "New York", "London/NY Overlap", "Asia"];
const HTF_TF = ["Weekly", "Daily", "H4", "H1"];
const ENTRY_ZONES = ["FVG", "Order Block", "EQ (Equilibrium)", "FVG + OB", "Other"];
const SL_PLACEMENTS = ["Under Sweep Wick", "Under Order Block", "Under Last Low/High", "Other"];
const RESULTS = ["Win", "Loss", "Breakeven"];
const SWEEP_TYPES = ["Equal Highs Swept", "Equal Lows Swept", "Previous High Swept", "Previous Low Swept", "Session High Swept", "Session Low Swept"];

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  pair: "XAU/USD", direction: "", session: "", htfBias: "", htfTimeframe: "",
  liquiditySweep: "", sweepType: "", bosConfirmed: "", entryZone: "",
  slPlacement: "", result: "", pnl: "", rr: "", notes: "",
};

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
  const bg = ok ? COLORS.greenDim : COLORS.redDim;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: bg, color, border: `1px solid ${color}30`
    }}>
      {ok ? "✓" : "✗"} {label}
    </span>
  );
}

function localAnalyze(trade, lang) {
  const labels = T[lang].checks;
  const checks = [];
  let score = 0;

  const goodSession = ["London", "New York", "London/NY Overlap"].includes(trade.session);
  checks.push({ label: labels[0], ok: goodSession });
  if (goodSession) score++;

  const hasHTF = trade.htfBias && trade.htfTimeframe;
  checks.push({ label: labels[1], ok: !!hasHTF });
  if (hasHTF) score++;

  const biasOk = (trade.direction === "Long" && trade.htfBias === "Bullish") ||
    (trade.direction === "Short" && trade.htfBias === "Bearish");
  checks.push({ label: labels[2], ok: biasOk });
  if (biasOk) score++;

  const hasSweep = trade.liquiditySweep === "yes";
  checks.push({ label: labels[3], ok: hasSweep });
  if (hasSweep) score++;

  const hasBOS = trade.bosConfirmed === "yes";
  checks.push({ label: labels[4], ok: hasBOS });
  if (hasBOS) score++;

  const goodEntry = ["FVG", "Order Block", "FVG + OB", "EQ (Equilibrium)"].includes(trade.entryZone);
  checks.push({ label: labels[5], ok: goodEntry });
  if (goodEntry) score++;

  const goodSL = ["Under Sweep Wick", "Under Order Block"].includes(trade.slPlacement);
  checks.push({ label: labels[6], ok: goodSL });
  if (goodSL) score++;

  return { checks, score, max: 7 };
}

function analyzeTradeWithAI(trade, lang, setFeedback, setLoading) {
  setLoading(true);
  setFeedback(null);
  const t = T[lang];

  const prompt = `You are an expert trading coach specialized in the TJR (TJRTrades) Smart Money Concepts strategy.

Analyze this trade and provide detailed, specific feedback in ${t.aiLang}:

Trade Data:
- Date: ${trade.date}
- Pair: ${trade.pair}
- Direction: ${trade.direction}
- Session: ${trade.session}
- HTF Bias: ${trade.htfBias} on ${trade.htfTimeframe}
- Liquidity Sweep: ${trade.liquiditySweep} (${trade.sweepType})
- BOS Confirmed on M5: ${trade.bosConfirmed}
- Entry Zone: ${trade.entryZone}
- SL Placement: ${trade.slPlacement}
- Result: ${trade.result}
- R:R: ${trade.rr}
- Notes: ${trade.notes}

TJR Strategy Rules:
1. HTF Bias must be determined from Weekly/Daily then H4/H1
2. A Liquidity Sweep MUST occur (highs/lows/stops taken)
3. BOS (Break of Structure) must confirm on M5 after the sweep
4. Entry ONLY in FVG, Order Block, or EQ during the retrace
5. SL placed under sweep wick or OB
6. Trade only London or NY sessions
7. 1 trade per day, 1-3% risk

Respond ONLY in this exact JSON format (no markdown, no backticks):
{
  "overallVerdict": "1 sentence summary of the trade quality in ${t.aiLang}",
  "strengths": ["string", "string"],
  "mistakes": ["string", "string"],
  "mainLesson": "the single most important thing to improve in ${t.aiLang}",
  "ruleViolations": ["string"],
  "score": 0,
  "nextTimeAdvice": "concrete advice for next trade in ${t.aiLang}"
}`;

  fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  })
    .then(r => r.json())
    .then(data => {
      const text = data.content?.map(i => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setFeedback(JSON.parse(clean));
    })
    .catch(() => {
      setFeedback({
        overallVerdict: t.feedbackError, strengths: [], mistakes: [],
        mainLesson: t.feedbackRetry, ruleViolations: [], score: 0, nextTimeAdvice: ""
      });
    })
    .finally(() => setLoading(false));
}

function TradeForm({ onSave, lang }) {
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localResult, setLocalResult] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const t = T[lang];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isComplete = form.direction && form.session && form.htfBias && form.htfTimeframe &&
    form.liquiditySweep && form.bosConfirmed && form.entryZone && form.slPlacement && form.result;

  const handleAnalyze = () => {
    setLocalResult(localAnalyze(form, lang));
    analyzeTradeWithAI(form, lang, setFeedback, setLoading);
    setAnalyzed(true);
  };

  const handleSave = () => {
    onSave({ ...form, id: Date.now(), localScore: localResult?.score || 0 });
    setForm(initialForm); setFeedback(null); setLocalResult(null); setAnalyzed(false);
  };

  const inp = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit"
  };
  const lbl = { fontSize: 12, color: COLORS.muted, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, display: "block" };

  const TwoBtn = ({ field, val, opts }) => (
    <div style={{ display: "flex", gap: 8 }}>
      {opts.map(o => (
        <button key={o.v} onClick={() => set(field, o.v)} style={{
          flex: 1, padding: "10px", borderRadius: 8, border: "1px solid",
          borderColor: val === o.v ? o.color : COLORS.border,
          background: val === o.v ? o.bg : COLORS.surface,
          color: val === o.v ? o.color : COLORS.muted,
          cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit"
        }}>{o.label}</button>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.02em" }}>{t.analyzeTitle}</h2>
        <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>{t.analyzeSubtitle}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
        <div>
          <div style={{ marginBottom: 16 }}><label style={lbl}>{t.date}</label><input style={inp} type="date" value={form.date} onChange={e => set("date", e.target.value)} /></div>
          <div style={{ marginBottom: 16 }}><label style={lbl}>{t.pair}</label><input style={inp} value={form.pair} onChange={e => set("pair", e.target.value)} /></div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.direction}</label>
            <TwoBtn field="direction" val={form.direction} opts={[
              { v: "Long", label: t.long, color: COLORS.green, bg: COLORS.greenDim },
              { v: "Short", label: t.short, color: COLORS.red, bg: COLORS.redDim }
            ]} />
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
              <TwoBtn field="htfBias" val={form.htfBias} opts={[
                { v: "Bullish", label: t.bullish, color: COLORS.green, bg: COLORS.greenDim },
                { v: "Bearish", label: t.bearish, color: COLORS.red, bg: COLORS.redDim }
              ]} />
            </div>
            <select style={{ ...inp, cursor: "pointer" }} value={form.htfTimeframe} onChange={e => set("htfTimeframe", e.target.value)}>
              <option value="">{t.chooseTf}</option>{HTF_TF.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.sweepPresent}</label>
            <div style={{ marginBottom: form.liquiditySweep === "yes" ? 8 : 0 }}>
              <TwoBtn field="liquiditySweep" val={form.liquiditySweep} opts={[
                { v: "yes", label: t.yes, color: COLORS.green, bg: COLORS.greenDim },
                { v: "no", label: t.no, color: COLORS.red, bg: COLORS.redDim }
              ]} />
            </div>
            {form.liquiditySweep === "yes" && (
              <select style={{ ...inp, cursor: "pointer", marginTop: 8 }} value={form.sweepType} onChange={e => set("sweepType", e.target.value)}>
                <option value="">{t.chooseSweep}</option>{SWEEP_TYPES.map(o => <option key={o}>{o}</option>)}
              </select>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.bosConfirmed}</label>
            <TwoBtn field="bosConfirmed" val={form.bosConfirmed} opts={[
              { v: "yes", label: t.yes, color: COLORS.green, bg: COLORS.greenDim },
              { v: "no", label: t.no, color: COLORS.red, bg: COLORS.redDim }
            ]} />
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
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{t.pnl}</label>
            <input style={inp} value={form.pnl} onChange={e => set("pnl", e.target.value)} placeholder="+45" />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>{t.notes}</label>
        <textarea style={{ ...inp, minHeight: 72, resize: "vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder={t.notesPlaceholder} />
      </div>

      {!analyzed && (
        <button onClick={handleAnalyze} disabled={!isComplete} style={{
          width: "100%", padding: "14px", borderRadius: 10,
          background: isComplete ? COLORS.accent : COLORS.subtle,
          color: isComplete ? "#000" : COLORS.muted,
          border: "none", fontSize: 15, fontWeight: 800,
          cursor: isComplete ? "pointer" : "not-allowed", fontFamily: "inherit"
        }}>{isComplete ? t.analyzeBtn : t.fillAll}</button>
      )}

      {localResult && (
        <div style={{ marginTop: 24, padding: 20, background: COLORS.surface, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.text }}>{t.ruleCheck}</h3>
            <span style={{ fontSize: 13, color: COLORS.muted }}>{localResult.score}/{localResult.max} {t.rules}</span>
          </div>
          <ScoreBar score={localResult.score} max={localResult.max} />
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {localResult.checks.map((c, i) => <Badge key={i} label={c.label} ok={c.ok} />)}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 20, padding: 20, background: COLORS.surface, borderRadius: 12, border: `1px solid ${COLORS.accentBorder}`, textAlign: "center" }}>
          <div style={{ color: COLORS.accent, fontSize: 14, fontWeight: 600 }}>✦ {t.loading}</div>
          <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 6 }}>{t.loadingMsg}</div>
        </div>
      )}

      {feedback && !loading && (
        <div style={{ marginTop: 20, padding: 20, background: COLORS.surface, borderRadius: 12, border: `1px solid ${COLORS.accentBorder}` }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: COLORS.accent }}>{t.aiAnalysis}</h3>
          <p style={{ margin: "0 0 16px", color: COLORS.text, fontSize: 14, lineHeight: 1.6 }}>{feedback.overallVerdict}</p>

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
      )}

      {analyzed && (
        <button onClick={handleSave} style={{
          width: "100%", marginTop: 16, padding: "14px", borderRadius: 10,
          background: COLORS.greenDim, color: COLORS.green,
          border: `1px solid ${COLORS.green}40`, fontSize: 15, fontWeight: 800,
          cursor: "pointer", fontFamily: "inherit"
        }}>{t.saveBtn}</button>
      )}
    </div>
  );
}

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

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: t.trades, value: trades.length, color: COLORS.text },
          { label: t.winRate, value: `${winRate}%`, color: winRate >= 50 ? COLORS.green : COLORS.red },
          { label: t.wins, value: wins, color: COLORS.green },
          { label: t.avgScore, value: `${avgScore}%`, color: avgScore >= 70 ? COLORS.green : COLORS.accent },
        ].map((s, i) => (
          <div key={i} style={{ padding: 16, background: COLORS.surface, borderRadius: 10, border: `1px solid ${COLORS.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...trades].reverse().map(tr => (
          <div key={tr.id} style={{
            padding: 16, background: COLORS.surface, borderRadius: 10,
            border: `1px solid ${tr.result === "Win" ? COLORS.green + "30" : tr.result === "Loss" ? COLORS.red + "30" : COLORS.border}`,
            display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 16, alignItems: "center"
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: tr.result === "Win" ? COLORS.greenDim : tr.result === "Loss" ? COLORS.redDim : COLORS.subtle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {tr.result === "Win" ? "✓" : tr.result === "Loss" ? "✗" : "—"}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{tr.pair} · {tr.direction} · {tr.session}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>{tr.date} · {tr.entryZone} · SL: {tr.slPlacement}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: COLORS.muted }}>R:R</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.accent }}>{tr.rr || "—"}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: COLORS.muted }}>Score</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{tr.localScore}/7</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("analyze");
  const [trades, setTrades] = useState([]);
  const [lang, setLang] = useState("en");
  const t = T[lang];

  const saveTrade = (trade) => { setTrades(prev => [...prev, trade]); setTab("journal"); };

  const tabStyle = (active) => ({
    padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 700, fontFamily: "inherit",
    background: active ? COLORS.accent : "transparent",
    color: active ? "#000" : COLORS.muted, transition: "all 0.2s"
  });

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'DM Mono', 'Fira Code', monospace", color: COLORS.text }}>
      <style>{`* { box-sizing: border-box; } select option { background: #16161f; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }`}</style>

      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, background: COLORS.bg, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000" }}>T</div>
          <div>
            <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text }}>{t.appName}</span>
            <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: 8 }}>powered by AI</span>
          </div>
        </div>
        <button onClick={startCheckout} style={{
          padding: "8px 18px", borderRadius: 8, border: "none",
          background: COLORS.accent, color: "#000",
          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginRight: 16
        }}>Subscribe $19/mo</button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Language Toggle */}
          <div style={{ display: "flex", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 3, gap: 2 }}>
            {["en", "de"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                background: lang === l ? COLORS.accent : "transparent",
                color: lang === l ? "#000" : COLORS.muted,
                fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all 0.2s"
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={tabStyle(tab === "analyze")} onClick={() => setTab("analyze")}>{t.tabAnalyze}</button>
            <button style={tabStyle(tab === "journal")} onClick={() => setTab("journal")}>
              {t.tabJournal}{trades.length > 0 && <span style={{ marginLeft: 6, background: COLORS.accentDim, color: COLORS.accent, borderRadius: 10, padding: "1px 6px", fontSize: 11 }}>{trades.length}</span>}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "analyze" ? <TradeForm onSave={saveTrade} lang={lang} /> : <Journal trades={trades} lang={lang} />}
      </div>
    </div>
  );
}
