import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";
import api from "../../services/api";

const initialFormState = {
  nome: "", email: "", cpf: "", telefone: "", data_nascimento: "",
  curso: "", ppc: "", matricula: "", ano_ingresso: "",
  siape: "", inicio_mandato: "", fim_mandato: ""
};

// Mapeamento de papéis para endpoints atômicos
const GRUPO_ENDPOINTS = {
  aluno: "alunos/",
  coordenador: "coordenadores/",
  cre: "cres/"
};

// Mapeamento de campos para validação
const getValidationUrl = (fieldName, grupo) => {
  switch (fieldName) {
    case "matricula": case "ppc": case "ano_ingresso": 
      return "alunos/";
    case "siape":
      return grupo === "cre" ? "cres/" : "coordenadores/";
    case "inicio_mandato": case "fim_mandato":
      return "mandatos/";
    default: 
      return "usuarios/";
  }
};

export default function CadastrarAtualizarUsuarioGrupo() {
  const [formData, setFormData] = useState(initialFormState);
  const [cursosComPpcs, setCursosComPpcs] = useState([]);
  const [ppcsDoCurso, setPpcsDoCurso] = useState([]);
  const [errors, setErrors] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("sucesso");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { pathname } = useLocation();
  const { id, grupo } = useParams();
  const navigate = useNavigate();
  const [submissionSuccessful, setSubmissionSuccessful] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const isEditing = !!id;
  const title = isEditing ? `Editar ${grupo.charAt(0).toUpperCase() + grupo.slice(1)}` : `Cadastrar Novo ${grupo.charAt(0).toUpperCase() + grupo.slice(1)}`;
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

    if (grupo === "aluno" || grupo === "coordenador") {
      loadCursosComPpcs();
    }
    
    // Carregar dados de edição para CRE imediatamente, pois não depende de cursos
    if (id && grupo === "cre") {
      loadEntityDataForEdit(id);
    }
  }, [grupo, id]);

  // Efeito separado para carregar dados de edição após cursosComPpcs estar disponível
  useEffect(() => {
    if (id && (grupo === "aluno" || grupo === "coordenador") && cursosComPpcs.length > 0 && !dataLoaded) {
      loadEntityDataForEdit(id);
      setDataLoaded(true);
    }
  }, [id, grupo, cursosComPpcs, dataLoaded]);

  async function loadEntityDataForEdit(entityId) {
    if (!entityId) return;
    try {
      const entityEndpoint = GRUPO_ENDPOINTS[grupo];
      const entityResponse = await api.get(`${entityEndpoint}${entityId}`);
      
      console.log("Resposta da API para edição:", entityResponse.data);
      
      // Extrair dados do usuário
      const userData = entityResponse.data.usuario || {};
      
      // Extrair dados específicos do grupo
      let entityData = {};
      
      if (grupo === "aluno") {
        entityData = {
          matricula: entityResponse.data.matricula,
          ppc: entityResponse.data.ppc,
          ano_ingresso: entityResponse.data.ano_ingresso
        };
        
        // Extrair o código do curso do PPC (assumindo formato "curso/numero")
        if (entityData.ppc && entityData.ppc.includes('/')) {
          const cursoCodigo = entityData.ppc.split('/')[0];
          entityData.curso = cursoCodigo;
          
          // Atualizar PPCs do curso
          const cursoDoAluno = cursosComPpcs.find(curso => curso.codigo === cursoCodigo);
          if (cursoDoAluno) {
            setPpcsDoCurso(cursoDoAluno.ppcs || []);
          }
        }
      } else if (grupo === "coordenador") {
        entityData = {
          siape: entityResponse.data.siape
        };
        
        // Tratar os dados do mandato (pegar o mandato mais recente)
        if (entityResponse.data.mandatos_coordenador && entityResponse.data.mandatos_coordenador.length > 0) {
          // Ordenar mandatos por data de início (mais recente primeiro)
          const mandatos = [...entityResponse.data.mandatos_coordenador].sort((a, b) => {
            // Converter datas para formato comparável
            const dataA = a.inicio_mandato.split('-').reverse().join('-');
            const dataB = b.inicio_mandato.split('-').reverse().join('-');
            return new Date(dataB) - new Date(dataA);
          });
          
          const mandatoAtual = mandatos[0];
          entityData.curso = mandatoAtual.curso;
          
          // Converter formato de data de DD-MM-YYYY para YYYY-MM-DD
          if (mandatoAtual.inicio_mandato) {
            const [dia, mes, ano] = mandatoAtual.inicio_mandato.split('-');
            entityData.inicio_mandato = `${ano}-${mes}-${dia}`;
          }
          
          if (mandatoAtual.fim_mandato) {
            const [dia, mes, ano] = mandatoAtual.fim_mandato.split('-');
            entityData.fim_mandato = `${ano}-${mes}-${dia}`;
          }
        }
      } else if (grupo === "cre") {
        entityData = {
          siape: entityResponse.data.siape
        };
      }
      
      console.log("Dados extraídos para o formulário:", { ...userData, ...entityData });
      setFormData({ ...userData, ...entityData });
      
    } catch (error) {
      console.error(`Erro ao carregar dados para edição de ${grupo}:`, error);
      setFeedbackType("erro");
      setFeedbackMessage(`Erro ao carregar dados para edição de ${grupo}.`);
      setShowFeedback(true);
    }
  }

  useEffect(() => {
    // Atualiza a lista de PPCs quando o curso selecionado muda
    const cursoSelecionado = cursosComPpcs.find(curso => curso.codigo === formData.curso);
    if (cursoSelecionado) {
      setPpcsDoCurso(cursoSelecionado.ppcs || []);
    }
    
    // Limpar o PPC selecionado ao mudar o curso (apenas para novos cadastros)
    if (!isEditing) {
      setFormData(prev => ({ ...prev, ppc: "" }));
    }
  }, [formData.curso, cursosComPpcs, isEditing]);

  // Valida campo a campo no backend e é chamando no handleBlur
  async function validateField(fieldName, value) {
    setErrors(prev => ({ ...prev, [fieldName]: null }));
    const url = getValidationUrl(fieldName, grupo);
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
    
    const grupoTexto = grupo.charAt(0).toUpperCase() + grupo.slice(1);
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
        const entityEndpoint = GRUPO_ENDPOINTS[grupo];
        
        // Preparar payload baseado no grupo
        let payload = {};

        
        if (grupo === "aluno") {
          payload = {
            usuario,
            matricula: formData.matricula,
            ppc: formData.ppc,
            ano_ingresso: formData.ano_ingresso
          };

         
          console.log("Payload formatado para edição de aluno:", payload);

        } else if (grupo === "coordenador") {
          // Converter datas de volta para o formato esperado pelo backend (DD-MM-YYYY)
          let inicio_mandato = formData.inicio_mandato;
          let fim_mandato = formData.fim_mandato;
          
          if (inicio_mandato && inicio_mandato.includes('-')) {
            const [ano, mes, dia] = inicio_mandato.split('-');
            inicio_mandato = `${dia}-${mes}-${ano}`;
          }
          
          if (fim_mandato && fim_mandato.includes('-')) {
            const [ano, mes, dia] = fim_mandato.split('-');
            fim_mandato = `${dia}-${mes}-${ano}`;
          }
          
          payload = {
            usuario,
            siape: formData.siape,
            curso: formData.curso,
            inicio_mandato,
            fim_mandato
          };
        } else if (grupo === "cre") {
          payload = {
            usuario,
            siape: formData.siape
          };
        }
        
        console.log(`Enviando payload para edição de ${grupo}:`, payload);
        response = await api.patch(`${entityEndpoint}${id}/`, payload);
      } 
      else {
        // Lógica para criação usando endpoints atômicos
        const entityEndpoint = GRUPO_ENDPOINTS[grupo];
        
        // Preparar payload baseado no grupo
        let payload = {};
        
        if (grupo === "aluno") {
          payload = {
            usuario,
            matricula: formData.matricula,
            ppc: formData.ppc,
            ano_ingresso: formData.ano_ingresso
          };
        } else if (grupo === "coordenador") {
          // Converter datas para o formato esperado pelo backend (DD-MM-YYYY)
          let inicio_mandato = formData.inicio_mandato;
          let fim_mandato = formData.fim_mandato;
          
          if (inicio_mandato && inicio_mandato.includes('-')) {
            const [ano, mes, dia] = inicio_mandato.split('-');
            inicio_mandato = `${dia}-${mes}-${ano}`;
          }
          
          if (fim_mandato && fim_mandato.includes('-')) {
            const [ano, mes, dia] = fim_mandato.split('-');
            fim_mandato = `${dia}-${mes}-${ano}`;
          }
          
          payload = {
            usuario,
            siape: formData.siape,
            curso: formData.curso,
            inicio_mandato,
            fim_mandato
          };
        } else if (grupo === "cre") {
          payload = {
            usuario,
            siape: formData.siape
          };
        }
        
        console.log(`Enviando payload para criação atômica de ${grupo}:`, payload);
        response = await api.post(entityEndpoint, payload);
      }
      
      setFeedbackType("sucesso");
      setFeedbackMessage(`${grupoTexto} ${operacaoTexto} com sucesso!`);
      setShowFeedback(true);
      setFormData(initialFormState);
      setErrors({});
      setSubmissionSuccessful(true);
    } catch (error) {
      console.error(`Erro ao ${operacaoTexto.toLowerCase()} ${grupo}:`, error);
      const errorData = error.response?.data;
      setFeedbackType("erro");
      setFeedbackMessage(`Erro ao ${operacaoTexto.toLowerCase()} ${grupoTexto.toLowerCase()}. ${errorData ? JSON.stringify(errorData) : ""}`);
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
      <HeaderCRE />
      <main className="container form-container">
        <h2>{title}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          {renderField("nome", "Nome")}
          {renderField("email", "Email", "email")}
          {renderField("cpf", "CPF")}
          {renderField("telefone", "Telefone")}
          {renderField("data_nascimento", "Data de Nascimento", "date")}

          {grupo === "aluno" && (
            <>
              {renderField("curso", "Curso", "select", cursosComPpcs)}
              {renderField("ppc", "PPC", "select", ppcsDoCurso)}
              {renderField("matricula", "Matrícula", "text")}
              {renderField("ano_ingresso", "Ano de Ingresso", "number")}
            </>
          )}

          {(grupo === "coordenador" || grupo === "cre") && (
            renderField("siape", "SIAPE", "number")
          )}

          {grupo === "coordenador" && (
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
