import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getGoogleUser, logout } from "../../../services/authUtils"; // Mantém para consistência, embora usuário externo possa não ter login completo
import "./../headers/header_nav.css"; // Reutiliza o CSS geral da navegação

const HeaderExterno = () => {
  const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    // Função para carregar os dados do usuário do Google a partir dos cookies
    const loadUserData = useCallback(() => {
        setUserData(getGoogleUser());
    }, []);

    useEffect(() => {
        loadUserData();

        const handleAuthChange = () => {
            console.log("Evento 'authChange' detectado. Recarregando dados do usuário.");
            loadUserData();
        };

        window.addEventListener("authChange", handleAuthChange);

        return () => {
            window.removeEventListener("authChange", handleAuthChange);
        };
    }, [loadUserData]);

    // Função para lidar com o logout do usuário
    const handleLogout = () => {
        logout(); // Chama a função centralizada em authUtils.js para limpar os cookies
        setUserData(null);
        // Limpa a role temporária do localStorage para o próximo login ou acesso.
        localStorage.removeItem('tempUserRole');
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
                            <Link to="/externo/nova-solicitacao" className="nav-link-item">Nova Solicitação</Link>
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
                        <>
                            {/* Conteúdo opcional para usuário não logado, se necessário */}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default HeaderExterno;