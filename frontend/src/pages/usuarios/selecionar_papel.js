import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";

import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

export default function SelecionarPapelUsuario() {
    const navigate = useNavigate();

    const handleSelect = (papel) => {
        navigate(`/usuarios/cadastro/${papel}`);
    };

    return (
        <div>
        <Header />
        <main className="container escolha-papel">
            <h2>Selecione o tipo de usuário para realizar cadastro:</h2>
            <div className="botoes-papeis">
                    <button onClick={() => handleSelect("aluno")} className="btn-discreto">
                        Aluno
                    </button>
                    <button onClick={() => handleSelect("coordenador")} className="btn-discreto">
                        Coordenador
                    </button>
                    <button onClick={() => handleSelect("cre")} className="btn-discreto">
                        CRE
                    </button>
                </div>

            <BotaoVoltar onClick={() => navigate("/")} />

        </main>
        <Footer />
        </div>      
    );
}


        