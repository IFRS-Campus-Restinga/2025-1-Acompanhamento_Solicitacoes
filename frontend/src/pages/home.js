import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

//Components
import GoogleLoginButton from "../components/GoogleLoginButton";

//CSS
import "./login.css";

const Home = () => {
  const navigate = useNavigate();

  // Se o usuário já estiver logado (cookie ou localStorage), redireciona
  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      navigate("/nova_solicitacao");
    }
  }, [navigate]);

  const handleLogin = () => {
    // Redireciona para o login do backend (Google)
    window.location.href = "http://localhost:8000/auth/login";
  };

  return (
    <div className="login-page-content">
      <div className="login-box">
        <h2>Bem-vindo ao Sistema de Solicitações</h2>
        <p>Para continuar, entre com sua conta institucional do Google.</p>
        <GoogleLoginButton onClick={handleLogin} />
      </div>  
    </div>
  );
};

export default Home;

