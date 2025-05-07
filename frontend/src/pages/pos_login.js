import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PosLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Iniciando login..."); // 🚀 Log antes de iniciar
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("Token recebido:", token); // Verifica se o token chegou

    if (token) {
      localStorage.setItem("token", token); // Armazena o token
      console.log("Token salvo no localStorage:", localStorage.getItem("token")); // Confirma que foi salvo
      window.location.href = "/perfil";
    } else {
      console.error("Token não recebido!");
      navigate("/", { replace: true }); // Redireciona para página inicial
    }
  }, [navigate]);

  return <p>Redirecionando...</p>;
}

export default PosLogin;
