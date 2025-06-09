import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import api from "../../services/api";

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

  const navigate = useNavigate();
  const { id } = useParams();

  const carregarUsuario = useCallback(async (usuarioId) => {
    try {
      const response = await api.get(`usuarios/${usuarioId}/`);
      const usuario = response.data;

      if (usuario.data_nascimento) {
        const data = new Date(usuario.data_nascimento);
        usuario.data_nascimento = data.toISOString().split("T")[0];
      }

      if (usuario.grupo === "Responsavel" && usuario.grupo_detalhes && usuario.grupo_detalhes.aluno_cpf) {
        setFormData({
          ...usuario,
          is_responsavel: true,
          aluno_cpf: usuario.grupo_detalhes.aluno_cpf,
        });
        setCpfBusca(usuario.grupo_detalhes.aluno_cpf);
        // Ao carregar um responsável existente, tenta buscar o nome do aluno
        try {
          const alunoResponse = await api.get(`alunos/buscar_por_cpf/?cpf=${usuario.grupo_detalhes.aluno_cpf}`);
          setNomeAlunoEncontrado(alunoResponse.data.nome_aluno); // Apenas o nome
          setAlunoBuscaErro("");
          setIsAlunoBuscadoEValido(true);
        } catch (alunoError) {
          console.error("Erro ao carregar nome do aluno do responsável:", alunoError);
          setNomeAlunoEncontrado("");
          setAlunoBuscaErro("Erro ao buscar nome do aluno associado.");
          setIsAlunoBuscadoEValido(false);
        }
      } else {
        setFormData({
          ...usuario,
          is_responsavel: false,
          aluno_cpf: "",
        });
        setCpfBusca("");
        setNomeAlunoEncontrado("");
        setAlunoBuscaErro("");
        setIsAlunoBuscadoEValido(false);
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      setMensagem(`Erro ${error.response?.status || ""}: ${error.response?.data?.detail || "Erro ao carregar usuário."}`);
      setTipoMensagem("erro");
      setShowFeedback(true);
    }
  }, []);

  useEffect(() => {
    if (id) {
      carregarUsuario(id);
    }
  }, [id, carregarUsuario]);

  const validarCampo = useCallback(async (fieldName, value) => {
    if (fieldName === "is_responsavel" || fieldName === "aluno_cpf") {
        return;
    }
    try {
      const data = { [fieldName]: value };
      const url = id ? `usuarios/${id}/` : "usuarios/";
      const method = id ? api.patch : api.post;
      await method(url, data);
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data) {
        setErrors((prev) => ({ ...prev, [fieldName]: error.response.data[fieldName] || null }));
      }
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

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
      } else if (name === "is_responsavel" && checked) {
        setIsAlunoBuscadoEValido(false);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCpfBuscaChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 9) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3');
    } else if (value.length > 3) {
        value = value.replace(/^(\d{3})$/, '$1');
    }
    setCpfBusca(value);
    setNomeAlunoEncontrado("");
    setAlunoBuscaErro("");
    setIsAlunoBuscadoEValido(false);
    setFormData((prev) => ({ ...prev, aluno_cpf: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validarCampo(name, value);
  };

  const handleBuscarAluno = async () => {
    const cpfLimpo = cpfBusca.replace(/\D/g, '');
    setNomeAlunoEncontrado("");
    setAlunoBuscaErro("");
    setIsAlunoBuscadoEValido(false);
    setFormData((prev) => ({ ...prev, aluno_cpf: "" }));

    if (!cpfLimpo || cpfLimpo.length !== 11) {
      setAlunoBuscaErro('Por favor, digite um CPF válido (11 dígitos).');
      return;
    }

    try {
      const response = await api.get(`alunos/buscar_por_cpf/?cpf=${cpfLimpo}`);
      const data = response.data;

      setNomeAlunoEncontrado(data.nome_aluno); // APENAS O NOME DO ALUNO
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
      if (!isAlunoBuscadoEValido) {
        formIsValid = false;
      }
    }

    setIsConcluirBtnDisabled(!formIsValid);

  }, [formData, isAlunoBuscadoEValido]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Limpa erros anteriores
    let currentErrors = {};

    // Validação de frontend: Se for responsável, o aluno deve ter sido buscado e validado
    if (formData.is_responsavel && !isAlunoBuscadoEValido) {
        currentErrors = { ...currentErrors, aluno_cpf: "Busque e valide o aluno responsável." };
    }

    // Validação de frontend: Formato básico de e-mail
    if (!formData.email.includes('@')) { 
        currentErrors = { ...currentErrors, email: "Email inválido." };
    }

    // Se houver erros de validação no frontend, exibe e interrompe o envio
    if (Object.keys(currentErrors).length > 0) {
        setErrors(currentErrors);
        setMensagem("Preencha todos os campos obrigatórios e valide o aluno.");
        setTipoMensagem("erro");
        setShowFeedback(true);
        return;
    }

    let createdUser = null; // Variável para armazenar o usuário criado no primeiro passo

    try {
        if (id) {
            // Cenário de EDIÇÃO DE USUÁRIO EXISTENTE
            // O endpoint base já cuida do '/solicitacoes/', então usamos apenas 'usuarios/{id}/'
            const updateUserData = {
                nome: formData.nome,
                email: formData.email,
                cpf: formData.cpf.replace(/\D/g, ''),
                telefone: formData.telefone.replace(/\D/g, ''),
                data_nascimento: formData.data_nascimento,
                is_active: formData.is_active,
            };
            await api.put(`usuarios/${id}/`, updateUserData); // CORRIGIDO: Removido 'solicitacoes/'
            setMensagem("Usuário atualizado com sucesso!");

        } else {
            // Cenário de CRIAÇÃO DE NOVO USUÁRIO (seja Externo ou Responsável)

            // PASSO 1: Criar o Usuário Base através do endpoint /usuarios/
            const newUserBaseData = {
                nome: formData.nome,
                email: formData.email,
                cpf: formData.cpf.replace(/\D/g, ''), 
                telefone: formData.telefone.replace(/\D/g, ''),
                data_nascimento: formData.data_nascimento,
            };

            // A chamada para 'usuarios/' já é relativa à base '/solicitacoes/'
            const userCreationResponse = await api.post("usuarios/", newUserBaseData); // CORRIGIDO: Removido 'solicitacoes/'
            createdUser = userCreationResponse.data; 
            console.log("Usuário base criado com sucesso:", createdUser);

            // PASSO 2 (CONDICIONAL): Se for para ser um Responsável, cria o registro de Responsável
            if (formData.is_responsavel && createdUser && createdUser.id) {
                const responsibleCreationData = {
                    usuario_id: createdUser.id, 
                    aluno_cpf: formData.aluno_cpf.replace(/\D/g, ''), 
                };
                // A chamada para 'responsaveis/' já é relativa à base '/solicitacoes/'
                await api.post("responsaveis/", responsibleCreationData); // CORRIGIDO: Removido 'solicitacoes/'
                setMensagem("Responsável cadastrado com sucesso!");
                console.log("Registro de Responsável criado e vinculado ao usuário.");
            } else {
                setMensagem("Usuário externo cadastrado com sucesso!");
            }
        }
        setTipoMensagem("sucesso");
        setShowFeedback(true);

    } catch (error) {
        console.error("Erro ao salvar usuário/responsável:", error.response);
        let errorMessages = [];

        if (error.response?.status === 400 && error.response.data) {
            if (error.response.data.usuario) { 
                for (const key in error.response.data.usuario) {
                    errorMessages.push(`${key.replace(/_/g, ' ')}: ${error.response.data.usuario[key].join(', ')}`);
                }
            } else if (error.response.data.aluno_cpf) {
                 errorMessages.push(`CPF do Aluno: ${error.response.data.aluno_cpf.join(', ')}`);
            } else if (error.response.data.detail) {
                errorMessages.push(error.response.data.detail);
            } else if (Object.keys(error.response.data).length > 0) {
                for (const key in error.response.data) {
                    if (key !== 'aluno_cpf') { 
                       errorMessages.push(`${key.replace(/_/g, ' ')}: ${error.response.data[key].join(', ')}`);
                    }
                }
            }
            
            setMensagem(`Erro de validação: ${errorMessages.join('\n') || "Verifique os campos."}`);
            setTipoMensagem("erro");
            setShowFeedback(true);
        } else {
            setMensagem(`Erro ${error.response?.status || ""}: ${error.response?.data?.detail || "Erro ao salvar usuário/responsável."}`);
            setTipoMensagem("erro");
            setShowFeedback(true);
        }
    }
};

  const fecharFeedback = useCallback(() => {
      setShowFeedback(false);
      // --- INÍCIO DA ALTERAÇÃO AQUI ---
      // Redireciona para /usuarios apenas se for um novo cadastro e sucesso
      if (tipoMensagem === "sucesso" && !id) { 
          navigate("/usuarios");
      }
      // --- FIM DA ALTERAÇÃO AQUI ---
  }, [navigate, id, tipoMensagem]);

  return (
    <div>
      <HeaderCRE />
      <main className="container form-container">
        <h2>{id ? "Editar Usuário" : "Cadastrar Novo Usuário"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          {Object.keys(initialState)
            .filter((key) => key !== "is_active" && key !== "is_responsavel" && key !== "aluno_cpf") 
            .map((field) => (
              <div className="form-group" key={field}>
                <label>{field.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}:</label>
                <input
                  type={field === "email" ? "email" : field === "data_nascimento" ? "date" : "text"}
                  name={field}
                  className={`input-text ${errors[field] ? "input-error" : ""}`}
                  value={formData[field] || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors[field] && <div className="error-text">{errors[field]}</div>}
              </div>
            ))}
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="is_responsavel"
                checked={formData.is_responsavel} 
                onChange={handleChange}
                id="isResponsavelCheckbox"
              />
              É responsável por um aluno?
            </label>
          </div>

          {formData.is_responsavel && (
            <div className="form-group" id="cadastroResponsavelSection">
              <label htmlFor="alunoCpfBusca">CPF do Aluno:</label>
              <input
                type="text"
                id="alunoCpfBusca"
                className={`input-text ${alunoBuscaErro ? "input-error" : ""}`}
                placeholder="Digite o CPF do aluno"
                value={cpfBusca}
                onChange={handleCpfBuscaChange}
                maxLength="14"
                style={{ marginBottom: '10px' }}
              />
              <button
                type="button"
                id="buscarAlunoBtn"
                onClick={handleBuscarAluno}
                className="submit-button"
                style={{ 
                  width: '100px', // Largura um pouco menor
                  padding: '8px 10px', // Padding um pouco menor
                  minWidth: 'unset',
                  display: 'block',
                  marginLeft: '0',
                  marginTop: '2px' // Empurra o botão um pouco para baixo do input
                }} 
              >
                Buscar
              </button>
              
              {/* Nome do aluno com margem superior para afastar do botão */}
              {nomeAlunoEncontrado && <p id="nomeAlunoEncontrado" style={{ color: 'black', marginTop: '30px' }}>{nomeAlunoEncontrado}</p>}
              {alunoBuscaErro && <p id="alunoBuscaErro" style={{ color: 'red', marginTop: '30px' }}>{alunoBuscaErro}</p>}
              
              {errors.aluno_cpf && <div className="error-text">{errors.aluno_cpf}</div>}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            id="concluirCadastroBtn"
            disabled={isConcluirBtnDisabled}
          >
            {id ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        <PopupFeedback
          show={showFeedback}
          mensagem={mensagem}
          tipo={tipoMensagem}
          onClose={fecharFeedback}
        />
      </main>
      <Footer />
    </div>
  );
}