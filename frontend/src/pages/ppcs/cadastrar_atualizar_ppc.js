import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import BotaoCadastrar from "../../components/UI/botoes/botao_cadastrar";

//POP-UPS IMPORTAÇÃO
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function CadastrarAtualizarPpc() {
  const [codigoInput, setCodigoInput] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");
  const [availableCursos, setAvailableCursos] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const navigate = useNavigate();
  const { codigo } = useParams(); 

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/cursos/")
      .then((res) => setAvailableCursos(res.data))
      .catch((err) =>
        console.error("Erro ao carregar cursos:", err)
      );
  }, []);

  useEffect(() => {
    if (codigo) {
      axios
        .get(`http://localhost:8000/solicitacoes/ppcs/${codigo}/`)
        .then((res) => {
          setCodigoInput(res.data.codigo);
          setSelectedCurso(res.data.curso);
        })
        .catch((err) => {
          setMensagem(
            `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar PPC."}`
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
      curso: selectedCurso 
    };

    const requisicao = codigo
      ? axios.put(`http://localhost:8000/solicitacoes/ppcs/${codigo}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/ppcs/", dados);

    requisicao
      .then(() => {
        setMensagem(codigo ? "PPC atualizado com sucesso!" : "PPC cadastrado com sucesso!");
        setTipoMensagem("sucesso");
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagem(
          `Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar PPC."}`
        );
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{codigo ? "Editar PPC" : "Cadastrar Novo PPC"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Código:</label>
            <input
              type="text"
              className="input-text"
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Curso associado:</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <select
                className="input-select"
                value={selectedCurso}
                onChange={(e) => setSelectedCurso(e.target.value)}
                required
              >
                <option value="">Selecione um curso</option>
                {availableCursos.map((curso) => (
                  <option key={curso.codigo} value={curso.codigo}>
                    {curso.nome} ({curso.codigo})
                  </option>
                ))}
              </select>
              <BotaoCadastrar to="/cursos/cadastrar" title="Criar Novo Curso" />
            </div>
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
            navigate("/ppcs");
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
