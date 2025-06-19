import axios from "axios";
import { getAuthToken } from "./authUtils"; // Importando a função para obter o token do cookie

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  headers: {}, // Inicialmente vazio, será preenchido pelo interceptor
});

// Interceptor de resposta - Trata erros de autenticação
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      console.error("Token inválido ou expirado!");
      // Importando a função de logout para remover os cookies de autenticação
      const { logout } = await import("./authUtils");
      logout(); // Remove os cookies de autenticação
      window.location.href = "/"; // Redireciona para login
    }
    return Promise.reject(error);
  }
);

// Interceptor de requisição - Adiciona o token de autenticação do cookie
axiosInstance.interceptors.request.use(config => {
  const token = getAuthToken(); // Obtém o token do cookie
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
