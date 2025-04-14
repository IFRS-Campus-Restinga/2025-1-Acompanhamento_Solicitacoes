import React from "react";
import { Link } from "react-router-dom";
import "./header_nav.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="left">
          <img src="/img/logo-ifrs-branco.png" alt="logotipo do ifrs campus restinga" className="logo"/>
        </div>

        <nav className="center">
          <ul className="nav-links">
            <li><Link to="/nova-solicitacao">Nova Solicitação</Link></li>
            <li><Link to="/solicitacoes">Minhas Solicitações</Link></li>
          </ul>
        </nav>

        <div className="right user-info">
          <p className="mensagem-usuario">Bem-vinde, Karolina Dean</p>
          <img src="img/profile-pic.jpg" alt="Perfil" className="profile-pic"/>
          <Link to="/settings" className="settings-link">
          <i className="bi bi-gear-fill icone" title="Configurações"></i>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
