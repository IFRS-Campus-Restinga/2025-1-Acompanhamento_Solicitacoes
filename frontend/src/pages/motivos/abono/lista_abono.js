import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../../components/footer";
import Header from "../../../components/header";
import "./abono.css";

//POP-UPS IMPORTAÇÃO
import PopupConfirmacao from "../../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";

export default function ListarMotivosAbono() {
  const navigate = useNavigate();
  const [motivos, setMotivos] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [motivoSelecionado, setMotivoSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [termoBusca, setTermoBusca] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/motivo_abono/")
      .then((res) => setMotivos(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar motivos."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const handleBusca = (e) => setTermoBusca(e.target.value);

  const motivosFiltrados = motivos.filter((motivo) =>
    motivo.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
    motivo.tipo_falta.toLowerCase().includes(termoBusca.toLowerCase())
  );

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
      <main className="container">
        <h2>Motivos de Abono</h2>
        <div className="conteudo-tabela">
          <div className="input-group w-50">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por descrição ou tipo de falta"
              value={termoBusca}
              onChange={handleBusca}
            />
          </div>
        </div>
        <div className="botao-cadastrar-wrapper">
          <Link to="/motivo_abono/cadastrar" className="botao-link" title="Criar Novo Motivo">
            <button className="botao-cadastrar">
              <i className="bi bi-plus-circle-fill"></i>
            </button>
          </Link>
        </div>
        

        {motivosFiltrados.length === 0 ? (
          <p className="mt-4">Nenhum motivo encontrado.</p>
        ) : (
          <table className="tabela-motivos">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Tipo de Falta</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {motivosFiltrados.map((motivo, index) => (
                <tr key={motivo.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                  <td>{motivo.descricao}</td>
                  <td>{motivo.tipo_falta}</td>
                  <td>
                    <div className="botoes-acoes">
                      <Link to={`/motivo_abono/${motivo.id}`} title="Editar">
                        <i className="bi bi-pencil-square icone-editar"></i>
                      </Link>
                      <button
                        onClick={() => {
                          setMotivoSelecionado(motivo.id);
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
