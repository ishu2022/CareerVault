// src/utils/notificationUtils.js

const BASE = "/api/v1";

export async function createNotification(userId, title, message, type = "general") {
  if (!userId) return;
  try {
    const res = await fetch(`${BASE}/notifications`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId, title, message, type }),
    });
    if (!res.ok) {
      const data = await res.json();
      console.warn("[createNotification] API error:", data.error);
    }
  } catch (err) {
    console.error("[createNotification] network error:", err);
  }
}

export const notifyFirstLogin = (userId) =>
  createNotification(
    userId,
    "Welcome to CareerVault! 🎉",
    "You've successfully logged in. Start exploring interview experiences.",
    "first_login"
  );

export const notifyExperienceSubmitted = (userId, company) =>
  createNotification(
    userId,
    "Experience submitted!",
    `Your interview experience for ${company} has been shared with the community.`,
    "experience_submitted"
  );

export const notifyExperienceDeleted = (userId, company) =>
  createNotification(
    userId,
    "Experience deleted",
    `Your interview experience for ${company} has been removed.`,
    "experience_deleted"
  );

export const notifyCompanyAdded = (userId, company) =>
  createNotification(
    userId,
    "New company added",
    `${company} is now available on CareerVault.`,
    "company_added"
  );