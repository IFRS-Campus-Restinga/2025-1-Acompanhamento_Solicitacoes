import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import PopupFeedback from "../../../components/pop_ups/popup_feedback"; 
import { useNavigate } from "react-router-dom";
import "../../../components/formulario.css";

export default function Formulario() {
    const [alunos, setAlunos] = useState([]);
    const [alunoSelecionado, setAlunoSelecionado] = useState(null);
    const [disciplinas, setDisciplinas] = useState([]);
    const [dados, setDados] = useState({
        aluno: "",
        disciplinas: [],
        ingressante: false,
        motivo_solicitacao: ""
    });
    const [showFeedback, setShowFeedback] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("sucesso");
    const [mensagemErro, setMensagemErro] = useState("");
    const [filtroDisciplina, setFiltroDisciplina] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/alunos/")
            .then((res) => setAlunos(res.data))
            .catch((err) => console.error("Erro ao buscar alunos:", err));
    }, []);

    useEffect(() => {
        if (alunoSelecionado?.ppc?.codigo) {
            axios.get(`http://localhost:8000/solicitacoes/formulario_trancamento_disciplina/disciplinas/${alunoSelecionado.ppc.curso.codigo}/`)
                .then((res) => {
                    const disciplinasData = Array.isArray(res.data) ? res.data : 
                                        res.data.disciplinas ? res.data.disciplinas : [];
                    setDisciplinas(disciplinasData);
                })
                .catch((err) => {
                    console.error("Erro ao buscar disciplinas:", err.response?.data || err);
                    setDisciplinas([]);
                });
        } else {
            setDisciplinas([]);
        }
    }, [alunoSelecionado]);

    const handleAlunoChange = (e) => {
        const alunoId = e.target.value;
        if (!alunoId) {
            setAlunoSelecionado(null);
            setDados({ ...dados, aluno: "", disciplinas: [] });
            return;
        }

        const aluno = alunos.find(a => a.id === parseInt(alunoId));
        if (aluno) {
            setAlunoSelecionado(aluno);
            setDados({
                ...dados,
                aluno: aluno.id,
                disciplinas: []
            });
        }
    };

    const handleDisciplinasChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
        const limite = dados.ingressante ? 2 : 5;
    
        const novasDisciplinas = [...new Set([...dados.disciplinas, ...selectedOptions])];
    
        if (novasDisciplinas.length > limite) {
            setMensagemErro(`Você só pode selecionar no máximo ${limite} disciplinas.`);
            return;
        }
    
        setMensagemErro("");
        setDados({ ...dados, disciplinas: novasDisciplinas });
    };

    const handleRemoveDisciplina = (codigo) => {
        setDados({
            ...dados,
            disciplinas: dados.disciplinas.filter(d => d !== codigo)
        });
        setMensagemErro("");
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
            setTimeout(() => navigate("/todas-solicitacoes"), 2000);
        } catch (err) {
            setTipoMensagem("erro");
            setMensagem(err.response?.data?.message || "Erro ao enviar solicitação");
            setShowFeedback(true);
        }
    };

    const disciplinasFiltradas = disciplinas.filter(disciplina =>
        disciplina.nome.toLowerCase().includes(filtroDisciplina.toLowerCase()) ||
        disciplina.codigo.toLowerCase().includes(filtroDisciplina.toLowerCase())
    );

    return (
        <div>
            <Header />
            <main className="container">
                <h2>Solicitação de Trancamento de Componente Curricular</h2>
                <div className="descricao-formulario">
                    <p>Este formulário destina-se à solicitação de trancamento de um ou mais componente(s) curricular(es) do período letivo vigente.</p>
                    <p>Conforme art. 122 da Organização Didática, entende-se por trancamento de componente curricular o ato formal pelo qual o estudante solicita a desistência de um ou mais componentes curriculares do curso.</p>
                    <p>Ainda, quando o estudante for ingressante será permitido o trancamento de até 2 (dois) componentes curriculares matriculados (art. 8º da Organização Didática).</p>
                    <p>QUEM: Estudantes dos cursos subsequentes e do superior.</p>
                    <p>QUANDO: A solicitação de trancamento de componente curricular poderá ser feita dentro de cada período letivo, conforme prazo estabelecido em nosso calendário acadêmico.</p>
                </div>

                <form className="formulario formulario-largo" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Aluno:</label>
                        <select onChange={handleAlunoChange} required>
                            <option value="">Selecione o aluno</option>
                            {alunos.map((aluno) => (
                                <option key={aluno.id} value={aluno.id}>
                                    {aluno.usuario.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {alunoSelecionado && (
                        <>
                            <div className="form-group">
                                <label>Curso:</label>
                                <input
                                    type="text"
                                    value={alunoSelecionado.ppc?.curso?.nome || "Não informado"}
                                    readOnly
                                />
                            </div>
                            <div className="form-group">
                                <label>PPC:</label>
                                <input
                                    type="text"
                                    value={alunoSelecionado.ppc?.codigo || "Não informado"}
                                    readOnly
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={dados.ingressante}
                                onChange={(e) => {
                                    const isIngressante = e.target.checked;
                                    const novoLimite = isIngressante ? 2 : 5;
                                    setDados({
                                        ...dados,
                                        ingressante: isIngressante,
                                        disciplinas: isIngressante ? dados.disciplinas.slice(0, 2) : dados.disciplinas
                                    });
                                
                                    if (dados.disciplinas.length > novoLimite) {
                                        setMensagemErro(`Você só pode selecionar no máximo ${novoLimite} disciplinas.`);
                                    } else {
                                        setMensagemErro("");
                                    }
                                }}
                            />
                            <span> Estou no primeiro semestre </span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Disciplinas Disponíveis:</label>
                        <div className="barra-pesquisa">
                            <i className="bi bi-search icone-pesquisa"></i>
                            <input
                                type="text"
                                placeholder="Buscar disciplinas..."
                                value={filtroDisciplina}
                                onChange={(e) => setFiltroDisciplina(e.target.value)}
                                className="input-pesquisa"
                                disabled={!alunoSelecionado || disciplinas.length === 0}
                                style={{ paddingLeft: '30px', height: '38px' }} 
                            />
                        </div>
                        <select
                            multiple
                            size="5"
                            value={dados.disciplinas}
                            onChange={handleDisciplinasChange}
                            disabled={!alunoSelecionado || disciplinas.length === 0}
                            required
                        >
                            {disciplinasFiltradas.map((disciplina) => (
                                <option key={disciplina.codigo} value={disciplina.codigo}>
                                    {disciplina.nome} ({disciplina.codigo})
                                </option>
                            ))}
                        </select>
                        {mensagemErro && <div className="erro">{mensagemErro}</div>}
                        {disciplinas.length === 0 && alunoSelecionado && (
                            <div className="aviso">Nenhuma disciplina disponível para trancamento.</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Disciplinas Selecionadas:</label>
                        <ul>
                            {dados.disciplinas.map((codigo) => {
                                const disciplina = disciplinas.find(d => d.codigo === codigo);
                                return (
                                    <li key={codigo}>
                                        {disciplina ? `${disciplina.nome} (${codigo})` : codigo}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDisciplina(codigo)}
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
                            onChange={(e) => setDados({...dados, motivo_solicitacao: e.target.value})}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button" 
                        disabled={!alunoSelecionado || dados.disciplinas.length === 0}
                    >
                        Enviar
                    </button>
                </form>

                <PopupFeedback
                    show={showFeedback}
                    mensagem={mensagem}
                    tipo={tipoMensagem}
                    onClose={() => setShowFeedback(false)}
                />
            </main>
            <Footer />
        </div>
    );
}