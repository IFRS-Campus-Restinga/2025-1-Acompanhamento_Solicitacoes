import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PopupConfirmacao from "./components/pop_ups/popup_confirmacao";
import PopupFeedback from "./components/pop_ups/popup_feedback";
import BotaoDetalhar from "./components/UI/botoes/botao_detalhar";
import BotaoEditar from "./components/UI/botoes/botao_editar";
import BotaoExcluir from "./components/UI/botoes/botao_excluir";
import Paginacao from "./components/UI/paginacao";

import api from "./services/api";

//CSS
import "./components/styles/tabela.css";

export default function ListarSolicitacoes() {
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
  const [loading, setLoading] = useState(true);

  const carregarSolicitacoes = () => {
    console.log("[ListarSolicitacoes] ➡️ Iniciando requisição para 'todas-solicitacoes'...");
    setLoading(true);
    api
      .get("todas-solicitacoes")
      .then((res) => {
        console.log("[ListarSolicitacoes] ✅ Resposta da API recebida:", res);
        if (res.data && Array.isArray(res.data)) {
          console.log("[ListarSolicitacoes] Dados das solicitações (array):", res.data);
          setSolicitacoes(res.data);
        } else {
          console.warn("[ListarSolicitacoes] ⚠️ Resposta da API não é um array ou não contém 'data'. Resposta:", res.data);
          setSolicitacoes([]);
        }
      })
      .catch((error) => {
        console.error("[ListarSolicitacoes] ❌ Erro ao buscar solicitações:", error.response || error.message || error);
        setSolicitacoes([]);
      })
      .finally(() => {
        setLoading(false);
        console.log("[ListarSolicitacoes] 🏁 Requisição finalizada.");
      });
  };

  useEffect(() => {
    carregarSolicitacoes();

    if (sessionStorage.getItem("voltarDoCadastro")) {
      sessionStorage.removeItem("voltarDoCadastro");
    }
  }, []);

  const confirmarExclusao = () => {
    console.log(`[ListarSolicitacoes] 🗑️ Tentando excluir solicitação ID: ${idSelecionado}`);
    api
      .delete(`todas-solicitacoes/${idSelecionado}/`)
      .then(() => {
        setMensagemPopup("Solicitação excluída com sucesso.");
        setTipoMensagem("success"); // Corrigido: usar "success" em vez de "sucesso"
      })
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao excluir solicitação."
          }`
        );
        setTipoMensagem("error"); // Corrigido: usar "error" em vez de "erro"
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setIdSelecionado(null);
        carregarSolicitacoes(); 
      });
  };

  const solicitacoesFiltradas = useMemo(() => {
    console.log("[ListarSolicitacoes] 🔍 Recalculando 'solicitacoesFiltradas'. Filtro:", filtro, "Total de solicitações:", solicitacoes.length);
    const resultadoFiltro = solicitacoes.filter(
      (s) =>
        (s.tipo && s.tipo.toLowerCase().includes(filtro.toLowerCase())) ||
        (s.status && s.status.toLowerCase().includes(filtro.toLowerCase())) ||
        (s.nome_aluno && s.nome_aluno.toLowerCase().includes(filtro.toLowerCase())) ||
        (s.posse_solicitacao && s.posse_solicitacao.toLowerCase().includes(filtro.toLowerCase()))
    );
    console.log("[ListarSolicitacoes] 📝 'solicitacoesFiltradas' resultado:", resultadoFiltro);
    return resultadoFiltro;
  }, [solicitacoes, filtro]);

  useEffect(() => {
    console.log("[ListarSolicitacoes] 📄 'solicitacoesPaginadas' atualizado:", solicitacoesPaginadas);
  }, [solicitacoesPaginadas]);

  if (loading) {
    return (
      <div>
        <main className="container">
          <p>Carregando solicitações...</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <main className="container">
        <h2>Solicitações</h2>

        <div className="barra-pesquisa">
          <i className="bi bi-search icone-pesquisa"></i>
          <input
            type="text"
            placeholder="Buscar por tipo, status, aluno ou posse..."
            value={filtro}
            onChange={(e) => {
              console.log("[ListarSolicitacoes] ⌨️ Filtro alterado para:", e.target.value);
              setFiltro(e.target.value);
              setPaginaAtual(1);
            }}
            className="input-pesquisa"
          />
        </div>

        {solicitacoesFiltradas.length === 0 && !loading ? (
          <p className="mensagem-central">Nenhuma solicitação encontrada com os filtros atuais.</p>
        ) : (
          <table className="tabela-geral tabela-solicitacoes">
            <thead>
              <tr>
                <th>ID</th>
                <th>Aluno</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Data</th>
                <th>Posse</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoesPaginadas.map((solicitacao, index) => (
                <tr
                  key={solicitacao.id}
                  className={index % 2 === 0 ? "linha-par" : "linha-impar"}
                >
                  <td>{solicitacao.id}</td>
                  <td>{solicitacao.nome_aluno || "N/D"}</td>
                  <td>{solicitacao.tipo || "N/D"}</td>
                  <td>{solicitacao.status || "N/D"}</td>
                  <td className="coluna-data">
                    {solicitacao.data_solicitacao 
                      ? new Date(solicitacao.data_solicitacao + 'T00:00:00').toLocaleDateString('pt-BR') 
                      : "N/D"}
                  </td>
                  <td>{solicitacao.posse_solicitacao || "N/D"}</td>
                  <td>
                    <div className="botoes-acoes">
                      <BotaoDetalhar to={`/detalhe-solicitacao/${solicitacao.id}`} />
                      <BotaoDetalhar to={`/aluno/detalhes-solicitacao/${solicitacao.id}`} />
                      <BotaoEditar to={`/solicitacoes/${solicitacao.id}`} />
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
        )}

        <Paginacao
          dados={solicitacoesFiltradas}
          paginaAtual={paginaAtual}
          setPaginaAtual={setPaginaAtual}
          itensPorPagina={5}
          onDadosPaginados={setSolicitacoesPaginadas}
        />

        {/* EXEMPLO CORRIGIDO: Usando actionType="delete" para botão vermelho */}
        <PopupConfirmacao
          show={mostrarPopup}
          mensagem="Tem certeza que deseja excluir esta solicitação?"
          onConfirm={confirmarExclusao}
          onCancel={() => setMostrarPopup(false)}
          confirmLabel="Deletar"
          actionType="delete" // Esta prop faz o botão ficar vermelho
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

/*
EXEMPLOS DE USO DO POPUP CONFIRMAÇÃO CORRIGIDO:

1. Para deletar algo (botão vermelho):
<PopupConfirmacao
  show={mostrarPopup}
  mensagem="Tem certeza que deseja excluir este item?"
  onConfirm={confirmarExclusao}
  onCancel={() => setMostrarPopup(false)}
  confirmLabel="Deletar"
  actionType="delete" // Botão vermelho
/>

2. Para aprovar algo (botão verde):
<PopupConfirmacao
  show={mostrarPopup}
  mensagem="Tem certeza que deseja aprovar este cadastro?"
  onConfirm={confirmarAprovacao}
  onCancel={() => setMostrarPopup(false)}
  confirmLabel="Aprovar"
  actionType="approve" // Botão verde
/>

3. Para rejeitar com justificativa (botão vermelho + campo de texto):
<PopupConfirmacao
  show={mostrarPopup}
  mensagem="Deseja rejeitar este cadastro?"
  onConfirm={confirmarRejeicao}
  onReject={confirmarRejeicao}
  onCancel={() => setMostrarPopup(false)}
  showRejectOption={true}
  confirmLabel="Rejeitar"
  actionType="reject" // Botão vermelho
/>

4. Para ação que precisa de justificativa (qualquer cor):
<PopupConfirmacao
  show={mostrarPopup}
  mensagem="Esta ação requer justificativa"
  onConfirm={confirmarAcao}
  onCancel={() => setMostrarPopup(false)}
  showJustificativa={true}
  confirmLabel="Confirmar"
  actionType="default" // Botão verde padrão
/>

5. Com detalhes do usuário:
<PopupConfirmacao
  show={mostrarPopup}
  mensagem="Confirmar aprovação do usuário?"
  onConfirm={confirmarAprovacao}
  onCancel={() => setMostrarPopup(false)}
  usuarioDetalhes={dadosUsuario}
  confirmLabel="Aprovar"
  actionType="approve"
/>
*/

