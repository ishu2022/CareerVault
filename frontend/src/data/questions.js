// src/data/questions.js
export const questions = [
  {
    id: 1,
    company: "Microsoft",
    question: "Explain Virtual DOM in React.",
    topic: "React",
    difficulty: "Medium",
    year: 2025,
  },
  {
    id: 2,
    company: "Amazon",
    question: "Two Sum",
    topic: "DSA",
    difficulty: "Easy",
    year: 2025,
  },
  {
    id: 3,
    company: "Amazon",
    question: "LRU Cache",
    topic: "DSA",
    difficulty: "Hard",
    year: 2024,
  },
  {
    id: 4,
    company: "Google",
    question: "DFS vs BFS. When would you use each?",
    topic: "DSA",
    difficulty: "Medium",
    year: 2024,
  },
  {
    id: 5,
    company: "Oracle",
    question: "Difference between Process and Thread.",
    topic: "OS",
    difficulty: "Easy",
    year: 2024,
  },
  {
    id: 6,
    company: "Infosys",
    question: "What is Normalization? Explain 1NF, 2NF, 3NF.",
    topic: "DBMS",
    difficulty: "Easy",
    year: 2025,
  },
  {
    id: 7,
    company: "TCS",
    question: "Explain the concept of Encapsulation in OOP.",
    topic: "OOP",
    difficulty: "Easy",
    year: 2024,
  },
  {
    id: 8,
    company: "Microsoft",
    question: "Binary Tree Traversal",
    topic: "DSA",
    difficulty: "Medium",
    year: 2025,
  },
  {
    id: 9,
    company: "Microsoft",
    question: "Process vs Thread",
    topic: "OS",
    difficulty: "Easy",
    year: 2025,
  },
  {
    id: 10,
    company: "Microsoft",
    question: "SQL Joins",
    topic: "DBMS",
    difficulty: "Medium",
    year: 2025,
  },
  {
    id: 11,
    company: "Microsoft",
    question: "Encapsulation in OOP",
    topic: "OOP",
    difficulty: "Easy",
    year: 2025,
  },
];

export const getQuestionsByCompany = (companyName) =>
  questions.filter(
    (q) => q.company.toLowerCase() === companyName?.toLowerCase()
  );

export const getQuestionsByTopic = (topic) =>
  questions.filter((q) => q.topic.toLowerCase() === topic?.toLowerCase());

export const searchQuestions = (term) => {
  const lower = term.toLowerCase();
  return questions.filter(
    (q) =>
      q.question.toLowerCase().includes(lower) ||
      q.company.toLowerCase().includes(lower) ||
      q.topic.toLowerCase().includes(lower)
  );
};