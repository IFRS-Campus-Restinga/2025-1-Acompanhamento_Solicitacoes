import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";
import { getCookie } from "../../services/authUtils";

//CSS
import "../../components/styles/telas_opcoes.css";

export default function SelecionarGrupoUsuario() {
    const navigate = useNavigate();
    const location = useLocation();
    const [googleData, setGoogleData] = useState({
        name: "",
        email: ""
    });

    // Efeito para obter dados do Google do cookie quando o componente é montado
    useEffect(() => {
        try {
            
            const googleUserCookie = getCookie('googleUser');
            
            if (googleUserCookie) {
                // Parsear o cookie para obter os dados do usuário
                const googleUser = JSON.parse(googleUserCookie);
                console.log("Dados do usuário Google obtidos do cookie:", googleUser);
                
                if (googleUser) {
                    setGoogleData({
                        name: googleUser.name || "",
                        email: googleUser.email || ""
                    });
                }
            } else {
                console.log("Cookie 'googleUser' não encontrado");
                
                // Verificar também os parâmetros da URL
                const queryParams = new URLSearchParams(location.search);
                const googleName = queryParams.get("google_name");
                const googleEmail = queryParams.get("google_email");
                
                if (googleName || googleEmail) {
                    console.log("Dados do Google encontrados na URL:", { nome: googleName, email: googleEmail });
                    setGoogleData({
                        name: googleName || "",
                        email: googleEmail || ""
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao obter dados do Google:", error);
        }
    }, [location.search]);

    const handleSelect = (grupo) => {
        // Construir a URL com os parâmetros do Google
        const params = new URLSearchParams();
        if (googleData.name) params.append("google_name", googleData.name);
        if (googleData.email) params.append("google_email", googleData.email);
        
        // Navegar para a página de cadastro com os parâmetros
        navigate(`/usuarios/cadastro/${grupo}?${params.toString()}`);
    };

    return (
        <div>
            <main className="container escolha-grupo">
                <h2>Selecione o tipo de usuário para realizar cadastro:</h2>
                <div className="grid-opcoes">
                    <button onClick={() => handleSelect("aluno")} className="link_botao_escolha">
                        Aluno
                    </button>
                    <button onClick={() => handleSelect("coordenador")} className="link_botao_escolha">
                        Coordenador
                    </button>
                    <button onClick={() => handleSelect("cre")} className="link_botao_escolha">
                        CRE
                    </button>
                </div>

                <BotaoVoltar onClick={() => navigate("/")} />
            </main>
        </div>      
    );
}