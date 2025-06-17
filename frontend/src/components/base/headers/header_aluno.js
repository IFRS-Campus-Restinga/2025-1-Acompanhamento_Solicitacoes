import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getGoogleUser, logout } from "../../../services/authUtils";
import "./../headers/header_nav.css";

const HeaderAluno = (//{onLogout}
) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

   // Função para carregar os dados do usuário do Google a partir dos cookies
    const loadUserData = useCallback(() => {
        setUserData(getGoogleUser());
    }, []);

    useEffect(() => {
        // Carrega os dados do usuário assim que o componente é montado
        loadUserData();

        // Esta função será chamada quando o evento 'authChange' for disparado
        // (por exemplo, após um login ou logout em outra aba/componente)
        const handleAuthChange = () => {
            console.log("Evento 'authChange' detectado. Recarregando dados do usuário.");
            loadUserData(); // Recarrega os dados para refletir a mudança
        };

        // Adiciona um ouvinte para o evento 'authChange'
        // Este evento deve ser disparado em logout ou onde o usuário é logado/autenticado
        window.addEventListener("authChange", handleAuthChange);

        // Limpa o ouvinte de evento quando o componente é desmontado
        return () => {
            window.removeEventListener("authChange", handleAuthChange);
        };
    }, [loadUserData]); // `loadUserData` é uma dependência do `useEffect`

 // Função para lidar com o logout do usuário
    const handleLogout = () => {
        logout(); // Chama a função centralizada em authUtils.js para limpar os cookies
        setUserData(null);
        navigate("/"); // Redireciona o usuário para a página inicial/de login
    };


  return (
        <header className="header">
            <div className="header-container">
                <div className="left">
                    <img src="/img/logo-ifrs-branco.png" alt="logotipo do ifrs campus restinga" className="logo" />
                </div>

                <nav className="center">
                    <ul className="nav-links">
                        <li>
                            <Link to="/aluno/nova-solicitacao">Nova Solicitação</Link>
                        </li>
                        <li>
                            <Link to="/aluno/minhas-solicitacoes">Minhas Solicitações</Link>
                        </li>
                    </ul>
                </nav>

                <div className="right user-info">
                    {userData ? (
                        <>
                            <p className="mensagem-usuario">Bem-vindo, {userData.name}</p>
                            <img
                                src={userData.picture} // URL da foto do Google
                                alt={userData.name} // Nome do usuário como alt text
                                className="profile-pic"
                            />
                            {/* Botão de Logout */}
                            <button onClick={handleLogout} title="Sair" style={{ marginLeft: "10px", background: "none", border: "none", cursor: "pointer" }}>
                                <i className="bi bi-box-arrow-right icone" style={{ fontSize: "1.5rem", color: "white" }}></i>
                            </button>
                            <Link to="/perfil" className="perfil-link" style={{ marginLeft: "5px", background: "none", border: "none", cursor: "pointer" }}>
                                <i className="bi bi-gear-fill icone" title="Meu Perfil" style={{ fontSize: "1.1rem", color: "white" }}></i>
                            </Link>
                        </>
                    ) : (
                        // Se não houver dados do usuário, mostra a mensagem de boas-vindas genérica
                        // O redirecionamento para a página de login geralmente ocorre em um nível superior
                        <>
                            <p className="mensagem-usuario">Bem-vindo</p>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default HeaderAluno;

