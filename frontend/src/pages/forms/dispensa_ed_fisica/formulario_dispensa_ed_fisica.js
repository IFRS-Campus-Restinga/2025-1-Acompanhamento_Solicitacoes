import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../../../services/authUtils";

// Components
import BuscaUsuario from "../../../components/busca_usuario";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
import BotaoEnviarSolicitacao from '../../../components/UI/botoes/botao_enviar_solicitacao';

//CSS
import "../../../components/styles/formulario.css";

//import VerificadorDisponibilidade from "../../../pages/disponibilidade/VerificadorDisponibilidade";
//COLOCAR DEPOIS DE RETURN{/*<VerificadorDisponibilidade tipoFormulario="EXERCICIOSDOMICILIARES"> verifica se a solicitacao está disponivel*/}

export default function FormularioDispensaEdFisica() {
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

    const [motivosDispensa, setMotivosDispensa] = useState([]);
    const [isLoadingMotivos, setIsLoadingMotivos] = useState(true);

    // Estados para curso e PPC
    const [curso, setCurso] = useState(null); // Dados do curso do aluno
    const [ppc, setPpc] = useState(null); // Dados do PPC do aluno

    // Estados para feedback e erros
    const [msgErro, setMsgErro] = useState("");
    const [tipoErro, setTipoErro] = useState("");
    const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- FUNÇÕES DE BUSCA E LÓGICA DO FORMULÁRIO ---

    // Função para receber dados do usuário de BuscaUsuario
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
            setValue("curso", res.data?.nome || '');
            setValue("curso_id", res.data?.id || '');
        } catch (error) {
            console.error("Erro ao buscar dados do curso:", error.response?.data || error.message);
            setMsgErro("Erro ao buscar dados do curso.");
            setTipoErro("erro");
            setFeedbackIsOpen(true);
            setCurso(null);
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
        } catch (error) {
            console.error("Erro ao buscar dados do PPC:", error.response?.data || error.message);
            setMsgErro("Erro ao buscar dados do PPC.");
            setTipoErro("erro");
            setFeedbackIsOpen(true);
            setPpc(null);
        }
    }, []);

    // Busca aluno pelo e-mail quando userData estiver disponível
    useEffect(() => {
        const buscarAluno = async () => {
            if (!userData?.email) {
                return;
            }
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

                    // Verifique se o usuário tem um objeto Aluno associado (grupo_detalhes)
                    if (usuarioEncontrado?.grupo_detalhes) {
                        const alunoReal = usuarioEncontrado.grupo_detalhes;
                        console.log("Objeto Aluno encontrado (grupo_detalhes):", alunoReal);

                        setAluno(alunoReal);
                        setAlunoNaoEncontrado(false);
                        buscouAlunoRef.current = true;

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
                        buscouAlunoRef.current = false;
                    }
                } else {
                    setAlunoNaoEncontrado(true);
                    setMsgErro("Aluno não encontrado no sistema.");
                    setTipoErro("erro");
                    setFeedbackIsOpen(true);
                    buscouAlunoRef.current = false;
                }
            } catch (err) {
                console.error("Erro ao buscar aluno:", err.response?.data || err.message);
                setAlunoNaoEncontrado(true);
                setMsgErro(err.response?.data?.message || "Erro ao buscar dados do aluno");
                setTipoErro("erro");
                setFeedbackIsOpen(true);
                buscouAlunoRef.current = false;
            }
        };

        if (userData && !buscouAlunoRef.current) {
            buscarAluno();
        }
    }, [userData, setValue, buscarDadosCurso, buscarDadosPpc]);

    // Carregar motivos de dispensa de educação física
    useEffect(() => {
        const buscarMotivosDispensa = async () => {
            try {
                const token = getAuthToken();
                const res = await axios.get(
                    "http://localhost:8000/solicitacoes/motivos-dispensa/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setMotivosDispensa(res.data);
                setIsLoadingMotivos(false);
            } catch (error) {
                console.error("Erro ao buscar motivos de dispensa:", error);
                setIsLoadingMotivos(false);
                if (error.response && error.response.status === 403) {
                    setMsgErro("Você não tem permissão para acessar os motivos de dispensa. Verifique sua autenticação.");
                    setTipoErro("erro");
                    setFeedbackIsOpen(true);
                } else {
                    setMsgErro("Erro ao buscar motivos de dispensa.");
                    setTipoErro("erro");
                    setFeedbackIsOpen(true);
                }
            }
        };
        buscarMotivosDispensa();
    }, []);

    // Função para validar o formulário antes de enviar
    const validarFormulario = (data) => {
        let temErro = false;

        // Validar turma
        if (!data.turma) {
            setError("turma", {
                type: "manual",
                message: "Informe a turma."
            });
            temErro = true;
        }

        // Validar ano/semestre de ingresso
        if (!data.ano_semestre_ingresso) {
            setError("ano_semestre_ingresso", {
                type: "manual",
                message: "Informe o ano/semestre de ingresso."
            });
            temErro = true;
        }

        // Validar motivo de solicitação
        if (!data.motivo_solicitacao) {
            setError("motivo_solicitacao", {
                type: "manual",
                message: "Selecione o motivo da solicitação."
            });
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
            formData.append("aluno", data.aluno_id);
            formData.append("turma", data.turma);
            formData.append("ano_semestre_ingresso", data.ano_semestre_ingresso);
            formData.append("motivo_solicitacao", data.motivo_solicitacao);
            
            // Adicionar observações se houver
            if (data.observacoes) {
                formData.append("observacoes", data.observacoes);
            }

            // Adicionar anexos se houver
            if (data.anexos && data.anexos.length > 0) {
                for (let i = 0; i < data.anexos.length; i++) {
                    formData.append("anexos", data.anexos[i]);
                }
            }

            // Enviar para a API
            const token = getAuthToken();
            const response = await axios.post(
                "http://localhost:8000/solicitacoes/form_disp_ed_fisica/",
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

    return (
        <div className="page-container">
            <main className="container">
                <BuscaUsuario dadosUsuario={handleUsuario} />
                <h2>Formulário de Dispensa de Educação Física</h2>
                <br></br>
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
                            {motivosDispensa.map(motivo => (
                                <option key={motivo.id} value={motivo.id}>
                                    {motivo.descricao}
                                </option>
                            ))}
                        </select>
                        {errors.motivo_solicitacao && (
                            <span className="error-message">{errors.motivo_solicitacao.message}</span>
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

            {/* Popup de feedback */}
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
