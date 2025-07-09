import React from "react";
import { useNavigate } from "react-router-dom";

export default function Erro403() {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h1 className="display-4 text-danger">403 - Acesso Negado</h1>
      <p className="lead">Você não tem permissão para acessar esta página.</p>
      <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
        Voltar para a página inicial
      </button>
    </div>
  );
}
