import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import IgnoreFields from "../../../components/ignoreFields";
import Options from "../../../components/options";
import Feedback from "../../../components/pop_ups/popup_feedback";
import { getAuthToken, getGoogleUser } from "../../../services/authUtils";

//CSS
import "../../../components/styles/formulario.css";

//import VerificadorDisponibilidade from "../../../pages/disponibilidade/VerificadorDisponibilidade";
//COLOCAR DEPOIS DE RETURN{/*<VerificadorDisponibilidade tipoFormulario="EXERCICIOSDOMICILIARES"> verifica se a solicitacao está disponivel*/}


export default function Formulario() {
    const [popularMotivosDispensa, setPopularMotivosDispensa] = useState([]);
    const [popularCursos, setPopularCursos] = useState([]);
    const [popularAlunos, setPopularAlunos] = useState([]);
    const [dados, setDados] = useState({});
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [msgErro, setMsgErro] = useState([]);
    const [popupType, setPopupType] = useState([]);

    // Novos estados para os campos do aluno
    const [nomeAluno, setNomeAluno] = useState("");
    const [emailAluno, setEmailAluno] = useState("");
    const [matriculaAluno, setMatriculaAluno] = useState("");

    const [carregando, setCarregando] = useState(true);
    const [userData, setUserData] = useState(null);

    const urls = useMemo(() => [
        "http://localhost:8000/solicitacoes/dispensa_ed_fisica/",
    ], []);

    const navigate = useNavigate();

    useEffect(() => {
        const handleUsuario = () => {
        setUserData(getGoogleUser());
        console.log(userData);
        setCarregando(false); // Indica que a busca inicial do usuário terminou
      };
      handleUsuario();
      }, [])

    useEffect(() => {
        if (!carregando && !userData) {
            navigate("/");
        }
    }, [carregando, userData, navigate]);

    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/motivo_dispensa/", {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`
            }
        })
            .then((response) => setPopularMotivosDispensa(response.data))
            .catch((err) => {
                setMsgErro(err);
                setPopupType("error");
                setPopupIsOpen(true);
            });
    }, []);

    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/cursos/")
            .then((response) => setPopularCursos(response.data))
            .catch((err) => {
                setMsgErro(err);
                setPopupType("error");
                setPopupIsOpen(true);
            })
    }, []);

    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/alunos/")
            .then((response) => setPopularAlunos(response.data))
            .catch((err) => {
                setMsgErro(err);
                setPopupType("error");
                setPopupIsOpen(true);
            });
    }, []);

    const handleFormChange = (dadosAtualizados) => {
        setDados(dadosAtualizados);
        // Se o ID do aluno mudou, busca os detalhes
        if (dadosAtualizados.aluno) {
            const alunoSelecionadoId = dadosAtualizados.aluno;
            fetchAlunoDetails(alunoSelecionadoId);
        } else {
            // Limpa os campos se nenhum aluno estiver selecionado
            setNomeAluno("");
            setEmailAluno("");
            setMatriculaAluno("");
        }
    };

    const fetchAlunoDetails = async (alunoId) => {
        try {
            const response = await axios.get(`http://localhost:8000/solicitacoes/alunos/${alunoId}/`);
            const alunoDetails = response.data;


            setNomeAluno(alunoDetails.usuario.nome);
            setEmailAluno(alunoDetails.usuario.email);
            setMatriculaAluno(alunoDetails.matricula);

            setDados(prevDados => ({
                ...prevDados,
                nome_aluno: alunoDetails.usuario.nome, 
                email_aluno: alunoDetails.usuario.email,
                matricula_aluno: alunoDetails.matricula,
                aluno: alunoId 
            }));
        } catch (err) {
            console.error("Erro ao buscar detalhes do aluno:", err);
            setMsgErro("Erro ao buscar detalhes do aluno.");
            setPopupType("error");
            setPopupIsOpen(true);
            // Limpa os campos em caso de erro
            setNomeAluno("");
            setEmailAluno("");
            setMatriculaAluno("");
        }
    };

    const postDispensaEdFisica = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            for (const [key, value] of Object.entries(dados)) {
                if (key === "anexos") {
                    if (Array.isArray(value)) {
                        value.forEach((file) => formData.append("anexos", file));
                    } else if (value instanceof File) {
                        formData.append("anexos", value);
                    }
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value);
                } else {
                    formData.append(key, ""); // evita campos vazios se forem required
                }
            }

            // Debug para ver o que está indo no FormData
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            await axios.post(
                "http://localhost:8000/solicitacoes/dispensa_ed_fisica/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            navigate("/todas-solicitacoes");
        } catch (err) {
            console.error("Erro no envio:", err.response?.data || err.message);
            setMsgErro(err.response?.data || err.message);
            setPopupType("error");
            setPopupIsOpen(true);
        }
    };

    if (carregando) {
            return (
                <>
                    <p>Carregando usuário...</p>
                </>
            );
        }

    if (userData) {
return (
        <div>
            <main className="container">
                <h2>Formulário de Dispensa de Educação Física</h2>
                <br></br>
                <h6 className="descricao-formulario">
                    Ao preencher este formulário, declaro que os documentos apresentados <strong>são verdadeiros</strong>,
                    e assumo a responsabilidade pelas informações aqui prestadas.
                </h6>

                <form className="formulario formulario-largura" onSubmit={postDispensaEdFisica}>
                    {/* Campos para exibir nome, email e matrícula do aluno */}
                    <div className="form-group">
                        <label htmlFor="email_aluno">E-mail:</label>
                        <input type="email" id="email_aluno" value={userData.email} readOnly />
                    </div>
                    <div className="form-group">
                        <label htmlFor="nome_aluno">Nome Completo:</label>
                        <input type="text" id="nome_aluno" value={userData.name} readOnly />
                    </div>
                    <div className="form-group">
                        <label htmlFor="matricula_aluno">Matrícula:</label>
                        <input type="text" id="matricula_aluno" value={matriculaAluno} readOnly />
                    </div>
                    <Options
                        url={urls}
                        popularCampo={{
                            aluno: {
                                data: popularAlunos,
                                labelKey: "id",
                                valueKey: "id", // Especifica a chave do ID
                                onChange: (event) => {
                                    const alunoId = event.target.value;
                                    handleFormChange({ ...dados, aluno: alunoId });
                                }
                            },
                            motivo_solicitacao: {
                                data: popularMotivosDispensa,
                                labelKey: "descricao"
                            }
                        }}
                        onChange={handleFormChange}
                        ignoreFields={IgnoreFields}
                    />
                    <button type="submit" className="submit-button">Enviar</button>
                </form>
            </main>
            <Feedback
                show={popupIsOpen}
                mensagem={msgErro?.response?.data?.detail || msgErro?.message || "Erro desconhecido!!!"}
                tipo={popupType}
                onClose={() => setPopupIsOpen(false)}
            />
        </div>
    );
    }
    
}
