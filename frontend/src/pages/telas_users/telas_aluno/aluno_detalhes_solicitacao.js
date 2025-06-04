import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

//Components
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";

//CSS
import "../../../components/detalhes_solicitacao.css";
import "../telas_aluno/stepper.css"

export default function DetalhesSolicitacao() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [solicitacao, setSolicitacao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    function Stepper() {
        if (solicitacao.status === "Em Análise") {
            return (
                <div className="body-stepper">
                    <ol className="stepper">
                        <li className="active">
                            <i className="bi bi-clock"></i>
                            <span>Em Análise</span>
                        </li>
                        <li>
                            <i className="bi bi-check-circle"></i>
                            <span>Aprovado</span>
                        </li>
                        <li>
                            <i className="bi bi-flag"></i>
                            <span>Concluído</span>
                        </li>
                    </ol>
                </div>

            )
        } else if (solicitacao.status === "Aprovado") {
            <div className="body-stepper">
                    <ol className="stepper">
                        <li>
                            <i className="bi bi-clock"></i>
                            <span>Em Análise</span>
                        </li>
                        <li className="active">
                            <i className="bi bi-check-circle"></i>
                            <span>Aprovado</span>
                        </li>
                        <li>
                            <i className="bi bi-flag"></i>
                            <span>Concluído</span>
                        </li>
                    </ol>
                </div>
        }
    }

    useEffect(() => {
        const fetchSolicitacao = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`http://localhost:8000/solicitacoes/todas-solicitacoes/${id}/`);

                if (!response.data) {
                    throw new Error("Dados da solicitação não encontrados");
                }

                setSolicitacao(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Erro ao buscar detalhes:", error);
                setError(error.message || "Não foi possível carregar os detalhes da solicitação.");
            } finally {
                setLoading(false);
            }
        };

        fetchSolicitacao();
    }, [id]);

    const formatarData = (dataString) => {
        if (!dataString) return '--/--/---- --:--';
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dataString).toLocaleDateString('pt-BR', options);
    };

    const handleVoltar = () => {
        navigate('/aluno/minhas-solicitacoes');
    };

    if (loading) {
        return (
            <div className="page-container">
                <HeaderAluno />
                <main className="container">
                    <div className="loading-spinner">
                        <p>Carregando detalhes da solicitação...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {

        return (
            <div className="page-container">
                <HeaderAluno />
                <main className="container">
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={handleVoltar} className="btn-voltar">
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
            <HeaderAluno />
            <main className="container detalhes-container">
                <div className="detalhes-header">
                    <h2>Detalhes da Solicitação #{solicitacao.id}</h2>
                </div>

                <div className="detalhes-content">
                    <div>
                        <Stepper />
                    </div>

                    <div className="detalhes-section">
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Documento Solicitado:</label>
                                <p>{solicitacao.tipo || 'Não informado'}</p>
                            </div>
                            <div className="info-item">
                                <label>Responsável:</label>
                                <p>{solicitacao.posse_solicitacao || 'Não atribuído'}</p>
                            </div>
                            <div className="info-item">
                                <label>Data da Solicitação:</label>
                                <p>{formatarData(solicitacao.data_solicitacao)}</p>
                            </div>
                            <div className="info-item">
                                <label>Última Atualização:</label>
                                <p>{formatarData(solicitacao.data_atualizacao)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="detalhes-section">
                        <h3>Justificativa</h3>
                        <div className="justificativa-box">
                            <p>{solicitacao.justificativa || 'Nenhuma justificativa fornecida.'}</p>
                        </div>
                    </div>

                    {solicitacao.observacoes && (
                        <div className="detalhes-section">
                            <h3>Observações</h3>
                            <div className="observacoes-box">
                                <p>{solicitacao.observacoes}</p>
                            </div>
                        </div>
                    )}
                </div>

                <BotaoVoltar onClick={() => navigate("/aluno/minhas-solicitacoes")} />
            </main>
            <Footer />
        </div>
    );
}