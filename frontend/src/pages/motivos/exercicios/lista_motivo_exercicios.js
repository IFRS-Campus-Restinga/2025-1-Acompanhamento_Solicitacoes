import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../../components/footer";
import Header from "../../../components/header";
import "./motivo_exercicios.css";
import PopupConfirmacao from "./popup_confirmacao";
import PopupFeedback from "./popup_feedback";

import { useNavigate } from "react-router-dom";

export default function ListarMotivosExercicios() {
  const navigate = useNavigate();
  const [motivos, setMotivos] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [motivoSelecionado, setMotivoSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/motivo_exercicios/")
      .then((res) => setMotivos(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar motivos."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/motivo_exercicios/${motivoSelecionado}/`)
      .then(() => {
        setMensagemPopup("Motivo excluído com sucesso.");
        setTipoMensagem("sucesso");
        setMotivos(motivos.filter((m) => m.id !== motivoSelecionado));
      })
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir motivo."}`);
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setMotivoSelecionado(null);
      });
  };

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Motivos de Exercicios</h2>

        <div className="botao-cadastrar-wrapper">
          <Link to="/motivo_exercicios/cadastrar" className="botao-link" title="Criar Novo Motivo">
            <button className="botao-cadastrar">
              <i className="bi bi-plus-circle-fill"></i>
            </button>
          </Link>
        </div>

        <table className="tabela-motivos">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {motivos.map((motivo, index) => (
              <tr key={motivo.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                <td>{motivo.descricao}</td>

                <td>
                  <div className="botoes-acoes">
                    <Link to={`/motivo_exercicios/${motivo.id}`} title="Editar">
                      <i className="bi bi-pencil-square icone-editar"></i>
                    </Link>
                    <button
                      onClick={() => {
                        setMotivoSelecionado(motivo.id);
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
