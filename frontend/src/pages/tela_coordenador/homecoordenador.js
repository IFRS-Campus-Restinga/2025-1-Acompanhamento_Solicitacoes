import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/base/header";
import Footer from "../../components/base/footer";
import "../../components/tabela-cruds.css";
import "../../components/layout-cruds.css";

const HomeCoordenador = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:8000/solicitacoes/todas-solicitacoes/");
        const todas = response.data || [];
        
        const solicitacoesCoord = todas.filter(
          (s) => s.posse_solicitacao.toLowerCase() === "coordenação"
        );
        
        setSolicitacoes(solicitacoesCoord);
      } catch (error) {
        console.error("Erro ao buscar solicitações", error);
        setError("Erro ao carregar solicitações.");
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitacoes();
  }, []);

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Painel da Coordenação</h2>

        {loading ? (
          <p>Carregando solicitações...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : solicitacoes.length > 0 ? (
          <table className="tabela-cruds">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Aluno</th>
                <th>Data</th>
                <th>Status</th>
                <th>Responsável</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhuma solicitação encontrada.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HomeCoordenador;
