import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import { getAuthToken, getGoogleUser } from "../../services/authUtils";

// Importe o CSS do Bootstrap para o modal (se já não estiver globalmente)
import "bootstrap/dist/css/bootstrap.min.css";
// Importe os ícones do Bootstrap (se já não estiver globalmente)
import "bootstrap-icons/font/bootstrap-icons.css";

export default function GerenciarExercDomicilares() {
    const [msgErro, setMsgErro] = useState("");
    const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);
    const [tipoErro, setTipoErro] = useState("");
    const [aluno, setAluno] = useState(null);
    const [alunoNaoEncontrado, setAlunoNaoEncontrado] = useState(false);

    const [userData, setUserData] = useState(null);
    const [carregando, setCarregando] = useState(true);

    const [formulario, setFormulario] = useState(null);

    const [token, setToken] = useState(null);

    // --- Novos estados para o formulário de edição ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [novaDataInicio, setNovaDataInicio] = useState("");
    const [novaDataFim, setNovaDataFim] = useState("");
    const [novoAnexo, setNovoAnexo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Para desabilitar o botão durante o envio

    const buscouAlunoRef = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        setToken(getAuthToken());
    }, []);

    useEffect(() => {
        const handleUsuario = () => {
            const user = getGoogleUser();
            setUserData(user);
            setCarregando(false);
            console.log("Dados do Google User:", user);
        };
        handleUsuario();
    }, []);

    useEffect(() => {
        if (!carregando && !userData) {
            navigate("/");
        }
    }, [carregando, userData, navigate]);

    useEffect(() => {
        const buscarAluno = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/solicitacoes/usuarios/buscar-por-email/${userData.email}/`);
                
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setAluno(res.data[0]);
                } else if (res.data) {
                    setAluno(res.data);
                } else {
                    setAlunoNaoEncontrado(true);
                    setMsgErro("Aluno não encontrado para o e-mail fornecido.");
                    setTipoErro("erro");
                    setFeedbackIsOpen(true);
                    console.error("Dados do aluno não encontrados ou formato inesperado:", res.data);
                }
                console.log("Dados do Aluno obtidos: ", res.data);
            } catch (err) {
                setAlunoNaoEncontrado(true);
                setMsgErro(err.message || "Erro desconhecido ao buscar aluno.");
                setTipoErro("erro");
                setFeedbackIsOpen(true);
                console.error("Erro ao buscar aluno:", err);
            }
        };

        if (userData?.email && !buscouAlunoRef.current) {
            buscouAlunoRef.current = true;
            buscarAluno();
        }
    }, [userData]);

    useEffect(() => {
        const buscarFormulario = async () => {
            if (!token) return; // Garante que o token esteja disponível

            try {
                // Endpoint para buscar o formulário de exercícios domiciliares pelo ID do aluno
                // Conforme discutido, se você tem um `ListAPIView` filtrando por query_param
                // a URL seria `form_exerc_dom/?aluno_id=${aluno.id}`.
                // Se você tem uma `@action` customizada no ViewSet, a URL seria
                // `form_exerc_dom/by-aluno-id/${aluno.id}/`.
                // A URL abaixo assume que você está usando a ação customizada `by-aluno-id`
                // ou que o endpoint /form_exerc_dom/{pk}/ pode ser usado com o ID do aluno
                // se a API for configurada para buscar por aluno.id no PK.
                // Ajuste a URL conforme a sua API:
                const res = await axios.get(`http://localhost:8000/solicitacoes/form_exerc_dom/${aluno.grupo_detalhes.id}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                // Se a API retornar um único objeto diretamente
                setFormulario(res.data[0]);
                // Inicializa os estados do formulário de edição com os dados atuais
                setNovaDataInicio(res.data[0].data_inicio_afastamento.split('T')[0]); // Formato YYYY-MM-DD
                setNovaDataFim(res.data[0].data_fim_afastamento.split('T')[0]); // Formato YYYY-MM-DD

                console.log("Formulário obtido:", res.data);
            } catch (err) {
                setMsgErro(err.response?.data?.message || err.message || "Erro desconhecido ao buscar formulário.");
                setTipoErro("erro");
                setFeedbackIsOpen(true);
                console.error("Erro ao buscar formulário:", err);
                setFormulario(null); // Define como null se não for encontrado ou houver erro
            }
        };
        if (aluno && aluno.id && token) { // Certifique-se que aluno, aluno.id e token existem
            buscarFormulario();
        }
    }, [aluno, token]); // Dependência do token também

    const formatarData = (dataString) => {
        if (!dataString) return '--/--/----';
        try {
            const [data] = dataString.split('T');
            const [ano, mes, dia] = data.split('-');
            return `${dia}/${mes}/${ano}`;
        } catch {
            return '--/--/----';
        }
    };

    // --- Funções para o Modal de Edição ---
    const openEditModal = () => {
        // Preenche o modal com os dados atuais do formulário
        if (formulario) {
            setNovaDataInicio(formulario.data_inicio_afastamento.split('T')[0]);
            setNovaDataFim(formulario.data_fim_afastamento.split('T')[0]);
            setNovoAnexo(null); // Limpa o arquivo selecionado
        }
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setNovoAnexo(null); // Garante que o arquivo seja resetado ao fechar
    };

    const handleFileChange = (e) => {
        setNovoAnexo(e.target.files[0]);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedbackIsOpen(false); // Fecha qualquer feedback anterior

        const formData = new FormData();
        formData.append('data_inicio_afastamento', novaDataInicio);
        formData.append('data_fim_afastamento', novaDataFim);
        if (novoAnexo) {
            formData.append('documento_comprobatorio', novoAnexo);
        }

        try {
            // Envia um PATCH para atualizar parcialmente o formulário
            // A URL deve ser para o detalhe do formulário, usando o ID do formulário
            const res = await axios.patch(`http://localhost:8000/solicitacoes/form_exerc_dom/update/${formulario.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Importante para envio de arquivos
                    'Authorization': `Bearer ${token}`
                }
            });

            setFormulario(res.data); // Atualiza o estado do formulário com os dados mais recentes
            setMsgErro("Período de afastamento atualizado com sucesso!");
            setTipoErro("sucesso");
            setFeedbackIsOpen(true);
            closeEditModal(); // Fecha o modal após o sucesso
        } catch (err) {
            console.error("Erro ao atualizar formulário:", err.response || err);
            setMsgErro(err.response?.data?.detail || err.response?.data?.message || err.message || "Erro ao atualizar período de afastamento.");
            setTipoErro("erro");
            setFeedbackIsOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Carregando usuário
    if (carregando) {
        return (
            <div className="page-container">
                <main className="container text-center my-5">
                    <p>Carregando usuário...</p>
                </main>
            </div>
        );
    }

    // Exibe dados do aluno e formulário
    if (userData && aluno && formulario) {
        return (
            <div className="page-container">
                <main className="container detalhes-container">
                    <div className="card mb-4">
                        <div className="card-body row">
                            <div className="col-md-6 mb-3">
                                <h6><i className="bi bi-person me-2"></i>Solicitante:</h6>
                                <p>{userData.name}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6><i className="bi bi-envelope me-2"></i>Email do solicitante:</h6>
                                <p>{userData.email}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6><i className="bi bi-calendar-check me-2"></i>Data da solicitação:</h6>
                                <p>{formatarData(formulario.data_solicitacao)}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6><i className="bi bi-calendar-range me-2"></i>Período de afastamento:</h6>
                                <p>{formatarData(formulario.data_inicio_afastamento)} - {formatarData(formulario.data_fim_afastamento)}</p>
                            </div>
                            {formulario.documento_comprobatorio && (
                                <div className="col-12 mb-3">
                                    <h6><i className="bi bi-file-earmark-arrow-down me-2"></i>Documento Comprobatório Atual:</h6>
                                    <p>
                                        <a href={formulario.documento_comprobatorio} target="_blank" rel="noopener noreferrer">
                                            Visualizar Documento <i className="bi bi-box-arrow-up-right ms-1"></i>
                                        </a>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center mb-4">
                        <button className="btn btn-primary" onClick={openEditModal}>
                            <i className="bi bi-pencil-square me-2"></i>Editar Período de Afastamento
                        </button>
                    </div>

                    {feedbackIsOpen && (
                        <PopupFeedback
                            mensagem={msgErro}
                            tipo={tipoErro}
                            onClose={() => setFeedbackIsOpen(false)}
                        />
                    )}
                </main>

                {/* Modal de Edição */}
                {isEditModalOpen && (
                    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-labelledby="editPeriodModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="editPeriodModalLabel">Editar Período de Afastamento</h5>
                                    <button type="button" className="btn-close" onClick={closeEditModal} aria-label="Close"></button>
                                </div>
                                <form onSubmit={handleEditSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label htmlFor="novaDataInicio" className="form-label">Nova Data de Início:</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="novaDataInicio"
                                                value={novaDataInicio}
                                                onChange={(e) => setNovaDataInicio(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="novaDataFim" className="form-label">Nova Data de Fim:</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="novaDataFim"
                                                value={novaDataFim}
                                                onChange={(e) => setNovaDataFim(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="novoAnexo" className="form-label">Anexar Nova Comprovação (opcional):</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                id="novoAnexo"
                                                onChange={handleFileChange}
                                            />
                                            <small className="form-text text-muted">Apenas arquivos como PDF, JPG, PNG são aceitos.</small>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {isEditModalOpen && <div className="modal-backdrop fade show"></div>} {/* Para o fundo escuro do modal */}
            </div>
        );
    }

    // Aluno não encontrado
    if (userData && alunoNaoEncontrado) {
        return (
            <div className="page-container">
                <main className="container text-center my-5">
                    <h2 className="text-danger">Aluno não encontrado no sistema.</h2>
                    <p>Verifique se o e-mail Google ({userData.email}) está corretamente vinculado a um aluno no sistema.</p>
                </main>
            </div>
        );
    }

    // Se userData existe, mas aluno ou formulário ainda estão carregando ou não encontrados
    if (userData && (!aluno || !formulario)) {
        return (
            <div className="page-container">
                <main className="container text-center my-5">
                    <div className="spinner-border text-info" role="status" />
                    <p className="mt-3">Buscando dados do aluno e formulário...</p>
                </main>
            </div>
        );
    }

    // Fallback genérico
    return (
        <div className="page-container">
            <main className="container text-center my-5">
                <p>Preparando a página...</p>
            </main>
        </div>
    );
}