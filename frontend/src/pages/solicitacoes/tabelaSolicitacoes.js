import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import Paginacao from "../../components/UI/paginacao";
import { getAuthToken, verificarGrupo } from "../../services/authUtils";
import BotaoDetalhar from "../../components/UI/botoes/botao_detalhar";
import "../../components/styles/tabela.css"
import "../../components/styles/telas_users.css"


export default function TabelaSolicitacoes() {

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

    const carregarSolicitacoes = (grupo) => {
    console.log("➡️ Requisitando todas-solicitacoes...");
      api
      .get(grupo === "aluno" ? "/minhas-solicitacoes"
        : grupo === "cre" ? "/cre/listar-solicitacoes"
        : grupo === "coordenador" ? "/coordenador/listar-solicitacoes"
        : grupo === "responsavel" ? "/minhas-solicitacoes" 
        : "/minhas-solicitacoes", {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      .then((res) => {
        console.log("✅ Resposta recebida:", res.data);
        setSolicitacoes(res.data);
      })
      .catch((error) => {
        console.error("❌ Erro ao buscar solicitações:", error);
      });
    
  };

useEffect(() => {
  async function carregarSeGrupoDetectado() {
    const grupoDetectado = await verificarGrupo();
    console.log("🔍 Grupo detectado:", grupoDetectado);

    if (grupoDetectado) {
      carregarSolicitacoes(grupoDetectado);
    }
  }

  carregarSeGrupoDetectado();
}, []);

    const solicitacoesFiltradas = useMemo(
        () =>
          solicitacoes
            .filter((s) => s.tipo !== "Extensão do prazo de afastamento") // <--- ignora esse tipo
            .filter(
              (s) =>
                s.tipo_formulario?.toLowerCase().includes(filtro.toLowerCase()) ||
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
                <p>Nenhuma solicitação encontrada.</p>
    
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
                      <tr key={solicitacao.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
    
                        <td>{solicitacao.tipo_formulario}</td>
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
    
                            <BotaoDetalhar to={`/detalhes-solicitacao/${solicitacao.id}`} />
    
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
  
    
            <PopupFeedback
              show={mostrarFeedback}
              mensagem={mensagemPopup}
              tipo={tipoMensagem}
              onClose={() => setMostrarFeedback(false)}
            />
    
          </main>
        </div>
      );
}