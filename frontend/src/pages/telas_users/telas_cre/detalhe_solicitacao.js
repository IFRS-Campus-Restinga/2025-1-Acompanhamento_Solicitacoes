import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

//Components
import Footer from "../../../components/base/footer";
import HeaderCRE from "../../../components/base/headers/header_cre";
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";

// POPUPS
import PopupConfirmacao from "../../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";

//CSS - Use o mesmo CSS do aluno ou um específico para CRE
import "../../../components/detalhes_solicitacao.css";
import "../../../components/formulario.css";

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
    const navigate = useNavigate(); // Correção: useNavigate dentro do componente
    const [solicitacaoBase, setSolicitacaoBase] = useState(null);
    const [detalhesFormulario, setDetalhesFormulario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para o popup de resposta
    const [mostrarPopupResponder, setMostrarPopupResponder] = useState(false);
    const [mostrarFeedback, setMostrarFeedback] = useState(false);
    const [mensagemPopup, setMensagemPopup] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("sucesso");

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
    const handleResponderClick = () => {
        setMostrarPopupResponder(true);
    };

    // Função para confirmar resposta
    const confirmarResposta = (resposta) => {
        
        console.log("Resposta enviada:", resposta);
        
        
        try {
            //Colocar o que será feito apos enviar resposta

            setMensagemPopup("Resposta enviada com sucesso!");
            setTipoMensagem("sucesso");
        } catch (err) {
            setMensagemPopup("Erro ao enviar resposta.");
            setTipoMensagem("erro");
        } finally {
            setMostrarPopupResponder(false);
            setMostrarFeedback(true);
        }
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

    if (loading) {
        return (
            <div className="page-container">
                <HeaderCRE />
                <main className="container">
                    <div className="loading-spinner">
                        <p>Carregando detalhes da solicitação...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error && !solicitacaoBase) {
        return (
            <div className="page-container">
                <HeaderCRE />
                <main className="container">
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => navigate("/cre/home")} className="btn-voltar">
                            Voltar
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="page-container">
            <HeaderCRE />
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
                    <BotaoVoltar onClick={() => navigate("/cre/home")} />
                    
                    <button 
                        onClick={handleResponderClick}
                        className="btn btn-responder"
                        title="Responder Solicitação"
                    >
                        Responder
                    </button>
                </div>

                {/* Popup de Confirmação para Resposta */}
                <PopupConfirmacao
                    show={mostrarPopupResponder}
                    mensagem="Deseja aprovar ou rejeitar esta solicitação?"
                    onConfirm={() => confirmarResposta("aprovado")}
                    onReject={(justificativa) => confirmarResposta(`rejeitado: ${justificativa}`)}
                    onCancel={() => setMostrarPopupResponder(false)}
                    showRejectOption={true}
                    confirmLabel="Aprovar"
                />

                {/* Popup de Feedback */}
                <PopupFeedback
                    show={mostrarFeedback}
                    mensagem={mensagemPopup}
                    tipo={tipoMensagem}
                    onClose={() => setMostrarFeedback(false)}
                />
            </main>
            <Footer />
        </div>
    );
};

export default DetalheSolicitacaoCRE;

