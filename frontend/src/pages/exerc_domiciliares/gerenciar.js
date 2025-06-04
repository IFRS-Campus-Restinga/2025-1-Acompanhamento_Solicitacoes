import HeaderAluno from "../../components/base/headers/header_aluno";
import Footer from "../../components/base/footer";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import BuscaUsuario from "../../components/busca_usuario";

export default function GerenciarExercDomicilares() {
    const [msgErro, setMsgErro] = useState("");
    const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);
    const [tipoErro, setTipoErro] = useState("");
    const [aluno, setAluno] = useState(null);
    const [alunoNaoEncontrado, setAlunoNaoEncontrado] = useState(false);

    const [userData, setUserData] = useState(null);
    const [carregando, setCarregando] = useState(true);

    const [formulario, setFormulario] = useState(null);

    const buscouAlunoRef = useRef(false);
    const navigate = useNavigate();

    const handleUsuario = (data) => {
        setUserData(data);
        setCarregando(false);
    };

    // Redireciona se não houver usuário
    useEffect(() => {
        if (!carregando && !userData) {
            navigate("/");
        }
    }, [carregando, userData, navigate]);

    // Busca aluno apenas quando userData.email estiver definido
    useEffect(() => {
        const buscarAluno = async () => {
                try {
                    const res = await axios.get(`http://localhost:8000/solicitacoes/usuarios/${userData.email}/`);
                        setAluno(res.data[0]);
                        console.log("Dados obtidos: ", res.data);
                } catch (err) {
                    
                        setAlunoNaoEncontrado(true);
                        setMsgErro(err.message || "Erro desconhecido");
                        setTipoErro("erro");
                        setFeedbackIsOpen(true);
                    }
                };

        if (userData?.email && !buscouAlunoRef.current) {
            buscouAlunoRef.current = true;
            buscarAluno();
        }
    }, [userData]);

    // Carregando usuário
    if (carregando) {
        return (
            <>
                <BuscaUsuario dadosUsuario={handleUsuario} />
                <p>Carregando usuário...</p>
            </>
        );
    }

    // Exibe dados do aluno
    if (userData && aluno) {
        /*useEffect(() => {
            try {
                const res = axios.get(`http://localhost:8000/solicitacoes/form_exercicio_domiciliar/aluno/${aluno.id}`)
                setFormulario(res.data);
            } catch (err) {
                setMsgErro(err);
                setTipoErro("erro");
                setFeedbackIsOpen(true);
            }
        })*/

        return (
            <div className="page-container">
                <HeaderAluno onLogout={() => setUserData(null)} />
                <main className="container detalhes-container">
                    <div className="detalhes-header">
                        <h2>Detalhes da Solicitação</h2>
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Nome do aluno:</label>
                            <p>{userData.name}</p>
                        </div>
                        <div className="info-item">
                            <label>Email:</label>
                            <p>{userData.email}</p>
                        </div>
                        <div className="info-item">
                            <label>CPF:</label>
                            <p>{aluno.cpf}</p>
                            {console.log(aluno.nome)}
                        </div>
                        <div className="info-item">
                            <label>Telefone:</label>
                            <p>{aluno.telefone}</p>
                        </div>
                        <div className="info-item">
                            <label>Data da solicitação: </label>
                            <p></p>
                        </div>
                    </div>

                    {feedbackIsOpen && (
                        <PopupFeedback
                            mensagem={msgErro}
                            tipo={tipoErro}
                            onClose={() => setFeedbackIsOpen(false)}
                        />
                    )}
                </main>
                <Footer />
            </div>
        );
    }

    // Aluno não encontrado
    if (userData && alunoNaoEncontrado) {
        return (
            <div className="page-container">
                <HeaderAluno onLogout={() => setUserData(null)} />
                <main className="container">
                    <h2>Aluno não encontrado no sistema.</h2>
                    <p>Verifique se o e-mail está corretamente vinculado a um aluno.</p>
                </main>
                <Footer />
            </div>
        );
    }

    return null;
}
