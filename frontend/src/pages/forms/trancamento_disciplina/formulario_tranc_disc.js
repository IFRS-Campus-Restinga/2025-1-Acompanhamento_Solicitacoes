import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BuscaUsuario from "../../../components/busca_usuario";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
import BotaoEnviarSolicitacao from "../../../components/UI/botoes/botao_enviar_solicitacao";
//import VerificadorDisponibilidade from "../../../pages/disponibilidade/VerificadorDisponibilidade";
//<VerificadorDisponibilidade tipoFormulario="TRANCAMENTODISCIPLINA"></VerificadorDisponibilidade>

// Serviços de autenticação
import { getAuthToken } from "../../../services/authUtils";

//CSS
import "../../../components/styles/formulario.css";

export default function FormularioTrancamentoDisciplina() {
    const { 
        register, 
        handleSubmit, 
        watch,
        setValue,
        getValues,
        formState: { errors } 
    } = useForm({
        defaultValues: {
            email: "",
            nome_completo: "",
            matricula: "",
            curso: "",
            periodo: "",
            aluno: "",
            disciplinas: [],
            ingressante: false,
            motivo_solicitacao: ""
        }
    });
    // Olhando pelas mudanças em campos que afetam outros campos
    const ingressanteWatched = watch("ingressante");
    const periodoWatched = watch("periodo");
    const motivoSolicitacaoWatched = watch("motivo_solicitacao"); // Pela condicional "outro" em motivo

    // Estados para controle de usuário e aluno

    const [userData, setUserData] = useState(null);
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);
    const [aluno, setAluno] = useState(null);
    const [alunoNaoEncontrado, setAlunoNaoEncontrado] = useState(false);
    
    // Estados para curso e PPC
    const [curso, setCurso] = useState(null);
    const [ppc, setPpc] = useState(null);
    
