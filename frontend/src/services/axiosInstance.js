import axios from "axios";

const token = localStorage.getItem("token");

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      console.error("Token inválido ou expirado!");
      localStorage.removeItem("token"); // Remove token inválido
      window.location.href = "/"; // Redireciona para login apenas se necessário
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export default axiosInstance;
