import client from "./client";

export const getStats = () =>
  client.get("/stats").then((r) => r.data);

export const getCompanies = () =>
  client.get("/companies").then((r) => r.data);

// GET /api/v1/companies/:name
// Returns: { company, experiences: [{ difficulty, outcome, role, year, rounds }] }
export const getCompany = (name) =>
  client.get(`/companies/${encodeURIComponent(name)}`).then((r) => r.data);