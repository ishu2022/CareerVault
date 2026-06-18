// src/pages/CompanyDetail.jsx
import { useParams, Link }     from "react-router-dom";
import { useState, useEffect } from "react";
import { getCompany }          from "../api/services";

// ── Constants ────────────────────────────────────────────────────

const ROUND_LABELS = {
  coding:        "Coding Round",
  technical:     "Technical Round",
  hr:            "HR Round",
  system_design: "System Design Round",
  managerial:    "Managerial Round",
};

const ROUND_COLORS = {
  coding:        { bg: "#e6f1fb", color: "#0c447c" },
  technical:     { bg: "#eaf5ea", color: "#1a5c1a" },
  hr:            { bg: "#fff3e0", color: "#7c4700" },
  system_design: { bg: "#f3e8ff", color: "#6b21a8" },
  managerial:    { bg: "#fef9c3", color: "#7a6000" },
};

const DIFFICULTY_COLORS = {
  easy:   { bg: "#eaf5ea", color: "#1a5c1a" },
  medium: { bg: "#fff3e0", color: "#7c4700" },
  hard:   { bg: "#fdecea", color: "#8b1a1a" },
};

const OUTCOME_COLORS = {
  selected: { bg: "#eaf5ea", color: "#1a5c1a" },
  rejected: { bg: "#fdecea", color: "#8b1a1a" },
};

// ── Helpers ──────────────────────────────────────────────────────

// Filter out empty + unknown rounds — the core requirement
function filterRounds(rounds) {
  return (rounds || []).filter(
    (r) => r.round_type !== "unknown" && r.questions?.length > 0
  );
}

// ── Sub-components ───────────────────────────────────────────────

