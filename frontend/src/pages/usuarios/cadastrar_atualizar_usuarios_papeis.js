import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import PopupFeedback from "../../components/pop_ups/popup_feedback";

export default function CadastrarAtualizarUsuarioPapel() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    matricula: "",
    turma: "",
    ano_ingresso: "",
    siape: "",
    curso: "",
    inicio_mandato: "",
    fim_mandato: "",
  });

  const [cursos, setCursos] = useState([]);
  const [errors, setErrors] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const navigate = useNavigate();
  const location = useLocation();
  const papel = location.pathname.split("/").pop();

  useEffect(() => {
    if (papel === "coordenador") {
      axios.get("http://localhost:8000/solicitacoes/cursos/")
        .then((res) => setCursos(res.data))
        .catch((err) => console.error("Erro ao carregar cursos", err));
    }
  }, [papel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const usuarioPayload = {
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone,
        data_nascimento: formData.data_nascimento,
      };

      const usuarioResponse = await axios.post("http://localhost:8000/solicitacoes/usuarios/", usuarioPayload);
      const usuarioId = usuarioResponse.data.id;

      if (papel === "aluno") {
        await axios.post("http://localhost:8000/solicitacoes/alunos/", {
          usuario: usuarioId,
          matricula: formData.matricula,
          turma: formData.turma,
          ano_ingresso: formData.ano_ingresso,
        });
      } else if (papel === "coordenador") {
        const coordenadorResponse = await axios.post("http://localhost:8000/solicitacoes/coordenadores/", {
          usuario: usuarioId,
          siape: formData.siape,
        });

        const coordenadorId = coordenadorResponse.data.id;

        await axios.post("http://localhost:8000/solicitacoes/mandatos/", {
          coordenador: coordenadorId,
          curso: formData.curso,
          inicio_mandato: formData.inicio_mandato,
          fim_mandato: formData.fim_mandato || null,
        });
      } else if (papel === "cre") {
        await axios.post("http://localhost:8000/solicitacoes/cres/", {
          usuario: usuarioId,
          siape: formData.siape,
        });
      }

      setMensagem("Cadastro realizado com sucesso!");
      setTipoMensagem("sucesso");
      setShowFeedback(true);

    } catch (err) {
      console.error(err);
      setMensagem(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar."}`);
      setTipoMensagem("erro");
      setShowFeedback(true);
    }
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>Cadastrar Novo {papel.charAt(0).toUpperCase() + papel.slice(1)}</h2>
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
                required
              />
            </div>
          ))}

          {papel === "aluno" && (
            <>
              <div className="form-group">
                <label>Matrícula:</label>
                <input type="text" name="matricula" className="input-text" value={formData.matricula} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Turma:</label>
                <input type="text" name="turma" className="input-text" value={formData.turma} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Ano de Ingresso:</label>
                <input type="number" name="ano_ingresso" className="input-text" value={formData.ano_ingresso} onChange={handleChange} required />
              </div>
            </>
          )}

          {(papel === "coordenador" || papel === "cre") && (
            <div className="form-group">
              <label>SIAPE:</label>
              <input type="number" name="siape" className="input-text" value={formData.siape} onChange={handleChange} required />
            </div>
          )}

          {papel === "coordenador" && (
            <>
              <div className="form-group">
                <label>Curso:</label>
                <select name="curso" className="input-text" value={formData.curso} onChange={handleChange} required>
                  <option value="">Selecione o Curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>{curso.codigo} - {curso.nome}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Início do Mandato:</label>
                <input type="date" name="inicio_mandato" className="input-text" value={formData.inicio_mandato} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Fim do Mandato:</label>
                <input type="date" name="fim_mandato" className="input-text" value={formData.fim_mandato} onChange={handleChange} />
              </div>
            </>
          )}

          <button type="submit" className="submit-button">
            Cadastrar
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
