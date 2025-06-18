import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../components/base/main";
import Login from "./login";

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
      <main className="container">
        <div className="login-box">
          <Login />
        </div>  
        </main>
    </div>
  );
};

export default Home;

