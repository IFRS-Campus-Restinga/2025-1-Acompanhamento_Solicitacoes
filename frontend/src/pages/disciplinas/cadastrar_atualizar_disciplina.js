import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/footer";
import Header from "../../components/header";
import "./disciplina.css";
import PopupFeedback from "./popup_feedback";

export default function CadastrarAtualizarDisciplina() {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const navigate = useNavigate();
  const { id } = useParams();

  // Carrega os dados da disciplina se for uma edição
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/solicitacoes/disciplinas/${id}/`)
        .then((res) => {
          setNome(res.data.nome);
          setCodigo(res.data.codigo);
        })
        .catch((err) => {
          setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar disciplina."}`);
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = { nome, codigo };

    // Determina se é cadastro ou atualização
    const requisicao = id
      ? axios.put(`http://localhost:8000/solicitacoes/disciplinas/${id}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/disciplinas/", dados);

    requisicao
      .then(() => {
        setMensagem(id ? "Disciplina atualizada com sucesso!" : "Disciplina cadastrada com sucesso!");
        setTipoMensagem("sucesso");
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar disciplina."}`);
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{id ? "Editar Disciplina" : "Cadastrar Nova Disciplina"}</h2>
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
          <div className="form-group">
            <label>Código:</label>
            <input
              type="text"
              className="input-area"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
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
            // Redireciona para a página de listagem de disciplinas
            navigate("/disciplinas");
          }}
        />
      </main>
      <Footer />
    </div>
  );
}