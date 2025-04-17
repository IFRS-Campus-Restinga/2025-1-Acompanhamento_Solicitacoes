import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";
import PopupFeedback from "./popup_feedback";
import "./usuarios.css";

export default function CadastrarAtualizarUsuario() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/solicitacoes/usuarios/${id}/`)
        .then(res => setFormData(res.data))
        .catch(err => {
          setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar usuário."}`);
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    }
  }, [id]);

  const validateField = (fieldName, value) => {
    const data = { [fieldName]: value };
    const url = id
      ? `http://localhost:8000/solicitacoes/usuarios/${id}/`
      : "http://localhost:8000/solicitacoes/usuarios/";

    const method = id ? axios.patch : axios.post;

    method(url, data)
      .then(() => setErrors(prev => ({ ...prev, [fieldName]: null })))
      .catch(err => {
        if (err.response?.status === 400 && err.response?.data) {
          setErrors(prev => ({ ...prev, [fieldName]: err.response.data[fieldName] || null }));
        }
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = id
      ? `http://localhost:8000/solicitacoes/usuarios/${id}/`
      : "http://localhost:8000/solicitacoes/usuarios/";

    const request = id ? axios.put(url, formData) : axios.post(url, formData);

    request
      .then(() => {
        setMensagem(id ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");
        setTipoMensagem("sucesso");
        setShowFeedback(true);
      })
      .catch(err => {
        if (err.response?.status === 400 && err.response.data) {
          setErrors(err.response.data);
        } else {
          setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar usuário."}`);
          setTipoMensagem("erro");
          setShowFeedback(true);
        }
      });
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{id ? "Editar Usuário" : "Cadastrar Novo Usuário"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          {["nome", "email", "cpf", "telefone", "data_nascimento"].map((field) => (
            <div className="form-group" key={field}>
              <label>{field.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}:</label>
              <input
                type={field === "email" ? "email" : field === "data_nascimento" ? "date" : "text"}
                name={field}
                className="input-text"
                value={formData[field] || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {errors[field] && <div className="error-text">{errors[field]}</div>}
            </div>
          ))}

          <div className="form-group">
            <label>Ativo:</label>
            <select
              className="input-select"
              name="is_active"
              value={formData.is_active ? "true" : "false"}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === "true" }))}
              onBlur={handleBlur}
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>

          <button type="submit" className="submit-button">
            {id ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        <PopupFeedback
          show={showFeedback}
          mensagem={mensagem}
          tipo={tipoMensagem}
          onClose={() => {
            setShowFeedback(false);
            navigate("/usuarios");
          }}
        />
      </main>
      <Footer />
    </div>
  );
}