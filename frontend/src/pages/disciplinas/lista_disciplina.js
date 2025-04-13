import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/footer";  // Caminho corrigido
import Header from "../../components/header";  // Caminho corrigido
import "./disciplina.css";
import PopupConfirmacao from "./popup_confirmacao";  // Caminho corrigido
import PopupFeedback from "./popup_feedback";  // Caminho corrigido

export default function ListarDisciplinas() {
  const navigate = useNavigate();
  const [disciplinas, setDisciplinas] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/disciplinas/")  // Corrigido para "solicitacoes"
      .then((res) => setDisciplinas(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar disciplinas."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/disciplinas/${disciplinaSelecionada}/`)  // Corrigido para "solicitacoes"
      .then(() => {
        setMensagemPopup("Disciplina excluída com sucesso.");
        setTipoMensagem("sucesso");
        setDisciplinas(disciplinas.filter((d) => d.codigo !== disciplinaSelecionada));
      })
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir disciplina."}`);
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setDisciplinaSelecionada(null);
      });
  };

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Disciplinas</h2>

        <div className="botao-cadastrar-wrapper">
          <Link to="/disciplinas/cadastrar" className="botao-link" title="Criar Nova Disciplina">
            <button className="botao-cadastrar">
              <i className="bi bi-plus-circle-fill"></i>
            </button>
          </Link>
        </div>

        <table className="tabela-disciplinas">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {disciplinas.map((disciplina, index) => (
              <tr key={disciplina.codigo} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                <td>{disciplina.codigo}</td>
                <td>{disciplina.nome}</td>
                <td>
                  <div className="botoes-acoes">
                    <Link to={`/disciplinas/${disciplina.codigo}`} title="Editar">
                      <i className="bi bi-pencil-square icone-editar"></i>
                    </Link>
                    <button
                      onClick={() => {
                        setDisciplinaSelecionada(disciplina.codigo);
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
          <button className="botao-voltar" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left-circle"></i> Voltar
          </button>
        </div>
        
      </main>
      <Footer />
    </div>
  );
}