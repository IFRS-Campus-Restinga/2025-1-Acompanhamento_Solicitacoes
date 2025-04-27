import React from "react";
import { Link } from "react-router-dom";
import "./botao_cadastrar.css";

export default function BotaoCadastrar({ to, title = "Criar Novo Motivo"}) {
  return (

<div className="botao-cadastrar-wrapper">
          <Link to="/motivo_exercicios/cadastrar" className="botao-link" title={title}>
            <button className="botao-cadastrar">
              <i className="bi bi-plus-circle-fill"></i>
            </button>
          </Link>
        </div>

    );
}