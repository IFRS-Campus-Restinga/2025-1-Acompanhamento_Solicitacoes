import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/footer";
import Header from "../../components/header";
import "./curso.css";

//POP-UPS IMPORTAÇÃO
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function ListarCursos() {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/cursos/")
      .then((res) => setCursos(res.data))
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar cursos."}`
        );
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios
      .delete(`http://localhost:8000/solicitacoes/cursos/${cursoSelecionado}/`)
      .then(() => {
        setMensagemPopup("Curso excluído com sucesso.");
        setTipoMensagem("sucesso");
        setCursos(cursos.filter((c) => c.codigo !== cursoSelecionado));
      })
      .catch((err) => {
        setMensagemPopup(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir curso."}`
        );
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setCursoSelecionado(null);
      });
  };

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Cursos</h2>

        <div className="botao-cadastrar-wrapper">
          <Link to="/cursos/cadastrar" className="botao-link" title="Criar Novo Curso">
            <button className="botao-cadastrar">
              <i className="bi bi-plus-circle-fill"></i>
            </button>
          </Link>
        </div>

        <table className="tabela-cursos">
          <thead>
            <tr>
              <th>Nome</th>
              <th>PPCs</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((curso, index) => (
              <tr key={curso.codigo} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                <td>{curso.nome}</td>
                <td>{curso.ppcs ? curso.ppcs.join(", ") : ""}</td>
                <td>
                  <div className="botoes-acoes">
                    <Link to={`/cursos/${curso.codigo}`} title="Editar">
                      <i className="bi bi-pencil-square icone-editar"></i>
                    </Link>
                    <button
                      onClick={() => {
                        setCursoSelecionado(curso.codigo);
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
