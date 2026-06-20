export const topicMeta = {
  DSA:  { color: "orange", bg: "bg-orange-50", text: "text-orange-500" },
  DBMS: { color: "indigo", bg: "bg-indigo-50", text: "text-indigo-500" },
  OS:   { color: "blue",   bg: "bg-blue-50",   text: "text-blue-500" },
  OOP:  { color: "green",  bg: "bg-green-50",  text: "text-green-500" },
  HR:   { color: "pink",   bg: "bg-pink-50",   text: "text-pink-500" },
  React:{ color: "sky",    bg: "bg-sky-50",    text: "text-sky-500" },
};

export const topicsByCompany = {
  Microsoft: [
    { label: "DSA", percentage: 45 },
    { label: "DBMS", percentage: 20 },
    { label: "OS", percentage: 15 },
    { label: "OOP", percentage: 10 },
    { label: "HR", percentage: 10 },
  ],
  Amazon: [
    { label: "DSA", percentage: 50 },
    { label: "System Design", percentage: 20 },
    { label: "OOP", percentage: 15 },
    { label: "HR", percentage: 15 },
  ],
  Google: [
    { label: "DSA", percentage: 55 },
    { label: "System Design", percentage: 25 },
    { label: "HR", percentage: 20 },
  ],
  Oracle: [
    { label: "DBMS", percentage: 35 },
    { label: "DSA", percentage: 30 },
    { label: "OS", percentage: 20 },
    { label: "HR", percentage: 15 },
  ],
};

export const getTopicsForCompany = (companyName) =>
  topicsByCompany[companyName] || topicsByCompany.Microsoft;