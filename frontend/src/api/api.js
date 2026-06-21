import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api/v1";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------- STATS ----------
export const getStats = async () => {
  const res = await apiClient.get("/stats");
  return res.data;
};

// ---------- COMPANIES ----------
export const getCompanies = async () => {
  const res = await apiClient.get("/companies");
  return res.data;
};

export const getCompany = async (name) => {
  const res = await apiClient.get(`/companies/${name}`);
  return res.data;
};

// ---------- QUESTIONS ----------
export const searchQuestions = async (keyword) => {
  const res = await apiClient.get("/questions", {
    params: { keyword },
  });
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

// ---------- CONTRIBUTE (no backend endpoint yet — placeholder) ----------
export const submitExperience = async (formData) => {
  const res = await apiClient.post("/experiences", formData);
  return res.data;
};