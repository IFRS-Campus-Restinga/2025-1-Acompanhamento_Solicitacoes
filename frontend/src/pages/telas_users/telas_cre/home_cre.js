import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import BotaoDetalhar from "../../../components/UI/botoes/botao_detalhar";
import Paginacao from "../../../components/UI/paginacao";
import "./cre.css";

const HomeCRE = () => {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [solicitacoesPaginadas, setSolicitacoesPaginadas] = useState([]);
    const [filtro, setFiltro] = useState("");

    useEffect(() => {
        const fetchSolicitacoes = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get("http://localhost:8000/solicitacoes/todas-solicitacoes/");
                console.log("Dados recebidos:", response.data);
                // Filtra para NÃO mostrar as finalizadas na tela principal
                const ativas = (response.data || []).filter(
                    solicitacao => solicitacao.status !== "Registrado" && solicitacao.status !== "Cancelado"
                );
                setSolicitacoes(ativas);
            } catch (error) {
                console.error("Erro ao buscar solicitações", error);
                setError("Erro ao carregar solicitações. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchSolicitacoes();
    }, []);


    const solicitacoesFiltradas = useMemo(
        () =>
          solicitacoes.filter(
            (s) =>
              s.tipo?.toLowerCase().includes(filtro.toLowerCase()) ||
              s.status?.toLowerCase().includes(filtro.toLowerCase())
          ),
        [solicitacoes, filtro]
      );
    

    const formatarData = (dataString) => {
        if (!dataString) return '--/--/----';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    return (
        <div>
            <main className="container">
                <h2>Solicitações</h2>

                <div>
                    <Link to="/solicitacoes-finalizadas" className="btn-finalizadas">
                        Ver Solicitações Finalizadas
                    </Link>
                </div>

                {loading ? (
                    <p>Carregando solicitações...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : solicitacoes.length > 0 ? (
                    <table className="tabela-cruds tabela-solicitacoes">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Aluno</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th>Posse</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitacoesPaginadas.map((solicitacao, index) => (
                                <tr key={solicitacao.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                                    <td>{solicitacao.tipo || "N/A"}</td>
                                    <td>{solicitacao.nome_aluno || "N/A"}</td>
                                    <td classname="coluna-data">{formatarData(solicitacao.data_solicitacao)}</td>
                                    <td className="status-badge">{solicitacao.status || "N/A"}</td>
                                    <td>{solicitacao.posse_solicitacao || "N/A"}</td>
                                    <td>
                                        <div className="botao-olho">

                                            <BotaoDetalhar to={`/detalhe-solicitacao/${solicitacao.id}`} />
                                            
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Nenhuma solicitação ativa encontrada.</p> /* Mensagem ajustada */
                )}

                <Paginacao
                    dados={solicitacoesFiltradas}
                    paginaAtual={paginaAtual}
                    setPaginaAtual={setPaginaAtual}
                    itensPorPagina={5}
                    onDadosPaginados={setSolicitacoesPaginadas}
                />
            </main>
        </div>
    );
};

export default HomeCRE;

