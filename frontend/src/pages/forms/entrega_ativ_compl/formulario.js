import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import Options from "../../../components/options";
import Feedback from "../../../components/pop_ups/popup_feedback";
import { useNavigate } from "react-router-dom";
import "../../../components/formulario.css";
import IgnoreFields from "../../../components/ignoreFields";

export default function Formulario() {
    const [popularCursos, setPopularCursos] = useState([]);
    const [popularDisciplinas, setPopularDisciplinas] = useState([]);
    const [popularAlunos, setPopularAlunos] = useState([]);
    const [dados, setDados] = useState({});
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [msgErro, setMsgErro] = useState([]);
    const [popupType, setPopupType] = useState([]);

    // Novos estados para os campos do aluno
    const [nomeAluno, setNomeAluno] = useState("");
    const [emailAluno, setEmailAluno] = useState("");
    const [matriculaAluno, setMatriculaAluno] = useState("");

    const urls = useMemo(() => [
        "http://localhost:8000/solicitacoes/form_ativ_compl/",
    ], []);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/cursos/")
            .then((response) => setPopularCursos(response.data))
            .catch((err) => {
                setMsgErro(err);
                setPopupType("error");
                setPopupIsOpen(true);
            });
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

    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/disciplinas/")
            .then((response) => setPopularDisciplinas(response.data))
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

            // Assumindo que a API retorna algo como:
            // { id: 1, matricula: '12345', usuario: { nome: 'Nome do Aluno', email: 'email@example.com' } }

            setNomeAluno(alunoDetails.usuario.nome);
            setEmailAluno(alunoDetails.usuario.email);
            setMatriculaAluno(alunoDetails.matricula);

            // Atualiza o estado 'dados' com as informações do aluno
            setDados(prevDados => ({
                ...prevDados,
                nome_aluno: alunoDetails.usuario.nome, // Use os names corretos dos seus campos
                email_aluno: alunoDetails.usuario.email,
                matricula_aluno: alunoDetails.matricula,
                aluno: alunoId // Mantém o ID do aluno selecionado
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

    const postAtivCompl = async (e) => {
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
                } else if (key === "disciplinas") {
                    if (Array.isArray(value)) {
                        value.forEach((disciplina) => formData.append("disciplinas", disciplina));
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
                "http://localhost:8000/solicitacoes/form_ativ_compl/",
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

    return (
        <div>
            <Header />
            <main className="container">
                <h2>Formulário de Entrega de Atividades Complementares</h2>
                <div className="descricao-formulario">
                    <p>Neste formulário, o estudante poderá entregar os comprovantes das atividades complementares obrigatórias do seu curso.</p>
                    <p>A análise da documentação e da carga horária é feita pela coordenação de curso. </p>
                    <p>QUEM: Estudantes dos cursos que possuem Atividades Complementares como parte da organização curricular.</p>
                    <p>QUANDO: A qualquer tempo, exceto para alunos concluintes, que deverão verificar a data limite para entrega no calendário acadêmico.</p>
                    <p>Após entrega do formulário, a coordenação de curso fará a análise da solicitação em até 15 (quinze) dias e a CRE tem até 15 (quinze) dias para inserir os resultados no sistema. Este prazo pode ser estendido conforme as demandas da coordenação de curso e/ou do setor. O resultado pode ser conferido no sistema acadêmico.</p>
                </div>

                <form className="formulario formulario-largo" onSubmit={postAtivCompl}>
                    {/* Campos para exibir nome, email e matrícula do aluno */}
                    <div className="form-group">
                        <label htmlFor="nome_aluno">Nome do Aluno:</label>
                        <input type="text" id="nome_aluno" value={nomeAluno} readOnly />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email_aluno">Email do Aluno:</label>
                        <input type="email" id="email_aluno" value={emailAluno} readOnly />
                    </div>
                    <div className="form-group">
                        <label htmlFor="matricula_aluno">Matrícula do Aluno:</label>
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
                            curso: {
                                data: popularCursos,
                                labelKey: "nome"
                            },
                            disciplinas: {
                                data: popularDisciplinas,
                                labelKey: "nome"
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
            <Footer />
        </div>
    );
}