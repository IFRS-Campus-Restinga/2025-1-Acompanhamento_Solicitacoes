import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import api from "../../services/api";
import { getCookie } from "../../services/authUtils";

//CSS
import "../../components/styles/formulario.css";

const initialState = {
  nome: "",
  email: "",
  cpf: "",
  telefone: "",
  data_nascimento: "",
  is_active: true,
  is_responsavel: false,
  aluno_cpf: "",
};

// Mapeamento de campos para validação - ajustado para o aluno_cpf
const getValidationUrl = (fieldName) => {
  if (fieldName === "aluno_cpf") {
    return null;
  }
  return "usuarios/";
};

export default function CadastrarAtualizarUsuario() {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const [cpfBusca, setCpfBusca] = useState("");
  const [nomeAlunoEncontrado, setNomeAlunoEncontrado] = useState("");
  const [alunoBuscaErro, setAlunoBuscaErro] = useState("");
  const [isAlunoBuscadoEValido, setIsAlunoBuscadoEValido] = useState(false);
  const [isConcluirBtnDisabled, setIsConcluirBtnDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessful, setSubmissionSuccessful] = useState(false);
  const [responsavelId, setResponsavelId] = useState(null); 

  // Estado para controlar quais campos são somente leitura
  const [readOnlyFields, setReadOnlyFields] = useState({
    nome: false,
    email: false
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { id: idFromUrl } = useParams(); 

  const isEditing = !!idFromUrl;
  const title = isEditing ? "Editar Usuário" : "Cadastrar Usuário";
  const submitButtonText = isEditing ? "Atualizar" : "Cadastrar";

  // Efeito para carregar dados do Google do cookie
  useEffect(() => {
    try {
      
      const googleUserCookie = getCookie('googleUser');

      if (googleUserCookie) {
        // Parsear o cookie para obter os dados do usuário
        const googleUser = JSON.parse(googleUserCookie);
        console.log("Dados do usuário Google obtidos do cookie:", googleUser);

        if (googleUser && (googleUser.name || googleUser.email)) {
          // Atualizar o formulário com os dados do Google
          setFormData(prev => ({
            ...prev,
            nome: googleUser.name || prev.nome,
            email: googleUser.email || prev.email
          }));

          // Definir quais campos serão somente leitura
          setReadOnlyFields({
            nome: !!googleUser.name,
            email: !!googleUser.email
          });

          console.log("Formulário atualizado com dados do Google:", {
            nome: googleUser.name,
            email: googleUser.email
          });
        }
      } else {
        console.log("Cookie 'googleUser' não encontrado");

        // Verificar também os parâmetros da URL
        const queryParams = new URLSearchParams(location.search);
        const googleName = queryParams.get("google_name");
        const googleEmail = queryParams.get("google_email");

        if (googleName || googleEmail) {
          console.log("Dados do Google encontrados na URL:", { nome: googleName, email: googleEmail });

          setFormData(prev => ({
            ...prev,
            nome: googleName || prev.nome,
            email: googleEmail || prev.email
          }));

          setReadOnlyFields({
            nome: !!googleName,
            email: !!googleEmail
          });
        }
      }
    } catch (error) {
      console.error("Erro ao obter dados do Google:", error);
    }
  }, [location.search]);

  const carregarUsuario = useCallback(async (id) => {
    setMensagem(""); // Limpa mensagens anteriores
    setTipoMensagem("sucesso"); // Reseta o tipo de mensagem

    let dataToLoad = null;
    let isResponsavelUser = false;
    let currentResponsavelId = null;

    try {
      // Tenta buscar como um usuário comum primeiro
      const userResponse = await api.get(`usuarios/${id}/`);
      const usuario = userResponse.data;

      if (usuario.grupo === "Responsavel" && usuario.grupo_detalhes) {
        // Se o usuário é um Responsável (e tem grupo_detalhes), busca os dados completos do responsável
        const responsavelIdFromUserApi = usuario.grupo_detalhes.id;
        const responsavelResponse = await api.get(`responsaveis/${responsavelIdFromUserApi}/`);
        dataToLoad = responsavelResponse.data; // Esta é a resposta da API de responsáveis
        isResponsavelUser = true;
        currentResponsavelId = responsavelResponse.data.id; // Armazena o ID real do responsável
      } else {
        // É um usuário comum (não responsável)
        dataToLoad = usuario; // Esta é a resposta da API de usuários
        isResponsavelUser = false;
        currentResponsavelId = null;
      }
    } catch (userError) {
      console.warn(`Erro ao carregar usuário como 'usuarios/${id}':`, userError);
      // Se falhou como usuário, tenta buscar como responsável diretamente
      try {
        const responsavelResponse = await api.get(`responsaveis/${id}/`);
        dataToLoad = responsavelResponse.data; 
        isResponsavelUser = true;
        currentResponsavelId = responsavelResponse.data.id; 
      } catch (responsavelError) {
        console.error(`Erro ao carregar usuário como 'responsaveis/${id}':`, responsavelError);
        setMensagem(`Erro ao carregar usuário. ID ${id} não encontrado como usuário ou responsável.`);
        setTipoMensagem("erro");
        setShowFeedback(true);
        return; // Sai da função se ambas as tentativas falharem
      }
    }

    // Processa os dados carregados (seja usuário ou responsável)
    if (dataToLoad) {
      if (isResponsavelUser) {
        const userData = dataToLoad.usuario;
        const alunoData = dataToLoad.aluno;

        if (userData.data_nascimento) {
          const data = new Date(userData.data_nascimento);
          userData.data_nascimento = data.toISOString().split("T")[0];
        }

        setFormData({
          ...userData, 
          is_responsavel: true,
          aluno_cpf: alunoData?.cpf || "", 
        });
        setCpfBusca(alunoData?.cpf || "");
        setResponsavelId(dataToLoad.id); 

        
        if (alunoData?.cpf) {
          try {
            const alunoResponse = await api.get(`alunos/buscar_por_cpf/?cpf=${alunoData.cpf}`);
            setNomeAlunoEncontrado(alunoResponse.data.nome_aluno);
            setAlunoBuscaErro("");
            setIsAlunoBuscadoEValido(true);
          } catch (alunoError) {
            console.error("Erro ao buscar nome do aluno associado:", alunoError);
            setNomeAlunoEncontrado("");
            setAlunoBuscaErro("Erro ao buscar nome do aluno associado.");
            setIsAlunoBuscadoEValido(false);
          }
        } else {
          setNomeAlunoEncontrado("");
          setAlunoBuscaErro("");
          setIsAlunoBuscadoEValido(false);
        }
      } else {

        if (dataToLoad.data_nascimento) {
          const data = new Date(dataToLoad.data_nascimento);
          dataToLoad.data_nascimento = data.toISOString().split("T")[0];
        }

        setFormData({
          ...dataToLoad, 
          is_responsavel: false,
          aluno_cpf: "",
        });
        setCpfBusca("");
        setNomeAlunoEncontrado("");
        setAlunoBuscaErro("");
        setIsAlunoBuscadoEValido(false);
        setResponsavelId(null);
      }
    }
  }, []);

  // Efeito para carregar o usuário quando o ID na URL muda
  useEffect(() => {
    if (idFromUrl) {
      carregarUsuario(idFromUrl);
    }
  }, [idFromUrl, carregarUsuario]);

  // Função auxiliar para formatar CPF
  const formatCpf = (cpf) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length > 9) {
      return cleanCpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    } else if (cleanCpf.length > 6) {
      return cleanCpf.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3');
    } else if (cleanCpf.length > 3) {
      return cleanCpf.replace(/^(\d{3})$/, '$1');
    }
    return cleanCpf;
  };

  // Valida campo a campo no backend (exceto aluno_cpf)
  async function validateField(fieldName, value) {
    if (readOnlyFields[fieldName] || fieldName === "aluno_cpf") return;

    setErrors(prev => ({ ...prev, [fieldName]: null }));
    const url = getValidationUrl(fieldName);
    if (!url) return;

    try {
      await api[isEditing ? "patch" : "post"](url, { [fieldName]: value });
    } catch (error) {
      if (error.response?.status === 400) {
        if (error.response?.data?.usuario && error.response.data.usuario[fieldName]) {
          //Verifica se é um array antes de chamar join()
          const errorMsg = Array.isArray(error.response.data.usuario[fieldName])
            ? error.response.data.usuario[fieldName].join(', ')
            : error.response.data.usuario[fieldName];
          setErrors(prev => ({ ...prev, [fieldName]: errorMsg }));
        }
        else if (error.response?.data?.[fieldName]) {
          //Verifica se é um array antes de chamar join()
          const errorMsg = Array.isArray(error.response.data[fieldName])
            ? error.response.data[fieldName].join(', ')
            : error.response.data[fieldName];
          setErrors(prev => ({ ...prev, [fieldName]: errorMsg }));
        }
      }
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (readOnlyFields[name]) return;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === "is_responsavel" && !checked && { aluno_cpf: "" }),
      }));
      if (name === "is_responsavel" && !checked) {
        setCpfBusca("");
        setNomeAlunoEncontrado("");
        setAlunoBuscaErro("");
        setIsAlunoBuscadoEValido(false);
        setResponsavelId(null); // Limpa o ID do responsável se desmarcar
      } else if (name === "is_responsavel" && checked) {
        setIsAlunoBuscadoEValido(false);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCpfBuscaChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    setCpfBusca(formatCpf(value));

    setFormData((prev) => ({ ...prev, aluno_cpf: value }));

    setNomeAlunoEncontrado("");
    setAlunoBuscaErro("");
    setIsAlunoBuscadoEValido(false);
  };

  const handleBlur = (e) => {
    if (readOnlyFields[e.target.name]) return;

    validateField(e.target.name, e.target.value);
  };

  const handleBuscarAluno = async () => {
    const cpfLimpo = cpfBusca.replace(/\D/g, '');
    setNomeAlunoEncontrado("");
    setAlunoBuscaErro("");
    setIsAlunoBuscadoEValido(false);

    if (!cpfLimpo || cpfLimpo.length !== 11) {
      setAlunoBuscaErro('Por favor, digite um CPF válido (11 dígitos).');
      return;
    }

    try {
      const response = await api.get(`alunos/buscar_por_cpf/?cpf=${cpfLimpo}`);
      const data = response.data;

      setNomeAlunoEncontrado(data.nome_aluno);
      setAlunoBuscaErro("");
      setIsAlunoBuscadoEValido(true);
      setFormData((prev) => ({ ...prev, aluno_cpf: cpfLimpo }));
    } catch (error) {
      console.error("Erro na busca de aluno:", error.response);
      setNomeAlunoEncontrado("");
      setAlunoBuscaErro(error.response?.data?.detail || "Erro ao buscar aluno.");
      setIsAlunoBuscadoEValido(false);
      setFormData((prev) => ({ ...prev, aluno_cpf: "" }));
    }
  };

  useEffect(() => {
    let formIsValid = true;

    const requiredFields = ['nome', 'email', 'cpf', 'telefone', 'data_nascimento'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        formIsValid = false;
        break;
      }
    }

    if (formData.is_responsavel) {
      if (!isAlunoBuscadoEValido || !formData.aluno_cpf) {
        formIsValid = false;
      }
    }

    if (Object.values(errors).some(error => error !== null)) {
      formIsValid = false;
    }

    setIsConcluirBtnDisabled(!formIsValid);

  }, [formData, isAlunoBuscadoEValido, errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionSuccessful(false);
    setErrors({});

    const isResponsavel = formData.is_responsavel;
    const operacaoTexto = isEditing ? "atualizado" : "criado";
    const tipoUsuarioTexto = isResponsavel ? "responsavel" : "Usuário externo";

    try {
      let response;

      // Dados do usuário (comuns a ambos os tipos)
      const usuarioData = {
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        data_nascimento: formData.data_nascimento,
        is_active: formData.is_active,
      };

      if (isEditing) {
        if (isResponsavel) {
          // Edição de responsável
          if (!responsavelId) {
            throw new Error("ID do responsável não encontrado para edição.");
          }
          const updateResponsibleData = {
            // Os campos de usuário são enviados DENTRO de um objeto 'usuario'
            usuario: {
              ...usuarioData,
            },
            aluno_cpf: formData.aluno_cpf.replace(/\D/g, ''),
          };

          console.log(`Atualizando responsavel com ID ${responsavelId}:`, updateResponsibleData);

          // Usa o responsavelId para a chamada PUT/PATCH para a API de responsáveis
          response = await api.put(`responsaveis/${responsavelId}/`, updateResponsibleData);
          setMensagem("Responsável atualizado com sucesso!");
        } else {
          // Edição de Usuário externo
          console.log(`Atualizando usuário externo com ID ${idFromUrl}:`, usuarioData);
          response = await api.put(`usuarios/${idFromUrl}/`, usuarioData);
          setMensagem("Usuário externo atualizado com sucesso!");
        }
      } else {
        // Lógica de Criação
        if (isResponsavel) {
          // Criação de responsável
          const responsibleCreationData = {
            // Os campos de usuário são enviados DENTRO de um objeto 'usuario'
            usuario: {
              ...usuarioData,
            },
            aluno_cpf: formData.aluno_cpf.replace(/\D/g, ''),
          };

          console.log("Criando novo responsavel:", responsibleCreationData);
          response = await api.post("responsaveis/", responsibleCreationData);
          setMensagem("Responsável cadastrado com sucesso!");
        } else {
          // Criação de Usuário externo (não responsável)
          console.log("Criando novo usuário externo:", usuarioData);
          response = await api.post("usuarios/", usuarioData);
          setMensagem("Usuário externo cadastrado com sucesso!");
        }
      }

      console.log(`${tipoUsuarioTexto} ${operacaoTexto} com sucesso:`, response.data);
      setTipoMensagem("sucesso");
      setShowFeedback(true);
      setSubmissionSuccessful(true);

      if (!isEditing) {
        setFormData(initialState);
        setCpfBusca("");
        setNomeAlunoEncontrado("");
        setIsAlunoBuscadoEValido(false);
        setResponsavelId(null);
      }
    } catch (error) {
      console.error(`Erro ao ${operacaoTexto.toLowerCase()} ${tipoUsuarioTexto.toLowerCase()}:`, error.response);

      let errorMessages = [];
      const errorData = error.response?.data;

      if (error.response?.status === 400 && errorData) {
        // Processar erros de campos de usuário
        if (errorData.usuario) {
          for (const key in errorData.usuario) {
            const fieldName = key.replace(/_/g, ' ');
            const errorValue = errorData.usuario[key];
            // Correção: Verifica se é um array antes de chamar join()
            const errorMsg = Array.isArray(errorValue) ? errorValue.join(', ') : errorValue;
            errorMessages.push(`${fieldName}: ${errorMsg}`);
            setErrors(prev => ({ ...prev, [key]: errorMsg }));
          }
        }

        // Processar erro do CPF do aluno (se houver)
        if (errorData.aluno_cpf) {
          const errorValue = errorData.aluno_cpf;
          //Verifica se é um array antes de chamar join()
          const errorMsg = Array.isArray(errorValue) ? errorValue.join(', ') : errorValue;
          errorMessages.push(`CPF do Aluno: ${errorMsg}`);
          setErrors(prev => ({ ...prev, aluno_cpf: errorMsg }));
        }

        // Processar erros gerais (non_field_errors)
        if (errorData.non_field_errors) {
          errorMessages.push(`Geral: ${errorData.non_field_errors.join(', ')}`);
        }

        // Processar erro de detalhe
        if (errorData.detail) {
          errorMessages.push(errorData.detail);
        }

        // Processar outros erros de campo diretos no payload do responsável
        for (const key in errorData) {
          if (!['usuario', 'aluno_cpf', 'non_field_errors', 'detail'].includes(key)) {
            const fieldName = key.replace(/_/g, ' ');
            const errorMsg = Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key];
            errorMessages.push(`${fieldName}: ${errorMsg}`);
            setErrors(prev => ({ ...prev, [key]: errorMsg }));
          }
        }
      } else if (errorData?.detail) {
        errorMessages.push(errorData.detail);
      } else {
        errorMessages.push(`Erro desconhecido ao ${operacaoTexto.toLowerCase()} ${tipoUsuarioTexto.toLowerCase()}. Tente novamente.`);
      }

      setMensagem(errorMessages.join('\n'));
      setTipoMensagem("erro");
      setShowFeedback(true);
      setSubmissionSuccessful(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    if (submissionSuccessful) {
      navigate("/usuarios");
    }
  };

  return (
    <div>
      <main className="container form-container">
        <h2>{title}</h2>

        <form className="formulario formulario-largura" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className={`input-text ${errors.nome ? "input-error" : ""} ${readOnlyFields.nome ? "readonly-field" : ""}`}
              value={formData.nome}
              onChange={handleChange}
              onBlur={handleBlur}
              readOnly={readOnlyFields.nome}
              style={readOnlyFields.nome ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
              required
            />
            {errors.nome && <div className="error-text">{errors.nome}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`input-text ${errors.email ? "input-error" : ""} ${readOnlyFields.email ? "readonly-field" : ""}`}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              readOnly={readOnlyFields.email}
              style={readOnlyFields.email ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}}
              required
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="cpf">CPF:</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              className={`input-text ${errors.cpf ? "input-error" : ""}`}
              value={formData.cpf}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {errors.cpf && <div className="error-text">{errors.cpf}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone:</label>
            <input
              type="text"
              id="telefone"
              name="telefone"
              className={`input-text ${errors.telefone ? "input-error" : ""}`}
              value={formData.telefone}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {errors.telefone && <div className="error-text">{errors.telefone}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="data_nascimento">Data de Nascimento:</label>
            <input
              type="date"
              id="data_nascimento"
              name="data_nascimento"
              className={`input-text ${errors.data_nascimento ? "input-error" : ""}`}
              value={formData.data_nascimento}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {errors.data_nascimento && <div className="error-text">{errors.data_nascimento}</div>}
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="is_responsavel"
              name="is_responsavel"
              checked={formData.is_responsavel}
              onChange={handleChange}
            />
            <label htmlFor="is_responsavel">É responsável por um aluno</label>
          </div>

          {formData.is_responsavel && (
            <div className="form-group">
              <label htmlFor="cpf_busca">CPF do Aluno:</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="cpf_busca"
                  name="cpf_busca"
                  className={`input-text ${alunoBuscaErro || errors.aluno_cpf ? "input-error" : ""}`}
                  value={cpfBusca}
                  onChange={handleCpfBuscaChange}
                  placeholder="Digite o CPF do aluno"
                />
                <button
                  type="button"
                  onClick={handleBuscarAluno}
                  className="buscar-button"
                >
                  Buscar
                </button>
              </div>
              {alunoBuscaErro && <div className="error-text">{alunoBuscaErro}</div>}
              {errors.aluno_cpf && <div className="error-text">{errors.aluno_cpf}</div>}
              {nomeAlunoEncontrado && (
                <div className="aluno-encontrado">
                  <p>Aluno encontrado: <strong>{nomeAlunoEncontrado}</strong></p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isConcluirBtnDisabled || isSubmitting}
          >
            {isSubmitting ? "Processando..." : submitButtonText}
          </button>
        </form>

        <PopupFeedback
          show={showFeedback}
          mensagem={mensagem}
          tipo={tipoMensagem}
          onClose={handleCloseFeedback}
        />
      </main>
    </div>
  );
}
