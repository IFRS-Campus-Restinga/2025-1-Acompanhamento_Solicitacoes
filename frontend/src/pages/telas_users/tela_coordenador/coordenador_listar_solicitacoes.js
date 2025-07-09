import axios from "axios";
import { useEffect, useState } from "react";

//CSS
import "../../../components/styles/tabela.css";

import BotaoDetalhar from "../../../components/UI/botoes/botao_detalhar";
import { getAuthToken } from "../../../services/authUtils";

const ListarSolicitacoesCoordenador = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:8000/solicitacoes/coordenador/listar-solicitacoes/", {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        
        setSolicitacoes(response.data);
      } catch (error) {
        console.error("Erro ao buscar solicitações", error);
        setError("Erro ao carregar solicitações.");
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitacoes();
  }, []);

  const alterarStatus = async (id, novoStatus) => {
    const confirmacao = window.confirm(`Tem certeza que deseja ${novoStatus.toLowerCase()} esta solicitação?`);
    if (!confirmacao) return;

    try {
      const response = await axios.patch(`http://localhost:8000/solicitacoes/atualizar-status/${id}/`, {
        status: novoStatus
      });
      console.log("PATCH response:", response.data);
      setSolicitacoes((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: novoStatus } : s
        )
      );
      alert(`Solicitação ${novoStatus.toLowerCase()} com sucesso!`);
    } catch (error) {
      console.error("Erro ao alterar status:", error.response || error);
      alert("Erro ao alterar status. Verifique o console.");
    }
  };

  return (
    <div>
      <main className="container">
        <h2>Painel da Coordenação</h2>

        {loading ? (
          <p>Carregando solicitações...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : solicitacoes.length > 0 ? (
          <table className="tabela-geral">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Aluno</th>
                <th>Data</th>
                <th>Status</th>
                <th>Responsável</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoes.map((s) => (
                <tr key={s.id}>
                  <td>{s.tipo}</td>
                  <td>{s.nome_aluno}</td>
                  <td>{s.data_solicitacao}</td>
                  <td>{s.status}</td>
                  <td>{s.posse_solicitacao}</td>
                  <td>
                    <div className="botao-olho">
                      <BotaoDetalhar to={`/coordenador/detalhes-solicitacao/${s.id}`} />
                    </div>
                    <button
                      style={{ backgroundColor: "green", color: "white", marginRight: "5px", padding: "5px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      onClick={() => alterarStatus(s.id, "Aprovado")} 
                    >
                      Aprovar
                    </button>
                    <button
                      style={{ backgroundColor: "red", color: "white", padding: "5px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      onClick={() => alterarStatus(s.id, "Reprovado")}
                    >
                      Reprovar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhuma solicitação encontrada.</p>
        )}
      </main>
    </div>
  );
};

export default ListarSolicitacoesCoordenador;
