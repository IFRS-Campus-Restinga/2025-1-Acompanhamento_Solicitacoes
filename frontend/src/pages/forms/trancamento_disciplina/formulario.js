import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import Popup from "../../../components/popup";
import PopupFeedback from "../../../components/pop_ups/popup_feedback"; 
import { useNavigate, useParams } from "react-router-dom";
import "../../../components/formulario.css";

export default function Formulario() {
    const { curso_codigo } = useParams();
    const [nomes, setNomes] = useState([]);  // Lista de nomes de alunos
    const [cursos, setCursos] = useState([]);  // Lista de cursos
    const [disciplinas, setDisciplinas] = useState([]);  // Lista de disciplinas
    const [dados, setDados] = useState({
        nome: "",  // ID do nome
        curso: curso_codigo || "",  // ID do curso
        disciplinas: [],
        ingressante: false,
        motivo_solicitacao: "",
    });
    const [showFeedback, setShowFeedback] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("sucesso");
    const [cadastroSucesso, setCadastroSucesso] = useState(false); // <- Adicionado
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [msgErro, setMsgErro] = useState([]);
    const [mensagemErro, setMensagemErro] = useState("");
    const [feedbackData, setFeedbackData] = useState({
        mensagem: "",
        tipo: "sucesso"
    });

    const popupActions = [
        {
            label: "Fechar",
            className: "btn btn-cancel",
            onClick: () => {
                setPopupIsOpen(false);
                navigate("/solicitacoes");
            }
        }
    ];

    const navigate = useNavigate();

    useEffect(() => {
        // Buscar os cursos disponíveis
        axios.get("http://localhost:8000/solicitacoes/cursos/")
            .then((response) => setCursos(response.data))
            .catch((err) => console.error("Erro ao buscar cursos:", err));
    }, []);

    useEffect(() => {
        // Buscar os nomes para popular o dropdown
        axios.get("http://localhost:8000/solicitacoes/nomes/") // Endpoint para nomes
            .then((response) => setNomes(response.data))
            .catch((err) => console.error("Erro ao buscar nomes:", err));
    }, []);

    useEffect(() => {
        if (dados.curso) {
            console.log("Curso selecionado:", dados.curso);
            axios.get(`http://localhost:8000/solicitacoes/formulario_trancamento_disciplina/disciplinas/${dados.curso}/`)
                .then((response) => {
                    console.log("Disciplinas recebidas:", response.data);  // Verificar a estrutura da resposta
                    // Supondo que as disciplinas venham em response.data.disciplinas
                    setDisciplinas(response.data.disciplinas || []);  // Garantir que seja um array
                })
                .catch((err) => {
                    console.error("Erro ao buscar disciplinas:", err);
                });
        }
    }, [dados.curso]);

    const handleCursoChange = (cursoId) => {
        setDados((prevDados) => ({
            ...prevDados,
            curso: cursoId,
            disciplinas: []
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                "http://localhost:8000/solicitacoes/formulario_trancamento_disciplina/",
                dados
            );
            setTipoMensagem("sucesso");
            setMensagem("Solicitação enviada com sucesso!");
            setShowFeedback(true);
            setShowFeedback(true);
            setDados({
                nome: "",
                curso: curso_codigo || "",
                disciplinas: [],
                ingressante: false,
                motivo_solicitacao: "",
            });
            setTimeout(() => {
                setShowFeedback(false); // Fecha o popup
                navigate("/nova-solicitacao"); 
            }, 2000);

        } catch (err) {
            setMsgErro(err);
            setPopupIsOpen(true);
            setFeedbackData({
                mensagem: "Erro ao enviar a solicitação.",
                tipo: "erro"
            });
            setShowFeedback(true);
            setTimeout(() => {
                setShowFeedback(false); // Fecha o popup
                navigate("/nova-solicitacao"); 
            }, 2000);
        }
    };

    const handleFormChange = (campo, valor) => {
        setDados((prevDados) => {
            let novosDados = { ...prevDados, [campo]: valor };
    
            if (campo === "ingressante" && valor === true) {
                novosDados.disciplinas = prevDados.disciplinas.slice(0, 2);
                setMensagemErro("Você só pode selecionar no máximo 2 disciplinas.");
            }
    
            return novosDados;
        });
    };

    const handleRemoveDisciplina = (codigo) => {
        setDados((prevDados) => ({
            ...prevDados,
            disciplinas: prevDados.disciplinas.filter(d => d !== codigo)
        }));
        setMensagemErro("");
    };

    const handleDisciplinasChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
        const limite = dados.ingressante ? 2 : 5;
    
        if (dados.ingressante) {
            if (dados.disciplinas.length > 2) {
                setDados((prevDados) => ({
                    ...prevDados,
                    disciplinas: prevDados.disciplinas.slice(0, 2),
                }));
                setMensagemErro("");
                return;
            }
        }
        
        if (dados.disciplinas.length + selectedOptions.length > limite) {
            setMensagemErro(`Você só pode selecionar no máximo ${limite} disciplinas.`);
            return; 
        }
    
        setMensagemErro("");
    
        if (dados.ingressante && dados.disciplinas.length + selectedOptions.length > 2) {
            selectedOptions.length = 2 - dados.disciplinas.length;
        }
    
        const disciplinasSelecionadas = new Set([...dados.disciplinas, ...selectedOptions]);
        const disciplinasAtualizadas = Array.from(disciplinasSelecionadas).slice(0, limite);

        handleFormChange("disciplinas", disciplinasAtualizadas);
    };

    return (
        <div>
            <Header />
            <main className="container">
                <h2>Solicitação de Trancamento de Componente Curricular</h2>
                <h6><p>Este formulário destina-se à solicitação de trancamento de um ou mais componente(s) curricular(es) do período letivo vigente.</p>
                <p>Conforme art. 122 da Organização Didática, entende-se por trancamento de componente curricular o ato formal pelo qual o estudante solicita a desistência de um ou mais componentes curriculares do curso.</p>
                <p>Ainda, quando o estudante for ingressante será permitido o trancamento de até 2 (dois) componentes curriculares matriculados (art. 8º da Organização Didática).</p>
                <p>QUEM: Estudantes dos cursos subsequentes e do superior.</p>
                <p>QUANDO: A solicitação de trancamento de componente curricular poderá ser feita dentro de cada período letivo, conforme prazo estabelecido em nosso calendário acadêmico.</p>
                <p>Após entrega do formulário, a coordenação de curso fará a análise da solicitação em até 7 (sete) dias e a CRE tem até 5 (cinco) dias úteis para inserir os resultados no sistema.</p> 
                <p>Este prazo pode ser estendido conforme as demandas da coordenação de curso e/ou do setor. O resultado pode ser conferido no sistema acadêmico.</p></h6>

                <form className="formulario formulario-largo" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome completo:</label>
                        <select
                            value={dados.nome}
                            onChange={(e) => handleFormChange("nome", e.target.value)}
                            required
                        >
                            <option value="">Selecione o nome</option>
                            {nomes.map((nome) => (
                                <option key={nome.id} value={nome.id}>
                                    {nome.nome}  {/* Nome do aluno, herdado de Usuário */}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={dados.ingressante}
                                onChange={(e) => handleFormChange("ingressante", e.target.checked)}
                            />
                            <span> Estou no primeiro semestre</span>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>Curso:</label>
                        <select
                            value={dados.curso}
                            onChange={(e) => handleCursoChange(e.target.value)}
                            required
                        >
                            <option value="">Selecione o curso</option>
                            {cursos.map((curso) => (
                                <option key={curso.codigo} value={curso.codigo}>
                                    {curso.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Disciplinas:</label>
                        <select
                            multiple
                            value={dados.disciplinas}
                            onChange={handleDisciplinasChange}
                            required
                        >
                            {disciplinas.map((disciplina) => (
                                <option key={disciplina.codigo} value={disciplina.codigo}>
                                    {disciplina.nome} - {disciplina.codigo}
                                </option>
                            ))}
                        </select>
                        {mensagemErro && (
                            <div style={{ color: "red", marginTop: "10px" }}>
                                {mensagemErro}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Disciplinas Selecionadas:</label>
                        <ul>
                            {dados.disciplinas.map((disciplinaCodigo) => {
                                const disciplina = disciplinas.find(d => d.codigo === disciplinaCodigo);
                                return (
                                    <li key={disciplinaCodigo}>
                                        {disciplina ? `${disciplina.nome} - ${disciplina.codigo}` : 'Desconhecido'}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDisciplina(disciplinaCodigo)}
                                            className="remove-btn"
                                        >
                                            X
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="form-group">
                        <label>Motivo da Solicitação:</label>
                        <textarea
                            value={dados.motivo_solicitacao}
                            onChange={(e) => handleFormChange("motivo_solicitacao", e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">Enviar</button>
                </form>
                
                <PopupFeedback
                    show={showFeedback}
                    mensagem={mensagem}
                    tipo={tipoMensagem}
                    onClose={() => {
                        setShowFeedback(false);
                        if (cadastroSucesso) {
                            navigate("/nova-solicitao");
                        }
                    }}
                />
                
            </main>

            <Footer />
        </div>
    );
}
