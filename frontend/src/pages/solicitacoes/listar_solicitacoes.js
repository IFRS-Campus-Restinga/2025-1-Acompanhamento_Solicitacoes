import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/base/header";
import Footer from "../../components/base/footer";
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";
import Paginacao from "../../components/UI/paginacao";
import api from "../../services/api";

export default function ListarSolicitacoes() {
  console.log(
    "➡️ Fazendo requisição para:",
    api.defaults.baseURL + "todas-solicitacoes"
  );
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

  useEffect(() => {
    api
      .get("todas-solicitacoes")
      .then((res) => {
        console.log("✅ Resposta recebida:", res.data);
        setSolicitacoes(res.data); // <-- Adicione esta linha
      })
      .catch((error) => {
        console.error("❌ Erro ao buscar solicitações:", error);
        // ... resto do catch
      });
  }, []);

  const confirmarExclusao = () => {
    api
      .delete(`todas-solicitacoes/${idSelecionado}/`)
      .then(() => {
        setMensagemPopup("Solicitação excluída com sucesso.");
        setTipoMensagem("sucesso");
        setSolicitacoes(solicitacoes.filter((s) => s.id !== idSelecionado));
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
      <Header />
      <main className="container">
        <h2>Solicitações</h2>

        <BotaoCadastrar to="/solicitacoes/cadastrar" title="Nova Solicitação" />

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

        <table className="tabela-cruds">
          <thead>
            <tr>
              <th>ID</th>
              <th>Aluno</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Data</th>
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
                <td>{solicitacao.data_solicitacao}</td>
                <td>
                  <div className="botoes-acoes">
                    <Link to={`/solicitacoes/${solicitacao.id}`} title="Editar">
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
