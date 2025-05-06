import api from "../../services/api";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

const initialFormState = {
  nome: "", email: "", cpf: "", telefone: "", data_nascimento: "",
  matricula: "", turma: "", ano_ingresso: "",
  siape: "", curso: "", inicio_mandato: "", fim_mandato: "",
};

const getValidationUrl = (fieldName, papel) => {
  const base = "usuarios/";
  switch (fieldName) {
    case "matricula": case "turma": case "ano_ingresso": return "alunos/";
    case "siape": return papel === "coordenador" ? "coordenadores/" : "cres/";
    case "curso": case "inicio_mandato": case "fim_mandato": return "mandatos/";
    default: return base;
  }
};

const getEntityEndpoint = (papel) => {
  switch (papel) {
    case "aluno": return "alunos/";
    case "coordenador": return "coordenadores/";
    case "cre": return "cres/";
    default: return "usuarios/";
  }
};

export default function CadastrarAtualizarUsuarioPapel() {
  const [formData, setFormData] = useState(initialFormState);
  const [cursos, setCursos] = useState([]);
  const [errors, setErrors] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState("sucesso");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const { pathname } = useLocation();
  const papel = pathname.split("/").pop();
  const { id } = useParams(); // Este 'id' é o ID do papel
  const navigate = useNavigate();

  const isEditing = !!id;
  const title = isEditing ? `Editar ${papel.charAt(0).toUpperCase() + papel.slice(1)}` : `Cadastrar Novo ${papel.charAt(0).toUpperCase() + papel.slice(1)}`;
  const submitButtonText = isEditing ? "Atualizar" : "Cadastrar";

  const loadCourses = useCallback(async () => {
    try {
      setCursos(await api.get("cursos/").then(res => res.data));
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
      setFeedbackType("erro");
      setFeedbackMessage(`Erro ao carregar cursos: ${error.message}`);
      setShowFeedback(true);
    }
  }, []);

  const loadEntityData = useCallback(async (entityId) => {
    if (!entityId) return;

    try {
      const entityEndpoint = getEntityEndpoint(papel);
      const entityResponse = await api.get(`${entityEndpoint}${entityId}/`);

      // Busca os dados do usuário usando o ID retornado
      const userId = entityResponse.data.usuario;
      const userResponse = await api.get(`usuarios/${userId}/`);

      // Combina os dados do papel e do usuário no formData
      setFormData(prev => ({ ...prev, ...entityResponse.data, ...userResponse.data }));

    } catch (error) {
      console.error(`Erro ao carregar dados para edição de ${papel}:`, error);
      setFeedbackType("erro");
      setFeedbackMessage(`Erro ao carregar dados para edição de ${papel}.`);
      setShowFeedback(true);
    }
  }, [papel]);

  useEffect(() => {
    if (papel === "coordenador") {
      loadCourses();
    }

    if (id) {
      loadEntityData(id);
    } else {
      setFormData(initialFormState);
    }
  }, [id, papel, loadCourses, loadEntityData]);

  const validateField = useCallback(async (fieldName, value) => {
    setErrors(prev => ({ ...prev, [fieldName]: null }));

    const url = getValidationUrl(fieldName, papel);
    if (!url) return;

    try {
      await api[isEditing ? "patch" : "post"](url, { [fieldName]: value });
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: error.response.data[fieldName][0] }));
      }
    }
  }, [papel, isEditing]);

  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  }, []);

  const handleBlur = useCallback(e => {
    validateField(e.target.name, e.target.value);
  }, [validateField]);

  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    const papelTexto = papel.charAt(0).toUpperCase() + papel.slice(1);
    const operacaoTexto = isEditing ? "atualizado" : "criado";
    const entityEndpoint = getEntityEndpoint(papel);
    const url = isEditing ? `${entityEndpoint}${id}/` : entityEndpoint;

    // Separa os dados do usuário e do papel para a requisição
    const { nome, email, cpf, telefone, data_nascimento, usuario, ...papelData } = formData;
    const userPayload = { nome, email, cpf, telefone, data_nascimento };

    try {
      const requestMethod = isEditing ? api.patch : api.post;

      // Se estiver editando, primeiro atualiza o usuário
      if (isEditing) {
        // Precisamos do ID do usuário associado ao papel para atualizar
        const entityResponse = await api.get(`${entityEndpoint}${id}/`);
        const userId = entityResponse.data.usuario;
        await api.patch(`usuarios/${userId}/`, userPayload);
        await requestMethod(url, papelData);
      } else {
        // Se estiver criando, primeiro cria o usuário e depois o papel
        const userResponse = await api.post("usuarios/", userPayload);
        const userId = userResponse.data.id;
        await requestMethod(url, { ...papelData, usuario: userId });
      }

      setFeedbackType("sucesso");
      setFeedbackMessage(`${papelTexto} ${operacaoTexto} com sucesso!`);
      setShowFeedback(true);
      setFormData(initialFormState);
      setErrors({});

    } catch (error) {
      console.error(`Erro ao ${operacaoTexto.toLowerCase()} ${papel}:`, error);
      const errorData = error.response?.data;
      setFeedbackType("erro");
      setFeedbackMessage(`Erro ao ${operacaoTexto.toLowerCase()} ${papelTexto.toLowerCase()}. ${errorData ? JSON.stringify(errorData) : ""}`);
      setShowFeedback(true);
      if (errorData) setErrors(errorData);
    }
  }, [formData, papel, isEditing, id]);

  const closeFeedback = useCallback(() => {
    setShowFeedback(false);
    navigate("/usuarios");
  }, [navigate]);

  const renderField = useCallback((field, label, type = "text", options = []) => (
    <div className="form-group" key={field}>
      <label>{label}:</label>
      {type === "select" ? (
        <select name={field} className={`input-text ${errors[field] ? "input-error" : ""}`} value={formData[field] || ""} onChange={handleChange} onBlur={handleBlur}>
          <option value="">Selecione</option>
          {options.map(option => <option key={option.codigo} value={option.codigo}>{option.codigo} - {option.nome}</option>)}
        </select>
      ) : (
        <input type={type} name={field} className={`input-text ${errors[field] ? "input-error" : ""}`} value={formData[field] || ""} onChange={handleChange} onBlur={handleBlur} />
      )}
      {errors[field] && <div className="error-text">{errors[field]}</div>}
    </div>
  ), [errors, formData, handleChange, handleBlur]);

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{title}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          {renderField("nome", "Nome")}
          {renderField("email", "Email", "email")}
          {renderField("cpf", "CPF")}
          {renderField("telefone", "Telefone")}
          {renderField("data_nascimento", "Data de Nascimento", "date")}

          {papel === "aluno" && (
            <>
              {renderField("matricula", "Matrícula")}
              {renderField("turma", "Turma")}
              {renderField("ano_ingresso", "Ano de Ingresso", "number")}
            </>
          )}

          {(papel === "coordenador" || papel === "cre") && (
            renderField("siape", "SIAPE", "number")
          )}

          {papel === "coordenador" && (
            <>
              {renderField("curso", "Curso", "select", cursos)}
              {renderField("inicio_mandato", "Início do Mandato", "date")}
              {renderField("fim_mandato", "Fim do Mandato", "date")}
            </>
          )}

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