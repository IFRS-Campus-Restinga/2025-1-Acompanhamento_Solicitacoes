import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../components/base/main";
import GoogleLoginButton from "./../components/GoogleLoginButton";
import "./login.css";

const Login = () => {
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
    <div>
      <main className="container">
        <div className="login-box">
          <h2>Bem-vindo ao Sistema de Solicitações</h2>
          <p>Para continuar, entre com sua conta institucional do Google.</p>
          <GoogleLoginButton />
        </div>  
        </main>
    </div>
  );
};

export default Login;

