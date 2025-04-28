import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import Options from "../../../components/options";
import Popup from "../../../components/popup";
import { useNavigate, useParams } from "react-router-dom";

export default function Formulario() {
    const { curso_codigo } = useParams();
    const [cursos, setCursos] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [dados, setDados] = useState({
        aluno: "",
        curso: curso_codigo || "",
        disciplinas: [],
        ingressante: false,
        motivo_solicitacao: "",
    });
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [msgErro, setMsgErro] = useState([]);
    const [mensagemErro, setMensagemErro] = useState("");

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

    // Carregar os cursos ao montar o componente
    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/cursos/")
            .then((response) => setCursos(response.data))
            .catch((err) => console.error("Erro ao buscar cursos:", err));
    }, []);

    // Carregar as disciplinas quando o curso for selecionado
    useEffect(() => {
        if (dados.curso) {
            axios.get(`http://localhost:8000/solicitacoes/formulario_trancamento_disciplina/disciplinas/${dados.curso}/`)
                .then((response) => setDisciplinas(response.data))
                .catch((err) => console.error("Erro ao buscar disciplinas:", err));
        }
    }, [dados.curso]);

    // Atualiza o curso selecionado e limpa as disciplinas
    const handleCursoChange = (cursoId) => {
        setDados((prevDados) => ({
            ...prevDados,
            curso: cursoId,
            disciplinas: [] // Limpa as disciplinas selecionadas ao mudar o curso
        }));
    };

    // Enviar os dados para a API
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Dados a enviar:", dados);  // Depuração para verificar se as disciplinas estão corretas

        await axios.post(
            "http://localhost:8000/formulario_trancamento_disciplina/",
            dados
        )
        .then(() => {
            navigate("/solicitacoes");
        })
        .catch((err) => {
            setMsgErro(err);
            setPopupIsOpen(true);
        });
    };

    // Atualiza os campos do formulário
    const handleFormChange = (campo, valor) => {
        setDados((prevDados) => ({
            ...prevDados,
            [campo]: valor,
        }));
    };

    // Remove uma disciplina selecionada
    const handleRemoveDisciplina = (codigo) => {
        setDados((prevDados) => ({
            ...prevDados,
            disciplinas: prevDados.disciplinas.filter(d => d !== codigo)
        }));
    };

    const handleDisciplinasChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
        console.log('Disciplinas selecionadas:', selectedOptions);
    
        // Limite de disciplinas: 2 se ingressante, 5 caso contrário
        const limite = dados.ingressante ? 2 : 5;
    
        // Verificar se o número de disciplinas selecionadas excede o limite
        if (selectedOptions.length > limite) {
            setMensagemErro(`Você só pode selecionar no máximo ${limite} disciplinas.`);
            return; // Não atualiza o estado se o limite for ultrapassado
        }
    
        setMensagemErro(""); // Limpar mensagem de erro quando estiver dentro do limite

        if (dados.ingressante && dados.disciplinas.length > 2) {
            selectedOptions.length = 2;  // Mantém apenas as 2 primeiras disciplinas
        }
    
        // Filtra as disciplinas já selecionadas para não permitir duplicação
        const disciplinasSelecionadas = new Set([...dados.disciplinas, ...selectedOptions]);
    
        // Limitar o número de disciplinas selecionadas (máximo de 2 ou 5)
        const disciplinasAtualizadas = Array.from(disciplinasSelecionadas).slice(0, limite);
    
        // Atualiza as disciplinas no estado
        handleFormChange("disciplinas", disciplinasAtualizadas);
    };

    return (
        <div>
            <Header />
            <main className="container form-container">
                <form className="form-box" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome do Aluno:</label>
                        <input
                            type="text"
                            className="input-text"
                            value={dados.aluno}
                            onChange={(e) => handleFormChange("aluno", e.target.value)}
                            required
                        />
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
                        <label>Motivo da Solicitação</label>
                        <textarea
                            value={dados.motivo_solicitacao}
                            onChange={(e) => handleFormChange("motivo_solicitacao", e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">Enviar</button>
                </form>
            </main>
            {popupIsOpen && (
                <Popup 
                    message={msgErro.response?.data?.motivo_solicitacao}
                    isError={true}
                    actions={popupActions}
                />
            )}
            <Footer />
        </div>
    );
}