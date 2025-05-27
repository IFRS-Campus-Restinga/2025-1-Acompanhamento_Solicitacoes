import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../../components/base/footer";
import HeaderCRE from "../../../components/base/headers/header_cre"; // Mantém o mesmo header
import "../../../components/formulario.css";
import "../../../components/layout-cruds.css";
import "../../../components/tabela-cruds.css";

const SolicitacoesFinalizadas = () => {
    const [solicitacoesFinalizadas, setSolicitacoesFinalizadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Função para formatar a data (opcional, pode ajustar conforme necessário)
    const formatarData = (dataString) => {
        if (!dataString) return "N/A";
        const data = new Date(dataString);
        // Adiciona verificação se a data é válida
        if (isNaN(data.getTime())) {
            return dataString; // Retorna a string original se não for data válida
        }
        // Ajusta para o fuso horário local se necessário, ou mantém UTC
        // Exemplo: return data.toLocaleDateString("pt-BR"); 
        return data.toISOString().split("T")[0]; // Formato YYYY-MM-DD
    };

    return (
        <div>
            <HeaderCRE />
            <main className="container">
                {/* Título da nova página */}
                <h2>Solicitações Finalizadas</h2>

                {/* Botão para voltar para a HomeCRE (opcional, mas útil) */}
                <div style={{ marginBottom: "20px" }}>
                    <Link to="/cre/home" className="btn btn-secondary">Voltar para Todas as Solicitações</Link>
                </div>

                {loading ? (
                    <p>Carregando solicitações...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : solicitacoesFinalizadas.length > 0 ? (
                    <table className="tabela-cruds"> {/* Usa a mesma classe CSS */}
                        <thead>
                            <tr>
                                <th>Tipo de Formulário</th>
                                <th>Aluno</th>
                                {/* Cabeçalho da coluna alterado */}
                                <th>Última Alteração</th> 
                                <th>Status</th>
                                <th>Responsável Final</th> {/* Ajuste semântico opcional */}
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitacoesFinalizadas.map((solicitacao, index) => (
                                <tr key={solicitacao.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                                    <td>{solicitacao.tipo || "N/A"}</td>
                                    <td>{solicitacao.nome_aluno || "N/A"}</td>
                                    {/* Exibe a data formatada. 
                                        Verifique se 'data_solicitacao' é a data correta para "Última Alteração". 
                                        Se houver outro campo como 'data_atualizacao', use-o aqui. */}
                                    <td>{formatarData(solicitacao.data_solicitacao)}</td> 
                                    <td>{solicitacao.status || "N/A"}</td>
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
            </main>
            <Footer />
        </div>
    );
};

export default SolicitacoesFinalizadas;

