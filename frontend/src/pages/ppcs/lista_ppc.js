import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/footer";
import Header from "../../components/header";
import "./ppc.css";

//POP-UPS IMPORTAÇÃO
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function ListarPpc() {
  const navigate = useNavigate();
  const [ppcs, setPpcs] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [ppcSelecionado, setPpcSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

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

  return (
    <div>
      <Header />
      <main className="container">
        <h2>PPCs</h2>

        <div className="botao-cadastrar-wrapper">
          <Link to="/ppcs/cadastrar" className="botao-link" title="Criar Novo PPC">
            <button className="botao-cadastrar">
              <i className="bi bi-plus-circle-fill"></i>
            </button>
          </Link>
        </div>

        <table className="tabela-ppc">
          <thead>
            <tr>
              <th>Código</th>
              <th>Curso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ppcs.map((ppc, index) => (
              <tr key={ppc.codigo} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                <td>{ppc.codigo}</td>
                {/* Exibe o código do curso associado – você pode ajustar para exibir o nome, se o serializer retornar */}
                <td>{ppc.curso}</td>
                <td>
                  <div className="botoes-acoes">
                    <Link
                      to={`/ppcs/${encodeURIComponent(ppc.codigo)}`}
                      title="Editar"
                    >
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

        <div className="botao-voltar-wrapper">
          <button className="botao-voltar" onClick={() => navigate("/")}>
            <i className="bi bi-arrow-left-circle"></i> Voltar
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
