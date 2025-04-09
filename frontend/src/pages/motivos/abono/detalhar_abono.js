import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../../components/footer";
import Header from "../../../components/header";
import Navbar from "../../../components/navbar";
import PopupFeedback  from "./popup_feedback";
import PopupConfirmacao from "./popup_confirmacao";
import "./abono.css";

export default function DetalharMotivoAbono() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [descricao, setDescricao] = useState("");
  const [tipoFalta, setTipoFalta] = useState("");
  const [tipos, setTipos] = useState([]);

  const [popup, setPopup] = useState({ show: false, message: "", isError: false });
  const [showConfirm, setShowConfirm] = useState(false);




  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/motivo_abono/tipos/")
      .then((res) => setTipos(res.data))
      .catch((err) => console.error("Erro ao carregar tipos:", err));
  }, []);

  useEffect(() => {
    axios.get(`http://localhost:8000/solicitacoes/motivo_abono/${id}/`)
      .then((res) => {
        setDescricao(res.data.descricao);
        setTipoFalta(res.data.tipo_falta);
      })
      .catch((err) => console.error("Erro ao carregar motivo:", err));
  }, [id]);

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8000/solicitacoes/motivo_abono/${id}/`, {
        descricao,
        tipo_falta: tipoFalta
      });
      setPopup({ show: true, message: "Motivo atualizado com sucesso!", isError: false });
    } catch (error) {
      setPopup({ show: true, message: "Erro ao atualizar.", isError: true })
      console.error(error);
    }
  };

  const confirmarExclusao = async () => {
    try {
      await axios.delete(`http://localhost:8000/solicitacoes/motivo_abono/${id}/`);
      setPopup({ show: true, message: "Motivo excluído com sucesso!", isError: false });
      setShowConfirm(false);
    } catch (error) {
      setPopup({ show: true, message: "Erro ao excluir motivo.", isError: true });
      setShowConfirm(false);
    }
  };
  
  const handleDelete = () => {
    setShowConfirm(true);
  };
  
  
  const fecharPopup = () => {
    const isSuccess = !popup.isError && popup.message.includes("sucesso");
    setPopup({ show: false, message: "", isError: false });
    if (isSuccess) {
      navigate("/motivo_abono");
    }
  };
  
  return (
    <div>
      <Header />
      <Navbar />
      <main className="container">
        <h2>Detalhes do Motivo de Abono</h2>

        <div className="form-group">
          <label>Descrição:</label><br />
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows="4"
            cols="50"
          />
        </div>

        <div className="form-group">
          <label>Tipo de Falta:</label><br />
          <select
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

        <div className="botoes-acoes">
          <button className="btn btn-secondary" onClick={() => navigate("/motivo_abono")}>Voltar</button>
          <button className="btn btn-primary" onClick={handleUpdate}>Editar</button>
          <button className="btn btn-danger" onClick={handleDelete}>Excluir</button>
        </div>
      </main>
      <Footer />

      <PopupConfirmacao
      show={showConfirm}
      onConfirm={confirmarExclusao}
      onCancel={() => setShowConfirm(false)}
      />

      <PopupFeedback
      show={popup.show}
      message={popup.message}
      isError={popup.isError}
      onClose={fecharPopup}
      />

    </div>
  );
}
