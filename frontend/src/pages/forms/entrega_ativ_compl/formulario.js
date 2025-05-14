import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import Options from "../../../components/options";
import Feedback from "../../../components/pop_ups/popup_feedback"
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

        navigate("/solicitacoes");
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

                        <Options
                            url={urls}
                            popularCampo={{
                                aluno: {
                                    data: popularAlunos,
                                    labelKey: "id"
                                },
                                curso: {
                                    data: popularCursos,
                                    labelKey: "nome"
                                },
                                disciplina: {
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
