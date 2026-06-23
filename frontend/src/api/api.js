import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api/v1";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Normalizes list responses whether the backend returns a bare array
// or an envelope like { data: [...] } / { results: [...] } / { items: [...] }.
const unwrapList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

// ---------- STATS ----------
export const getStats = async () => {
  const res = await apiClient.get("/stats");
  return res.data;
};

// ---------- COMPANIES ----------
export const getCompanies = async () => {
  const res = await apiClient.get("/companies");
  return unwrapList(res.data);
};

export const getCompany = async (name) => {
  const res = await apiClient.get(`/companies/${name}`);
  return res.data;
};

// Top companies for the dashboard, ranked by interview volume.
// Assumes each company object from GET /companies carries some form of
// interview count (total_interviews / interview_count / interviewCount).
// Adjust the field names below to match whatever MongoEngine document
// actually returns.
export const getTopCompanies = async (limit = 5) => {
  const companies = await getCompanies();
  return companies
    .map((c) => ({
      name: c.name,
      slug: c.slug ?? c.name,
      interviews: c.total_interviews ?? c.interview_count ?? c.interviewCount ?? 0,
    }))
    .sort((a, b) => b.interviews - a.interviews)
    .slice(0, limit);
};

// ---------- QUESTIONS ----------
export const searchQuestions = async (keyword) => {
  const res = await apiClient.get("/questions", {
    params: { keyword },
  });
  return res.data;
};

// ---------- EXPERIENCES / CONTRIBUTIONS ----------
// ASSUMED ROUTE: GET /experiences?limit=&sort=-created_at
// Confirm the route name + sort param with the Flask side once a list
// endpoint exists; this currently mirrors the POST /experiences route
// that submitExperience already uses.
export const getRecentExperiences = async (limit = 4) => {
  const res = await apiClient.get("/experiences", {
    params: { limit, sort: "-created_at" },
  });
  return unwrapList(res.data);
};

export const submitExperience = async (formData) => {
  const res = await apiClient.post("/experiences", formData);
  return res.data;
};

// ---------- TOPICS ----------
// ASSUMED ROUTE: GET /topics, returning [{ name, question_count }, ...]
export const getTopics = async (limit = 10) => {
  const res = await apiClient.get("/topics", { params: { limit } });
  return unwrapList(res.data);
};

// ---------- INTERVIEW TREND ----------
// ASSUMED ROUTE: GET /stats/trend, returning
// [{ label: "Dec '24", value: 70 }, ...]. If this route doesn't exist yet
// on the Flask side, this call will reject and the Dashboard hides the
// trend chart card rather than crashing the page.
export const getInterviewTrend = async () => {
  const res = await apiClient.get("/stats/trend");
  return res.data;
};

// ---------- BOOKMARKS (no backend endpoint yet — localStorage based) ----------
export const getBookmarks = () => {
  const saved = localStorage.getItem("careervault_bookmarks");
  return saved ? JSON.parse(saved) : [];
};

export const addBookmark = (questionId) => {
  const current = getBookmarks();
  if (!current.includes(questionId)) {
    const updated = [...current, questionId];
    localStorage.setItem("careervault_bookmarks", JSON.stringify(updated));
    return updated;
  }
  return current;
};

export const removeBookmark = (questionId) => {
  const current = getBookmarks();
  const updated = current.filter((id) => id !== questionId);
  localStorage.setItem("careervault_bookmarks", JSON.stringify(updated));
  return updated;
};