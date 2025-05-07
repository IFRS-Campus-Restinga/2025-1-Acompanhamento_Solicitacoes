// src/services/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", // ou sua URL de API real
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // se estiver usando cookies/sessões
});

export default axiosInstance;
