import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Selected company — shared between Companies, CompanyDetail, OAPrep
  const [selectedCompany, setSelectedCompany] = useState("Microsoft");

  // Selected topic filter — used in Questions page
  const [selectedTopic, setSelectedTopic] = useState("All");

  // Global search query — used by Navbar search bar + Questions page
  const [searchQuery, setSearchQuery] = useState("");

  // Bookmarked question IDs — persisted to localStorage
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem("careervault_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("careervault_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (questionId) => {
    setBookmarks((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const isBookmarked = (questionId) => bookmarks.includes(questionId);

  const value = {
    selectedCompany,
    setSelectedCompany,
    selectedTopic,
    setSelectedTopic,
    searchQuery,
    setSearchQuery,
    bookmarks,
    toggleBookmark,
    isBookmarked,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook — pages call useAppContext() instead of importing useContext + AppContext everywhere
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};