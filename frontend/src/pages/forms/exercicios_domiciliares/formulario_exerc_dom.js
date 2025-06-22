import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";

// Components
import BuscaUsuario from "../../../components/busca_usuario.js";
import PopupFeedback from "../../../components/pop_ups/popup_feedback.js";
import BotaoEnviarSolicitacao from '../../../components/UI/botoes/botao_enviar_solicitacao';

//import VerificadorDisponibilidade from "../../../pages/disponibilidade/VerificadorDisponibilidade";
//COLOCAR DEPOIS DE RETURN{/*<VerificadorDisponibilidade tipoFormulario="EXERCICIOSDOMICILIARES"> verifica se a solicitacao está disponivel*/}

import "../../../components/styles/formulario.css";

// Serviços de autenticação
import { getAuthToken } from "../../../services/authUtils.js"; //para puxar do Google Redirect Handler


export default function FormularioExercicioDomiciliar() {
    // React Hook Form
    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
        setError,
        clearErrors,
        reset,
        getValues
    } = useForm();

    const navigate = useNavigate();

    // Referência para controlar busca única do aluno
    const buscouAlunoRef = useRef(false);

     // --- ESTADOS ---
    const [userData, setUserData] = useState(null); // Dados do usuário do Google/localStorage
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);
    const [aluno, setAluno] = useState(null); // Dados completos do aluno do backend
    const [alunoNaoEncontrado, setAlunoNaoEncontrado] = useState(false);

    const [motivos, setMotivos] = useState([]);
    const [isLoadingMotivos, setIsLoadingMotivos] = useState(true);

    // Estados para curso e PPC (PPC é fundamental para a nova busca de disciplinas)
    const [curso, setCurso] = useState(null); // Dados do curso do aluno
    const [ppc, setPpc] = useState(null); // Dados do PPC do aluno

    // Estados para feedback e erros
    const [msgErro, setMsgErro] = useState("");
    const [tipoErro, setTipoErro] = useState("");
    const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);

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

    const [periodoCalculado, setPeriodoCalculado] = useState(""); // Período de afastamento em dias
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Campos observados do formulário
    const motivoSolicitacao = watch("motivo_solicitacao");
    const documentoApresentado = watch("documento_apresentado");
    const dataInicioAfastamento = watch("data_inicio_afastamento");
    const dataFimAfastamento = watch("data_fim_afastamento");

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

    const buscarDadosCurso = useCallback(async (codigoCurso) => {
        if (!codigoCurso) return;
        try {
            console.log("Buscando dados do curso:", codigoCurso);
            const token = getAuthToken(); //Alterado
            const res = await axios.get(`http://localhost:8000/solicitacoes/cursos/${codigoCurso}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Dados do curso:", res.data);
            setCurso(res.data);
            console.log("ID do curso retornado pela API:", res.data?.id);
            setValue("curso", res.data?.nome || ''); // Preencher campo do form
            setValue("curso_id", res.data?.id || ''); // Preencher ID do curso para o payload

            // Lógica para definir os períodos disponíveis baseada no tipo_periodo do curso
            const tipoPeriodoModel = res.data.tipo_periodo; // Ex: 'SEMESTRAL' ou 'ANUAL'
            const periodos = tipoPeriodoModel.toUpperCase() === 'SEMESTRAL'
                ? Array.from({ length: 10 }, (_, i) => ({ value: `${i + 1}º Semestre`, label: `${i + 1}º Semestre` }))
                : Array.from({ length: 5 }, (_, i) => ({ value: `${i + 1}º Ano`, label: `${i + 1}º Ano` }));
            setPeriodosDisponiveis(periodos);

        } catch (error) {
            console.error("Erro ao buscar dados do curso:", error.response?.data || error.message);
            setMsgErro("Erro ao buscar dados do curso.");
            setTipoErro("erro");
            setFeedbackIsOpen(true);
            setCurso(null);
            setPeriodosDisponiveis([]); // Limpar períodos se houver erro
        }
    }, [setValue]); 

    const buscarDadosPpc = useCallback(async (codigoPpc) => {
        if (!codigoPpc) return;
        try {
            console.log("Buscando dados do PPC:", codigoPpc);
            const token = getAuthToken(); //Alterado
            const res = await axios.get(`http://localhost:8000/solicitacoes/ppcs/${codigoPpc}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Dados do PPC:", res.data);
            setPpc(res.data);

            // CORREÇÃO AQUI: aluno já é o grupo_detalhes, acessar direto ano_ingresso
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
            setMsgErro("Erro ao buscar dados do PPC.");
            setTipoErro("erro");
            setFeedbackIsOpen(true);
            setPpc(null);
        }
    }, [aluno, curso, setValue, calcularPeriodoAtualAluno, periodosDisponiveis]);

    // Função para receber dados do usuário de BuscaUsuario (mantido)
    const handleUsuario = useCallback((data) => {
        console.log("BuscaUsuario retornou:", data);
        setUserData(data);
        setCarregandoUsuario(false);
    }, []);

    // Redireciona se não houver usuário (mantido)
    useEffect(() => {
        if (!carregandoUsuario && !userData) {
            navigate("/");
        }
    }, [carregandoUsuario, userData, navigate]);

    useEffect(() => {
        const buscarAluno = async () => {
            if (!userData?.email) {
                return;
            }
            try {
                console.log("Buscando aluno pelo e-mail:", userData.email);
                const token = getAuthToken(); //Alterado
                const res = await axios.get(`http://localhost:8000/solicitacoes/usuarios/buscar-por-email/${userData.email}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data) {
                    const usuarioEncontrado = res.data; 
                    console.log("Usuário encontrado na API:", usuarioEncontrado);

                    // Verifique se o usuário tem um objeto Aluno associado (grupo_detalhes)
                    if (usuarioEncontrado?.grupo_detalhes) {
                        const alunoReal = usuarioEncontrado.grupo_detalhes; 
                        console.log("Objeto Aluno REAL encontrado (grupo_detalhes):", alunoReal);

                        setAluno(alunoReal); 
                        setAlunoNaoEncontrado(false);
                        buscouAlunoRef.current = true; // Definir como true APENAS se o aluno REAL for encontrado

                        setValue("nome_completo", usuarioEncontrado?.nome || userData?.name || ''); 
                        setValue("matricula", alunoReal?.matricula || ''); 
                        setValue("curso", alunoReal?.curso_nome || ''); 
                        setValue("email", usuarioEncontrado?.email || userData?.email || ''); 

                        // Preencher campos ocultos para IDs
                        setValue("aluno_id", alunoReal?.id || ''); 
                        setValue("curso_codigo", alunoReal?.curso_codigo || '');
                        setValue("ppc_codigo", alunoReal?.ppc_codigo || '');

                        if (alunoReal?.curso_codigo) {
                            await buscarDadosCurso(alunoReal.curso_codigo);
                        }
                        if (alunoReal?.ppc_codigo) {
                            await buscarDadosPpc(alunoReal.ppc_codigo);
                        }
                    } else {
                        console.error("Usuário encontrado, mas sem dados de Aluno (grupo_detalhes).");
                        setAlunoNaoEncontrado(true);
                        setMsgErro("Dados de aluno não encontrados para este usuário.");
                        setTipoErro("erro");
                        setFeedbackIsOpen(true);
                        buscouAlunoRef.current = false; // Permitir nova busca se não encontrar grupo_detalhes
                    }
                } else {
                    setAlunoNaoEncontrado(true);
                    setMsgErro("Aluno não encontrado no sistema.");
                    setTipoErro("erro");
                    setFeedbackIsOpen(true);
                    buscouAlunoRef.current = false; // Permitir nova busca
                }
            } catch (err) {
                console.error("Erro ao buscar aluno:", err.response?.data || err.message);
                setAlunoNaoEncontrado(true);
                setMsgErro(err.response?.data?.message || "Erro ao buscar dados do aluno");
                setTipoErro("erro");
                setFeedbackIsOpen(true);
                buscouAlunoRef.current = false; // Permitir nova busca em caso de erro
            }
        };

        if (userData && !buscouAlunoRef.current) {
            buscarAluno();
        }
    }, [userData, setValue, buscarDadosCurso, buscarDadosPpc]);

    // Carregar motivos de exercício domiciliar (mantido)
    useEffect(() => {
        const buscarMotivos = async () => {
            try {
                const token = getAuthToken(); //Alterado
                const res = await axios.get(
                    "http://localhost:8000/solicitacoes/motivo_exercicios/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setMotivos(res.data);
                setIsLoadingMotivos(false);
            } catch (error) {
                console.error("Erro ao buscar motivos de exercício:", error);
                setIsLoadingMotivos(false);
                // Mostrar erro de autenticação para 403
                if (error.response && error.response.status === 403) {
                    setMsgErro("Você não tem permissão para acessar os motivos de solicitação. Verifique sua autenticação.");
                    setTipoErro("erro");
                    setFeedbackIsOpen(true);
                } else {
                    setMsgErro("Erro ao buscar motivos de solicitação.");
                    setTipoErro("erro");
                    setFeedbackIsOpen(true);
                }
            }
        };
        buscarMotivos();
    }, []);

    // Calcular período de afastamento em dias (mantido)
    useEffect(() => {
        if (dataInicioAfastamento && dataFimAfastamento) {
            const inicio = new Date(dataInicioAfastamento);
            const fim = new Date(dataFimAfastamento);

            if (!isNaN(inicio) && !isNaN(fim)) {
                if (fim < inicio) {
                    setPeriodoCalculado("");
                    setError("data_fim_afastamento", {
                        type: "manual",
                        message: "A data final não pode ser antes da inicial."
                    });
                } else {
                    const diffTime = Math.abs(fim - inicio);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    setPeriodoCalculado(`${diffDays} dias`);
                    clearErrors("data_fim_afastamento");
                }
            } else {
                setPeriodoCalculado("");
            }
        } else {
            setPeriodoCalculado("");
        }
    }, [dataInicioAfastamento, dataFimAfastamento, setError, clearErrors]);

    // Função para buscar disciplinas (AGORA USANDO O NOVO ENDPOINT E FILTRANDO POR PPC E PERÍODO)
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
            // Adicionar à lista de selecionadas
            const novasSelecionadas = [...disciplinasSelecionadas, disciplina];
            setDisciplinasSelecionadas(novasSelecionadas);
            
            // Atualizar o campo do formulário com os códigos das disciplinas
            const codigosDisciplinas = novasSelecionadas.map(d => d.codigo);
            setValue("disciplinas", codigosDisciplinas);
        }
    };

    // Função para remover uma disciplina selecionada
    const removerDisciplina = (codigo) => {
        const novasSelecionadas = disciplinasSelecionadas.filter(d => d.codigo !== codigo);
        setDisciplinasSelecionadas(novasSelecionadas);
        
        // Atualizar o campo do formulário com os códigos das disciplinas
        const codigosDisciplinas = novasSelecionadas.map(d => d.codigo);
        setValue("disciplinas", codigosDisciplinas);
    };

    // Função para lidar com a mudança no select de período
    const handlePeriodoChange = (e) => {
        const novoPeriodo = e.target.value;
        setPeriodoSelecionado(novoPeriodo);
        setValue("periodo", novoPeriodo);
    };

    // Função para enviar o formulário (PADRONIZADA)
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        
        try {
            // Validação inicial dos dados obrigatórios
            if (!aluno?.id) {
                throw new Error("Dados incompletos do aluno. Recarregue a página e tente novamente.");
            }
            
            if (!data.disciplinas || data.disciplinas.length === 0) {
                setMsgErro("Selecione pelo menos uma disciplina.");
                setTipoErro("erro");
                setFeedbackIsOpen(true);
                setIsSubmitting(false);
                return;
            }
            
            if (!data.motivo_solicitacao || !data.documento_apresentado) {
                setMsgErro("Preencha todos os campos obrigatórios.");
                setTipoErro("erro");
                setFeedbackIsOpen(true);
                setIsSubmitting(false);
                return;
            }
            
            if (!data.data_inicio_afastamento || !data.data_fim_afastamento) {
                setMsgErro("Informe as datas de início e fim do afastamento.");
                setTipoErro("erro");
                setFeedbackIsOpen(true);
                setIsSubmitting(false);
                return;
            }
            
            const formData = new FormData();
            
            // Dados básicos do formulário
            formData.append('motivo_solicitacao', data.motivo_solicitacao);
            formData.append('documento_apresentado', data.documento_apresentado);
            formData.append('data_inicio_afastamento', data.data_inicio_afastamento);
            formData.append('data_fim_afastamento', data.data_fim_afastamento);
            
            // Dados do aluno
            formData.append('aluno_id', aluno.id);
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
            formData.append('tipo_solicitacao', 'EXERCICIOS_DOMICILIARES');
            
            // Arquivos anexos (opcional)
            if (data.anexos && data.anexos.length > 0) {
                Array.from(data.anexos).forEach((file, index) => {
                    formData.append(`arquivo_${index}`, file);
                });
            }
            
            const token = getAuthToken();
            const response = await axios.post(
                "http://localhost:8000/solicitacoes/formularios-exercicios-domiciliares/",
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
            setMsgErro("Solicitação de exercícios domiciliares enviada com sucesso!");
            setTipoErro("sucesso");
            setFeedbackIsOpen(true);
            
            // Redirecionamento com delay
            setTimeout(() => navigate("/aluno/minhas-solicitacoes"), 2000);
            
        } catch (error) {
            console.error("Erro detalhado:", error);
            
            // Tratamento refinado de erros
            const errorMessage = error.response?.data?.detail || 
                                error.response?.data?.message || 
                                error.message || 
                                "Erro desconhecido ao enviar solicitação";
            
            setMsgErro(errorMessage);
            setTipoErro("erro");
            setFeedbackIsOpen(true);
            
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
                {feedbackIsOpen && (
                    <PopupFeedback
                        mensagem={msgErro}
                        tipo={tipoErro}
                        onClose={() => setFeedbackIsOpen(false)}
                    />
                )}
            </div>
        );
    }

    
    // Renderiza o formulário principal
    return (
        <div className="page-container">
            <main className="container">
                <h2>Solicitação de Exercícios Domiciliares</h2>
                <br></br>
                <h6>
                    Conforme o Art. 141. da Organização Didática do IFRS, os Exercícios
                    Domiciliares possibilitam ao estudante realizar atividades em seu
                    domicílio, quando houver impedimento de frequência às aulas por um
                    período superior a 15 (quinze) dias, de acordo com o Decreto 1.044/69
                    e com a Lei 6.202/75, tendo suas faltas abonadas durante o período de
                    afastamento. O atendimento através de Exercício Domiciliar é um
                    processo em que a família e a Instituição devem atuar de forma
                    colaborativa, para que o estudante possa realizar suas atividades sem
                    prejuízo na sua vida acadêmica. A solicitação deverá ser protocolada
                    em até 05 (cinco) dias úteis subsequentes ao início da ausência às
                    atividades letivas.
                </h6>

                    <form onSubmit={handleSubmit(onSubmit)} className="formulario formulario-largura">

                    <div className="dados-aluno-container">
                        <div className="form-group">
                            <label htmlFor="email">E-mail:</label>
                            <input type="email" readOnly {...register("email")} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="nome_completo">Nome Completo:</label>
                            <input type="text"  readOnly {...register("nome_completo")} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="matricula">Matrícula:</label>
                            <input type="text"  readOnly {...register("matricula")} />
                        </div>
                        <div className="form-group">
                            <label>Curso:</label>
                            <input type="text" {...register("curso")} readOnly />
                        </div>
                    </div>

                    {/* Campos ocultos para IDs */}
                    <input type="hidden" {...register("aluno_id")} />
                    <input type="hidden" {...register("curso_id")} />
                    <input type="hidden" {...register("curso_codigo")} />
                    <input type="hidden" {...register("ppc_codigo")} />

                    <div className="form-group">
                        <label htmlFor="motivo_solicitacao">Motivo da Solicitação:</label>
                        <select
                            id="motivo_solicitacao"
                            {...register("motivo_solicitacao", { required: "Selecione um motivo" })}
                        >
                            <option value="">Selecione um motivo</option>
                            {motivos.map((motivo) => (
                                <option key={motivo.id} value={motivo.id}>
                                    {motivo.descricao}
                                </option>
                            ))}
                        </select>
                        {errors.motivo_solicitacao && (
                            <span className="erro">{errors.motivo_solicitacao.message}</span>
                        )}
                    </div>

                    {/* Documento apresentado */}
                        <div className="form-group">
                          <label htmlFor="documento_apresentado">
                            Escolha o tipo de documento para justificar a sua solicitação:
                          </label>
                          <select
                            id="documento_apresentado"
                            {...register("documento_apresentado", {
                              required: "Escolher o tipo de documento é obrigatório",
                            })}
                          >
                            <option value="">Selecione o documento</option>
                            <option value="atestado">Atestado médico</option>
                            <option value="certidao_nascimento">Certidão de nascimento</option>
                            <option value="termo_guarda">Termo judicial de guarda</option>
                            <option value="certidao_obito">Certidão de óbito</option>
                            <option value="justificativa_propria">
                              Justificativa de próprio punho
                            </option>
                            <option value="outro">Outro</option>
                          </select>
                          {errors.documento_apresentado && (
                            <span className="erro">{errors.documento_apresentado.message}</span>
                          )}
                        </div>

                         {/* Outro documento (condicional) */}
                        {documentoApresentado === "outro" && (
                        <div className="form-group">
                          <label htmlFor="outro_documento">Descreva o outro documento:</label>
                          <input
                            type="text"
                            id="outro_documento"
                            {...register("outro_documento", {
                              required: documentoApresentado === "outro" ? "Descreva o outro documento" : false,
                            })}
                          />
                          {errors.outro_documento && (
                            <span className="erro">{errors.outro_documento.message}</span>
                          )}
                        </div>
                        )}
                            {/* Período de Afastamento */}
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="periodo_afastamento_dias">Dias de Afastamento:</label>
                            <input
                                type="text"
                                id="periodo_afastamento_dias"
                                value={periodoCalculado}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <div className="date-inputs">
                                <div>
                                    <label htmlFor="data_inicio_afastamento">Data Inicial:</label>
                                    <input
                                        className="input-data"
                                        type="date"
                                        id="data_inicio_afastamento"
                                        {...register("data_inicio_afastamento", { required: "Data inicial é obrigatória." })}
                                    />
                                    {errors.data_inicio_afastamento && <span className="error-text">{errors.data_inicio_afastamento.message}</span>}
                                </div>
                                <div>
                                    <label htmlFor="data_fim_afastamento">Data Final:</label>
                                    <input
                                        className="input-data"
                                        type="date"
                                        id="data_fim_afastamento"
                                        {...register("data_fim_afastamento", { required: "Data final é obrigatória." })}
                                    />
                                    {errors.data_fim_afastamento && <span className="error-text">{errors.data_fim_afastamento.message}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Seleção de Período */}
                        <div className="form-group">
                            <label htmlFor="periodo">Período:</label>
                            <select
                                id="periodo"
                                value={periodoSelecionado}
                                onChange={handlePeriodoChange}
                                required
                            >
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
                    </div>

                
                        <div className="form-group">
                            <label htmlFor="anexos">Anexos (obrigatório):</label>
                            <input
                                type="file"
                                id="anexos"
                                {...register("anexos", { required: "Anexo é obrigatório" })}
                                multiple
                            />
                            {errors.anexos && (
                                <span className="erro">{errors.anexos.message}</span>
                            )}
                        </div>
                        
                        {/* Campo para consegue_realizar_atividades */}
                        <div className="form-group">
                            <label htmlFor="consegue_realizar_atividades">Declaro que possuo condições de realizar as atividades remotamente durante o período de afastamento.</label>
                            <select
                                id="consegue_realizar_atividades"
                                {...register("consegue_realizar_atividades", { required: "Este campo é obrigatório." })}
                            >
                                <option value="">Selecione</option>
                                <option value={true}>Sim</option>
                                <option value={false}>Não</option>
                            </select>
                            {errors.consegue_realizar_atividades && <span className="error-text">{errors.consegue_realizar_atividades.message}</span>}
                        </div>

                    </div>

                    <BotaoEnviarSolicitacao isSubmitting={isSubmitting}/>

                </form>
            </main>
            {feedbackIsOpen && (
                <PopupFeedback
                    mensagem={msgErro}
                    tipo={tipoErro}
                    onClose={() => setFeedbackIsOpen(false)}
                />
            )}
        </div>
    );
}