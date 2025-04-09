import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../../../components/footer";
import Header from "../../../components/header";
import Navbar from "../../../components/navbar";
import PopupFeedback from "./popup_feedback";
import "./abono.css";
import { useNavigate } from "react-router-dom";

export default function CadastrarMotivoAbono() {
  const [descricao, setDescricao] = useState("");
  const [tipoFalta, setTipoFalta] = useState("");
  const [tipos, setTipos] = useState([]);
  const navigate = useNavigate();

  const [popup, setPopup] = useState({ show: false, message: "", isError: false });

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/motivo_abono/tipos/")
      .then((res) => setTipos(res.data))
      .catch((err) => console.error("Erro ao carregar tipos de falta:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/solicitacoes/motivo_abono/", {
        descricao,
        tipo_falta: tipoFalta,
      });
      setPopup({ show: true, message: "Motivo cadastrado com sucesso!", isError: false });
      setDescricao("");
      setTipoFalta("");
    } catch (error) {
      console.error(error);
      setPopup({ show: true, message: "Erro ao cadastrar motivo.", isError: true });
    }
  };

  
  const fecharPopup = () => {
    setPopup({ show: false, message: "", isError: false });
    if (!popup.isError) {
      navigate("/motivo_abono");
    }
  };
  

  return (
    <div>
      <Header />
      <Navbar />
      <main className="container">
        <h2>Cadastrar Motivo de Abono</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Descrição:</label><br />
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
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

          <br />
          <div className="botoes-acoes">
            <button type="submit" className="btn btn-primary">Cadastrar</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/motivo_abono")}>Voltar</button>
          </div>
        </form>
      </main>
      <Footer />

      <PopupFeedback
        show={popup.show}
        message={popup.message}
        isError={popup.isError}
        onClose={fecharPopup}
      />
    </div>
  );
}
