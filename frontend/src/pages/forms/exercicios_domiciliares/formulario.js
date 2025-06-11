import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import BuscaUsuario from "../../../components/busca_usuario";
import "../../../components/formulario.css";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";

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
    // Movida para cá para que as outras funções a vejam.
    const calcularPeriodoAtualAluno = useCallback((anoIngresso, tipoPeriodo) => {
        if (!anoIngresso || !tipoPeriodo) return '';

        const anoAtual = new Date().getFullYear();
        const mesAtual = new Date().getMonth() + 1; // Mês 1-12

        let periodoNumerico;

        if (tipoPeriodo.toUpperCase() === 'SEMESTRAL') { // Adicionado .toUpperCase() para robustez
            const semestreAtual = (mesAtual >= 1 && mesAtual <= 6) ? 1 : 2;
            if (anoAtual === anoIngresso) {
                periodoNumerico = semestreAtual;
            } else {
                periodoNumerico = (anoAtual - anoIngresso) * 2 + semestreAtual;
            }
            return `${periodoNumerico}º Semestre`;
        } else if (tipoPeriodo.toUpperCase() === 'ANUAL') { // Adicionado .toUpperCase()
            periodoNumerico = anoAtual - anoIngresso + 1;
            return `${periodoNumerico}º Ano`;
        }
        return '';
    }, []); // Não há dependências externas que mudem a lógica desta função


    // **Primeira alteração aqui: Envolver buscarDadosCurso em useCallback**
    const buscarDadosCurso = useCallback(async (codigoCurso) => {
        if (!codigoCurso) return;
        try {
            console.log("Buscando dados do curso:", codigoCurso);
            const token = localStorage.getItem("appToken");
            const res = await axios.get(`http://localhost:8000/solicitacoes/cursos/${codigoCurso}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Dados do curso:", res.data);
            setCurso(res.data);
            setValue("curso", res.data?.nome || ''); // Preencher campo do form

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
    }, [setValue]); // setValue é uma dependência do useCallback, mas é estável pelo React Hook Form


    // **Segunda alteração aqui: Envolver buscarDadosPpc em useCallback**
    const buscarDadosPpc = useCallback(async (codigoPpc) => {
        if (!codigoPpc) return;
        try {
            console.log("Buscando dados do PPC:", codigoPpc);
            const token = localStorage.getItem("appToken");
            const res = await axios.get(`http://localhost:8000/solicitacoes/ppcs/${codigoPpc}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Dados do PPC:", res.data);
            setPpc(res.data);

            // Tentar pré-selecionar o período atual do aluno se houver dados
            // Agora, o tipo_periodo para calcular o periodo atual virá do curso.
            // AQUI ESTÁ UM PONTO DE DECISÃO IMPORTANTE:
            // Se o tipo_periodo para calcular o "periodoSelecionado" vem do `curso` (como pareceu inicialmente),
            // então `aluno` e `curso` precisam ser dependências corretas aqui.
            // Se o tipo_periodo vem do PPC, a lógica de `setPeriodosDisponiveis` e o cálculo do período
            // do aluno devem ser feitos nesta função.
            // Mantive a lógica que você já tinha, que acessa `aluno` e `curso` no contexto deste useCallback.
            if (aluno?.grupo_detalhes?.ano_ingresso && curso?.tipo_periodo) {
                const periodoCalculadoInicial = calcularPeriodoAtualAluno(
                    aluno.grupo_detalhes.ano_ingresso,
                    curso.tipo_periodo // Usando tipo_periodo do curso
                );
                setPeriodoSelecionado(periodoCalculadoInicial);
                setValue("periodo", periodoCalculadoInicial); // Define o valor no React Hook Form
            } else if (periodosDisponiveis.length > 0) { // Se não tiver período calculado, mas tiver disponível
                setPeriodoSelecionado(periodosDisponiveis[0].value);
                setValue("periodo", periodosDisponiveis[0].value);
            }

        } catch (error) {
            console.error("Erro ao buscar dados do PPC:", error.response?.data || error.message);
            setMsgErro("Erro ao buscar dados do PPC.");
            setTipoErro("erro");
            setFeedbackIsOpen(true);
            setPpc(null);
            // setPeriodosDisponiveis([]); // Se o PPC falhar, os períodos podem ter sido definidos pelo curso
        }
    }, [aluno, curso, setValue, calcularPeriodoAtualAluno, periodosDisponiveis]); // Adicionado `aluno`, `curso`, `calcularPeriodoAtualAluno`, `periodosDisponiveis` como dependências

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

    // **Terceira alteração: Array de dependências do useEffect que busca o aluno**
    // Agora `buscarDadosCurso` e `buscarDadosPpc` são funções memoizadas, então podem ser incluídas aqui.
    useEffect(() => {
        const buscarAluno = async () => {
            if (!userData?.email) {
                return;
            }
            try {
                console.log("Buscando aluno pelo e-mail:", userData.email);
                const token = localStorage.getItem("appToken");
                const res = await axios.get(`http://localhost:8000/solicitacoes/usuarios/${userData.email}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data) {
                    const alunoEncontrado = res.data;
                    console.log("Aluno encontrado:", alunoEncontrado);

                    setAluno(alunoEncontrado);
                    setAlunoNaoEncontrado(false);

                    setValue("nome_completo", alunoEncontrado?.nome || userData?.name || '');
                    setValue("matricula", alunoEncontrado?.grupo_detalhes?.matricula || '');
                    setValue("curso", alunoEncontrado?.grupo_detalhes?.curso_nome || '');
                    setValue("email", alunoEncontrado?.email || userData?.email || ''); // Preencher o email também

                    // Preencher campos ocultos para IDs, se necessário no backend
                    setValue("aluno_id", alunoEncontrado?.id || '');
                    setValue("curso_codigo", alunoEncontrado?.grupo_detalhes?.curso_codigo || '');
                    setValue("ppc_codigo", alunoEncontrado?.grupo_detalhes?.ppc_codigo || '');


                    if (alunoEncontrado?.grupo_detalhes?.curso_codigo) {
                        // Chamar `buscarDadosCurso` (que já é useCallback)
                        await buscarDadosCurso(alunoEncontrado.grupo_detalhes.curso_codigo);
                    }
                    if (alunoEncontrado?.grupo_detalhes?.ppc_codigo) {
                        // Chamar `buscarDadosPpc` (que já é useCallback)
                        await buscarDadosPpc(alunoEncontrado.grupo_detalhes.ppc_codigo);
                    }

                } else {
                    setAlunoNaoEncontrado(true);
                    setMsgErro("Aluno não encontrado no sistema.");
                    setTipoErro("erro");
                    setFeedbackIsOpen(true);
                }
            } catch (err) {
                console.error("Erro ao buscar aluno:", err.response?.data || err.message);
                setAlunoNaoEncontrado(true);
                setMsgErro(err.response?.data?.message || "Erro ao buscar dados do aluno");
                setTipoErro("erro");
                setFeedbackIsOpen(true);
            }
        };

        if (userData && !buscouAlunoRef.current) {
            buscouAlunoRef.current = true;
            buscarAluno();
        }
    }, [userData, setValue, buscarDadosCurso, buscarDadosPpc]); // **Aqui é a alteração importante!**


    // Carregar motivos de exercício domiciliar (mantido)
    useEffect(() => {
        const buscarMotivos = async () => {
            try {
                const token = localStorage.getItem("appToken");
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
        if (!ppcCodigo || !periodo) {
            setDisciplinasFiltradas([]);
            return;
        }

        setIsLoadingDisciplinas(true);
        setErroBuscaDisciplinas("");

        try {
            console.log(`Buscando disciplinas para PPC: ${ppcCodigo} e Período: ${periodo}`);
            const token = localStorage.getItem("appToken");
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
    }, []); // Dependências: nenhuma função externa, apenas o estado interno

    // useEffect para carregar disciplinas automaticamente quando o período ou PPC do aluno mudam
    useEffect(() => {
        // Só busca disciplinas se já tiver o ppc_codigo do aluno E um período válido selecionado
        if (aluno?.grupo_detalhes?.ppc_codigo && periodoSelecionado && !isLoadingDisciplinas) {
            buscarDisciplinas(aluno.grupo_detalhes.ppc_codigo, periodoSelecionado);
        }
    }, [aluno, periodoSelecionado, isLoadingDisciplinas, buscarDisciplinas]); // Dependências: aluno, periodoSelecionado, isLoadingDisciplinas, buscarDisciplinas

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
                motivo: data.motivo_solicitacao,
                data_inicio: data.data_inicio_afastamento,
                data_fim: data.data_fim_afastamento,
                documento_apresentado: data.documento_apresentado,
                periodo: periodoSelecionado,

                outro_motivo: data.motivo_solicitacao === "outro" ? data.outro_motivo : undefined,
                outro_documento: data.documento_apresentado === "outro" ? data.outro_documento : undefined,
                consegue_realizar_atividades_remotas: data.consegue_realizar_atividades_remotas,
                disciplinas: disciplinasSelecionadasArray,
            };

            const token = localStorage.getItem("appToken");

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
                <HeaderAluno onLogout={() => setUserData(null)} />
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

    if (userData && aluno) {
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
                        <input type="hidden" {...register("aluno_id")} />
                        <input type="hidden" {...register("curso_codigo")} />
                        <input type="hidden" {...register("ppc_codigo")} />

                        <div className="form-group">
                            <label htmlFor="email">E-mail:</label>
                            <input
                                type="text"
                                id="email"
                                {...register("email")}
                                readOnly
                                style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="nome_completo">Nome Completo:</label>
                            <input
                                type="text"
                                id="nome_completo"
                                {...register("nome_completo")}
                                readOnly
                                style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="matricula">Matrícula:</label>
                            <input
                                type="text"
                                id="matricula"
                                {...register("matricula")}
                                readOnly
                                style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="curso">Curso:</label>
                            <input
                                type="text"
                                id="curso"
                                {...register("curso")}
                                readOnly
                                style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="periodo">Período:</label>
                            <select
                                id="periodo"
                                {...register("periodo", { required: "Período é obrigatório" })}
                                onChange={handlePeriodoChange}
                                value={periodoSelecionado}
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

                        <div className="form-group">
                            <label>Disciplinas do Período:</label>
                            {isLoadingDisciplinas ? (
                                <p>Carregando disciplinas...</p>
                            ) : erroBuscaDisciplinas ? (
                                <p className="error-message">{erroBuscaDisciplinas}</p>
                            ) : disciplinasFiltradas.length > 0 ? (
                                <div className="disciplinas-container">
                                    {disciplinasFiltradas.map((disciplina) => (
                                        <div key={disciplina.codigo} className="disciplina-checkbox">
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
                                !isLoadingDisciplinas && periodoSelecionado &&
                                <p>Nenhuma disciplina encontrada para este período. Selecione um período acima.</p>
                            )}
                            {Object.keys(disciplinasSelecionadas).filter(k => disciplinasSelecionadas[k]).length === 0 &&
                                <span className="error-text">Selecione pelo menos uma disciplina.</span>
                            }
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
                            })}
                          >
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

                        {/* Período de afastamento calculado */}
                        <div className="form-group">
                          <label htmlFor="periodo_afastamento">Período de afastamento (dias):</label>
                          <input
                            type="text"
                            id="periodo_afastamento"
                            value={periodoCalculado}
                            readOnly
                            style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                          />
                        </div>

                        {/* Datas de afastamento */}
                        <fieldset className="periodo-afastamento">
                          <legend>Datas do Afastamento</legend>
                          <div className="datas-container">
                            <div className="form-group">
                              <label htmlFor="data_inicio_afastamento">Data inicial:</label>
                              <input
                                type="date"
                                id="data_inicio_afastamento"
                                {...register("data_inicio_afastamento", { required: "Data inicial é obrigatória" })}
                              />
                              {errors.data_inicio_afastamento && <span className="error-text">{errors.data_inicio_afastamento.message}</span>}
                            </div>
                            <div className="form-group">
                              <label htmlFor="data_fim_afastamento">Data final:</label>
                              <input
                                type="date"
                                id="data_fim_afastamento"
                                {...register("data_fim_afastamento", { required: "Data final é obrigatória" })}
                              />
                              {errors.data_fim_afastamento && <span className="error-text">{errors.data_fim_afastamento.message}</span>}
                            </div>
                          </div>
                        </fieldset>

                        {/* Anexos */}
                        <div className="form-group">
                          <label htmlFor="anexos">Anexar documentos comprobatórios (PDF, JPG, PNG):</label>
                          <input
                            type="file"
                            id="anexos"
                            multiple
                            {...register("anexos")}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </div>


                        {/* Checkbox para atividades remotas */}
                        <div className="form-group checkbox-group">
                          <input
                            type="checkbox"
                            id="consegue_realizar_atividades_remotas"
                            {...register("consegue_realizar_atividades_remotas")}
                          />
                          <label htmlFor="consegue_realizar_atividades_remotas">
                            Declaro que possuo condições de realizar as atividades remotamente durante o período de afastamento.
                          </label>
                        </div>
                        {/* Botão de envio */}
                        <button type="submit" className="btn btn-primary">
                          Enviar solicitação
                        </button>
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
}
