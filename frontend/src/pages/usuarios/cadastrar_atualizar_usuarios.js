import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/headers/header";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import api from "../../services/api";

const initialState = {
  nome: "",
  email: "",
  cpf: "",
  telefone: "",
  data_nascimento: "",
  is_active: true,
};

export default function CadastrarAtualizarUsuario() {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

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

  const validarCampo = useCallback(async (fieldName, value) => {
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validarCampo(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = id ? `usuarios/${id}/` : "usuarios/";
    const request = id ? api.put(url, formData) : api.post(url, formData);

    try {
      await request;
      setMensagem(id ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");
      setTipoMensagem("sucesso");
      setShowFeedback(true);
    } catch (error) {
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
      <Header />
      <main className="container form-container">
        <h2>{id ? "Editar Usuário" : "Cadastrar Novo Usuário"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          {Object.keys(initialState)
            .filter((key) => key !== "is_active")
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