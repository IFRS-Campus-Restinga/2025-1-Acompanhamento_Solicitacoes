import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";

const SolicitacoesFinalizadas = () => {
    const [solicitacoesFinalizadas, setSolicitacoesFinalizadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSolicitacoes = async () => {
            setLoading(true);
            setError(null);
            try {
                // Busca todas as solicitações (a filtragem será feita no frontend)
                const response = await axios.get("http://localhost:8000/solicitacoes/todas-solicitacoes/");
                const todasSolicitacoes = response.data || [];
                
                // Filtra as solicitações com status "Registrado" ou "Cancelado"
                const finalizadas = todasSolicitacoes.filter(
                    solicitacao => solicitacao.status === "Registrado" || solicitacao.status === "Cancelado"
                );
                
                console.log("Solicitações finalizadas filtradas:", finalizadas);
                setSolicitacoesFinalizadas(finalizadas);

            } catch (error) {
                console.error("Erro ao buscar solicitações", error);
                setError("Erro ao carregar solicitações finalizadas. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchSolicitacoes();
    }, []);

    // Função para formatar a data
    const formatarData = (dataString) => {
        if (!dataString) return '--/--/----';
        const data = new Date(dataString);
        if (isNaN(data.getTime())) {
            return dataString;
        }
        return data.toLocaleDateString('pt-BR');
    };

    return (
        <div>
            <main className="container">
                {/* Título da nova página */}
                <h2>Solicitações Finalizadas</h2>

                {loading ? (
                    <p>Carregando solicitações...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : solicitacoesFinalizadas.length > 0 ? (
                    <table className="tabela-cruds tabela-solicitacoes">
                        <thead>
                            <tr>
                                <th>Tipo de Formulário</th>
                                <th>Aluno</th>
                                <th>Última Alteração</th> 
                                <th>Status</th>
                                <th>Responsável Final</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitacoesFinalizadas.map((solicitacao, index) => (
                                <tr key={solicitacao.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                                    <td>{solicitacao.tipo || "N/A"}</td>
                                    <td>{solicitacao.nome_aluno || "N/A"}</td>
                                    <td classname="coluna-data">{formatarData(solicitacao.data_solicitacao)}</td> 
                                    <td className="status-badge">{solicitacao.status || "N/A"}</td>
                                    <td>{solicitacao.posse_solicitacao || "N/A"}</td>
                                    <td>
                                        <div className="botao-olho"> {/* Mantém o mesmo estilo */}
                                            <Link to={`/detalhe-solicitacao/${solicitacao.id}`} title="Ver detalhes">
                                                <i className="bi bi-eye-fill icone-olho"></i>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Nenhuma solicitação finalizada encontrada.</p>
                )}

                {/* Botão para voltar para a HomeCRE (opcional, mas útil) */}
                <BotaoVoltar onClick={() => navigate("/cre/home")} />
            </main>
        </div>
    );
};

export default SolicitacoesFinalizadas;

