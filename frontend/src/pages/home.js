import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./../components/base/footer";
import Header from "./../components/base/header";
import "./../components/base/main";
import "./login.css";
import GoogleLoginButton from "./../components/GoogleLoginButton";

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
    <div>
      <Header />
      <main className="container">
        <div className="login-box">
          <h2>Bem-vindo ao Sistema de Solicitações</h2>
          <p>Para continuar, entre com sua conta institucional do Google.</p>
          <GoogleLoginButton />
        </div>  
        </main>
      <Footer />
    </div>
  );
};

export default Home;

