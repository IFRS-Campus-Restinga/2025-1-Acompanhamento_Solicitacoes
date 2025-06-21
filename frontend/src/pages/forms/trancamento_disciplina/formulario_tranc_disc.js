import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BuscaUsuario from "../../../components/busca_usuario";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
//import VerificadorDisponibilidade from "../../../pages/disponibilidade/VerificadorDisponibilidade";
//<VerificadorDisponibilidade tipoFormulario="TRANCAMENTODISCIPLINA"></VerificadorDisponibilidade>

// Serviços de autenticação
import { getAuthToken } from "../../../services/authUtils";

//CSS
import "../../../components/styles/formulario.css";

export default function FormularioTrancamentoDisciplina() {
    const { register, 
        handleSubmit: rhfHandleSubmit, 
        watch,
        setValue,
        getValues,
        formState: { errors } } = 
        useForm({
        defaultValues: {
            email: "", // Set default values based on initial data
            nome_completo: "",
            matricula: "",
            curso: "",
            periodo: "",
            aluno: "", // This will be set programmatically
            disciplinas: [], // This will be set programmatically based on checkbox selection
            ingressante: false,
            motivo_solicitacao: ""
        }
    });
    // Watch for changes in fields that affect others, e.g., 'ingressante'
    const ingressanteWatched = watch("ingressante");
    const periodoWatched = watch("periodo");
    const motivoSolicitacaoWatched = watch("motivo_solicitacao"); // For conditional "outro" field

    // Estados para controle de usuário e aluno

    const [userData, setUserData] = useState(null);
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);
    const [aluno, setAluno] = useState(null);
    const [alunoNaoEncontrado, setAlunoNaoEncontrado] = useState(false);
    
    // Estados para curso e PPC
    const [curso, setCurso] = useState(null);
    const [ppc, setPpc] = useState(null);
    
    // Estados para disciplinas
    const [periodoSelecionado, setPeriodoSelecionado] = useState("");
    const [periodosDisponiveis, setPeriodosDisponiveis] = useState([]); // This would need to be populated, e.g., from an API call
    const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState({}); // To manage checkbox states
    const [disciplinas, setDisciplinas] = useState([]);
    const [filtroDisciplina, setFiltroDisciplina] = useState("");
    const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);
    const [erroBuscaDisciplinas, setErroBuscaDisciplinas] = useState("");
    
    // Estado para o formulário
    const [dados, setDados] = useState({
        aluno: "",
        disciplinas: [],
        ingressante: false,
        motivo_solicitacao: ""
    });
    
    // Estados para feedback e erros
    const [showFeedback, setShowFeedback] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("sucesso");
    const [mensagemErro, setMensagemErro] = useState("");
    
    // Referência para controlar busca única
    const buscouAlunoRef = useRef(false);
    const navigate = useNavigate();

    // Callback para o BuscaUsuario
    const handleUsuario = useCallback((data) => {
        console.log("BuscaUsuario retornou:", data);
        setUserData(data);
        setCarregandoUsuario(false);
    }, []);

    // Redireciona se não houver usuário
    useEffect(() => {
        if (!carregandoUsuario && !userData) {
            navigate("/");
        }
    }, [carregandoUsuario, userData, navigate]);

    // Busca aluno pelo e-mail quando userData estiver disponível
    useEffect(() => {
        const buscarAluno = async () => {
            try {
                console.log("Buscando aluno pelo e-mail:", userData.email);
                const token = getAuthToken();
                const res = await axios.get(`http://localhost:8000/solicitacoes/usuarios/buscar-por-email/${userData.email}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data) {
                    const usuarioEncontrado = res.data;
                    console.log("Usuário encontrado na API:", usuarioEncontrado);

                    if (usuarioEncontrado?.grupo_detalhes) {
                        const alunoReal = usuarioEncontrado.grupo_detalhes;
                        console.log("Objeto Aluno encontrado (grupo_detalhes):", alunoReal);

                        setAluno(alunoReal);
                        setAlunoNaoEncontrado(false);

                        // Update the form field 'aluno' using setValue
                        setValue("aluno", alunoReal.id); // This is important!

                        if (alunoReal?.curso_codigo) {
                            buscarDadosCurso(alunoReal.curso_codigo);
                        }
                        if (alunoReal?.ppc_codigo) {
                            buscarDadosPpc(alunoReal.ppc_codigo);
                        }
                    } else {
                        console.error("Usuário encontrado, mas sem dados de Aluno (grupo_detalhes).");
                        setAlunoNaoEncontrado(true);
                        setMensagem("Dados de aluno não encontrados para este usuário.");
                        setTipoMensagem("erro");
                        setShowFeedback(true);
                    }
                } else {
                    setAlunoNaoEncontrado(true);
                    setMensagem("Aluno não encontrado no sistema.");
                    setTipoMensagem("erro");
                    setShowFeedback(true);
                }
            } catch (err) {
                console.error("Erro ao buscar aluno:", err.response?.data || err.message);
                setAlunoNaoEncontrado(true);
                setMensagem(err.response?.data?.message || "Erro ao buscar dados do aluno");
                setTipoMensagem("erro");
                setShowFeedback(true);
            }
        };

        if (userData?.email && !buscouAlunoRef.current) {
            buscouAlunoRef.current = true;
            buscarAluno();
        }
    }, [userData, setValue]); // Add setValue to dependency array

    // Buscar dados do curso
    const buscarDadosCurso = async (codigoCurso) => {
        try {
            console.log("Buscando dados do curso:", codigoCurso);
            const token = getAuthToken();
            const res = await axios.get(`http://localhost:8000/solicitacoes/cursos/${codigoCurso}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Dados do curso:", res.data);
            setCurso(res.data);
            
            // Buscar disciplinas do curso
            buscarDisciplinas(codigoCurso);
        } catch (error) {
            console.error("Erro ao buscar dados do curso:", error);
            setMensagem("Erro ao buscar dados do curso.");
            setTipoMensagem("erro");
            setShowFeedback(true);
        }
    };

    // Buscar dados do PPC
    const buscarDadosPpc = async (codigoPpc) => {
        try {
            console.log("Buscando dados do PPC:", codigoPpc);
            const token = getAuthToken();
            const res = await axios.get(`http://localhost:8000/solicitacoes/ppcs/${codigoPpc}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Dados do PPC:", res.data);
            setPpc(res.data);
        } catch (error) {
            console.error("Erro ao buscar dados do PPC:", error);
            setMensagem("Erro ao buscar dados do PPC.");
            setTipoMensagem("erro");
            setShowFeedback(true);
        }
    };

    useEffect(() => {
    const fetchPeriodos = async () => {
        if (ppc?.codigo) {
            try {
                // Example: Fetch periods from an API
                const token = getAuthToken();
                const res = await axios.get(`http://localhost:8000/solicitacoes/ppcs/${ppc.codigo}/periodos/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPeriodosDisponiveis(res.data.map(p => ({ value: p.codigo, label: `Período ${p.numero}` })));
            } catch (err) {
                console.error("Erro ao buscar períodos:", err);
                // Handle error
            }
        }
    };
    fetchPeriodos();
}, [ppc]);

// Handler for period selection
const handlePeriodoChange = (e) => {
    const selectedPeriod = e.target.value;
    setPeriodoSelecionado(selectedPeriod);
    // Optionally trigger re-fetch of disciplines if disciplines are tied to period AND course
    // If disciplines are only tied to course, this might not be strictly necessary for disciplines,
    // but useful if you need to know the period for the submission itself.
};

    // Buscar todas as disciplinas do curso
    const buscarDisciplinas = async (cursoCodigo) => {
        if (!cursoCodigo) return;
        
        setIsLoadingDisciplinas(true);
        setErroBuscaDisciplinas("");
        
        try {
            console.log(`Buscando disciplinas para o curso ${cursoCodigo}`);
            const token = getAuthToken();
            const res = await axios.get(`http://localhost:8000/solicitacoes/formulario_trancamento_disciplina/disciplinas/${cursoCodigo}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            const disciplinasData = Array.isArray(res.data) ? res.data : 
                                res.data.disciplinas ? res.data.disciplinas : [];
            console.log("Disciplinas encontradas:", disciplinasData);
            setDisciplinas(disciplinasData);
        } catch (error) {
            console.error("Erro ao buscar disciplinas:", error.response?.data || error.message);
            setErroBuscaDisciplinas("Erro ao buscar disciplinas. Tente novamente.");
            setDisciplinas([]);
        } finally {
            setIsLoadingDisciplinas(false);
        }
    };

    // Manipular mudança no checkbox de ingressante
    const handleIngressanteChange = (e) => {
        const isIngressante = e.target.checked;
        setValue("ingressante", isIngressante); // Update form state
        const novoLimite = isIngressante ? 2 : 5;

        // Get current selected disciplines from react-hook-form state
        const currentDisciplinas = getValues("disciplinas") || [];
        if (currentDisciplinas.length > novoLimite) {
            // Trim if necessary and update the form state
            const trimmedDisciplinas = currentDisciplinas.slice(0, novoLimite);
            setValue("disciplinas", trimmedDisciplinas);
            setMensagemErro(`Você só pode selecionar no máximo ${novoLimite} disciplinas. Algumas disciplinas foram desmarcadas.`);
        } else {
            setMensagemErro("");
        }
    };

    // Manipular seleção de disciplinas
    const handleDisciplinaCheckboxChange = (e) => {
        const { value, checked } = e.target; // value is the discipline.codigo
        const currentDisciplinas = getValues("disciplinas") || [];
        const limite = ingressanteWatched ? 2 : 5; // Use ingressanteWatched from useForm

        let updatedDisciplinas;
        if (checked) {
            updatedDisciplinas = [...currentDisciplinas, value];
            if (updatedDisciplinas.length > limite) {
                setMensagemErro(`Você só pode selecionar no máximo ${limite} disciplinas.`);
                // Prevent checking if it exceeds the limit
                e.target.checked = false; // Visually uncheck
                return;
            }
        } else {
            updatedDisciplinas = currentDisciplinas.filter(d => d !== value);
            setMensagemErro(""); // Clear error if disciplines are being removed
        }
        setValue("disciplinas", updatedDisciplinas); // Update form state with the new array
        setMensagemErro(""); // Clear any previous error if valid now
    };

    // Manipular remoção de disciplina
    const handleRemoveDisciplina = (codigo) => {
        setDados({
            ...dados,
            disciplinas: dados.disciplinas.filter(d => d !== codigo)
        });
        setMensagemErro("");
    };

    // Manipular mudança no motivo da solicitação
    const handleMotivoChange = (e) => {
            setValue("motivo_solicitacao", e.target.value);
    };

    // Enviar formulário
     const onSubmitForm = async (data) => { // 'data' contains the validated form values
        console.log("Dados do formulário para envio:", data);

        if (!aluno) { // Keep this check if 'aluno' state is critical and not part of form data
            setMensagem("Por favor, aguarde o carregamento dos dados do aluno.");
            setTipoMensagem("erro");
            setShowFeedback(true);
            return;
        }

        // Basic validation that react-hook-form might not catch easily or for clarity
        if (data.disciplinas.length === 0) {
            setMensagem("Selecione pelo menos uma disciplina.");
            setTipoMensagem("erro");
            setShowFeedback(true);
            return;
        }

        try {
            const token = getAuthToken();
            await axios.post(
                "http://localhost:8000/solicitacoes/formulario_trancamento_disciplina/",
                data, // Use 'data' from react-hook-form
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                }
            );

            setMensagem("Solicitação enviada com sucesso!");
            setTipoMensagem("sucesso");
            setShowFeedback(true);

            setTimeout(() => navigate("/todas-solicitacoes"), 2000);
        } catch (error) {
            setMensagem(error.response?.data?.message || "Erro ao enviar solicitação");
            setTipoMensagem("erro");
            setShowFeedback(true);
        }
    };

    // Filtrar disciplinas com base na busca
    const disciplinasFiltradas = disciplinas.filter(disciplina =>
        disciplina.nome.toLowerCase().includes(filtroDisciplina.toLowerCase()) ||
        disciplina.codigo.toLowerCase().includes(filtroDisciplina.toLowerCase())
    );

    // Renderização condicional durante carregamento
    if (carregandoUsuario) {
        return (
            <>
                <BuscaUsuario dadosUsuario={handleUsuario} />
                <main className="container">
                    <p>Carregando usuário...</p>
                </main>
            </>
        );
    }

    // Renderização quando aluno não é encontrado
    if (userData && alunoNaoEncontrado) {
        return (
            <div className="page-container">
                <main className="container">
                    <h2>Aluno não encontrado no sistema.</h2>
                    <p>Verifique se o e-mail está corretamente vinculado a um aluno.</p>
                </main>
                {showFeedback && (
                    <PopupFeedback
                        mensagem={mensagem}
                        tipo={tipoMensagem}
                        onClose={() => setShowFeedback(false)}
                    />
                )}
            </div>
        );
    }

    // Renderização do formulário completo
    if (userData && aluno) {
        return (
                <div className="page-container">
                    <BuscaUsuario dadosUsuario={handleUsuario} />
                    <main className="container">
                        <h2>Solicitação de Trancamento de Componente Curricular</h2>
                        <br></br>
                        <h6 className="descricao-formulario">
                            Neste formulário, você poderá solicitar o trancamento de um ou mais componentes curriculares de seu curso, 
                            referentes ao período letivo vigente.
                            Estudantes Ingressantes podem solicitar o trancamento de até <strong>2 (dois)</strong> componentes curriculares 
                            matriculados no período letivo.
                            <hr></hr><strong>
                            ATENÇÃO:</strong> A solicitação de trancamento de componente curricular poderá ser feita até a quarta semana 
                            após o início das atividades letivas, conforme estabelecido em nosso calendário acadêmico.
                        </h6>

                        <form className="formulario formulario-largura" onSubmit={rhfHandleSubmit(onSubmitForm)}>

                        <div className="dados-aluno-container">
                            <div className="form-group">
                                <label>E-mail:</label>
                                <input type="email" value={userData?.email || ""} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Nome Completo:</label>
                                <input type="text" value={aluno?.nome || userData?.name || ""} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Matrícula:</label>
                                <input type="text" value={aluno?.matricula || ""} readOnly />
                            </div>
                            
                            <div className="form-group">
                                <label>Curso:</label>
                                <input type="text" value={curso?.nome || "Carregando..."} readOnly />
                            </div>
                            
                            <div className="form-group">
                                <label>PPC:</label>
                                <input type="text" value={ppc?.codigo || "Carregando..."} readOnly />
                            </div>
                        </div>
                         <div className="form-group">
                            <label>Ano/Semestre de Ingresso:</label>
                            <input type="text" value={aluno?.ano_ingresso || ""} readOnly />
                        </div>
                        <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                {...register("ingressante")} // Register the ingressante checkbox
                                onChange={handleIngressanteChange} // Keep your custom onChange for side effects
                                checked={ingressanteWatched} // Make sure it's controlled by watched value
                            />
                            <span> Estou no primeiro semestre </span>
                        </label>
                        </div>


                             {/* Seleção de Período */}
                                <div className="form-group">
                                    <label htmlFor="periodo">Período:</label>
                                    <select
                                        id="periodo"
                                        {...register("periodo", { required: "Selecione um período." })}
                                        onChange={handlePeriodoChange} // Ensure this handler exists and works with setValue
                                        value={periodoSelecionado} // Or use watch("periodo")
                                        disabled={!periodosDisponiveis.length || !aluno?.ppc_codigo}
                                    >
                                        <option value="">Selecione o período</option>
                                        {periodosDisponiveis.map((periodo) => (
                                            <option key={periodo.value} value={periodo.value}>
                                                {periodo.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.periodo && <span className="error-text">{errors.periodo.message}</span>}
                                </div>
                            {/* Input for filtering disciplines (add this if you want it) */}
                            <div className="form-group">
                                <label htmlFor="filtroDisciplina">Filtrar Disciplinas:</label>
                                <input
                                    type="text"
                                    id="filtroDisciplina"
                                    value={filtroDisciplina}
                                    onChange={(e) => setFiltroDisciplina(e.target.value)}
                                    placeholder="Buscar por nome ou código..."
                                />
                            </div>

                             {/* Seleção de Disciplinas */}
                            <div className="form-group">
                                <label>Disciplinas do Período:</label>
                                {isLoadingDisciplinas ? (
                                    <p>Carregando disciplinas...</p>
                                ) : erroBuscaDisciplinas ? (
                                    <p className="error-text">{erroBuscaDisciplinas}</p>
                                ) : disciplinasFiltradas.length > 0 ? (
                                    <div className="disciplinas-list">
                                        {disciplinasFiltradas.map((disciplina) => (
                                            <div key={disciplina.codigo} className="disciplina-checkbox">
                                                <input
                                                    type="checkbox"
                                                    id={`disciplina-${disciplina.codigo}`}
                                                    value={disciplina.codigo} // Use value for checkboxes
                                                    {...register("disciplinas")} // Register for an array of values
                                                    onChange={handleDisciplinaCheckboxChange} // Your custom handler
                                                    checked={getValues("disciplinas")?.includes(disciplina.codigo)} // Control checked state
                                                />
                                                <label htmlFor={`disciplina-${disciplina.codigo}`}>
                                                    {disciplina.nome} ({disciplina.codigo})
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Nenhuma disciplina encontrada para este curso.</p> // Changed text
                                )}
                                {errors.disciplinas && <span className="error-text">{errors.disciplinas.message}</span>}
                                {mensagemErro && <span className="error-text">{mensagemErro}</span>} {/* Display dynamic error */}
                            </div>
                            <div className="form-group">
                                <label htmlFor="motivo_solicitacao">Motivo da Solicitação:</label>
                                <select
                                    id="motivo_solicitacao"
                                    {...register("motivo_solicitacao", { required: "O motivo da solicitação é obrigatório." })}
                                    onChange={handleMotivoChange} // Keep your custom onChange if needed for side effects
                                    >
                                    <option value="">Selecione o motivo</option>
                                    <option value="Dificuldade de adaptação">Dificuldade de adaptação</option>
                                    <option value="Problemas de saúde">Problemas de saúde</option>
                                    <option value="Carga horária excessiva">Carga horária excessiva</option>
                                    <option value="Outros">Outros (especificar)</option>
                                </select>
                                {errors.motivo_solicitacao && <span className="error-text">{errors.motivo_solicitacao.message}</span>}
                            </div>
                             {/* If 'Outros' is selected for motivo_solicitacao, add a text area */}
                            {watch("motivo_solicitacao") === "Outros" && (
                            <div className="form-group">
                                <label htmlFor="motivo_outros">Especificar Outros Motivos:</label>
                                <textarea
                                    id="motivo_outros"
                                    {...register("motivo_outros", { required: "Por favor, especifique o motivo." })}
                                    rows="3"
                                ></textarea>
                                {errors.motivo_outros && <span className="error-text">{errors.motivo_outros.message}</span>}
                            </div>
                            )}

                            <button 
                                type="submit" 
                                className="submit-button" 
                                disabled={isLoadingDisciplinas || dados.disciplinas.length === 0}
                            >
                                Enviar
                            </button>
                        </form>
                    </main>
                    {showFeedback && (
                        <PopupFeedback
                            mensagem={mensagem}
                            tipo={tipoMensagem}
                            onClose={() => setShowFeedback(false)}
                        />
                    )}
                </div>
        );
    }

    return null;
}
