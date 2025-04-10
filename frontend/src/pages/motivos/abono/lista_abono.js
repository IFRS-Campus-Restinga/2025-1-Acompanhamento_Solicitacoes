import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../../../components/header";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import PopupConfirmacao from "./popup_confirmacao";
import PopupFeedback from "./popup_feedback";
import { Pencil, Trash2 } from "lucide-react";
import "./abono.css";

export default function ListarMotivosAbono() {
  const [motivos, setMotivos] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [motivoSelecionado, setMotivoSelecionado] = useState(null);
  const [tipoFalta, setTipoFalta] = useState("");
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/motivo_abono/")
      .then((res) => setMotivos(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar motivos."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/motivo_abono/${motivoSelecionado}/`)
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
      <Navbar />
      <main className="container">
        <h2>Motivos de Abono</h2>

        <div className="botao-cadastrar-wrapper">
          <Link to="/motivo_abono/cadastrar">
            <button className="botao-cadastrar">Cadastrar novo motivo</button>
          </Link>
        </div>

        <table className="tabela-motivos">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Tipo de Falta</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {motivos.map((motivo, index) => (
              <tr key={motivo.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                <td>{motivo.descricao}</td>
                <td>{motivo.tipo_falta}</td>
                <td>
                  <div className="botoes-acoes">
                    <Link to={`/motivo_abono/${motivo.id}`} title="Editar">
                      <Pencil className="icone-acao" />
                    </Link>
                    <button
                      onClick={() => {
                        setMotivoSelecionado(motivo.id);
                        setMostrarPopup(true);
                      }}
                      title="Excluir"
                      className="icone-botao"
                    >
                      <Trash2 className="icone-acao" />
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
      </main>
      <Footer />
    </div>
  );
}
