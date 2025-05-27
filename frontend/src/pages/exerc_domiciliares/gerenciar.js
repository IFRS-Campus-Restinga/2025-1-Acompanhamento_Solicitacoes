import HeaderAluno from "../../components/base/headers/header_aluno";
import Footer from "../../components/base/footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import BuscaUsuario from "../../components/busca_usuario";

export default function GerenciarExercDomicilares() {
    const [msgErro, setMsgErro] = useState("");
    const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);
    const [tipoErro, setTipoErro] = useState("");
    const [alunos, setAlunos] = useState([]);

    const [userData, setUserData] = useState(null);
    const [carregando, setCarregando] = useState(true);

    const navigate = useNavigate();

    const handleUsuario = (data) => {
        setUserData(data);
        setCarregando(false);
    };

    useEffect(() => {
        if (!carregando && userData === null) {
            const timeout = setTimeout(() => {
                navigate("/");
            }, 0);

            return () => clearTimeout(timeout);
        }
    }, [carregando, userData, navigate]);


    if (carregando) {
        return (
            <>
                <BuscaUsuario dadosUsuario={handleUsuario} />
                <p>Carregando usuário...</p>
            </>
        );
    }

    if (userData) {
        return (
            <div className="page-container">
                <HeaderAluno onLogout={() => setUserData(null)} />
                <h2>Dados da solicitação</h2>
                <main className="container">
                    <label>Nome do aluno: {userData.name}</label>
                    <label>Email: {userData.email}</label>

                    {feedbackIsOpen && (
                        <PopupFeedback
                            mensagem={msgErro.response?.detail}
                            tipo={tipoErro}
                            onClose={() => setFeedbackIsOpen(false)}
                        />
                    )}
                </main>
                <Footer />
            </div>
        );
    }

    return null;
}
