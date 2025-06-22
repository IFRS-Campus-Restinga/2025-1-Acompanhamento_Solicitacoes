import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

//COMPONENTS
import PopupConfirmacao from "../../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
import BotaoDetalhar from "../../../components/UI/botoes/botao_detalhar";
import BotaoExcluir from "../../../components/UI/botoes/botao_excluir";
import Paginacao from "../../../components/UI/paginacao";

//CSS
import "../../../components/styles/tabela.css";


const MinhasSolicitacoesAluno = () => {
     const navigate = useNavigate();

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [idSelecionado, setIdSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [solicitacoesPaginadas, setSolicitacoesPaginadas] = useState([]);
  const [filtro, setFiltro] = useState("");

  const carregarSolicitacoes = () => {
    console.log("➡️ Requisitando todas-solicitacoes...");
    api
      .get("todas-solicitacoes")
      .then((res) => {
        console.log("✅ Resposta recebida:", res.data);
        setSolicitacoes(res.data);
      })
      .catch((error) => {
        console.error("❌ Erro ao buscar solicitações:", error);
      });
  };

  useEffect(() => {
    carregarSolicitacoes();

    // Se você usar sessionStorage para controlar retorno de cadastro:
    if (sessionStorage.getItem("voltarDoCadastro")) {
      carregarSolicitacoes();
      sessionStorage.removeItem("voltarDoCadastro");
    }
  }, []);

  const confirmarExclusao = () => {
    api
      .delete(`todas-solicitacoes/${idSelecionado}/`)
      .then(() => {
        setMensagemPopup("Solicitação excluída com sucesso.");
        setTipoMensagem("sucesso");
      })
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao excluir solicitação."
          }`
        );
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setIdSelecionado(null);
        carregarSolicitacoes(); // Recarrega após exclusão
      });
  };

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
        
        try {
          // Extrai apenas a parte da data (ignora o fuso horário)
          const [dataPart] = dataString.split('T');
          const [ano, mes, dia] = dataPart.split('-');
          
          return `${dia}/${mes}/${ano}`;
        } catch (error) {
          console.error('Erro ao formatar data:', error);
          return '--/--/----';
        }
      };

    return (
        <div>
             <main className="container">
                <h2>Solicitações</h2>

                <div className="barra-pesquisa">
                <i className="bi bi-search icone-pesquisa"></i>
                <input
                    type="text"
                    placeholder="Buscar por tipo ou status..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="input-pesquisa"
                />
                </div>

                {solicitacoesFiltradas.length === 0 ? (
                <div className="nenhuma-solicitacao">
                  <p>Nenhuma solicitação realizada.</p>
                
                </div>
              ) : (
                <>

                <table className="tabela-geral tabela-solicitacoes">
                <thead>
                    <tr>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Posse</th>
                    <th>Ações</th>
                    </tr>

                </thead>
                <tbody>
                    {solicitacoesPaginadas.map((solicitacao, index) => (
                    <tr key={solicitacao.id}className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                        
                        <td>{solicitacao.tipo}</td>
                        <td>
                            <span className={`status-badge ${solicitacao.status.toLowerCase().replace(' ', '-')}`}>
                                {solicitacao.status}
                            </span>
                        </td>
                        <td className="coluna-data">
                          {formatarData(solicitacao.data_solicitacao)}
                        </td>
                        <td>{solicitacao.posse_solicitacao}</td>
                        
                        {/*   to={`/solicitacoes/${solicitacao.id}`}  */}
                        <td>
                            <div className="botoes-acoes">

                                <BotaoDetalhar to={`/aluno/detalhes-solicitacao/${solicitacao.id}`} />
          
                                <BotaoExcluir onClick={() => {
                                  setIdSelecionado(solicitacao.id);
                                  setMostrarPopup(true);
                                }} />
                                
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>

                
              </>
            )}

                <Paginacao
                dados={solicitacoesFiltradas}
                paginaAtual={paginaAtual}
                setPaginaAtual={setPaginaAtual}
                itensPorPagina={5}
                onDadosPaginados={setSolicitacoesPaginadas}
                />


                <PopupConfirmacao
                show={mostrarPopup}
                onConfirm={confirmarExclusao}
                onCancel={() => setMostrarPopup(false)}
                />

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

export default MinhasSolicitacoesAluno;
