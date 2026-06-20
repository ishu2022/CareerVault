import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

export const getCompanies = async () => {
  const response = await axios.get(`${API_BASE_URL}/companies`);
  return response.data;
};

export const getStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/stats`);
  return response.data;
};

// ADD THIS
export const getCompany = async (companyName) => {
  const response = await axios.get(
    `${API_BASE_URL}/companies/${encodeURIComponent(companyName)}`
  );

  return response.data;
};