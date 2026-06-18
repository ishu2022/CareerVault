import { useNavigate } from "react-router-dom";

export default function CompanyCard({ name }) {
  const navigate = useNavigate();
  const initial  = name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      style={s.card}
      onClick={() => navigate(`/companies/${encodeURIComponent(name)}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow   = "0 0 0 3px var(--accent-bg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow   = "none";
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) =>
        e.key === "Enter" && navigate(`/companies/${encodeURIComponent(name)}`)
      }
    >
      <div style={s.avatar}>{initial}</div>
      <div style={s.name}>{name}</div>
      <div style={s.arrow}>→</div>
    </div>
  );
}

const s = {
  card: {
    display:      "flex",
    alignItems:   "center",
    gap:          "14px",
    padding:      "16px 18px",
    background:   "var(--code-bg)",
    border:       "1px solid var(--border)",
    borderRadius: "10px",
    cursor:       "pointer",
    transition:   "border-color 0.15s, box-shadow 0.15s",
    userSelect:   "none",
  },
  avatar: {
    width:          "38px",
    height:         "38px",
    borderRadius:   "8px",
    background:     "var(--accent-bg)",
    color:          "var(--accent)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    fontWeight:     700,
    fontSize:       "15px",
    flexShrink:     0,
  },
  name: {
    flex:       1,
    fontSize:   "15px",
    fontWeight: 500,
    color:      "var(--text-h)",
  },
  arrow: {
    fontSize:   "16px",
    color:      "var(--text)",
    flexShrink: 0,
  },
};