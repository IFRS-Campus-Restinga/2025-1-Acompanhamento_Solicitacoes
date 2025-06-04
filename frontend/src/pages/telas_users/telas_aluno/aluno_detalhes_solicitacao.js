import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

//Components
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";

//CSS
import "../../../components/detalhes_solicitacao.css";

export default function DetalhesSolicitacao() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [solicitacao, setSolicitacao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        
        try {
            // Extrai a parte da data e hora separadamente
            const [dataPart, horaPart] = dataString.split('T');
            
            // Para datas sem hora (apenas data)
            if (!horaPart) {
            const [ano, mes, dia] = dataPart.split('-');
            return `${dia}/${mes}/${ano}`;
            }
            
            // Para datas com hora
            const [ano, mes, dia] = dataPart.split('-');
            const [horaCompleta] = horaPart.split('.'); // Remove milissegundos se existirem
            const [horas, minutos] = horaCompleta.split(':');
            
            return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return '--/--/---- --:--';
        }
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
                    <span className={`status-badge ${solicitacao.status.toLowerCase().replace(' ', '-')}`}>
                        {solicitacao.status}
                    </span>
                </div>

                <div className="detalhes-content">
                    <div className="detalhes-section">
                        <h3>Informações Básicas</h3>
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