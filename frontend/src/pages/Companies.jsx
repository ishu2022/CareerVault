import { useState, useMemo }  from "react";
import { useEffect }          from "react";
import { getCompanies }       from "../api/services";
import CompanyCard            from "../components/CompanyCard";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [query,     setQuery]     = useState("");

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .catch((e) => setError(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, []);

  // Client-side filter — no extra API call
  const filtered = useMemo(
    () =>
      companies.filter((name) =>
        name.toLowerCase().includes(query.toLowerCase())
      ),
    [companies, query]
  );

  return (
    <div style={s.page}>
      {/* Header */}
      <h1 style={s.title}>Companies</h1>
      <p style={s.sub}>
        {companies.length > 0
          ? `${filtered.length} of ${companies.length} companies`
          : "Browse all companies"}
      </p>

      {/* Search */}
      <div style={s.searchWrap}>
        <input
          style={s.input}
          type="text"
          placeholder="Search companies…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button style={s.clear} onClick={() => setQuery("")}>
            ✕
          </button>
        )}
      </div>

      {/* States */}
      {loading && <p style={s.state}>Loading companies…</p>}

      {error && (
        <div style={s.error}>
          <strong>Could not load companies</strong> — {error}
        </div>
      )}

      {/* Empty search result */}
      {!loading && !error && filtered.length === 0 && query && (
        <p style={s.state}>No companies match "{query}"</p>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div style={s.grid}>
          {filtered.map((name) => (
            <CompanyCard key={name} name={name} />
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page:  { maxWidth: "860px", margin: "0 auto", padding: "40px 24px" },
  title: { fontSize: "24px", fontWeight: 700, color: "var(--text-h)", margin: "0 0 6px" },
  sub:   { fontSize: "14px", color: "var(--text)", margin: "0 0 24px" },

  searchWrap: {
    position:     "relative",
    marginBottom: "28px",
  },
  input: {
    width:        "100%",
    padding:      "10px 40px 10px 14px",
    fontSize:     "14px",
    color:        "var(--text-h)",
    background:   "var(--code-bg)",
    border:       "1px solid var(--border)",
    borderRadius: "8px",
    outline:      "none",
    boxSizing:    "border-box",
    font:         "inherit",
  },
  clear: {
    position:   "absolute",
    right:      "12px",
    top:        "50%",
    transform:  "translateY(-50%)",
    background: "none",
    border:     "none",
    cursor:     "pointer",
    fontSize:   "13px",
    color:      "var(--text)",
    padding:    0,
  },

  state: { color: "var(--text)", textAlign: "center", padding: "48px 0" },
  error: {
    padding:      "12px 16px",
    borderRadius: "8px",
    border:       "1px solid var(--accent-border)",
    background:   "var(--accent-bg)",
    color:        "var(--accent)",
    fontSize:     "14px",
    marginBottom: "24px",
  },

  grid: {
    display:             "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap:                 "12px",
  },
};