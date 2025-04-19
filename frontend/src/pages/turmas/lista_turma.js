import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/footer";
import Header from "../../components/header";
import "./turma.css";

//POP-UPS IMPORTAÇÃO
import PopupConfirmacao from "../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function ListarTurmas() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/turmas/")
      .then((res) => setTurmas(res.data))
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar turmas."}`);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  }, []);

  const confirmarExclusao = () => {
    axios.delete(`http://localhost:8000/solicitacoes/turmas/${turmaSelecionada}/`)
      .then(() => {
        setMensagemPopup("Turma excluída com sucesso.");
        setTipoMensagem("sucesso");
        setTurmas(turmas.filter((t) => t.id !== turmaSelecionada));
      })
      .catch((err) => {
        setMensagemPopup(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir turma."}`);
        setTipoMensagem("erro");
      })
      .finally(() => {
        setMostrarPopup(false);
        setMostrarFeedback(true);
        setTurmaSelecionada(null);
      });
  };

  const turmasFiltradas = turmas.filter((turma) =>
    turma.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Turmas</h2>

        <div className="botao-cadastrar-wrapper">
          <Link to="/turmas/cadastrar" className="botao-link" title="Criar Nova Turma">
            <button className="botao-cadastrar">
              <i className="bi bi-plus-circle-fill"></i>
            </button>
          </Link>
        </div>

        <div className="barra-pesquisa">
          <i className="bi bi-search icone-pesquisa"></i>
          <input
            type="text"
            placeholder="Buscar..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-pesquisa"
          />
        </div>

        {turmasFiltradas.length === 0 ? (
          <p><br />Nenhuma turma encontrada!</p>
        ) : (
          <table className="tabela-turmas">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Disciplinas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {turmasFiltradas.map((turma, index) => (
                <tr key={turma.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                  <td>{turma.nome}</td>
                  <td>
                    {turma.disciplinas?.length
                      ? turma.disciplinas.map(d => d.nome).join(", ")
                      : "Nenhuma disciplina atribuída"}
                  </td>
                  <td>
                    <div className="botoes-acoes">
                      <Link to={`/turmas/${turma.id}`} title="Editar">
                        <i className="bi bi-pencil-square icone-editar"></i>
                      </Link>
                      <button
                        onClick={() => {
                          setTurmaSelecionada(turma.id);
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
          <button className="botao-voltar" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left-circle"></i> Voltar
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}