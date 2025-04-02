import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

const navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Nova Solicitação</Link></li>
        <li><Link to="/solicitacoes">Minhas Solicitações</Link></li>
      </ul>
    </nav>
  );
};

export default navbar;
