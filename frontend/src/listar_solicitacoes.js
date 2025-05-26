import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./components/base/footer";
import HeaderCRE from "./components/base/headers/header_cre";
import PopupConfirmacao from "./components/pop_ups/popup_confirmacao";
import PopupFeedback from "./components/pop_ups/popup_feedback";
import BotaoCadastrar from "./components/UI/botoes/botao_cadastrar";
import BotaoVoltar from "./components/UI/botoes/botao_voltar";
import Paginacao from "./components/UI/paginacao";
import api from "./services/api"; // Seu arquivo de configuração da API

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
  const [loading, setLoading] = useState(true); // Estado para feedback de carregamento

  const carregarSolicitacoes = () => {
    console.log("[ListarSolicitacoes] ➡️ Iniciando requisição para 'todas-solicitacoes'...");
    setLoading(true);
    api
      .get("todas-solicitacoes") // Ex: http://localhost:8000/solicitacoes/todas-solicitacoes/
      .then((res) => {
        console.log("[ListarSolicitacoes] ✅ Resposta da API recebida:", res);
        if (res.data && Array.isArray(res.data)) {
          console.log("[ListarSolicitacoes] Dados das solicitações (array):", res.data);
          setSolicitacoes(res.data);
        } else {
          console.warn("[ListarSolicitacoes] ⚠️ Resposta da API não é um array ou não contém 'data'. Resposta:", res.data);
          setSolicitacoes([]); // Garante que seja um array
        }
      })
      .catch((error) => {
        console.error("[ListarSolicitacoes] ❌ Erro ao buscar solicitações:", error.response || error.message || error);
        setSolicitacoes([]); // Garante que seja um array em caso de erro
      })
      .finally(() => {
        setLoading(false);
        console.log("[ListarSolicitacoes] 🏁 Requisição finalizada.");
      });
  };

  useEffect(() => {
    carregarSolicitacoes();

    if (sessionStorage.getItem("voltarDoCadastro")) {
      // carregarSolicitacoes(); // Já é chamado acima, pode ser redundante se não houver lógica condicional
      sessionStorage.removeItem("voltarDoCadastro");
    }
  }, []);

  const confirmarExclusao = () => {
    console.log(`[ListarSolicitacoes] 🗑️ Tentando excluir solicitação ID: ${idSelecionado}`);
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
        carregarSolicitacoes(); 
      });
  };

  const solicitacoesFiltradas = useMemo(() => {
    console.log("[ListarSolicitacoes] 🔍 Recalculando 'solicitacoesFiltradas'. Filtro:", filtro, "Total de solicitações:", solicitacoes.length);
    const resultadoFiltro = solicitacoes.filter(
      (s) =>
        // Adicionando verificações para evitar erros se os campos forem null/undefined
        (s.tipo && s.tipo.toLowerCase().includes(filtro.toLowerCase())) ||
        (s.status && s.status.toLowerCase().includes(filtro.toLowerCase())) ||
        (s.nome_aluno && s.nome_aluno.toLowerCase().includes(filtro.toLowerCase())) || // Adicionado filtro por nome do aluno
        (s.posse_solicitacao && s.posse_solicitacao.toLowerCase().includes(filtro.toLowerCase())) // Adicionado filtro por posse
    );
    console.log("[ListarSolicitacoes] 📝 'solicitacoesFiltradas' resultado:", resultadoFiltro);
    return resultadoFiltro;
  }, [solicitacoes, filtro]);

  // Log para quando solicitacoesPaginadas mudar
  useEffect(() => {
    console.log("[ListarSolicitacoes] 📄 'solicitacoesPaginadas' atualizado:", solicitacoesPaginadas);
  }, [solicitacoesPaginadas]);


  if (loading) {
    return (
      <div>
        <HeaderCRE />
        <main className="container">
          <p>Carregando solicitações...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <HeaderCRE />
      <main className="container">
        <h2>Solicitações</h2>

        <BotaoCadastrar
          to="/aluno/nova-solicitacao" // Verifique se esta rota está correta para o perfil CRE
          title="Nova Solicitação"
          onClick={() => sessionStorage.setItem("voltarDoCadastro", "1")}
        />

        <div className="barra-pesquisa">
          <i className="bi bi-search icone-pesquisa"></i>
          <input
            type="text"
            placeholder="Buscar por tipo, status, aluno ou posse..."
            value={filtro}
            onChange={(e) => {
              console.log("[ListarSolicitacoes] ⌨️ Filtro alterado para:", e.target.value);
              setFiltro(e.target.value);
              setPaginaAtual(1); // Reseta para a primeira página ao filtrar
            }}
            className="input-pesquisa"
          />
        </div>

        {solicitacoesFiltradas.length === 0 && !loading ? (
          <p className="mensagem-central">Nenhuma solicitação encontrada com os filtros atuais.</p>
        ) : (
          <table className="tabela-cruds tabela-solicitacoes">
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
                      <Link
                        to={`/solicitacoes/${solicitacao.id}`} // Ajuste se a rota de detalhe/edição for diferente
                        title="Detalhar/Editar"
                      >
                        <i className="bi bi-pencil-square icone-editar"></i>
                      </Link>
                      <button
                        onClick={() => {
                          setIdSelecionado(solicitacao.id);
                          setMostrarPopup(true);
                        }}
                        title="Excluir"
                        className="icone-botao"
                      >
                        <i className="bi bi-trash3-fill icone-excluir"></i>
                      </button>
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
          itensPorPagina={5} // Você pode ajustar este número
          onDadosPaginados={setSolicitacoesPaginadas}
        />

        <PopupConfirmacao
          show={mostrarPopup}
          mensagem="Tem certeza que deseja excluir esta solicitação?"
          onConfirm={confirmarExclusao}
          onCancel={() => setMostrarPopup(false)}
        />

        <PopupFeedback
          show={mostrarFeedback}
          mensagem={mensagemPopup}
          tipo={tipoMensagem}
          onClose={() => setMostrarFeedback(false)}
        />

        <BotaoVoltar onClick={() => navigate("/")} />
      </main>
      <Footer />
    </div>
  );
}