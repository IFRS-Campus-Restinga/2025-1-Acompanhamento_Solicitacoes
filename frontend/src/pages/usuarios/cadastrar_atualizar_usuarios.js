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
  // --- NOVOS CAMPOS PARA RESPONSÁVEL ---
  is_responsavel: false, // Por padrão, não é responsável
  aluno_cpf: "", // Será preenchido com o CPF do aluno selecionado
  // ------------------------------------
};

export default function CadastrarAtualizarUsuario() {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [alunosDisponiveis, setAlunosDisponiveis] = useState([]); 

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
      // --- AJUSTE: Carregar dados de responsável na edição ---
      // Verifica se o usuário é um responsável e se possui o campo 'responsavel'
      if (usuario.grupo === "Responsavel" && usuario.grupo_detalhes && usuario.grupo_detalhes.aluno_cpf) {
        setFormData({
          ...usuario,
          is_responsavel: true,
          aluno_cpf: usuario.grupo_detalhes.aluno_cpf, // Preenche com o CPF do aluno vindo do backend
        });
      } else {
        // Para outros tipos de usuário ou responsáveis sem dados de aluno (inconsistência)
        setFormData({
            ...usuario,
            is_responsavel: false, // Garante que esteja false se não for Responsavel ou não tiver aluno_cpf
            aluno_cpf: ""
        });
      }
      // --------------------------------------------------------
      setFormData(usuario);
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

  useEffect(() => {
    // --- MUDANÇA: Busca e-mails E CPFs de alunos ---
    const fetchAlunos = async () => {
      try {
        // ASSUMIMOS que o endpoint '/usuarios/emails-alunos/' agora retorna
        // uma lista de objetos { email: "...", cpf: "..." }
        const response = await api.get('usuarios/emails-alunos/');
        setAlunosDisponiveis(response.data); // Armazena a lista de objetos (email, cpf)
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        // Opcional: Mostrar feedback de erro para o usuário
        // setMensagem("Erro ao carregar lista de alunos.");
        // setTipoMensagem("erro");
        // setShowFeedback(true);
      }
    };
    fetchAlunos();
  }, []);

  const validarCampo = useCallback(async (fieldName, value) => {
    // --- MUDANÇA: Não valide 'is_responsavel' e 'aluno_cpf' AQUI ---
    if (fieldName === "is_responsavel" || fieldName === "aluno_cpf") {
        return;
    }
    // ---------------------------------------------------------------
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
    // --- MUDANÇA: Tratamento para checkbox ---
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        // Se is_responsavel for desmarcado, limpa o aluno_cpf
        ...(name === "is_responsavel" && !checked && { aluno_cpf: "" }), 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validarCampo(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let currentErrors = {};

    // --- MUDANÇA: Validação frontend para `aluno_cpf` ---
    if (formData.is_responsavel && !formData.aluno_cpf) {
      currentErrors = { ...currentErrors, aluno_cpf: "Selecione o aluno responsável." };
    }

    if (Object.keys(currentErrors).length > 0) {
        setErrors(currentErrors);
        return;
    }

    // --- MUDANÇA: Prepara os dados para enviar para o backend ---
    const dataToSend = { ...formData };
    
    // Remove 'aluno_cpf' se o usuário não for responsável para evitar enviar dados desnecessários
    if (!dataToSend.is_responsavel) {
        delete dataToSend.aluno_cpf; 
    }

    // A propriedade 'is_active' não precisa ser enviada se não estiver no 'initialState'
    // ou se o backend gerencia isso. Por padrão, o DRF não exige que campos não alterados
    // em um POST sejam enviados, mas se for um PUT, todos são esperados.
    // Como você usa PUT para atualização, mantenha.

    // ---------------------------------------------------

    const url = id ? `usuarios/${id}/` : "usuarios/";
    // Para edição (PUT), enviamos todos os dados, inclusive os não alterados.
    // Para criação (POST), enviamos os dados do novo usuário.
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
            // --- MUDANÇA: Filtra os novos campos do mapeamento genérico ---
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
          {/* Checkbox "É responsável?" */}
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="is_responsavel"
                checked={formData.is_responsavel} 
                onChange={handleChange}
              />
              É responsável por um aluno?
            </label>
          </div>
          {/* Campo condicional para seleção do aluno pelo CPF */}
          {formData.is_responsavel && (
            <div className="form-group">
              <label>Aluno (selecione pelo E-mail):</label>
              <select
                name="aluno_cpf" // --- MUDANÇA: O nome do campo é 'aluno_cpf' para o backend ---
                className={`input-text ${errors.aluno_cpf ? "input-error" : ""}`}
                value={formData.aluno_cpf || ""} // O valor selecionado será o CPF do aluno
                onChange={handleChange}
                required={formData.is_responsavel}
              >
                <option value="">Selecione um aluno</option>
                {/* --- MUDANÇA: Renderiza opções com e-mail visível e CPF como valor --- */}
                {alunosDisponiveis.map((aluno) => (
                  <option key={aluno.cpf} value={aluno.cpf}>{aluno.email} (CPF: {aluno.cpf})</option>
                ))}
              </select>
              {errors.aluno_cpf && <div className="error-text">{errors.aluno_cpf}</div>}
            </div>
          )}

          <button type="submit" className="submit-button">
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