function Pill({ label, colorMap }) {
  if (!label) return null;
  const c = colorMap[label.toLowerCase()];
  if (!c)   return null;
  return (
    <span style={{ ...s.pill, background: c.bg, color: c.color }}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

function RoundSection({ round }) {
  const [open, setOpen] = useState(true);
  const label  = ROUND_LABELS[round.round_type] || round.round_type;
  const colors = ROUND_COLORS[round.round_type] || { bg: "var(--code-bg)", color: "var(--text)" };

  return (
    <div style={s.roundBox}>
      {/* Round header */}
      <button style={s.roundHeader} onClick={() => setOpen((o) => !o)}>
        <div style={s.roundLeft}>
          <span style={{ ...s.roundBadge, background: colors.bg, color: colors.color }}>
            {label}
          </span>
          <span style={s.roundCount}>
            {round.questions.length} question{round.questions.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span style={s.chevron}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Questions list */}
      {open && (
        <ul style={s.qList}>
          {round.questions.map((q, i) => (
            <li key={i} style={s.qItem}>
              <span style={s.qBullet}>Q{i + 1}</span>
              <span style={s.qText}>{q}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ExperienceCard({ exp, index }) {
  const [open, setOpen]  = useState(index === 0);
  const visibleRounds    = filterRounds(exp.rounds);
  const totalQ           = visibleRounds.reduce((n, r) => n + r.questions.length, 0);
  const hasContent       = visibleRounds.length > 0;

  return (
    <div style={s.expCard}>
      {/* Card header — clickable */}
      <div style={s.expHeader} onClick={() => setOpen((o) => !o)}>
        <div style={s.expMeta}>
          {/* Year */}
          <span style={s.expYear}>{exp.year || "Year N/A"}</span>

          {/* Role — only if not "Unknown" */}
          {exp.role && exp.role !== "Unknown" && (
            <span style={s.expRole}>{exp.role}</span>
          )}

          {/* Difficulty + Outcome pills */}
          <div style={s.pillRow}>
            <Pill label={exp.difficulty} colorMap={DIFFICULTY_COLORS} />
            <Pill label={exp.outcome}    colorMap={OUTCOME_COLORS}    />
          </div>
        </div>

        <div style={s.expRight}>
          {hasContent && (
            <span style={s.expSummary}>
              {visibleRounds.length} round{visibleRounds.length !== 1 ? "s" : ""} · {totalQ} questions
            </span>
          )}
          <span style={s.chevron}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div style={s.expBody}>
          {hasContent ? (
            visibleRounds.map((r, i) => <RoundSection key={i} round={r} />)
          ) : (
            <p style={s.noContent}>
              No detailed round information available for this experience.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────

export default function CompanyDetail() {
  const { companyName }                   = useParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setData(null);
    setError(null);

    getCompany(companyName)
      .then(setData)
      .catch((e) => setError(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [companyName]);

  return (
    <div style={s.page}>

      {/* Back nav */}
      <Link to="/companies" style={s.back}>← All Companies</Link>

      {/* Loading */}
      {loading && (
        <div style={s.centered}>
          <div style={s.spinner} />
          <p style={s.spinnerText}>Loading experiences…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={s.errorCard}>
          <div style={s.errorIcon}>⚠</div>
          <div>
            <div style={s.errorTitle}>Could not load company data</div>
            <div style={s.errorMsg}>{error}</div>
          </div>
        </div>
      )}

      {/* Content */}
      {data && (
        <>
          {/* Page header */}
          <div style={s.pageHeader}>
            <div style={s.companyAvatar}>
              {data.company?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 style={s.companyName}>{data.company}</h1>
              <p style={s.companyMeta}>
                {data.experiences?.length || 0} interview experience
                {data.experiences?.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* No experiences at all */}
          {data.experiences?.length === 0 && (
            <div style={s.emptyState}>
              Interview experiences not available.
            </div>
          )}

          {/* Experience cards */}
          <div style={s.expList}>
            {data.experiences?.map((exp, i) => (
              <ExperienceCard key={i} exp={exp} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────

const s = {
  page:  { maxWidth: "860px", margin: "0 auto", padding: "32px 24px" },

  back: {
    display:       "inline-flex",
    alignItems:    "center",
    fontSize:      "14px",
    color:         "var(--accent)",
    textDecoration:"none",
    marginBottom:  "28px",
    fontWeight:    500,
  },

  // Loading
  centered: { display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0", gap: "16px" },
  spinner: {
    width: "32px", height: "32px",
    border: "3px solid var(--border)",
    borderTop: "3px solid var(--accent)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  spinnerText: { fontSize: "14px", color: "var(--text)", margin: 0 },

  // Error
  errorCard: {
    display: "flex", alignItems: "flex-start", gap: "14px",
    padding: "16px 20px", borderRadius: "10px",
    border: "1px solid var(--accent-border)",
    background: "var(--accent-bg)",
  },
  errorIcon:  { fontSize: "20px", color: "var(--accent)", flexShrink: 0 },
  errorTitle: { fontSize: "14px", fontWeight: 600, color: "var(--accent)", marginBottom: "4px" },
  errorMsg:   { fontSize: "13px", color: "var(--text)" },

  // Page header
  pageHeader: {
    display: "flex", alignItems: "center", gap: "18px", marginBottom: "32px",
  },
  companyAvatar: {
    width: "56px", height: "56px", borderRadius: "12px",
    background: "var(--accent-bg)", color: "var(--accent)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "24px", fontWeight: 700, flexShrink: 0,
  },
  companyName: { fontSize: "26px", fontWeight: 700, color: "var(--text-h)", margin: "0 0 4px" },
  companyMeta: { fontSize: "14px", color: "var(--text)", margin: 0 },

  // Empty
  emptyState: {
    padding: "48px 0", textAlign: "center",
    fontSize: "15px", color: "var(--text)",
  },

  // Experience list
  expList: { display: "flex", flexDirection: "column", gap: "12px" },

  expCard: {
    border: "1px solid var(--border)", borderRadius: "12px",
    background: "var(--code-bg)", overflow: "hidden",
  },
  expHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px", cursor: "pointer", userSelect: "none",
    gap: "12px",
  },
  expMeta:    { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  expYear:    { fontSize: "15px", fontWeight: 700, color: "var(--text-h)" },
  expRole:    { fontSize: "13px", color: "var(--text)" },
  pillRow:    { display: "flex", gap: "6px" },
  expRight:   { display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 },
  expSummary: { fontSize: "12px", color: "var(--text)" },
  chevron:    { fontSize: "10px", color: "var(--text)" },

  pill: { fontSize: "11px", fontWeight: 500, padding: "3px 9px", borderRadius: "20px" },

  expBody: {
    borderTop: "1px solid var(--border)",
    padding: "16px 20px",
    display: "flex", flexDirection: "column", gap: "10px",
    background: "var(--bg)",
  },
  noContent: { fontSize: "13px", color: "var(--text)", margin: 0, padding: "8px 0" },

  // Round
  roundBox:    { border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" },
  roundHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px", width: "100%",
    background: "var(--code-bg)", border: "none",
    cursor: "pointer", textAlign: "left", font: "inherit",
  },
  roundLeft:  { display: "flex", alignItems: "center", gap: "10px" },
  roundBadge: { fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px" },
  roundCount: { fontSize: "12px", color: "var(--text)" },

  // Questions
  qList: {
    margin: 0, padding: "0",
    listStyle: "none",
    background: "var(--bg)",
    borderTop: "1px solid var(--border)",
  },
  qItem: {
    display: "flex", alignItems: "flex-start", gap: "12px",
    padding: "11px 16px",
    borderBottom: "1px solid var(--border)",
    lineHeight: 1.6,
  },
  qBullet: {
    fontSize: "11px", fontWeight: 600,
    color: "var(--accent)",
    background: "var(--accent-bg)",
    borderRadius: "4px",
    padding: "1px 6px",
    flexShrink: 0,
    marginTop: "2px",
  },
  qText: { fontSize: "14px", color: "var(--text-h)" },
};

// Spinner keyframes
if (typeof document !== "undefined" && !document.getElementById("__cv_spin")) {
  const st   = document.createElement("style");
  st.id      = "__cv_spin";
  st.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(st);
}