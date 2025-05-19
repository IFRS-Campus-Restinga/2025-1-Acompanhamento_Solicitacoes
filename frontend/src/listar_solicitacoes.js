import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./components/base/footer";
import HeaderCRE from "./components/base/headers/header_cre";
import PopupConfirmacao from "./components/pop_ups/popup_confirmacao";
import PopupFeedback from "./components/pop_ups/popup_feedback";
import BotaoCadastrar from "./components/UI/botoes/botao_cadastrar";
import BotaoVoltar from "./components/UI/botoes/botao_voltar";
import Paginacao from "./components/UI/paginacao";
import api from "./services/api";

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

  return (
    <div>
      <HeaderCRE />
      <main className="container">
        <h2>Solicitações</h2>

        <BotaoCadastrar
          to="/aluno/nova-solicitacao"
          title="Nova Solicitação"
          onClick={() => sessionStorage.setItem("voltarDoCadastro", "1")}
        />

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
                <td>{solicitacao.nome_aluno}</td>
                <td>{solicitacao.tipo}</td>
                <td>{solicitacao.status}</td>
                <td className="coluna-data">
                  {solicitacao.data_solicitacao}
                </td>
                <td>{solicitacao.posse_solicitacao}</td>
                <td>
                  <div className="botoes-acoes">
                    <Link
                      to={`/solicitacoes/${solicitacao.id}`}
                      title="Editar"
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

        <BotaoVoltar onClick={() => navigate("/")} />
      </main>
      <Footer />
    </div>
  );
}
