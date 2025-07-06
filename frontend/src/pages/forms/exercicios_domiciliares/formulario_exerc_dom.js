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

    // Carregar motivos de exercício domiciliar
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
            
            // Limpar disciplinas selecionadas quando mudar o período
            setDisciplinasSelecionadas([]);
            
        } catch (error) {
            console.error("Erro ao buscar disciplinas:", error.response?.data || error.message);
            setTodasDisciplinas([]);
            setDisciplinasFiltradas([]);
            setErroBuscaDisciplinas("Erro ao buscar disciplinas. Tente novamente.");
        } finally {
            setIsLoadingDisciplinas(false);
        }
    }, [aluno, periodoSelecionado]);

    // Efeito para buscar disciplinas quando o período mudar
    useEffect(() => {
        if (periodoSelecionado && aluno?.ppc_codigo) {
            buscarDisciplinas(aluno.ppc_codigo, periodoSelecionado);
        }
    }, [periodoSelecionado, aluno, buscarDisciplinas]);

    // Função para filtrar disciplinas com base no texto de busca
    useEffect(() => {
        if (filtroDisciplina.trim() === "") {
            setDisciplinasFiltradas(todasDisciplinas);
        } else {
            const filtradas = todasDisciplinas.filter(
                (disciplina) =>
                    disciplina.nome.toLowerCase().includes(filtroDisciplina.toLowerCase()) ||
                    disciplina.codigo.toLowerCase().includes(filtroDisciplina.toLowerCase())
            );
            setDisciplinasFiltradas(filtradas);
        }
    }, [filtroDisciplina, todasDisciplinas]);

    // Função para alternar a seleção de uma disciplina
    const toggleDisciplinaSelecionada = (disciplina) => {
        setDisciplinasSelecionadas((prev) => {
            const jaSelecionada = prev.some((d) => d.id === disciplina.id);
            if (jaSelecionada) {
                return prev.filter((d) => d.id !== disciplina.id);
            } else {
                return [...prev, disciplina];
            }
        });
    };

    // Função para remover uma disciplina da seleção
    const removerDisciplinaSelecionada = (id) => {
        setDisciplinasSelecionadas((prev) => prev.filter((d) => d.id !== id));
    };

    // Função para verificar se uma disciplina está selecionada
    const isDisciplinaSelecionada = (id) => {
        return disciplinasSelecionadas.some((d) => d.id === id);
    };

    // Função para lidar com a mudança de período
    const handlePeriodoChange = (e) => {
        const novoPeriodo = e.target.value;
        setPeriodoSelecionado(novoPeriodo);
        setValue("periodo", novoPeriodo);
    };

    // Função para lidar com a mudança no campo de busca de disciplinas
    const handleFiltroDisciplinaChange = (e) => {
        setFiltroDisciplina(e.target.value);
    };

    // Função para validar o formulário antes de enviar
    const validarFormulario = (data) => {
        let temErro = false;

        // Validar motivo de solicitação
        if (!data.motivo_solicitacao) {
            setError("motivo_solicitacao", {
                type: "manual",
                message: "Selecione o motivo da solicitação."
            });
            temErro = true;
        }

        // Validar documento apresentado
        if (!data.documento_apresentado) {
            setError("documento_apresentado", {
                type: "manual",
                message: "Selecione o documento que será apresentado."
            });
            temErro = true;
        }

        // Validar datas
        if (!data.data_inicio_afastamento) {
            setError("data_inicio_afastamento", {
                type: "manual",
                message: "Informe a data de início do afastamento."
            });
            temErro = true;
        }

        if (!data.data_fim_afastamento) {
            setError("data_fim_afastamento", {
                type: "manual",
                message: "Informe a data de fim do afastamento."
            });
            temErro = true;
        }

        // Validar disciplinas selecionadas
        if (disciplinasSelecionadas.length === 0) {
            setErroBuscaDisciplinas("Selecione pelo menos uma disciplina.");
            temErro = true;
        }

        return !temErro;
    };

    // Função para enviar o formulário
    const onSubmit = async (data) => {
        if (!validarFormulario(data)) {
            setMsgErro("Por favor, corrija os erros no formulário antes de enviar.");
            setTipoErro("erro");
            setFeedbackIsOpen(true);
            return;
        }

        setIsSubmitting(true);

        try {
            // Preparar os dados para envio
            const formData = new FormData();

            // Adicionar dados do aluno
            formData.append("aluno_id", data.aluno_id);
            formData.append("aluno_nome", data.nome_completo);
            formData.append("aluno_email", data.email);
            formData.append("matricula", data.matricula);
            formData.append("curso_id", data.curso_id);

            // Adicionar dados da solicitação
            formData.append("motivo_solicitacao", data.motivo_solicitacao);
            formData.append("documento_apresentado", data.documento_apresentado);
            formData.append("data_inicio_afastamento", data.data_inicio_afastamento);
            formData.append("data_fim_afastamento", data.data_fim_afastamento);
            formData.append("periodo", data.periodo);

            // Adicionar disciplinas selecionadas
            const disciplinasIds = disciplinasSelecionadas.map(d => d.id);
            formData.append("disciplinas", JSON.stringify(disciplinasIds));

            // Adicionar anexos se houver
            if (data.anexos && data.anexos.length > 0) {
                for (let i = 0; i < data.anexos.length; i++) {
                    formData.append("anexos", data.anexos[i]);
                }
            }

            // Enviar para a API
            const token = getAuthToken();
            const response = await axios.post(
                "http://localhost:8000/solicitacoes/exercicios_domiciliares/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            console.log("Resposta da API:", response.data);
            setMsgErro("Solicitação enviada com sucesso!");
            setTipoErro("sucesso");
            setFeedbackIsOpen(true);

            // Redirecionar após 2 segundos
            setTimeout(() => {
                navigate("/todas-solicitacoes");
            }, 2000);
        } catch (error) {
            console.error("Erro ao enviar formulário:", error.response?.data || error.message);
            setMsgErro(error.response?.data?.message || "Erro ao enviar solicitação. Tente novamente.");
            setTipoErro("erro");
            setFeedbackIsOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDERIZAÇÃO ---

    // Renderização durante carregamento do usuário
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
    
    // Renderização principal do formulário
    return (
        <div className="page-container">
            <BuscaUsuario dadosUsuario={handleUsuario} />
            <main className="container">
                <h2>Solicitação de Exercícios Domiciliares</h2>
                <br />
                <h6 className="descricao-formulario">
                    Ao preencher este formulário, declaro que os documentos apresentados <strong>são verdadeiros</strong>,
                    e assumo a responsabilidade pelas informações aqui prestadas.
                </h6>

                <form className="formulario formulario-largura" onSubmit={handleSubmit(onSubmit)}>
                    {/* Campos ocultos para IDs */}
                    <input type="hidden" {...register("aluno_id")} />
                    <input type="hidden" {...register("curso_id")} />
                    <input type="hidden" {...register("curso_codigo")} />
                    <input type="hidden" {...register("ppc_codigo")} />

                    {/* Dados do aluno */}
                    <div className="dados-aluno-container">
                        <div className="form-group">
                            <label>E-mail:</label>
                            <input type="email" {...register("email")} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Nome Completo:</label>
                            <input type="text" {...register("nome_completo")} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Matrícula:</label>
                            <input type="text" {...register("matricula")} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Curso:</label>
                            <input type="text" {...register("curso")} readOnly />
                        </div>
                    </div>

                    {/* Motivo da solicitação */}
                    <div className="form-group">
                        <label htmlFor="motivo_solicitacao">Motivo da Solicitação:</label>
                        <select
                            id="motivo_solicitacao"
                            {...register("motivo_solicitacao", { required: "Motivo é obrigatório" })}
                            disabled={isLoadingMotivos}
                        >
                            <option value="">Selecione o motivo</option>
                            {motivos.map(motivo => (
                                <option key={motivo.id} value={motivo.id}>
                                    {motivo.descricao}
                                </option>
                            ))}
                        </select>
                        {errors.motivo_solicitacao && (
                            <span className="error-message">{errors.motivo_solicitacao.message}</span>
                        )}
                    </div>

                    {/* Documento apresentado */}
                    <div className="form-group">
                        <label htmlFor="documento_apresentado">Documento que será apresentado:</label>
                        <select
                            id="documento_apresentado"
                            {...register("documento_apresentado", { required: "Documento é obrigatório" })}
                        >
                            <option value="">Selecione o documento</option>
                            <option value="Atestado médico">Atestado médico</option>
                            <option value="Certidão de nascimento">Certidão de nascimento</option>
                            <option value="Termo judicial de guarda">Termo judicial de guarda</option>
                            <option value="Certidão de óbito">Certidão de óbito</option>
                            <option value="Justificativa de próprio punho">Justificativa de próprio punho</option>
                            <option value="Outro">Outro</option>
                        </select>
                        {errors.documento_apresentado && (
                            <span className="error-message">{errors.documento_apresentado.message}</span>
                        )}
                    </div>

                    {/* Período de afastamento */}
                    <div className="form-group">
                        <label htmlFor="data_inicio_afastamento">Data de início do afastamento:</label>
                        <input
                            type="date"
                            id="data_inicio_afastamento"
                            {...register("data_inicio_afastamento", { required: "Data inicial é obrigatória" })}
                        />
                        {errors.data_inicio_afastamento && (
                            <span className="error-message">{errors.data_inicio_afastamento.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="data_fim_afastamento">Data de fim do afastamento:</label>
                        <input
                            type="date"
                            id="data_fim_afastamento"
                            {...register("data_fim_afastamento", { required: "Data final é obrigatória" })}
                        />
                        {errors.data_fim_afastamento && (
                            <span className="error-message">{errors.data_fim_afastamento.message}</span>
                        )}
                    </div>

                    {periodoCalculado && (
                        <div className="info-box">
                            <p>Período de afastamento: <strong>{periodoCalculado}</strong></p>
                        </div>
                    )}

                    {/* Seleção de período */}
                    <div className="form-group">
                        <label htmlFor="periodo">Período:</label>
                        <select
                            id="periodo"
                            value={periodoSelecionado}
                            onChange={handlePeriodoChange}
                            disabled={periodosDisponiveis.length === 0}
                        >
                            <option value="">Selecione o período</option>
                            {periodosDisponiveis.map((periodo) => (
                                <option key={periodo.value} value={periodo.value}>
                                    {periodo.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Novo sistema de busca e seleção de disciplinas */}
                    <div className="form-group">
                        <label>Disciplinas:</label>
                        
                        {isLoadingDisciplinas ? (
                            <p>Carregando disciplinas...</p>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    placeholder="Buscar disciplina por nome ou código..."
                                    value={filtroDisciplina}
                                    onChange={handleFiltroDisciplinaChange}
                                    className="search-input"
                                />
                                
                                {erroBuscaDisciplinas && (
                                    <span className="error-message">{erroBuscaDisciplinas}</span>
                                )}
                                
                                <div className="disciplina-selection-box">
                                    {disciplinasFiltradas.length > 0 ? (
                                        disciplinasFiltradas.map((disciplina) => (
                                            <div
                                                key={disciplina.id}
                                                className={`disciplina-option ${
                                                    isDisciplinaSelecionada(disciplina.id) ? "selected" : ""
                                                }`}
                                                onClick={() => toggleDisciplinaSelecionada(disciplina)}
                                            >
                                                <strong>{disciplina.codigo}</strong> - {disciplina.nome}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-results">
                                            {filtroDisciplina
                                                ? "Nenhuma disciplina encontrada com esse filtro."
                                                : "Nenhuma disciplina disponível para este período."}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="selected-items-container">
                                    <h4>Disciplinas selecionadas:</h4>
                                    {disciplinasSelecionadas.length > 0 ? (
                                        <div className="disciplinas-selecionadas-container">
                                            {disciplinasSelecionadas.map((disciplina) => (
                                                <div key={disciplina.id} className="selected-disciplina-box">
                                                    <span>
                                                        <strong>{disciplina.codigo}</strong> - {disciplina.nome}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="remove-btn"
                                                        onClick={() => removerDisciplinaSelecionada(disciplina.id)}
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>Nenhuma disciplina selecionada.</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Anexos */}
                    <div className="form-group">
                        <label htmlFor="anexos">Anexos:</label>
                        <input
                            type="file"
                            id="anexos"
                            multiple
                            {...register("anexos")}
                        />
                        <small>Selecione os documentos comprobatórios (opcional).</small>
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