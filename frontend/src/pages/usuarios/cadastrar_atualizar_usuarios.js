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
    let currentErrors = {};

    if (formData.is_responsavel && !isAlunoBuscadoEValido) {
      currentErrors = { ...currentErrors, aluno_cpf: "Busque e valide o aluno responsável." };
    }

    if (Object.keys(currentErrors).length > 0) {
        setErrors(currentErrors);
        setMensagem("Preencha todos os campos obrigatórios e valide o aluno.");
        setTipoMensagem("erro");
        setShowFeedback(true);
        return;
    }

    const dataToSend = { ...formData };
    
    // --- Lógica para o tipo_usuario ---
    if (dataToSend.is_responsavel && dataToSend.aluno_cpf) {
        dataToSend.tipo_usuario = 'RESPONSAVEL';
    } else {
        dataToSend.tipo_usuario = 'EXTERNO';
        delete dataToSend.aluno_cpf; // Garante que aluno_cpf não seja enviado para externos
    }
    // ---------------------------------

    const url = id ? `usuarios/${id}/` : "usuarios/";
    const request = id ? api.put(url, dataToSend) : api.post(url, dataToSend);

    try {
      await request;
      setMensagem(id ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");
      setTipoMensagem("sucesso");
      setShowFeedback(true);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error.response);
      if (error.response?.status === 400 && error.response.data) {
        setErrors(error.response.data);
        const errorDetail = error.response.data.detail || JSON.stringify(error.response.data);
        setMensagem(`Erro de validação: ${errorDetail}`);
        setTipoMensagem("erro");
        setShowFeedback(true);
      } else {
        setMensagem(`Erro ${error.response?.status || ""}: ${error.response?.data?.detail || "Erro ao salvar usuário."}`);
        setTipoMensagem("erro");
        setShowFeedback(true);
      }
    }
  };

  const fecharFeedback = useCallback(() => {
    setShowFeedback(false);
    navigate("/usuarios");
  }, [navigate]);

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