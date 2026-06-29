// src/utils/searchUtils.js
//
// Reusable global search logic for the Navbar search bar.
// - Fetches the company list once and caches it in memory.
// - Resolves a search query to either a company detail route
//   or a question-search route.
//
// No new backend endpoints are created. Existing endpoints reused:
//   GET /api/v1/companies
//   GET /api/v1/questions/search?q=
//
// If your Questions page reads a different query param name,
// change QUESTIONS_PARAM below — nothing else needs to change.

const QUESTIONS_PARAM = "q";

const API_BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:5000/api/v1";

let companiesCache = null; // resolved array of company names
let companiesFetchPromise = null; // in-flight promise (dedupes concurrent calls)
let lastFetchedAt = 0;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Extracts a flat array of company name strings from whatever shape
 * /api/v1/companies returns (array of strings, or array of objects
 * with a `name` field).
 */
function normalizeCompaniesResponse(data) {
  if (!Array.isArray(data)) {
    // Some APIs wrap the list, e.g. { companies: [...] }
    if (data && Array.isArray(data.companies)) {
      data = data.companies;
    } else {
      return [];
    }
  }

  return data
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        return item.name || item.company || item.company_name || null;
      }
      return null;
    })
    .filter(Boolean);
}

/**
 * Fetches the company list, using an in-memory cache to avoid
 * duplicate/repeated network calls. Safe to call from multiple
 * places (e.g. multiple Navbar instances) — concurrent calls
 * share the same in-flight request.
 */
export async function getCompanies({ forceRefresh = false } = {}) {
  const isCacheFresh =
    companiesCache !== null && Date.now() - lastFetchedAt < CACHE_TTL_MS;

  if (!forceRefresh && isCacheFresh) {
    return companiesCache;
  }

  if (companiesFetchPromise) {
    return companiesFetchPromise;
  }

  companiesFetchPromise = fetch(`${API_BASE_URL}/companies`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch companies (status ${res.status})`);
      }
      return res.json();
    })
    .then((data) => {
      const list = normalizeCompaniesResponse(data);
      companiesCache = list;
      lastFetchedAt = Date.now();
      return list;
    })
    .finally(() => {
      companiesFetchPromise = null;
    });

  return companiesFetchPromise;
}

/**
 * Case-insensitive exact match against the company list.
 * Returns the original (correctly-cased) company name if found,
 * otherwise null.
 */
function findExactCompanyMatch(query, companies) {
  const normalizedQuery = query.toLowerCase();
  return (
    companies.find((name) => name.toLowerCase() === normalizedQuery) || null
  );
}

/**
 * Resolves a raw search input into a navigation target.
 *
 * Returns an object:
 *   { path: string, matchedCompany: boolean }
 * or null if the query is empty/whitespace-only.
 *
 * Throws if the companies fetch fails — caller decides how to
 * handle (e.g. fall back to question search anyway).
 */
export async function resolveGlobalSearch(rawQuery) {
  const query = (rawQuery || "").trim();

  if (!query) {
    return null;
  }

  let companies = [];
  try {
    companies = await getCompanies();
  } catch (err) {
    // Re-throw so the caller can decide on fallback behavior,
    // but include the query so a fallback route can still be built.
    const error = new Error(
      `Could not verify company match: ${err.message}`
    );
    error.query = query;
    throw error;
  }

  const matchedCompany = findExactCompanyMatch(query, companies);

  if (matchedCompany) {
    return {
      path: `/companies/${encodeURIComponent(matchedCompany)}`,
      matchedCompany: true,
    };
  }

  return {
    path: `/questions?${QUESTIONS_PARAM}=${encodeURIComponent(query)}`,
    matchedCompany: false,
  };
}