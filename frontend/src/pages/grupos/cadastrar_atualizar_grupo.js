import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/headers/header";
import "./grupo.css";

//POP-UPS IMPORTAÇÃO
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function CadastrarAtualizarGrupo() {
  const [nome, setNome] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const navigate = useNavigate();
  const { id } = useParams();

  // Carrega os dados do grupo se for uma edição
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/solicitacoes/grupos/${id}/`)
        .then((res) => {
          setNome(res.data.name);
        })
        .catch((err) => {
          setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar grupo."}`);
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = { name: nome };

    const requisicao = id
      ? axios.put(`http://localhost:8000/solicitacoes/grupos/${id}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/grupos/", dados);

    requisicao
      .then(() => {
        setMensagem(id ? "Grupo atualizado com sucesso!" : "Grupo cadastrado com sucesso!");
        setTipoMensagem("sucesso");
        setShowFeedback(true);
      })
      .catch((err) => {
        setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar grupo."}`);
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{id ? "Editar Grupo" : "Cadastrar Novo Grupo"}</h2>
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
            navigate("/grupos");
          }}
        />
      </main>
      <Footer />
    </div>
  );
}