import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import BuscaUsuario from "../../../components/busca_usuario";
import "../../../components/formulario.css";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
import { getAuthToken, logout } from "../../../services/authUtils"; //para puxar do Google Redirect Handler

import { toast } from "react-toastify";

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

    const [disciplinasFiltradas, setDisciplinasFiltradas] = useState([]);
    const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState({}); // Para checkboxes de disciplinas
    const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);
    const [erroBuscaDisciplinas, setErroBuscaDisciplinas] = useState("");

    const [periodoCalculado, setPeriodoCalculado] = useState(""); // Período de afastamento em dias

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
        console.log("--- DEBUG DISCIPLINAS ---"); //
        console.log("Estado 'aluno':", aluno); //
        console.log("PPC Código (aluno?.ppc_codigo):", aluno?.ppc_codigo); // CORREÇÃO AQUI
        console.log("Período Selecionado:", periodoSelecionado); //

        if (!ppcCodigo || !periodo) {
            console.log("Não buscou disciplinas: PPC ou Período ausente/inválido para buscarDisciplinas."); //
            setDisciplinasFiltradas([]);
            setErroBuscaDisciplinas("Selecione um período para carregar as disciplinas.");
            return;
        }

        setIsLoadingDisciplinas(true);
        setErroBuscaDisciplinas("");

        try {
            console.log(`Buscando disciplinas para PPC: ${ppcCodigo} e Período: ${periodo}`);
            const token = getAuthToken(); //Alterado
            const res = await axios.get(
                `http://localhost:8000/solicitacoes/disciplinas_por_ppc_e_periodo/?ppc_codigo=${ppcCodigo}&periodo=${periodo}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Disciplinas encontradas:", res.data.disciplinas);
            setDisciplinasFiltradas(res.data.disciplinas);
        } catch (error) {
            console.error("Erro ao buscar disciplinas:", error.response?.data || error.message);
            setErroBuscaDisciplinas("Erro ao buscar disciplinas. Verifique o período selecionado ou a conexão.");
            setDisciplinasFiltradas([]);
        } finally {
            setIsLoadingDisciplinas(false);
        }
    }, [aluno, periodoSelecionado]); // Dependências: aluno (para o log), periodoSelecionado. `buscarDisciplinas` é agora a função que usa esses valores.

    // useEffect para carregar disciplinas automaticamente quando o período ou PPC do aluno mudam
    useEffect(() => {
        // Só busca disciplinas se já tiver o ppc_codigo do aluno E um período válido selecionado
        if (aluno?.ppc_codigo && periodoSelecionado) { // CORREÇÃO AQUI: aluno já é o grupo_detalhes
            buscarDisciplinas(aluno.ppc_codigo, periodoSelecionado); //
        } else {
            setDisciplinasFiltradas([]); // Limpar disciplinas se não houver PPC ou período
        }
    }, [aluno, periodoSelecionado, buscarDisciplinas]); 

    // Manipular seleção do dropdown de período
    const handlePeriodoChange = (e) => {
        const periodo = e.target.value;
        setPeriodoSelecionado(periodo);
        setDisciplinasSelecionadas({}); // Limpar disciplinas selecionadas ao mudar o período
    };

    // Manipular seleção de checkboxes de disciplinas (mantido)
    const handleDisciplinaChange = (event) => {
        const { name, checked } = event.target;
        setDisciplinasSelecionadas(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    // Enviar formulário (ajustado para usar IDs corretos do aluno e formato de payload)
    const onSubmit = async (data) => {
        console.log("Dados do formulário para envio:", data);

        const disciplinasSelecionadasArray = Object.keys(disciplinasSelecionadas).filter(k => disciplinasSelecionadas[k]);
        if (disciplinasSelecionadasArray.length === 0) {
            setMsgErro("Por favor, selecione pelo menos uma disciplina.");
            setTipoErro("erro");
            setFeedbackIsOpen(true);
            return;
        }

        if (!aluno?.id) {
            setMsgErro("Dados do aluno não carregados. Tente novamente.");
            setTipoErro("erro");
            setFeedbackIsOpen(true);
            return;
        }

        try {
            const payload = {
                aluno: aluno.id,
                motivo_solicitacao: data.motivo_solicitacao,
                data_inicio_afastamento: data.data_inicio_afastamento,
                data_fim_afastamento: data.data_fim_afastamento,
                documento_apresentado: data.documento_apresentado,
                periodo: periodoSelecionado,
                curso: data.curso_id, // CORREÇÃO AQUI: Enviando o ID do curso
                outro_motivo: data.motivo_solicitacao === "outro" ? data.outro_motivo : undefined,
                outro_documento: data.documento_apresentado === "outro" ? data.outro_documento : undefined,
                consegue_realizar_atividades: data.consegue_realizar_atividades, // Campo obrigatório
                disciplinas: disciplinasSelecionadasArray,
            };
            console.log("Payload FINAL para envio (Verifique 'aluno' e 'curso'):", payload); // DEBUG: Veja o que está sendo enviado!

            const token = getAuthToken(); //Alterado

            const response = await axios.post(
                "http://localhost:8000/solicitacoes/formulario_exerc_dom/",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (data.anexos && data.anexos.length > 0) {
                const formId = response.data.id;
                const anexoFormData = new FormData();
                for (let i = 0; i < data.anexos.length; i++) {
                    anexoFormData.append("anexos", data.anexos[i]);
                }
                anexoFormData.append("solicitacao_id", formId);

                try {
                    await axios.post(
                        "http://localhost:8000/solicitacoes/anexos/",
                        anexoFormData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "multipart/form-data",
                            },
                        }
                    );
                    toast.success("Anexos enviados com sucesso!");
                } catch (anexoError) {
                    console.error("Erro ao enviar anexos:", anexoError.response?.data || anexoError.message);
                    toast.warn("Formulário enviado, mas houve erro ao anexar documentos.");
                }
            }

            console.log("Resposta da API (sucesso):", response.data);
            setMsgErro("Solicitação enviada com sucesso!");
            setTipoErro("sucesso");
            setFeedbackIsOpen(true);

            reset();
            setDisciplinasSelecionadas({});
            setDisciplinasFiltradas([]);
            setPeriodoSelecionado("");
            setPeriodosDisponiveis([]);
            setAluno(null); // Limpar estado do aluno para forçar nova busca se necessário

            setTimeout(() => navigate('/minhas-solicitacoes'), 2000);

        } catch (error) {
            console.error("Erro ao enviar solicitação:", error.response?.data || error.message);
            setMsgErro(error.response?.data?.message || "Erro ao enviar solicitação. Tente novamente.");
            setTipoErro("erro");
            setFeedbackIsOpen(true);
        }
    };

    if (carregandoUsuario) {
        return (
            <>
                <BuscaUsuario dadosUsuario={handleUsuario} />
                <HeaderAluno />
                <main className="container">
                    <p>Carregando usuário...</p>
                </main>
                <Footer />
            </>
        );
    }

    if (userData && alunoNaoEncontrado) {
        return (
            <div className="page-container">
                <HeaderAluno onLogout={() => {
                    logout(); // Chama a função do authUtils para remover os cookies
                    setUserData(null); // Limpa o estado local para forçar o redirecionamento
                    navigate("/"); // Redireciona para a página inicial ou de login
                }}
                />
                <main className="container">
                    <h2>Aluno não encontrado no sistema.</h2>
                    <p>Verifique se o e-mail está corretamente vinculado a um aluno.</p>
                </main>
                <Footer />
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
            <HeaderAluno onLogout={() => setUserData(null)} />
            <main className="container">
                 <h2>Solicitação de Exercícios Domiciliares</h2>
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

                    <form onSubmit={handleSubmit(onSubmit)} className="formulario">
            

                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="email">E-mail:</label>
                            <input type="email" id="email" readOnly {...register("email")} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="nome_completo">Nome Completo:</label>
                            <input type="text" id="nome_completo" readOnly {...register("nome_completo")} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="matricula">Matrícula:</label>
                            <input type="text" id="matricula" readOnly {...register("matricula")} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="curso">Curso:</label>
                            <input type="text" id="curso" readOnly {...register("curso")} />
                            {/* Campo oculto para o ID do curso */}
                            <input type="hidden" {...register("curso_id")} /> {/* */}
                            {/* Campos ocultos para códigos de aluno e PPC */}
                            <input type="hidden" {...register("aluno_id")} />
                            <input type="hidden" {...register("curso_codigo")} />
                            <input type="hidden" {...register("ppc_codigo")} />
                        </div>
                    </div>

                    {/* Seleção de Período */}
                    <div className="form-section">
                  
                        <div className="form-group">
                            <label htmlFor="periodo">Período:</label>
                            <select
                                id="periodo"
                                {...register("periodo", { required: "Selecione um período." })}
                                onChange={handlePeriodoChange}
                                value={periodoSelecionado}
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
                                    <div key={disciplina.codigo} className="disciplina-checkbox"> {/* */}
                                        <input
                                            type="checkbox"
                                            id={`disciplina-${disciplina.codigo}`}
                                            name={disciplina.codigo}
                                            checked={!!disciplinasSelecionadas[disciplina.codigo]}
                                            onChange={handleDisciplinaChange}
                                        />
                                        <label htmlFor={`disciplina-${disciplina.codigo}`}>
                                            {disciplina.nome} ({disciplina.codigo})
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Nenhuma disciplina encontrada para este período. Selecione um período acima.</p>
                        )}
                        {Object.keys(disciplinasSelecionadas).filter(k => disciplinasSelecionadas[k]).length === 0 && (
                            <span className="error-text">Selecione pelo menos uma disciplina.</span>
                        )}
                    </div>

                     {/* Motivo da solicitação */}
                        <div className="form-group">
                          <label htmlFor="motivo_solicitacao">
                            Motivo da solicitação:
                          </label>
                          <select
                            id="motivo_solicitacao"
                            {...register("motivo_solicitacao", {
                              required: "Motivo da solicitação é obrigatório",
                            })}>
                            <option value="">Selecione o motivo</option>
                            <option value="saude">
                              Problemas de saúde, conforme inciso I do art. 142 da OD.
                            </option>
                            <option value="maternidade">
                              Licença maternidade, conforme inciso II do art. 142 da OD.
                            </option>
                            <option value="familiar">
                              Acompanhamento de familiar (primeiro grau) com problemas de
                              saúde, inciso III, art. 142 da OD.
                            </option>
                            <option value="aborto_ou_falecimento">
                              Gestantes que sofreram aborto, falecimento do recém-nascido ou
                              natimorto (IV, 142 OD)
                            </option>
                            <option value="adocao">
                              Adoção de criança, conforme inciso V, art. 142 da OD.
                            </option>
                            <option value="conjuge">
                              Licença cônjuge/companheiro de parturiente/puérperas, conforme
                              inciso VI do art. 142 da OD.
                            </option>
                            <option value="outro">Outro</option>
                          </select>
                          {errors.motivo_solicitacao && (
                            <span className="error-text">{errors.motivo_solicitacao.message}</span>
                          )}
                        </div>
                        {/* Outro motivo (condicional) */}
                        {motivoSolicitacao === "outro" && (
                        <div className="form-group">
                          <label htmlFor="outro_motivo">Descreva o outro motivo:</label>
                          <input
                            type="text"
                            id="outro_motivo"
                            {...register("outro_motivo", {
                              required: motivoSolicitacao === "outro" ? "Descreva o outro motivo" : false,
                            })}
                          />
                          {errors.outro_motivo && (
                            <span className="error-text">{errors.outro_motivo.message}</span>
                          )}
                        </div>
                         )}

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
                            <span className="error-text">{errors.documento_apresentado.message}</span>
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
                            <span className="error-text">{errors.outro_documento.message}</span>
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
                                        type="date"
                                        id="data_inicio_afastamento"
                                        {...register("data_inicio_afastamento", { required: "Data inicial é obrigatória." })}
                                    />
                                    {errors.data_inicio_afastamento && <span className="error-text">{errors.data_inicio_afastamento.message}</span>}
                                </div>
                                <div>
                                    <label htmlFor="data_fim_afastamento">Data Final:</label>
                                    <input
                                        type="date"
                                        id="data_fim_afastamento"
                                        {...register("data_fim_afastamento", { required: "Data final é obrigatória." })}
                                    />
                                    {errors.data_fim_afastamento && <span className="error-text">{errors.data_fim_afastamento.message}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="anexos">Anexar documentos comprobatórios (PDF, JPG, PNG):</label>
                            <input
                                type="file"
                                id="anexos"
                                {...register("anexos")}
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            {errors.anexos && <span className="error-text">{errors.anexos.message}</span>}
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

                    <button type="submit" className="submit-button">Enviar Solicitação</button>
                </form>
            </main>
            <Footer />
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