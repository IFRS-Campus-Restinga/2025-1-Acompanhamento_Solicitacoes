import { useNavigate } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/headers/header";

import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

export default function SelecionarGrupoUsuario() {
    const navigate = useNavigate();

    const handleSelect = (grupo) => {
        navigate(`/usuarios/cadastro/${grupo}`);
    };

    return (
        <div>
        <Header />
        <main className="container escolha-grupo">
            <h2>Selecione o tipo de usuário para realizar cadastro:</h2>
            <div className="botoes-grupos">
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


        