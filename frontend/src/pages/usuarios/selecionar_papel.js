import React from "react";
import { useNavigate } from "react-router-dom";

export default function SelecionarPapelUsuario() {
    const navigate = useNavigate();

    const handleSelect = (papel) => {
        navigate(`/usuarios/cadastro/${papel}`);
    };

    return (
        <div className="container escolha-papel">
            <h2>Escolha o papel de cadastro:</h2>
            <button onClick={() => handleSelect("aluno")} className="btn">Aluno</button>
            <button onClick={() => handleSelect("coordenador")} className="btn">Coordenador</button>
            <button onClick={() => handleSelect("cre")} className="btn">CRE</button>
        </div>
    );
}
