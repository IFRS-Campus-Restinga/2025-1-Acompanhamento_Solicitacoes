import { useEffect, useState } from "react";
import Footer from "../../../components/footer";
import Header from "../../../components/header";

//POP-UPS IMPORTAÇÃO
import Feedback from "../../../components/pop_ups/popup_feedback";

import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function CadastrarAtualizarMotivoDispensa() {
    
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const [feedbackType, setFeedbackType] = useState(null);
    const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);
    const [descricao, setDescricao] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
          axios.get(`http://localhost:8000/solicitacoes/motivo_dispensa/${id}/`)
            .then((res) => {
              setDescricao(res.data.descricao);
            })
            .catch((err) => {
              setFeedbackMessage(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar motivo."}`);
              setFeedbackType("error");
              setFeedbackIsOpen(true);
            })
        } 
      }, [id]);

      const handleSubmit = (e) => {
        e.preventDefault();
        const dados = { descricao };
    
        const requisicao = id
          ? axios.put(`http://localhost:8000/solicitacoes/motivo_dispensa/${id}/`, dados)
          : axios.post("http://localhost:8000/solicitacoes/motivo_dispensa/", dados);
    
        requisicao
          .then(() => {
            setFeedbackMessage(id ? "Motivo atualizado com sucesso!" : "Motivo cadastrado com sucesso!");
            setFeedbackType("sucess");
          })
          .catch((err) => {
            setFeedbackMessage(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar motivo."}`);
            setFeedbackType("error");
          })
          .finally(() => {
            setFeedbackIsOpen(true);
          });
      };
    
    return (
        <div>
          <Header />
          <main className="container form-container">
            <h2>{id ? "Editar Motivo de Dispensa de Educação Física" : "Cadastrar Novo Motivo de Dispensa de Educação Física"}</h2>
            <form className="form-box" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Descrição:</label>
                <textarea
                  className="input-area"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                  maxlength="200"
                  minlength="9"
                />
              </div>
              <button type="submit" className="submit-button">
                {id ? "Atualizar" : "Cadastrar"}
              </button>
            </form>
            {feedbackIsOpen && (
                <Feedback
                message={feedbackMessage}
                type={feedbackType}
                onClose={() => {
                    setFeedbackIsOpen(false);
                    navigate("/motivo_dispensa");}
                }
            />
            )}
            
                        
          </main>
          <Footer />
        </div>
      );
}