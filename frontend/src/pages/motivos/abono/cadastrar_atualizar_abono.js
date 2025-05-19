import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../components/base/footer";
import Header from "../../../components/base/headers/header";

//POP-UPS IMPORTAÇÃO
import PopupFeedback from "../../../components/pop_ups/popup_feedback";

export default function CadastrarAtualizarAbono() {
  const [descricao, setDescricao] = useState("");
  const [tipoFalta, setTipoFalta] = useState("");
  const [tipos, setTipos] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const navigate = useNavigate();
  const { id } = useParams();


  const extrairMensagemErro = (erroData) => {
    if (typeof erroData === "string") return erroData;
    if (erroData?.mensagem) return erroData.mensagem;
    if (erroData?.detail) return erroData.detail;

    if (typeof erroData === "object") {
      const primeiraChave = Object.keys(erroData)[0];
      const mensagens = erroData[primeiraChave];
      if (Array.isArray(mensagens)) {
        return mensagens[0];
      }
    }

    return "Erro desconhecido.";
  };


  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/motivo_abono/tipos/")
      .then((res) => setTipos(res.data))
      .catch((err) => console.error("Erro ao carregar tipos de falta:", err));
  }, []);

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/solicitacoes/motivo_abono/${id}/`)
        .then((res) => {
          setDescricao(res.data.descricao);
          setTipoFalta(res.data.tipo_falta);
        })
        .catch((err) => {
          const erroServidor = extrairMensagemErro(err.response?.data);
          setMensagem(`Erro ${err.response?.status || ""}: ${erroServidor}`);
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    } 
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = { descricao, tipo_falta: tipoFalta };

    const requisicao = id
      ? axios.put(`http://localhost:8000/solicitacoes/motivo_abono/${id}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/motivo_abono/", dados);

    requisicao
      .then(() => {
        setMensagem(id ? "Motivo atualizado com sucesso!" : "Motivo cadastrado com sucesso!");
        setTipoMensagem("sucesso");
        setShowFeedback(true);
      })
      .catch((err) => {
        const erroServidor = extrairMensagemErro(err.response?.data);
        setMensagem(`Erro ${err.response?.status || ""}: ${erroServidor}`);
        setTipoMensagem("erro");
        setShowFeedback(true);
      });
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{id ? "Editar Motivo de Abono" : "Cadastrar Novo Motivo de Abono"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Descrição:</label>
            <textarea
              className="input-area"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              maxlength="200"
              minlength="10"
            />
          </div>
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
            if(tipoMensagem === "sucesso"){
              navigate("/motivo_abono"); 
            }
            
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
