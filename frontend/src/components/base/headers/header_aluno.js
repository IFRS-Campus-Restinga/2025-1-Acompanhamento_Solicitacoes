import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./../headers/header_nav.css";

const HeaderAluno = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const storedUser = localStorage.getItem("googleUser");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erro ao parsear dados do usuário do localStorage:", error);
        localStorage.removeItem("googleUser"); 
        localStorage.removeItem("appToken");
      }
    }

    const handleStorageChange = (event) => {
      if (event.key === "googleUser") {
        if (event.newValue) {
          try {
            setUserData(JSON.parse(event.newValue));
          } catch (error) {
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("googleUser");
    localStorage.removeItem("appToken");
    // localStorage.removeItem("refreshToken"); // Se você usar refresh tokens
    setUserData(null);
    // TODO: Adicionar lógica para invalidar o token no backend, se aplicável
    navigate("/"); // Redireciona para a página de login
    // window.location.reload(); // Força um reload para limpar qualquer estado restante, se necessário
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="left">
          <Link to="/aluno/minhas-solicitacoes">
            <img
              src="/img/logo-ifrs-branco.png" 
              alt="logotipo do ifrs campus restinga"
              className="logo"
            />
          </Link>
        </div>

        <nav className="center">
          <ul className="nav-links">
            <li>
              <Link to="/aluno/nova-solicitacao">Nova Solicitação</Link>
            </li>
            <li>
              <Link to="/aluno/minhas-solicitacoes">Minhas Solicitações</Link>
            </li>
          </ul>
        </nav>

        <div className="right user-info">
          {userData ? (
            <>
              <p className="mensagem-usuario">Bem-vindo, {userData.name}</p>
              <img
                src={userData.picture} // URL da foto do Google
                alt={userData.name} // Nome do usuário como alt text
                className="profile-pic"
              />
              {/* Botão de Logout */}
              <button onClick={handleLogout} title="Sair" style={{ marginLeft: "10px", background: "none", border: "none", cursor: "pointer" }}>
                <i className="bi bi-box-arrow-right icone" style={{ fontSize: "1.5rem", color: "white" }}></i>
              </button>
              <Link to="/perfil" className="perfil-link" style={{ marginLeft: "5px"}}>
                <i className="bi bi-gear-fill icone" title="Meu Perfil"></i>
              </Link>
            </>
          ) : (
            // Se não houver dados do usuário, pode mostrar um link de login
            // ou manter a informação padrão se preferir que o redirecionamento cuide disso
            <>
              <p className="mensagem-usuario">Bem-vindo</p> 
              {/* <Link to="/login">Entrar</Link> */}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderAluno;

