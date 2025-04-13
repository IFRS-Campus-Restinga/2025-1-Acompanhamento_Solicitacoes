import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../components/footer";
import Header from "../../../components/header";
import "./motivo_exercicios.css";
import PopupFeedback from "./popup_feedback";

export default function CadastrarAtualizarExercicios() {
  const [descricao, setDescricao] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const navigate = useNavigate();
  const { id } = useParams();


  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/solicitacoes/motivo_exercicios/${id}/`)
        .then((res) => {
          setDescricao(res.data.descricao);
        })
        .catch((err) => {
          setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar motivo."}`);
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    } 
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = { descricao};

    const requisicao = id
      ? axios.put(`http://localhost:8000/solicitacoes/motivo_exercicios/${id}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/motivo_exercicios/", dados);

    requisicao
      .then(() => {
        setMensagem(id ? "Motivo atualizado com sucesso!" : "Motivo cadastrado com sucesso!");
        setTipoMensagem("sucesso");
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar motivo."}`);
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{id ? "Editar Motivo de Exercicios" : "Cadastrar Novo Motivo de Exercicios"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Descrição:</label>
            <textarea
              className="input-area"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
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
            navigate("/motivo_exercicios"); 
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
