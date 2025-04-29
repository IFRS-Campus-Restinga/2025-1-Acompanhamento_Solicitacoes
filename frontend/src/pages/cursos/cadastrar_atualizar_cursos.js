import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
//POP-UPS IMPORTAÇÃO
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function CadastrarAtualizarCursos() {
  const [codigoInput, setCodigoInput] = useState("");
  const [nome, setNome] = useState("");
  const [selectedPpcs, setSelectedPpcs] = useState([]);
  const [availablePpcs, setAvailablePpcs] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const navigate = useNavigate();
  const { codigo } = useParams();

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/ppcs/")
      .then((res) => setAvailablePpcs(res.data))
      .catch((err) => console.error("Erro ao carregar PPCs:", err));
  }, []);

  useEffect(() => {
    if (codigo) {
      axios
        .get(`http://localhost:8000/solicitacoes/cursos/${codigo}/`)
        .then((res) => {
          setCodigoInput(res.data.codigo);
          setNome(res.data.nome);
          setSelectedPpcs(res.data.ppcs || []);
        })
        .catch((err) => {
          setMensagem(
            `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar curso."}`
          );
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    }
  }, [codigo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = { 
      codigo: codigoInput, 
      nome, 
      ppcs: selectedPpcs 
    };

    const requisicao = codigo
      ? axios.put(`http://localhost:8000/solicitacoes/cursos/${codigo}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/cursos/", dados);

    requisicao
      .then(() => {
        setMensagem(codigo ? "Curso atualizado com sucesso!" : "Curso cadastrado com sucesso!");
        setTipoMensagem("sucesso");
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagem(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar curso."}`
        );
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  const handlePpcSelection = (e) => {
    const newSelection = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedPpcs(newSelection);
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{codigo ? "Editar Curso" : "Cadastrar Novo Curso"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Código do Curso:</label>
            {codigo ? (
              <input
                type="text"
                className="input-text"
                value={codigoInput}
                disabled
              />
            ) : (
              <input
                type="text"
                className="input-text"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value)}
                required
              />
            )}
          </div>
          <div className="form-group">
            <label>Nome do Curso:</label>
            <input
              type="text"
              className="input-text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            {codigo ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        <PopupFeedback
          show={showFeedback}
          mensagem={mensagem}
          tipo={tipoMensagem}
          onClose={() => {
            setShowFeedback(false);
            navigate("/cursos");
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
