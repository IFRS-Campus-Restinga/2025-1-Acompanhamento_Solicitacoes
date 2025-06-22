import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getGoogleUser, logout } from "../../../services/authUtils"; // Mantém para consistência, embora usuário externo possa não ter login completo
import "./../headers/header_nav.css"; // Reutiliza o CSS geral da navegação

const HeaderExterno = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // A lógica de autenticação pode ser simplificada para usuário externo,
  // mas é bom manter a estrutura caso haja login simplificado ou logout para eles.
  const loadUserData = useCallback(() => {
    // Para usuário externo, talvez não haja userData real, ou seja apenas um identificador temporário.
    // Ajuste 'getGoogleUser()' conforme a sua lógica de autenticação para usuários externos.
    setUserData(getGoogleUser()); 
  }, []);

  useEffect(() => {
    loadUserData();
    const handleAuthChange = () => {
      console.log("Evento 'authChange' detectado para usuário externo. Recarregando dados.");
      loadUserData();
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, [loadUserData]);

  // Função de logout, caso o usuário externo tenha alguma forma de sessão
  const handleLogout = () => {
    logout(); 
    setUserData(null);
    navigate("/"); 
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="left">
          {/* Logo permanece na extrema esquerda */}
          <img
            src="/img/logo-ifrs-branco.png"
            alt="logotipo do ifrs campus restinga"
            className="logo"
          />
        </div>

        <nav className="center">
          <ul className="nav-links">
            <li>
              {/* Botão único para o usuário externo */}
              <Link to="/externo/desistencia-vaga">
                Desistir da Vaga
              </Link>
            </li>
          </ul>
        </nav>

        <div className="right user-info">
          {/* A seção de informações do usuário (Bem-vindo, foto, logout)
              pode ser removida ou adaptada, dependendo se usuários externos
              terão algum tipo de autenticação ou perfil simplificado.
              Por enquanto, mantive a estrutura com base no seu código,
              assumindo que 'userData' pode ser nulo para este tipo de usuário. */}
          {userData ? (
            <>
              <p className="mensagem-usuario">Bem-vindo, {userData.name}</p>
              <img
                src={userData.picture} 
                alt={userData.name} 
                className="profile-pic"
              />
              <button
                onClick={handleLogout}
                title="Sair"
                style={{
                  marginLeft: "10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <i
                  className="bi bi-box-arrow-right icone"
                  style={{ fontSize: "1.5rem", color: "white" }}
                ></i>
              </button>
              <Link
                to="/perfil"
                className="perfil-link"
                style={{
                  marginLeft: "5px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <i
                  className="bi bi-gear-fill icone"
                  title="Meu Perfil"
                  style={{ fontSize: "1.1rem", color: "white" }}
                ></i>
              </Link>
            </>
          ) : (
            // Pode deixar vazio ou adicionar algo como "Faça Login" se aplicável
            <p className="mensagem-usuario">Usuário Externo</p> 
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderExterno;