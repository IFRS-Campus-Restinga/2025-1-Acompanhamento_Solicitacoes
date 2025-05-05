import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import Options from "../../../components/options";
import Feedback from "../../../components/pop_ups/popup_feedback"
import { useNavigate } from "react-router-dom";
import "../../../components/formulario.css";

export default function Formulario() {
    const [popularMotivosDispensa, setPopularMotivosDispensa] = useState([]);
    const [popularCursos, setPopularCursos] = useState([]);
    const [dados, setDados] = useState({});
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [msgErro, setMsgErro] = useState([]);
    const [popupType, setPopupType] = useState([]);

    const urls = useMemo(() => [
        "http://localhost:8000/solicitacoes/dispensa_ed_fisica/",
        "http://localhost:8000/solicitacoes/anexos/"
    ], []);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/motivo_dispensa/")
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

    const handleFormChange = (dadosAtualizados) => {
        setDados(dadosAtualizados);
    };

    const postDispensaEdFisica = async (e) => {
        e.preventDefault();
        try {
            // Primeiro envia a solicitação de dispensa
            const responseDispensa = await axios.post(
                "http://localhost:8000/solicitacoes/dispensa_ed_fisica/",
                {
                    descricao: dados.descricao,
                    curso: dados.curso,
                    motivo_solicitacao: dados.motivo_solicitacao
                }
            );

            const formDispensaId = responseDispensa.data.id;

            // Agora envia os anexos, um a um
            if (dados.anexo instanceof FileList) {
                const promises = Array.from(dados.anexo).map((file) => {
                    const formData = new FormData();
                    formData.append("form_dispensa_ed_fisica", formDispensaId);
                    formData.append("anexo", file);

                    return axios.post(
                        "http://localhost:8000/solicitacoes/anexos/",
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        }
                    );
                });

                await Promise.all(promises); // Aguarda todos enviarem
            } else if (dados.anexo instanceof File) {
                const formData = new FormData();
                formData.append("form_dispensa_ed_fisica", formDispensaId);
                formData.append("anexo", dados.anexo);

                await axios.post(
                    "http://localhost:8000/solicitacoes/anexos/",
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            }

            navigate("/solicitacoes");

        } catch (err) {
            setMsgErro(err);
            setPopupType("error");
            setPopupIsOpen(true);
        }
    };



    return (
        <div>
            <Header />
            <main className="container">
                <h2>Formulário de Dispensa de Educação Física</h2>
                <div className="descricao-formulario">
                    <p>Este formulário é destinado aos estudantes que solicitam a dispensa da prática de Educação Física. Para solicitar a dispensa, é necessário preencher integralmente o formulário, apresentando toda documentação comprobatória.</p>

                    <p>De acordo com a LDB, Lei 9394/96, Art. 26 a Educação Física, integrada à proposta pedagógica da escola, é componente curricular obrigatório da educação básica, sendo sua prática facultativa ao aluno que se enquadrar em qualquer um dos pontos a seguir: </p>

                    <ul>
                        <li>Cumprir jornada de trabalho igual ou superior a seis horas;</li>
                        <li>Maior de trinta anos de idade;</li>
                        <li>Prestar serviço militar inicial ou que, em situação similar, estiver obrigado à prática da educação física;</li>
                        <li>Estar amparado pelo decreto-lei n°1.044, de 21 de outubro de 1969;</li>
                        <li>Ter prole.</li>
                    </ul>

                    <p>QUEM: Todos os cursos.</p>

                    <p>QUANDO: a qualquer momento dentro do período letivo.</p>

                    <p>Após entrega do formulário, a coordenação de curso fará a análise da solicitação em até 7 (sete) dias e a CRE tem até 5 (cinco) dias úteis para inserir os resultados no sistema. Este prazo pode ser estendido conforme as demandas da coordenação de curso e/ou do setor.</p>
                </div>

                <form className="formulario formulario-largo" onSubmit={postDispensaEdFisica}>

                        <Options
                            url={urls}
                            popularCampo={{
                                motivo_solicitacao: {
                                    data: popularMotivosDispensa,
                                    labelKey: "descricao"
                                },
                                curso: {
                                    data: popularCursos,
                                    labelKey: "nome"
                                }
                            }}
                            onChange={handleFormChange}
                            ignoreFields={["id", "form_dispensa_ed_fisica", "form_exercicos_domiciliares", "form_abono_falta"]}
                        />
                    <button type="submit" className="submit-button">Enviar</button>
                </form>
            </main>
            <Feedback
                show={popupIsOpen}
                mensagem={msgErro?.response?.data?.detail || msgErro?.message || "Erro desconhecido"}
                tipo={popupType}
                onClose={() => setPopupIsOpen(false)}
            />

            <Footer />
        </div>
    );
}
