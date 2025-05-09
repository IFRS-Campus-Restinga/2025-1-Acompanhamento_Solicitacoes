import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import Paginacao from "../../components/UI/paginacao";
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

export default function ListarPpc() {
  const navigate = useNavigate();
  const [ppcs, setPpcs] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [ppcSelecionado, setPpcSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ppcsPaginados, setPpcsPaginados] = useState([]);

  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/ppcs/")
      .then((res) => setPpcs(res.data))
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao carregar PPCs."
          }`
        );
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios
      .delete(`http://localhost:8000/solicitacoes/ppcs/${ppcSelecionado}/`)
      .then(() => {
        setMensagemPopup("PPC excluído com sucesso.");
        setTipoMensagem("sucesso");
        setPpcs(ppcs.filter((p) => p.codigo !== ppcSelecionado));
      })
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${
            err.response?.data?.detail || "Erro ao excluir PPC."
          }`
        );
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setPpcSelecionado(null);
      });
  };

  const ppcsFiltrados = useMemo(() => 
    ppcs.filter(ppc =>
      ppc.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
      (ppc.curso && ppc.curso.toLowerCase().includes(filtro.toLowerCase()))
    ), 
    [ppcs, filtro]
  );
  

  return (
    <div>
      <Header />
      <main className="container">
        <h2>PPCs</h2>

        <BotaoCadastrar to="/ppcs/cadastrar" title="Criar Novo PPC" />

        <div className="barra-pesquisa">
          <i className="bi bi-search icone-pesquisa"></i>
          <input
            type="text"
            placeholder="Buscar por código ou curso..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-pesquisa"
          />
        </div>

        <table className="tabela-cruds">
          <thead>
            <tr>
              <th>Código</th>
              <th>Curso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ppcsPaginados.map((ppc, index) => (
              <tr key={ppc.codigo} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                <td>{ppc.codigo}</td>
                <td>{ppc.curso.nome}</td>
                <td>
                  <div className="botoes-acoes">
                    <Link to={`/ppcs/${encodeURIComponent(ppc.codigo)}`} title="Editar">
                      <i className="bi bi-pencil-square icone-editar"></i>
                    </Link>
                    <button
                      onClick={() => {
                        setPpcSelecionado(ppc.codigo);
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
          dados={ppcsFiltrados}
          paginaAtual={paginaAtual}
          setPaginaAtual={setPaginaAtual}
          itensPorPagina={5}
          onDadosPaginados={setPpcsPaginados}
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
