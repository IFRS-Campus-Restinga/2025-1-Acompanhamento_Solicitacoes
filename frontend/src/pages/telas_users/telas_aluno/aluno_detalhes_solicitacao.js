import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Components
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";
import Stepper from "../../../components/UI/stepper";

// Bootstrap Icons CSS (caso ainda não esteja incluso globalmente)
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAuthToken } from "../../../services/authUtils";

export default function DetalhesSolicitacao() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [solicitacao, setSolicitacao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = getAuthToken();

    useEffect(() => {
        if (token) {
            fetchSolicitacao();
        }
    }, [id, token])

    const fetchSolicitacao = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/solicitacoes/todas-solicitacoes/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.data) throw new Error("Dados da solicitação não encontrados.");
            setSolicitacao(response.data);
        } catch (err) {
            setError(err.message || "Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleAlterarPrazo = () => {
        // Redireciona para a página de alteração de prazo, passando o ID da solicitação
        navigate(`/exercicios_domiciliares/gerenciar`);
    };

    const formatarData = (dataString) => {
        if (!dataString) return '--/--/---- --:--';
        try {
            const [data, hora] = dataString.split('T');
            const [ano, mes, dia] = data.split('-');
            const [horas, minutos] = hora?.split('.')[0]?.split(':') || [];
            return `${dia}/${mes}/${ano} ${horas || '--'}:${minutos || '--'}`;
        } catch {
            return '--/--/---- --:--';
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <main className="container text-center my-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-3">Carregando detalhes da solicitação...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <main className="container text-center my-5">
                    <div className="alert alert-danger">{error}</div>
                    <button onClick={() => navigate('/aluno/minhas-solicitacoes')} className="btn btn-secondary mt-3">
                        Voltar
                    </button>
                </main>
            </div>
        );
    }

    // Condição para exibir o botão de alterar prazo
    const podeAlterarPrazo = solicitacao &&
                             solicitacao.tipo === "EXERCICIOSDOMICILIARES" &&
                             solicitacao.status === "Aprovado";

    return (
        <div className="page-container">
            <main className="container my-4">
                <div className="mb-4">
                    <h2 className="text-center">Detalhes da Solicitação #{solicitacao.id}</h2>
                </div>

                <div className="container">
                    <Stepper statusAtual={solicitacao.status} />
                </div>
                    
                <div className="card mb-4">
                    <div className="card-body row">
                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-file-earmark-text me-2"></i>Documento Solicitado:</h6>
                            <p>{solicitacao.tipo || 'Não informado'}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-person me-2"></i>Responsável:</h6>
                            <p>{solicitacao.posse_solicitacao || 'Não atribuído'}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-calendar-check me-2"></i>Data da Solicitação:</h6>
                            <p>{formatarData(solicitacao.data_solicitacao)}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-clock-history me-2"></i>Última Atualização:</h6>
                            <p>{formatarData(solicitacao.data_atualizacao)}</p>
                        </div>
                    </div>
                </div>

                <div className="card mb-4">
                    <div className="card-body">
                        <h5><i className="bi bi-chat-left-text me-2"></i>Justificativa</h5>
                        <p>{solicitacao.justificativa || 'Nenhuma justificativa fornecida.'}</p>
                    </div>
                </div>

                {solicitacao.observacoes && (
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5><i className="bi bi-info-circle me-2"></i>Observações</h5>
                            <p>{solicitacao.observacoes}</p>
                        </div>
                    </div>
                )}

                <div className="text-center">
                    {podeAlterarPrazo && (
                        <button className="btn btn-primary me-2" onClick={handleAlterarPrazo}>
                            <i className="bi bi-calendar-range me-2"></i>Alterar Prazo de Afastamento
                        </button>
                    )}
                    <BotaoVoltar onClick={() => navigate("/aluno/minhas-solicitacoes")} />
                </div>
            </main>
        </div>
    );
}