import api from "../../services/api";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

const initialFormState = {
  nome: "", email: "", cpf: "", telefone: "", data_nascimento: "",
  curso: "", ppc: "", matricula: "", ano_ingresso: "",
};

const getValidationUrl = (fieldName, papel) => {
  const base = "usuarios/";
  switch (fieldName) {
    case "matricula": case "ppc": case "ano_ingresso": return "alunos/";
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
  const [cursosComPpcs, setCursosComPpcs] = useState([]);
  const [ppcsDoCurso, setPpcsDoCurso] = useState([]);
  const [errors, setErrors] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("sucesso");
  const { pathname } = useLocation();
  const papel = pathname.split("/").pop();
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditing = !!id;
  const title = isEditing ? `Editar ${papel.charAt(0).toUpperCase() + papel.slice(1)}` : `Cadastrar Novo ${papel.charAt(0).toUpperCase() + papel.slice(1)}`;
  const submitButtonText = isEditing ? "Atualizar" : "Cadastrar";

  useEffect(() => {
    async function loadCursosComPpcs() {
      try {
        const response = await api.get("cursos/");
        setCursosComPpcs(response.data);
        console.log("Estrutura de cursosComPpcs:", response.data); //deletar
      } catch (error) {
        console.error("Erro ao carregar cursos com PPCs:", error);
        setFeedbackType("erro");
        setFeedbackMessage(`Erro ao carregar cursos: ${error.message}`);
        setShowFeedback(true);
      }
    }

    async function loadEntityDataForEdit(entityId) {
      if (!entityId) return;
      try {
        const entityEndpoint = getEntityEndpoint(papel);
        const entityResponse = await api.get(`${entityEndpoint}${entityId}/`);
        const userId = entityResponse.data.usuario;
        const userResponse = await api.get(`usuarios/${userId}/`);
        setFormData({ ...userResponse.data, ...entityResponse.data });
        // Carregar PPCs do curso do aluno para edição
        if (entityResponse.data.ppc) {
          const cursoDoAluno = cursosComPpcs.find(curso => curso.codigo === entityResponse.data.ppc.curso);
          setPpcsDoCurso(cursoDoAluno?.ppcs || []);
        }
      } catch (error) {
        console.error(`Erro ao carregar dados para edição de ${papel}:`, error);
        setFeedbackType("erro");
        setFeedbackMessage(`Erro ao carregar dados para edição de ${papel}.`);
        setShowFeedback(true);
      }
    }


    if (papel === "aluno" || papel === "coordenador") {
      loadCursosComPpcs();
    }
    if (id) {
      loadEntityDataForEdit(id);
    } else {
      setFormData(initialFormState);
    }
  }, [id, papel]);

  useEffect(() => {
    // Atualiza a lista de PPCs quando o curso selecionado muda
    const cursoSelecionado = cursosComPpcs.find(curso => curso.codigo === formData.curso);
    setPpcsDoCurso(cursoSelecionado?.ppcs || []);
    // Limpar o PPC selecionado ao mudar o curso
    setFormData(prev => ({ ...prev, ppc: "" }));
  }, [formData.curso, cursosComPpcs]);

  async function validateField(fieldName, value) {
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
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
    if (name === "curso") {  
    console.log("Curso selecionado:", value);
  }
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const papelTexto = papel.charAt(0).toUpperCase() + papel.slice(1);
    const operacaoTexto = isEditing ? "atualizado" : "criado";
    const entityEndpoint = getEntityEndpoint(papel);
    const url = isEditing ? `${entityEndpoint}${id}/` : entityEndpoint;
    const { nome, email, cpf, telefone, data_nascimento, curso, ppc, usuario, ...papelData } = formData;
    const userPayload = { nome, email, cpf, telefone, data_nascimento };
    const alunoPayload = { ...papelData, ppc: ppc };

    try {
      const requestMethod = isEditing ? api.patch : api.post;
      if (isEditing) {
        const entityResponse = await api.get(`${entityEndpoint}${id}/`);
        const userId = entityResponse.data.usuario;
        await api.patch(`usuarios/${userId}/`, userPayload);
        await requestMethod(url, alunoPayload);
      } else if (papel === "aluno") {
        const userResponse = await api.post("usuarios/", userPayload);
        const userId = userResponse.data.id;
        await requestMethod(url, { ...alunoPayload, curso: curso, ppc: ppc, usuario: userId });
      } else {
        // Lógica para outros papéis (coordenador, cre) se necessário
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
  }

  const closeFeedback = () => {
    setShowFeedback(false);
    navigate("/usuarios");
  };

  const renderField = (field, label, type = "text", options = [], optionLabelKey = "nome", optionValueKey = "codigo") => (
  <div className="form-group" key={field}>
    <label>{label}:</label>
    {type === "select" ? (
      <select
        name={field}
        className={`input-text ${errors[field] ? "input-error" : ""}`}
        value={formData[field] || ""}
        onChange={handleChange}
        onBlur={handleBlur}
      >
        <option value="">Selecione</option>
        {field === "ppc" &&
          options.map(option => {
            console.log("Opção do PPC no render:", option);
            return (
              <option key={option} value={option}>
                {option}
              </option>
            );
          })}

        {options.map(option => (
          <option key={option?.codigo} value={option?.codigo}>
            {option?.nome}
          </option>
        ))}
      </select>
      ) : (
        <input
          type={type}
          name={field}
          className={`input-text ${errors[field] ? "input-error" : ""}`}
          value={formData[field] || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          required={["nome", "email", "cpf", "telefone", "data_nascimento"].includes(field)}
        />
      )}
      {errors[field] && <div className="error-text">{errors[field]}</div>}
    </div>
  );

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
              {renderField("curso", "Curso", "select", cursosComPpcs, "nome", "codigo")}
              {renderField("ppc", "PPC", "select", ppcsDoCurso)}
              {renderField("matricula", "Matrícula", "text")}
              {renderField("ano_ingresso", "Ano de Ingresso", "number")}
            </>
          )}

          {(papel === "coordenador" || papel === "cre") && (
            renderField("siape", "SIAPE", "number")
          )}

          {papel === "coordenador" && (
            <>
              {renderField("curso", "Curso", "select", cursosComPpcs, "nome", "codigo")}
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