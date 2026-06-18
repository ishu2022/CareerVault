// src/services/api.js
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  timeout: 10000,
});

// ── Overview / Stats ─────────────────────────────────────────────
export const getOverview = () =>
  client.get("/overview").then((r) => r.data);

// ── Companies ────────────────────────────────────────────────────
export const getCompanies = () =>
  client.get("/companies").then((r) => r.data);

export const getCompany = (name) =>
  client.get(`/companies/${encodeURIComponent(name)}`).then((r) => r.data);

// ── Questions ────────────────────────────────────────────────────
export const searchQuestions = (query, filters = {}) => {
  const params = { q: query, ...filters };
  return client.get("/questions/search", { params }).then((r) => r.data);
};