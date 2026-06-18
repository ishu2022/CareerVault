import axios from "axios";

const client = axios.create({
  baseURL: "http://127.0.0.1:5000/api/v1",
  timeout: 10000,
});

export default client;