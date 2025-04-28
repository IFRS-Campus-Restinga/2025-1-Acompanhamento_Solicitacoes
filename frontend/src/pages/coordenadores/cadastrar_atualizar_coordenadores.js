//teste//


import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function CadastrarAtualizarCoordenador() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    siape: "",
    curso: "",
    inicio_mandato: "",
    fim_mandato: ""
  });

  const [errors, setErrors] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [cursos, setCursos] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams(); // id do coordenador

  const getCursos = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/cursos/`);
      setCursos(response.data);  // A resposta deve conter a lista de cursos
    } catch (error) {
      console.error("Erro ao carregar cursos", error);
    }
  };

  useEffect(() => {
    getCursos();  // Carregar os cursos quando o componente for montado

    if (id) {
      axios.get(`http://localhost:8000/solicitacoes/coordenadores/${id}/`)
        .then(res => {
          const data = res.data;
          setFormData({
            nome: data.usuario.nome,
            email: data.usuario.email,
            cpf: data.usuario.cpf,
            telefone: data.usuario.telefone,
            data_nascimento: data.usuario.data_nascimento,
            siape: data.siape,
            curso: data.mandato.curso, // Preenchendo com o curso do coordenador
            inicio_mandato: data.mandato.inicio_mandato,
            fim_mandato: data.mandato.fim_mandato || "",
          });
        })
        .catch(err => {
          console.error(err);
          setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao carregar coordenador."}`);
          setTipoMensagem("erro");
          setShowFeedback(true);
        });
    }
  }, [id]);

  const validateField = (fieldName, value) => {
    const data = { [fieldName]: value };
    const url = id
      ? `http://localhost:8000/solicitacoes/coordenadores/${id}/`
      : "http://localhost:8000/solicitacoes/coordenadores/";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = id
      ? `http://localhost:8000/solicitacoes/coordenadores/${id}/`
      : "http://localhost:8000/solicitacoes/coordenadores/";

    const method = id ? axios.put : axios.post;

    const payload = {
      usuario: {
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone,
        data_nascimento: formData.data_nascimento,
      },
      siape: formData.siape,
      mandato: {
        curso: formData.curso,
        inicio_mandato: formData.inicio_mandato,
        fim_mandato: formData.fim_mandato || null,
      }
    };

    try {
      await method(url, payload);
      setMensagem(id ? "Coordenador atualizado com sucesso!" : "Coordenador cadastrado com sucesso!");
      setTipoMensagem("sucesso");
      setShowFeedback(true);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400 && err.response.data) {
        setErrors(err.response.data);
      } else {
        setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar coordenador."}`);
        setTipoMensagem("erro");
        setShowFeedback(true);
      }
    }
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{id ? "Editar Coordenador" : "Cadastrar Novo Coordenador"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          {[ 
            { name: "nome", label: "Nome" },
            { name: "email", label: "Email", type: "email" },
            { name: "cpf", label: "CPF" },
            { name: "telefone", label: "Telefone" },
            { name: "data_nascimento", label: "Data de Nascimento", type: "date" },
            { name: "siape", label: "SIAPE" },
            { name: "inicio_mandato", label: "Início do Mandato", type: "date" },
            { name: "fim_mandato", label: "Fim do Mandato", type: "date" },
          ].map(({ name, label, type = "text" }) => (
            <div className="form-group" key={name}>
              <label>{label}:</label>
              <input
                type={type}
                name={name}
                className={`input-text ${errors[name] ? "input-error" : ""}`}
                value={formData[name] || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {errors[name] && <div className="error-text">{errors[name]}</div>}
            </div>
          ))}

          {/* Campo de seleção para o curso */}
          <div className="form-group">
            <label>Curso:</label>
            <select
              name="curso"
              className={`input-text ${errors.curso ? "input-error" : ""}`}
              value={formData.curso || ""}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o curso</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.nome}
                </option>
              ))}
            </select>
            {errors.curso && <div className="error-text">{errors.curso}</div>}
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
            navigate("/coordenadores");
          }}
        />
      </main>
      <Footer />
    </div>
  );
}