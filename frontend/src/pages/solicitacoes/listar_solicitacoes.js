import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/base/header";
import Footer from "../../components/base/footer";
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";
import BarraPesquisa from "../../components/UI/barra_pesquisa";
import Paginacao from "../../components/UI/paginacao";
import api from "../../services/api";
import useSolicitacoes from "../../hooks/useSolicitacoes.js";
import useBuscaPaginada from "../../hooks/useBuscaPaginada";

export default function ListarSolicitacoes() {
  const navigate = useNavigate();
  const { solicitacoes, setSolicitacoes, carregando, erro } = useSolicitacoes();

  const {
    filtro,
    setFiltro,
    paginaAtual,
    setPaginaAtual,
    dadosPaginados,
    setDadosPaginados,
    dadosFiltrados,
  } = useBuscaPaginada(solicitacoes);

  const [mostrarPopup, setMostrarPopup] = React.useState(false);
  const [idSelecionado, setIdSelecionado] = React.useState(null);
  const [mostrarFeedback, setMostrarFeedback] = React.useState(false);
  const [mensagemPopup, setMensagemPopup] = React.useState("");
  const [tipoMensagem, setTipoMensagem] = React.useState("sucesso");

  const confirmarExclusao = () => {
    api
      .delete(`todas-solicitacoes/${idSelecionado}/`)
      .then(() => {
        setMensagemPopup("Solicitação excluída com sucesso.");
        setTipoMensagem("sucesso");
        setSolicitacoes((prev) =>
          prev.filter((s) => s.id !== idSelecionado)
        );
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

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Solicitações</h2>

        <BotaoCadastrar to="/nova-solicitacao" title="Nova Solicitação" />

        <BarraPesquisa value={filtro} onChange={(e) => setFiltro(e.target.value)} />

        {carregando ? (
          <p>Carregando solicitações...</p>
        ) : erro ? (
          <p className="erro">Erro ao carregar solicitações.</p>
        ) : (
          <>
            <table className="tabela-cruds">
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
                {dadosPaginados.map((s, index) => (
                  <tr
                    key={s.id}
                    className={index % 2 === 0 ? "linha-par" : "linha-impar"}
                  >
                    <td>{s.id}</td>
                    <td>{s.nome_aluno}</td>
                    <td>{s.tipo}</td>
                    <td>{s.status}</td>
                    <td>{s.data_solicitacao}</td>
                    <td>{s.posse_solicitacao}</td>
                    <td>
                      <div className="botoes-acoes">
                        <Link to={`/solicitacoes/${s.id}`} title="Editar">
                          <i className="bi bi-pencil-square icone-editar"></i>
                        </Link>
                        <button
                          onClick={() => {
                            setIdSelecionado(s.id);
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
              dados={dadosFiltrados}
              paginaAtual={paginaAtual}
              setPaginaAtual={setPaginaAtual}
              itensPorPagina={5}
              onDadosPaginados={setDadosPaginados}
            />
          </>
        )}

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