// Estados para feedback e erros
    const [showFeedback, setShowFeedback] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("sucesso");
    const [mensagemErro, setMensagemErro] = useState("");
    
    // Estados para disciplinas e períodos
    const [periodoSelecionado, setPeriodoSelecionado] = useState(""); // Usado para o <select> de período
    const [periodosDisponiveis, setPeriodosDisponiveis] = useState([]); // Opções para o <select> de período

    // Estados para o novo sistema de busca e seleção de disciplinas
    const [todasDisciplinas, setTodasDisciplinas] = useState([]); // Todas as disciplinas do período
    const [disciplinasFiltradas, setDisciplinasFiltradas] = useState([]); // Disciplinas filtradas pela busca
    const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState([]); // Disciplinas selecionadas pelo usuário
    const [filtroDisciplina, setFiltroDisciplina] = useState(""); // Texto de busca para filtrar disciplinas
    const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);
    const [erroBuscaDisciplinas, setErroBuscaDisciplinas] = useState("");
    
    // Estado para o formulário
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Referência para controlar busca única
    const buscouAlunoRef = useRef(false);
    const navigate = useNavigate();

    // --- FUNÇÕES DE BUSCA E LÓGICA DO FORMULÁRIO ---

    // Função para calcular o período atual do aluno (com base no ano de ingresso e tipo de período)
    const calcularPeriodoAtualAluno = useCallback((anoIngresso, tipoPeriodo) => {
        if (!anoIngresso || !tipoPeriodo) return '';

        const anoAtual = new Date().getFullYear();
        const mesAtual = new Date().getMonth() + 1; // Mês 1-12

        let periodoNumerico;

        if (tipoPeriodo.toUpperCase() === 'SEMESTRAL') {
            const semestreAtual = (mesAtual >= 1 && mesAtual <= 6) ? 1 : 2;
            if (anoAtual === anoIngresso) {
                periodoNumerico = semestreAtual;
            } else {
                periodoNumerico = (anoAtual - anoIngresso) * 2 + semestreAtual;
            }
            return `${periodoNumerico}º Semestre`;
        } else if (tipoPeriodo.toUpperCase() === 'ANUAL') {
            periodoNumerico = anoAtual - anoIngresso + 1;
            return `${periodoNumerico}º Ano`;
        }
        return '';
    }, []);

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
                        buscouAlunoRef.current = true;

                        // Preencher campos do formulário
                        setValue("nome_completo", usuarioEncontrado?.nome || userData?.name || '');
                        setValue("matricula", alunoReal?.matricula || '');
                        setValue("curso", alunoReal?.curso_nome || '');
                        setValue("email", usuarioEncontrado?.email || userData?.email || '');

                        // Preencher campos ocultos para IDs
                        setValue("aluno", alunoReal?.id || '');
                        setValue("aluno_id", alunoReal?.id || '');
                        setValue("curso_codigo", alunoReal?.curso_codigo || '');
                        setValue("ppc_codigo", alunoReal?.ppc_codigo || '');

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
                        buscouAlunoRef.current = false;
                    }
                } else {
                    setAlunoNaoEncontrado(true);
                    setMensagem("Aluno não encontrado no sistema.");
                    setTipoMensagem("erro");
                    setShowFeedback(true);
                    buscouAlunoRef.current = false;
                }
            } catch (err) {
                console.error("Erro ao buscar aluno:", err.response?.data || err.message);
                setAlunoNaoEncontrado(true);
                setMensagem(err.response?.data?.message || "Erro ao buscar dados do aluno");
                setTipoMensagem("erro");
                setShowFeedback(true);
                buscouAlunoRef.current = false;
            }
        };

        if (userData?.email && !buscouAlunoRef.current) {
            buscarAluno();
        }
    }, [userData, setValue]);

    // Buscar dados do curso
    const buscarDadosCurso = useCallback(async (codigoCurso) => {
        if (!codigoCurso) return;
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
            console.log("ID do curso retornado pela API:", res.data?.id);
            setValue("curso", res.data?.nome || '');
            setValue("curso_id", res.data?.id || '');

            // Lógica para definir os períodos disponíveis baseada no tipo_periodo do curso
            const tipoPeriodoModel = res.data.tipo_periodo; // Ex: 'SEMESTRAL' ou 'ANUAL'
            const periodos = tipoPeriodoModel.toUpperCase() === 'SEMESTRAL'
                ? Array.from({ length: 10 }, (_, i) => ({ value: `${i + 1}º Semestre`, label: `${i + 1}º Semestre` }))
                : Array.from({ length: 5 }, (_, i) => ({ value: `${i + 1}º Ano`, label: `${i + 1}º Ano` }));
            setPeriodosDisponiveis(periodos);

        } catch (error) {
            console.error("Erro ao buscar dados do curso:", error.response?.data || error.message);
            setMensagem("Erro ao buscar dados do curso.");
            setTipoMensagem("erro");
            setShowFeedback(true);
            setCurso(null);
            setPeriodosDisponiveis([]);
        }
    }, [setValue]);

    // Buscar dados do PPC
    const buscarDadosPpc = useCallback(async (codigoPpc) => {
        if (!codigoPpc) return;
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

            if (aluno?.ano_ingresso && curso?.tipo_periodo) {
                const periodoCalculadoInicial = calcularPeriodoAtualAluno(
                    aluno.ano_ingresso, 
                    curso.tipo_periodo 
                );
                setPeriodoSelecionado(periodoCalculadoInicial);
                setValue("periodo", periodoCalculadoInicial); 
            } else if (periodosDisponiveis.length > 0) { 
                setPeriodoSelecionado(periodosDisponiveis[0].value);
                setValue("periodo", periodosDisponiveis[0].value);
            }

        } catch (error) {
            console.error("Erro ao buscar dados do PPC:", error.response?.data || error.message);
            setMensagem("Erro ao buscar dados do PPC.");
            setTipoMensagem("erro");
            setShowFeedback(true);
            setPpc(null);
        }
    }, [aluno, curso, setValue, calcularPeriodoAtualAluno, periodosDisponiveis]);

    // Função para buscar disciplinas
    const buscarDisciplinas = useCallback(async (ppcCodigo, periodo) => {
        console.log("--- DEBUG DISCIPLINAS ---");
        console.log("Estado 'aluno':", aluno);
        console.log("PPC Código (aluno?.ppc_codigo):", aluno?.ppc_codigo);
        console.log("Período Selecionado:", periodoSelecionado);

        if (!ppcCodigo || !periodo) {
            console.log("Não buscou disciplinas: PPC ou Período ausente/inválido para buscarDisciplinas.");
            setTodasDisciplinas([]);
            setDisciplinasFiltradas([]);
            setErroBuscaDisciplinas("Selecione um período para carregar as disciplinas.");
            return;
        }

        setIsLoadingDisciplinas(true);
        setErroBuscaDisciplinas("");

        try {
            console.log(`Buscando disciplinas para PPC: ${ppcCodigo} e Período: ${periodo}`);
            const token = getAuthToken();
            const res = await axios.get(
                `http://localhost:8000/solicitacoes/disciplinas_por_ppc_e_periodo/?ppc_codigo=${ppcCodigo}&periodo=${periodo}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Disciplinas encontradas:", res.data.disciplinas);
            
            // Armazenar todas as disciplinas e inicializar as disciplinas filtradas
            setTodasDisciplinas(res.data.disciplinas || []);
            setDisciplinasFiltradas(res.data.disciplinas || []);
            
            // Limpar o filtro de busca
            setFiltroDisciplina("");
            
            // Limpar disciplinas selecionadas quando mudar o período
            setDisciplinasSelecionadas([]);
            setValue("disciplinas", []);
        } catch (error) {
            console.error("Erro ao buscar disciplinas:", error.response?.data || error.message);
            setErroBuscaDisciplinas("Erro ao buscar disciplinas. Verifique o período selecionado ou a conexão.");
            setTodasDisciplinas([]);
            setDisciplinasFiltradas([]);
        } finally {
            setIsLoadingDisciplinas(false);
        }
    }, [aluno, periodoSelecionado, setValue]);

    // useEffect para carregar disciplinas automaticamente quando o período mudar
    useEffect(() => {
        if (periodoSelecionado && aluno?.ppc_codigo) {
            buscarDisciplinas(aluno.ppc_codigo, periodoSelecionado);
        }
    }, [periodoSelecionado, aluno, buscarDisciplinas]);

    // Função para filtrar disciplinas com base no texto de busca
    useEffect(() => {
        if (filtroDisciplina.trim() === "") {
            // Se o filtro estiver vazio, mostrar todas as disciplinas
            setDisciplinasFiltradas(todasDisciplinas);
        } else {
            // Filtrar disciplinas pelo nome ou código
            const filtradas = todasDisciplinas.filter(
                disciplina => 
                    disciplina.nome.toLowerCase().includes(filtroDisciplina.toLowerCase()) ||
                    disciplina.codigo.toLowerCase().includes(filtroDisciplina.toLowerCase())
            );
            setDisciplinasFiltradas(filtradas);
        }
    }, [filtroDisciplina, todasDisciplinas]);

    // Função para selecionar uma disciplina
    const selecionarDisciplina = (disciplina) => {
        // Verificar se a disciplina já está selecionada
        const jaSelecionada = disciplinasSelecionadas.some(d => d.codigo === disciplina.codigo);
        
        if (!jaSelecionada) {
            // Verificar limite de disciplinas para ingressantes
            const limiteAtual = ingressanteWatched ? 2 : 5;
            if (disciplinasSelecionadas.length >= limiteAtual) {
                setMensagemErro(`Você só pode selecionar no máximo ${limiteAtual} disciplinas.`);
                return;
            }
            
            // Adicionar à lista de selecionadas
            const novasSelecionadas = [...disciplinasSelecionadas, disciplina];
            setDisciplinasSelecionadas(novasSelecionadas);
            
            // Atualizar o campo do formulário com os códigos das disciplinas
            const codigosDisciplinas = novasSelecionadas.map(d => d.codigo);
            setValue("disciplinas", codigosDisciplinas);
            setMensagemErro("");
        }
    };

    // Função para remover uma disciplina selecionada
    const removerDisciplina = (codigo) => {
        const novasSelecionadas = disciplinasSelecionadas.filter(d => d.codigo !== codigo);
        setDisciplinasSelecionadas(novasSelecionadas);
        
        // Atualizar o campo do formulário com os códigos das disciplinas
        const codigosDisciplinas = novasSelecionadas.map(d => d.codigo);
        setValue("disciplinas", codigosDisciplinas);
        setMensagemErro("");
    };

    // Função para lidar com a mudança no select de período
    const handlePeriodoChange = (e) => {
        const novoPeriodo = e.target.value;
        setPeriodoSelecionado(novoPeriodo);
        setValue("periodo", novoPeriodo);
    };

    // Manipular mudança no checkbox de ingressante
    const handleIngressanteChange = (e) => {
        const isIngressante = e.target.checked;
        setValue("ingressante", isIngressante);
        
        // Verificar se precisa remover disciplinas selecionadas
        const novoLimite = isIngressante ? 2 : 5;
        if (disciplinasSelecionadas.length > novoLimite) {
            const novasSelecionadas = disciplinasSelecionadas.slice(0, novoLimite);
            setDisciplinasSelecionadas(novasSelecionadas);
            
            // Atualizar o campo do formulário
            const codigosDisciplinas = novasSelecionadas.map(d => d.codigo);
            setValue("disciplinas", codigosDisciplinas);
            
            setMensagemErro(`Você só pode selecionar no máximo ${novoLimite} disciplinas. Algumas disciplinas foram desmarcadas.`);
        } else {
            setMensagemErro("");
        }
    };

    // Função para enviar o formulário
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        
        try {
            // Validação inicial dos dados obrigatórios
            if (!aluno?.id) {
                throw new Error("Dados incompletos do aluno. Recarregue a página e tente novamente.");
            }
            
            if (!data.disciplinas || data.disciplinas.length === 0) {
                setMensagem("Selecione pelo menos uma disciplina.");
                setTipoMensagem("erro");
                setShowFeedback(true);
                setIsSubmitting(false);
                return;
            }
            
            if (!data.motivo_solicitacao) {
                setMensagem("Preencha a justificativa.");
                setTipoMensagem("erro");
                setShowFeedback(true);
                setIsSubmitting(false);
                return;
            }
            
            const formData = new FormData();
            
            // Dados básicos do formulário
            formData.append('motivo_solicitacao', data.motivo_solicitacao);
            formData.append('ingressante', data.ingressante);
            
            // Dados do aluno
            formData.append('aluno', aluno.id);
            formData.append('matricula', aluno.matricula);
            formData.append('curso_id', curso?.id || '');
            formData.append('curso_codigo', curso?.codigo || '');
            formData.append('ppc_codigo', ppc?.codigo || '');
            
            // Disciplinas selecionadas
            data.disciplinas.forEach(disciplina => {
                formData.append('disciplinas', disciplina);
            });
            
            // Metadados automáticos
            formData.append('data_solicitacao', new Date().toISOString().split('T')[0]);
            formData.append('status', 'pendente');
            formData.append('tipo_solicitacao', 'TRANCAMENTO_DISCIPLINA');
            
            // Arquivos anexos (opcional)
            if (data.arquivos && data.arquivos.length > 0) {
                Array.from(data.arquivos).forEach((file, index) => {
                    formData.append(`arquivo_${index}`, file);
                });
            }
            
            const token = getAuthToken();
            const response = await axios.post(
                "http://localhost:8000/solicitacoes/formularios-trancamento-disciplina/",
                formData,
                {
                    headers: { 
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    },
                    timeout: 10000 // Timeout de 10 segundos
                }
            );
            
            // Feedback de sucesso
            setMensagem("Solicitação de trancamento de disciplina enviada com sucesso!");
            setTipoMensagem("sucesso");
            setShowFeedback(true);
            
            // Redirecionamento com delay
            setTimeout(() => navigate("/aluno/minhas-solicitacoes"), 2000);
            
        } catch (error) {
            console.error("Erro detalhado:", error);
            
            // Tratamento refinado de erros
            const errorMessage = error.response?.data?.detail || 
                                error.response?.data?.message || 
                                error.message || 
                                "Erro desconhecido ao enviar solicitação";
            
            setMensagem(errorMessage);
            setTipoMensagem("erro");
            setShowFeedback(true);
            
            // Log adicional para desenvolvimento
            if (process.env.NODE_ENV === 'development') {
                console.error("Detalhes do erro:", {
                    config: error.config,
                    response: error.response
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

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

                        <form className="formulario formulario-largura" onSubmit={handleSubmit(onSubmit)}>

                        <div className="dados-aluno-container">
                            <div className="form-group">
                                <label>E-mail:</label>
                                <input type="email"{...register("email")} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Nome Completo:</label>
                                <input type="text" {...register("nome_completo")} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Matrícula:</label>
                                <input type="text"  {...register("matricula")} readOnly />
                            </div>
                            
                            <div className="form-group">
                                <label>Curso:</label>
                                <input type="text" {...register("curso")} readOnly  />
                            </div>

                            {/* Campos ocultos para IDs */}
                            <input type="hidden" {...register("aluno")} />
                            <input type="hidden" {...register("aluno_id")} />
                            <input type="hidden" {...register("curso_id")} />
                            <input type="hidden" {...register("curso_codigo")} />
                            <input type="hidden" {...register("ppc_codigo")} />
                            
                             <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        {...register("ingressante")}
                                        onChange={handleIngressanteChange}
                                    />
                                    <span> Sou aluno ingressante (primeiro semestre/ano no curso)</span>
                                </label>
                                <small>Alunos ingressantes podem trancar no máximo 2 disciplinas.</small>
                            </div>

                            {/* Seleção de Período */}
                            <div className="form-group">
                                <label htmlFor="periodo">Período:</label>
                                <select
                                    id="periodo"
                                    value={periodoSelecionado}
                                    onChange={handlePeriodoChange}
                                    required>
                                    <option value="">Selecione o período</option>
                                    {periodosDisponiveis.map(periodo => (
                                        <option key={periodo.value} value={periodo.value}>
                                            {periodo.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Seleção de Disciplinas */}
                            <div className="form-group">
                                <label>Disciplinas:</label>
                                <div className="barra-pesquisa">
                                    <i className="bi bi-search icone-pesquisa"></i>
                                    <input
                                        type="text"
                                        placeholder="Buscar disciplinas..."
                                        value={filtroDisciplina}
                                        onChange={(e) => setFiltroDisciplina(e.target.value)}
                                        className="input-pesquisa"
                                        disabled={isLoadingDisciplinas || todasDisciplinas.length === 0}
                                        style={{ paddingLeft: '30px', height: '38px' }} 
                                    />
                                </div>
                                  {isLoadingDisciplinas ? (
                                    <p>Carregando disciplinas...</p>
                                ) : (
                                    <>
                                        {erroBuscaDisciplinas ? (
                                            <div className="erro">{erroBuscaDisciplinas}</div>
                                        ) : (
                                            <>
                                                {disciplinasFiltradas.length > 0 ? (
                                                    <div className="disciplina-selection-box">
                                                        {disciplinasFiltradas.map((disciplina) => (
                                                            <div 
                                                                key={disciplina.codigo}
                                                                className={`disciplina-option ${disciplinasSelecionadas.some(d => d.codigo === disciplina.codigo) ? 'selected' : ''}`}
                                                                onClick={() => selecionarDisciplina(disciplina)}
                                                            >
                                                                {disciplina.nome} ({disciplina.codigo})
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="aviso">
                                                        {todasDisciplinas.length === 0 
                                                            ? "Selecione um período para ver as disciplinas disponíveis." 
                                                            : "Nenhuma disciplina encontrada com o filtro aplicado."}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>

                                {/* ÁREA DE DISCIPLINAS SELECIONADAS */}
                                 <div className="form-group">
                                    <label>Disciplinas Selecionadas:</label>
                                    {disciplinasSelecionadas.length > 0 ? (
                                        <div className="disciplinas-selecionadas-container">
                                            {disciplinasSelecionadas.map((disciplina) => (
                                                <div key={disciplina.codigo} className="selected-disciplina-box">
                                                    {disciplina.nome} ({disciplina.codigo})
                                                    <button
                                                        type="button"
                                                        onClick={() => removerDisciplina(disciplina.codigo)}
                                                        className="remove-btn"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="aviso">Nenhuma disciplina selecionada.</div>
                                    )}
                                    {mensagemErro && <div className="erro">{mensagemErro}</div>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="motivo_solicitacao">Justificativa:</label>
                                    <textarea
                                        id="motivo_solicitacao"
                                        {...register("motivo_solicitacao", { 
                                            required: "Justificativa é obrigatória",
                                            minLength: {
                                                value: 20,
                                                message: "Mínimo 20 caracteres"
                                            }
                                        })}
                                        rows="5"
                                    />
                                    {errors.motivo_solicitacao && (
                                        <span className="erro">{errors.motivo_solicitacao.message}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="arquivos">Anexos (opcional):</label>
                                    <input
                                        type="file"
                                        id="arquivos"
                                        {...register("arquivos")}
                                        multiple
                                    />
                                </div>
                   
                            </div>

                            <BotaoEnviarSolicitacao isSubmitting={isSubmitting}/>

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
