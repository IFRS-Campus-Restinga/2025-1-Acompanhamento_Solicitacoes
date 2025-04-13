import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/footer";
import Header from "../../components/header";
import "./turma.css";
import PopupFeedback from "./popup_feedback";

export default function CadastrarAtualizarTurma() {
  const [nome, setNome] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const navigate = useNavigate();
  const { id } = useParams();

  // Carrega os dados da turma se for uma edição
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/solicitacoes/turmas/${id}/`)
        .then((res) => {
          setNome(res.data.nome);
        })
        .catch((err) => {
          setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar turma."}`);
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = { nome };

    const requisicao = id
      ? axios.put(`http://localhost:8000/solicitacoes/turmas/${id}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/turmas/", dados);

    requisicao
      .then(() => {
        setMensagem(id ? "Turma atualizada com sucesso!" : "Turma cadastrada com sucesso!");
        setTipoMensagem("sucesso");
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar turma."}`);
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{id ? "Editar Turma" : "Cadastrar Nova Turma"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome:</label>
            <input
              type="text"
              className="input-area"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            {id ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        <PopupFeedback
          show={showFeedback}
          mensagem={mensagem}
          tipo={tipoMensagem}
          onClose={() => {
            setShowFeedback(false);
            navigate("/turmas");
          }}
        />
      </main>
      <Footer />
    </div>
  );
}