import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState("Microsoft");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Bookmarks now store full question objects, not just IDs
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem("careervault_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("careervault_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // questionObj = { company, question, round_type }
  const toggleBookmark = (questionObj) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.question === questionObj.question);
      if (exists) {
        return prev.filter((b) => b.question !== questionObj.question);
      }
      return [...prev, questionObj];
    });
  };

  const isBookmarked = (questionText) =>
    bookmarks.some((b) => b.question === questionText);

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

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};