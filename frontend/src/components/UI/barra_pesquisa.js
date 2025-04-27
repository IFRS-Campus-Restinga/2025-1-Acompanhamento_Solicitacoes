import React from "react";
import "./barra_pesquisa.css";

export default function BotaoCadastrar({ value, onChange}) {
  return (

<div className="barra-pesquisa">
          <i className="bi bi-search icone-pesquisa"></i>
          <input
            type="text"
            placeholder="Buscar..."
            value={onChange}            
            className="input-pesquisa"
          />
        </div>
  );
}