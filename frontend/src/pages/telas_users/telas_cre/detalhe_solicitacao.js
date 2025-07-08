import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

//Components
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";

// POPUPS
import PopupConfirmacao from "../../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";

//CSS - Use o mesmo CSS do aluno ou um específico para CRE
import "../../../components/styles/detalhes.css";

// Mapeamento dos tipos de formulário
const FORM_DETAIL_ENDPOINTS = {
    ABONOFALTAS: "/formulario_abono_falta/",
    TRANCAMENTODISCIPLINA: "/formulario_trancamento_disciplina/",
    TRANCAMENTOMATRICULA: "/formularios-trancamento/",
    DISPENSAEDFISICA: "/dispensa_ed_fisica/",
    DESISTENCIAVAGA: "/form_desistencia_vaga/",
    EXERCICIOSDOMICILIARES: "/form_exercicio_domiciliar/",
    ENTREGACERTIFICADOS: "/form_ativ_compl/",
};

const DetalheSolicitacaoCRE = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [solicitacaoBase, setSolicitacaoBase] = useState(null);
    const [detalhesFormulario, setDetalhesFormulario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para o popup de resposta
    const [mostrarPopup, setMostrarPopup] = useState(false);
    const [mostrarFeedback, setMostrarFeedback] = useState(false);
    const [mensagemPopup, setMensagemPopup] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("success");
    const [tipoAcao, setTipoAcao] = useState(""); // "aprovar", "rejeitar"

    // Função de formatação de data corrigida
    const formatarData = (dataString) => {
        if (!dataString) return '--/--/---- --:--';
        try {
            const [dataPart, horaPart] = dataString.split('T');
            if (!horaPart) {
                const [ano, mes, dia] = dataPart.split('-');
                return `${dia}/${mes}/${ano}`;
            }
            const [ano, mes, dia] = dataPart.split('-');
            const [horaCompleta] = horaPart.split('.');
            const [horas, minutos] = horaCompleta.split(':');
            return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return '--/--/---- --:--';
        }
    };

    // Função para abrir o popup de resposta
    const abrirPopupResposta = () => {
        setTipoAcao("aprovar");
        setMostrarPopup(true);
    };

    // Função unificada para lidar com confirmações
    const handleConfirmacao = (justificativa = null) => {
        if (!solicitacaoBase) return;

        switch (tipoAcao) {
            case "aprovar":
                // Lógica para aprovar solicitação
                console.log("Aprovando solicitação:", id);
                try {
                    // Aqui você colocaria a chamada da API para aprovar
                    // Exemplo: await api.patch(`/solicitacoes/aprovar/${id}/`);
                    
                    setMensagemPopup("Solicitação aprovada com sucesso!");
                    setTipoMensagem("success");
                } catch (err) {
                    setMensagemPopup("Erro ao aprovar solicitação.");
                    setTipoMensagem("error");
                }
                break;

            case "rejeitar":
                // Lógica para rejeitar solicitação com justificativa
                console.log("Rejeitando solicitação:", id, "Justificativa:", justificativa);
                try {
                    // Aqui você colocaria a chamada da API para rejeitar
                    // Exemplo: await api.patch(`/solicitacoes/rejeitar/${id}/`, { justificativa });
                    
                    setMensagemPopup("Solicitação rejeitada com sucesso!");
                    setTipoMensagem("success");
                } catch (err) {
                    setMensagemPopup("Erro ao rejeitar solicitação.");
                    setTipoMensagem("error");
                }
                break;

            default:
                console.error("Tipo de ação não reconhecido:", tipoAcao);
        }

        // Fechar popup e mostrar feedback
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setTipoAcao("");
    };

    // Função para rejeitar solicitação
    const rejeitarSolicitacao = (justificativa) => {
        setTipoAcao("rejeitar");
        handleConfirmacao(justificativa);
    };

    // Função para cancelar popup
    const cancelarPopup = () => {
        setMostrarPopup(false);
        setTipoAcao("");
    };

    useEffect(() => {
        const fetchDetalhes = async () => {
            setLoading(true);
            setError(null);
            try {
                const baseResponse = await axios.get(`http://localhost:8000/solicitacoes/todas-solicitacoes/${id}/`);
                setSolicitacaoBase(baseResponse.data);

                const tipoFormulario = baseResponse.data.nome_formulario;
                const specificEndpointPath = FORM_DETAIL_ENDPOINTS[tipoFormulario];

                if (specificEndpointPath) {
                    try {
                        const detailResponse = await axios.get(`http://localhost:8000/solicitacoes${specificEndpointPath}${id}/`);
                        setDetalhesFormulario(detailResponse.data);
                    } catch (specificError) {
                        setError(`Não foi possível carregar os detalhes específicos do formulário ${tipoFormulario}.`);
                        setDetalhesFormulario({});
                    }
                } else {
                    setDetalhesFormulario({});
                }
            } catch (err) {
                setError("Erro ao carregar os dados da solicitação.");
                setSolicitacaoBase(null);
                setDetalhesFormulario(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetalhes();
    }, [id]);

    // Determina as props do popup baseado no tipo de ação
    const getPopupProps = () => {
        switch (tipoAcao) {
            case "aprovar":
                return {
                    mensagem: "Deseja aprovar ou rejeitar esta solicitação?",
                    confirmLabel: "Aprovar",
                    actionType: "approve",
                    showRejectOption: true,
                    showJustificativa: false
                };
            
            default:
                return {
                    mensagem: "Tem certeza que deseja continuar?",
                    confirmLabel: "Confirmar",
                    actionType: "default",
                    showRejectOption: false,
                    showJustificativa: false
                };
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <main className="container">
                    <div className="loading-spinner">
                        <p>Carregando detalhes da solicitação...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error && !solicitacaoBase) {
        return (
            <div className="page-container">
                <main className="container">
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => navigate("/cre/solicitacoes")} className="btn-voltar">
                            Voltar
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const popupProps = getPopupProps();

    return (
        <div className="page-container">
            <main className="container detalhes-container">
                <div className="detalhes-header">
                    <h2>Detalhes da Solicitação #{id}</h2>
                    {solicitacaoBase?.status && (
                        <span className={`status-badge ${solicitacaoBase.status.toLowerCase().replace(' ', '-')}`}>
                            {solicitacaoBase.status}
                        </span>
                    )}
                </div>

                {error && <div className="alert alert-warning">{error}</div>}

                {/* Seção de Informações Gerais */}
                <div className="detalhes-section">
                    <h3>Informações Básicas</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Tipo de Solicitação:</label>
                            <p>{solicitacaoBase?.nome_formulario || 'Não informado'}</p>
                        </div>
                        <div className="info-item">
                            <label>Aluno:</label>
                            <p>{solicitacaoBase?.nome_aluno || 'Não informado'}</p>
                        </div>
                        <div className="info-item">
                            <label>Data da Solicitação:</label>
                            <p>{formatarData(solicitacaoBase?.data_solicitacao)}</p>
                        </div>
                        <div className="info-item">
                            <label>Status:</label>
                            <p>{solicitacaoBase?.status || 'Não informado'}</p>
                        </div>
                         <div className="info-item">
                            <label>Responsável:</label>
                            <p>{solicitacaoBase?.posse_solicitacao || 'Não atribuído'}</p>
                        </div>
                        <div className="info-item">
                            <label>Data de Emissão:</label>
                            <p>{formatarData(solicitacaoBase?.data_emissao) || '--/--/----'}</p>
                        </div>
                    </div>
                </div>

                {/* Seção de Detalhes Específicos */}
                {detalhesFormulario && Object.keys(detalhesFormulario).length > 0 && (
                    <div className="detalhes-section">
                        <h3>Detalhes do Formulário</h3>
                        <div className="info-grid">
                            {Object.entries(detalhesFormulario)
                                .filter(([key]) => !['id', 'solicitacao'].includes(key))
                                .map(([key, value]) => (
                                    <div key={key} className="info-item">
                                        <label>{key.replace(/_/g, ' ').toUpperCase()}:</label>
                                        <p>
                                            {Array.isArray(value) 
                                                ? value.join(', ') 
                                                : (typeof value === 'object' 
                                                    ? JSON.stringify(value) 
                                                    : String(value))}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
                
                {/* Seção de botões */}
                <div className="botoes-acoes-detalhes">
                    <BotaoVoltar onClick={() => navigate("/cre/solicitacoes")} />
                    
                    <button 
                        onClick={abrirPopupResposta}
                        className="btn btn-responder"
                        title="Responder Solicitação"
                    >
                        Responder
                    </button>
                </div>

                {/* Popup Simplificado */}
                <PopupConfirmacao
                    show={mostrarPopup}
                    mensagem={popupProps.mensagem}
                    onConfirm={handleConfirmacao}
                    onReject={rejeitarSolicitacao}
                    onCancel={cancelarPopup}
                    showRejectOption={popupProps.showRejectOption}
                    confirmLabel={popupProps.confirmLabel}
                    actionType={popupProps.actionType}
                    showJustificativa={popupProps.showJustificativa}
                />

                {/* Popup de Feedback */}
                <PopupFeedback
                    show={mostrarFeedback}
                    mensagem={mensagemPopup}
                    tipo={tipoMensagem}
                    onClose={() => setMostrarFeedback(false)}
                />
            </main>
        </div>
    );
};

export default DetalheSolicitacaoCRE;

