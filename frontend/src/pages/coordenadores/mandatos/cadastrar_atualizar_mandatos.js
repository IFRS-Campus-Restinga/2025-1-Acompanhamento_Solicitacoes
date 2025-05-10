import api from "../../../services/api";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Footer from "../../../components/base/footer";
import Header from "../../../components/base/header";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";

const initialFormState = {
  coordenador: "",
  curso: "",
  inicio_mandato: "",
  fim_mandato: "",
};

export default function CadastrarAtualizarMandato() {
  const [formData, setFormData] = useState(initialFormState);
  const [coordenadores, setCoordenadores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [errors, setErrors] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("sucesso");
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditing = !!id;
  const title = isEditing ? "Editar Mandato" : "Cadastrar Novo Mandato";
  const submitButtonText = isEditing ? "Atualizar Mandato" : "Cadastrar Mandato";

  useEffect(() => {
    async function loadCoordenadores() {
      try {
        const response = await api.get("coordenadores/");
        setCoordenadores(response.data);
      } catch (error) {
        console.error("Erro ao carregar coordenadores:", error);
        setFeedbackType("erro");
        setFeedbackMessage(`Erro ao carregar coordenadores: ${error.message}`);
        setShowFeedback(true);
      }
    }

    async function loadCursos() {
      try {
        const response = await api.get("cursos/");
        setCursos(response.data);
      } catch (error) {
        console.error("Erro ao carregar cursos:", error);
        setFeedbackType("erro");
        setFeedbackMessage(`Erro ao carregar cursos: ${error.message}`);
        setShowFeedback(true);
      }
    }

    async function loadMandatoDataForEdit(mandatoId) {
      if (!mandatoId) return;
      try {
        const response = await api.get(`mandatos/${mandatoId}/`);
        setFormData({
          coordenador: response.data.coordenador,
          curso: response.data.curso,
          inicio_mandato: response.data.inicio_mandato,
          fim_mandato: response.data.fim_mandato || "",
        });
      } catch (error) {
        console.error("Erro ao carregar dados do mandato para edição:", error);
        setFeedbackType("erro");
        setFeedbackMessage("Erro ao carregar dados do mandato para edição.");
        setShowFeedback(true);
      }
    }

    loadCoordenadores();
    loadCursos();
    if (id) {
      loadMandatoDataForEdit(id);
    } else {
      setFormData(initialFormState);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        coordenador: formData.coordenador,
        curso: formData.curso,
        inicio_mandato: formData.inicio_mandato,
        fim_mandato: formData.fim_mandato || null,
      };

      const response = isEditing
        ? await api.patch(`mandatos/${id}/`, payload)
        : await api.post("mandatos/", payload);

      setFeedbackType("sucesso");
      setFeedbackMessage(`Mandato ${isEditing ? "atualizado" : "cadastrado"} com sucesso!`);
      setShowFeedback(true);
      setFormData(initialFormState);
      setErrors({});
    } catch (error) {
      console.error("Erro ao cadastrar/atualizar mandato:", error);
      const errorData = error.response?.data;
      setFeedbackType("erro");
      setFeedbackMessage(`Erro ao ${isEditing ? "atualizar" : "cadastrar"} mandato. ${errorData ? JSON.stringify(errorData) : ""}`);
      setShowFeedback(true);
      if (errorData) setErrors(errorData);
    }
  }

  const closeFeedback = () => {
    setShowFeedback(false);
    navigate("/mandatos"); // Redirecionar para a listagem de mandatos
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{title}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="coordenador">Coordenador:</label>
            <select
              id="coordenador"
              name="coordenador"
              className={`input-text ${errors.coordenador ? "input-error" : ""}`}
              value={formData.coordenador || ""}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um coordenador</option>
              {coordenadores.map(coordenador => (
                <option key={coordenador.id} value={coordenador.id}>
                  {coordenador.siape} ({coordenador.usuario.nome})
                </option>
              ))}
            </select>
            {errors.coordenador && <div className="error-text">{errors.coordenador}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="curso">Curso:</label>
            <select
              id="curso"
              name="curso"
              className={`input-text ${errors.curso ? "input-error" : ""}`}
              value={formData.curso || ""}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um curso</option>
              {cursos.map(curso => (
                <option key={curso.codigo} value={curso.codigo}>
                  {curso.nome} ({curso.codigo})
                </option>
              ))}
            </select>
            {errors.curso && <div className="error-text">{errors.curso}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="inicio_mandato">Início do Mandato:</label>
            <input
              type="date"
              id="inicio_mandato"
              name="inicio_mandato"
              className={`input-text ${errors.inicio_mandato ? "input-error" : ""}`}
              value={formData.inicio_mandato || ""}
              onChange={handleChange}
              required
            />
            {errors.inicio_mandato && <div className="error-text">{errors.inicio_mandato}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="fim_mandato">Fim do Mandato (Opcional):</label>
            <input
              type="date"
              id="fim_mandato"
              name="fim_mandato"
              className={`input-text ${errors.fim_mandato ? "input-error" : ""}`}
              value={formData.fim_mandato || ""}
              onChange={handleChange}
            />
            {errors.fim_mandato && <div className="error-text">{errors.fim_mandato}</div>}
          </div>

          <button type="submit" className="submit-button">{submitButtonText}</button>
        </form>

        <PopupFeedback
          show={showFeedback}
          mensagem={feedbackMessage}
          tipo={feedbackType}
          onClose={closeFeedback}
        />
      </main>
      <Footer />
    </div>
  );
}