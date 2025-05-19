import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/headers/header";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";
import api from "../../services/api";

const initialFormState = {
  nome: "", email: "", cpf: "", telefone: "", data_nascimento: "",
  curso: "", ppc: "", matricula: "", ano_ingresso: "",
  siape: "", inicio_mandato: "", fim_mandato: ""
};

// Mapeamento de papéis para endpoints atômicos
const PAPEL_ENDPOINTS = {
  aluno: "alunos/",
  coordenador: "coordenadores/",
  cre: "cres/"
};

// Mapeamento de campos para validação
const getValidationUrl = (fieldName, papel) => {
  switch (fieldName) {
    case "matricula": case "ppc": case "ano_ingresso": 
      return "alunos/";
    case "siape":
      return papel === "cre" ? "cres/" : "coordenadores/";
    case "inicio_mandato": case "fim_mandato":
      return "mandatos/";
    default: 
      return "usuarios/";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { pathname } = useLocation();
  //const papel = pathname.split("/").pop();
  const { id, papel } = useParams();
  const navigate = useNavigate();
  const [submissionSuccessful, setSubmissionSuccessful] = useState(false);

  const isEditing = !!id;
  const title = isEditing ? `Editar ${papel.charAt(0).toUpperCase() + papel.slice(1)}` : `Cadastrar Novo ${papel.charAt(0).toUpperCase() + papel.slice(1)}`;
  const submitButtonText = isEditing ? "Atualizar" : "Cadastrar";

  useEffect(() => {
    async function loadCursosComPpcs() {
      try {
        const response = await api.get("cursos/");
        setCursosComPpcs(response.data);
        console.log("Estrutura de cursosComPpcs:", response.data);
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
        const entityEndpoint = PAPEL_ENDPOINTS[papel];
        const entityResponse = await api.get(`${entityEndpoint}${entityId}/`);
        
        // Extrair dados do usuário e da entidade específica
        let userData = {};
        let entityData = {};
        
        if (papel === "coordenador") {
          // Para coordenador, a estrutura pode ser diferente devido ao mandato
          userData = entityResponse.data.usuario || {};
          entityData = {
            ...entityResponse.data.coordenador || {},
            curso: entityResponse.data.mandato?.curso || "",
            inicio_mandato: entityResponse.data.mandato?.inicio_mandato || "",
            fim_mandato: entityResponse.data.mandato?.fim_mandato || ""
          };
        } else {
          // Para aluno e CRE
          userData = entityResponse.data.usuario || {};
          entityData = entityResponse.data[papel] || {};
        }
        
        setFormData({ ...userData, ...entityData });
        
        // Carregar PPCs do curso do aluno para edição
        if (papel === "aluno" && entityData.ppc) {
          const cursoDoAluno = cursosComPpcs.find(curso => curso.codigo === entityData.ppc.curso);
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
    
    // Limpar o PPC selecionado ao mudar o curso (apenas para novos cadastros)
    if (!isEditing) {
      setFormData(prev => ({ ...prev, ppc: "" }));
    }
  }, [formData.curso, cursosComPpcs, isEditing]);

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
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionSuccessful(false);
    
    const papelTexto = papel.charAt(0).toUpperCase() + papel.slice(1);
    const operacaoTexto = isEditing ? "atualizado" : "criado";

    const usuario = {
      nome: formData.nome,
      email: formData.email,
      cpf: formData.cpf,
      telefone: formData.telefone,
      data_nascimento: formData.data_nascimento,
    }

    
    try {
      let response;
      
      
      if (isEditing) {
        // Lógica para edição
        const entityEndpoint = PAPEL_ENDPOINTS[papel];
        
        // Preparar payload baseado no papel
        let payload = {};
        
        
        if (papel === "aluno") {
          payload = {
            usuario,
            matricula: formData.matricula,
            ppc: formData.ppc,
            ano_ingresso: formData.ano_ingresso
          };
        } else if (papel === "coordenador") {
          payload = {
            usuario,
            siape: formData.siape,
            curso: formData.curso,
            inicio_mandato: formData.inicio_mandato,
            fim_mandato: formData.fim_mandato
          };
        } else if (papel === "cre") {
          payload = {
            usuario,
            siape: formData.siape
          };
        }
        
        response = await api.patch(`${entityEndpoint}${id}/`, payload);
      } 
      else {
        // Lógica para criação usando endpoints atômicos
        const entityEndpoint = PAPEL_ENDPOINTS[papel];
        
        // Preparar payload baseado no papel
        let payload = {};
        
        if (papel === "aluno") {
          payload = {
            usuario,
            matricula: formData.matricula,
            ppc: formData.ppc,
            ano_ingresso: formData.ano_ingresso
          };
        } else if (papel === "coordenador") {
          payload = {
            usuario,
            siape: formData.siape,
            curso: formData.curso,
            inicio_mandato: formData.inicio_mandato,
            fim_mandato: formData.fim_mandato
          };
        } else if (papel === "cre") {
          payload = {
            usuario,
            siape: formData.siape
          };
        }
        
        console.log(`Enviando payload para criação atômica de ${papel}:`, payload);
        response = await api.post(entityEndpoint, payload);
      }
      
      setFeedbackType("sucesso");
      setFeedbackMessage(`${papelTexto} ${operacaoTexto} com sucesso!`);
      setShowFeedback(true);
      setFormData(initialFormState);
      setErrors({});
      setSubmissionSuccessful(true);
    } catch (error) {
      console.error(`Erro ao ${operacaoTexto.toLowerCase()} ${papel}:`, error);
      const errorData = error.response?.data;
      setFeedbackType("erro");
      setFeedbackMessage(`Erro ao ${operacaoTexto.toLowerCase()} ${papelTexto.toLowerCase()}. ${errorData ? JSON.stringify(errorData) : ""}`);
      setShowFeedback(true);
      if (errorData) setErrors(errorData);
      setSubmissionSuccessful(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const closeFeedback = () => {
    setShowFeedback(false);
    if (submissionSuccessful) {
      navigate("/usuarios");
    }
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
          {field === "ppc" && ppcsDoCurso.length > 0 &&
            ppcsDoCurso.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))
          }
          
          {field !== "ppc" && options.length > 0 &&
            options.map(option => (
              <option key={option?.codigo} value={option?.codigo}>
                {option?.nome}
              </option>
            ))
          }
        </select>
      ) : (
        <input
          type={type}
          name={field}
          className={`input-text ${errors[field] ? "input-error" : ""}`}
          value={formData[field] || ""}
          onChange={handleChange}
          onBlur={handleBlur}
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
              {renderField("curso", "Curso", "select", cursosComPpcs)}
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
              {renderField("curso", "Curso", "select", cursosComPpcs)}
              {renderField("inicio_mandato", "Início do Mandato", "date")}
              {renderField("fim_mandato", "Fim do Mandato", "date")}
            </>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processando..." : submitButtonText}
          </button>
        </form>

        <PopupFeedback
          show={showFeedback}
          mensagem={feedbackMessage}
          tipo={feedbackType}
          onClose={closeFeedback}
        />
        <BotaoVoltar onClick={() => navigate(-1)} />
      </main>
      <Footer />
    </div>
  );
}
