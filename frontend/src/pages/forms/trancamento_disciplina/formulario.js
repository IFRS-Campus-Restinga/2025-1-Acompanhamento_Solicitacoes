import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import Options from "../../../components/options";
import Popup from "../../../components/popup";
import { useNavigate, useParams } from "react-router-dom";

export default function Formulario() {
    const { curso_codigo } = useParams();  // Captura o curso_codigo da URL
    const [cursos, setCursos] = useState([]);  // Lista de cursos
    const [disciplinas, setDisciplinas] = useState([]);  // Disciplinas relacionadas ao curso
    const [dados, setDados] = useState({
        aluno: "",
        curso: curso_codigo || "",  // Inicializa com o curso da URL, se disponível
        disciplinas: [],
        ingressante: false,
        motivo_solicitacao: "",
    });
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [msgErro, setMsgErro] = useState([]);

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

    // Carregar cursos ao iniciar
    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/cursos/")
            .then((response) => setCursos(response.data))
            .catch((err) => console.error("Erro ao buscar cursos:", err));
    }, []);

    // Carregar disciplinas ao selecionar um curso ou ao mudar a URL
    useEffect(() => {
        if (dados.curso) {
            axios.get(`http://localhost:8000/solicitacoes/formulario_trancamento_disciplina/disciplinas/${dados.curso}/`)
                .then((response) => setDisciplinas(response.data))
                .catch((err) => console.error("Erro ao buscar disciplinas:", err));
        }
    }, [dados.curso]);  // A cada vez que o curso muda

    const handleCursoChange = (cursoId) => {
        setDados((prevDados) => ({
            ...prevDados,
            curso: cursoId,  // Atualiza o curso selecionado
            disciplinas: []   // Limpa as disciplinas ao trocar de curso
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        })
    };

    const handleFormChange = (campo, valor) => {
        setDados((prevDados) => ({
            ...prevDados,
            [campo]: valor,
        }));
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
                        <label>Curso</label>
                        <select
                            value={dados.curso}
                            onChange={(e) => handleCursoChange(e.target.value)}  // Alteração aqui
                            required
                        >
                            <option value="">Selecione o curso</option>
                            {cursos.map((curso) => (
                                <option key={curso.codigo} value={curso.codigo}>{curso.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Disciplinas</label>
                        <select
                            multiple
                            value={dados.disciplinas}
                            onChange={(e) => handleFormChange("disciplinas", Array.from(e.target.selectedOptions, option => option.value))}
                            required
                        >
                            {disciplinas.map((disciplina) => (
                                <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
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