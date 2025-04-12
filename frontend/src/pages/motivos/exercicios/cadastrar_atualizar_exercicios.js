import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../components/header";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import PopupFeedback from "./popup_feedback";
import "./motivo_exercicios.css";

export default function CadastrarAtualizarAbono() {
  const [descricao, setDescricao] = useState("");
  const [tipoFalta, setTipoFalta] = useState("");
  const [tipos, setTipos] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const navigate = useNavigate();
  const { id } = useParams();

/*
  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/motivo_exercicios/tipos/")
      .then((res) => setTipos(res.data))
      .catch((err) => console.error("Erro ao carregar tipos de falta:", err));
  }, []);
*/
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
    const dados = {descricao};

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
      <Navbar />
      <main className="container form-container">
        <h2>{id ? "Editar Motivo de Exercicios Domiciliares" : "Cadastrar Novo Motivo de Exercicios Domiciliares"}</h2>
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
            {/*
          <div className="form-group">
            <label>Tipo de Falta:</label>
            <select
              className="input-select"
              value={tipoFalta}
              onChange={(e) => setTipoFalta(e.target.value)}
              required
            >
              <option value="">Selecione um tipo</option>
              {tipos.map((tipoOption) => (
                <option key={tipoOption.value} value={tipoOption.value}>
                  {tipoOption.label}
                </option>
              ))}
            </select>
          </div>
           Comentário */}

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
