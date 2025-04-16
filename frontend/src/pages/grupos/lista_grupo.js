import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/footer";
import Header from "../../components/header";
import PopupConfirmacao from "./popup_confirmacao";
import PopupFeedback from "./popup_feedback";
import "./grupo.css";

export default function ListarGrupos() {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/grupos/")
      .then((res) => setGrupos(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar grupos."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/grupos/${grupoSelecionado}/`)
      .then(() => {
        setMensagemPopup("Grupo excluído com sucesso.");
        setTipoMensagem("sucesso");
        setGrupos(grupos.filter((t) => t.id !== grupoSelecionado));
      })
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir grupo."}`);
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setGrupoSelecionado(null);
      });
  };

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Grupos</h2>

        <div className="botao-cadastrar-wrapper">
          <Link to="/grupos/cadastrar" className="botao-link" title="Criar Novo Grupo">
            <button className="botao-cadastrar">
              <i className="bi bi-plus-circle-fill"></i>
            </button>
          </Link>
        </div>

        <table className="tabela-grupos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((grupo, index) => (
              <tr key={grupo.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                <td>{grupo.id}</td>
                <td>{grupo.name}</td>
                <td>
                  <div className="botoes-acoes">
                    <Link to={`/grupos/${grupo.id}`} title="Editar">
                      <i className="bi bi-pencil-square icone-editar"></i>
                    </Link>
                    <button
                      onClick={() => {
                        setGrupoSelecionado(grupo.id);
                        setMostrarPopup(true);
                      }}
                      title="Excluir"
                      className="icone-botao">
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
          <button className="botao-voltar" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left-circle"></i> Voltar
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}