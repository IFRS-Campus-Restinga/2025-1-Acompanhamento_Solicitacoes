import api from "../../services/api";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import BotaoVoltar from "../../components/UI/botoes/botao_voltar";

const initialFormState = {
  nome: "", email: "", cpf: "", telefone: "", data_nascimento: "",
  siape: "",
  curso: "",
  inicio_mandato: "",
  fim_mandato: "",
};

export default function CadastrarAtualizarCoordenador() {
  const [formData, setFormData] = useState(initialFormState);
  const [cursos, setCursos] = useState([]);
  const [errors, setErrors] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const title = isEditing ? "Editar Coordenador" : "Cadastrar Novo Coordenador";
  const submitButtonText = isEditing ? "Atualizar Coordenador" : "Cadastrar Coordenador";

  useEffect(() => {
    async function loadCursos() {
      try {
        const response = await api.get("cursos/");
        setCursos(response.data);
      } catch (error) {
        console.error("Erro ao carregar cursos:", error);
        setTipoMensagem("erro");
        setMensagem(`Erro ao carregar cursos: ${error.message}`);
        setShowFeedback(true);
      }
    }

    async function loadCoordenadorData() {
      if (isEditing && id) {
        try {
          const response = await api.get(`coordenadores/${id}/`);
          const coordenadorData = response.data;
          setFormData({
            nome: coordenadorData.usuario.nome,
            email: coordenadorData.usuario.email,
            cpf: coordenadorData.usuario.cpf,
            telefone: coordenadorData.usuario.telefone,
            data_nascimento: coordenadorData.usuario.data_nascimento,
            siape: coordenadorData.siape,
            curso: coordenadorData.mandatos_coordenador[0]?.curso || "",
            inicio_mandato: coordenadorData.mandatos_coordenador[0]?.inicio_mandato ? coordenadorData.mandatos_coordenador[0].inicio_mandato.split('-').reverse().join('-') : "",
            fim_mandato: coordenadorData.mandatos_coordenador[0]?.fim_mandato ? coordenadorData.mandatos_coordenador[0].fim_mandato.split('-').reverse().join('-') : "",
          });
        } catch (error) {
          console.error("Erro ao carregar dados do coordenador:", error);
          setTipoMensagem("erro");
          setMensagem(`Erro ao carregar dados do coordenador: ${error.message}`);
          setShowFeedback(true);
        }
      }
    }

    loadCursos();
    loadCoordenadorData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null })); // Limpa o erro ao alterar o campo
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      usuario: {
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone,
        data_nascimento: formData.data_nascimento,
      },
      siape: formData.siape,
      curso: formData.curso,
      inicio_mandato: formData.inicio_mandato,
      fim_mandato: formData.fim_mandato || null,
    };

    try {
      let response;
      if (isEditing && id) {
        response = await api.put(`coordenadores/${id}/`, payload);
      } else {
        response = await api.post("coordenadores/cadastro-coordenador-mandato/", payload);
      }

      setTipoMensagem("sucesso");
      setMensagem(`Coordenador ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
      setShowFeedback(true);
      setFormData(initialFormState);
      setErrors({});
      navigate("/usuarios");
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} coordenador:`, error);
      const errorData = error.response?.data;
      setTipoMensagem("erro");
      setMensagem(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} coordenador. ${errorData ? JSON.stringify(errorData) : ""}`);
      setShowFeedback(true);
      if (errorData) {
        setErrors(errorData); // Atualiza o estado de errors com os erros do backend
      }
    }
  }

  const closeFeedback = () => {
    setShowFeedback(false);
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h2>{title}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          <h3>Dados do Usuário</h3>
          <div className="form-group">
            <label htmlFor="nome">Nome:</label>
            <input type="text" id="nome" name="nome" className={`input-text ${errors.nome ? "input-error" : ""}`} value={formData.nome} onChange={handleChange} required />
            {errors.nome && <div className="error-text">{errors.nome}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" className={`input-text ${errors.email ? "input-error" : ""}`} value={formData.email} onChange={handleChange} required />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="cpf">CPF:</label>
            <input type="text" id="cpf" name="cpf" className={`input-text ${errors.cpf ? "input-error" : ""}`} value={formData.cpf} onChange={handleChange} required />
            {errors.cpf && <div className="error-text">{errors.cpf}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone:</label>
            <input type="text" id="telefone" name="telefone" className={`input-text ${errors.telefone ? "input-error" : ""}`} value={formData.telefone} onChange={handleChange} required />
            {errors.telefone && <div className="error-text">{errors.telefone}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="data_nascimento">Data de Nascimento:</label>
            <input type="date" id="data_nascimento" name="data_nascimento" className={`input-text ${errors.data_nascimento ? "input-error" : ""}`} value={formData.data_nascimento} onChange={handleChange} required />
            {errors.data_nascimento && <div className="error-text">{errors.data_nascimento}</div>}
          </div>

          <h3>Dados do Coordenador</h3>
          <div className="form-group">
            <label htmlFor="siape">SIAPE:</label>
            <input type="number" id="siape" name="siape" className={`input-text ${errors.siape ? "input-error" : ""}`} value={formData.siape} onChange={handleChange} required />
            {errors.siape && <div className="error-text">{errors.siape}</div>}
          </div>

          <h3>Dados do Mandato</h3>
          <div className="form-group">
            <label htmlFor="curso">Curso:</label>
            <select
              id="curso"
              name="curso"
              className={`input-text ${errors.curso ? "input-error" : ""}`}
              value={formData.curso}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o Curso</option>
              {cursos.map(curso => (
                <option key={curso.codigo} value={curso.codigo}>
                  {`${curso.nome} (${curso.codigo})`}
                </option>
              ))}
            </select>
            {errors.curso && <div className="error-text">{errors.curso}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="inicio_mandato">Início do Mandato:</label>
            <input type="date" id="inicio_mandato" name="inicio_mandato" className={`input-text ${errors.inicio_mandato ? "input-error" : ""}`} value={formData.inicio_mandato} onChange={handleChange} required />
            {errors.inicio_mandato && <div className="error-text">{errors.inicio_mandato}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="fim_mandato">Fim do Mandato (Opcional):</label>
            <input type="date" id="fim_mandato" name="fim_mandato" className="input-text" value={formData.fim_mandato} onChange={handleChange} />
            {errors.fim_mandato && <div className="error-text">{errors.fim_mandato}</div>}
          </div>

          <button type="submit" className="submit-button">{submitButtonText}</button>
        </form>

        <PopupFeedback
          show={showFeedback}
          mensagem={mensagem}
          tipo={tipoMensagem}
          onClose={closeFeedback}
        />
        <BotaoVoltar onClick={() => navigate('/usuarios')} />
      </main>
      <Footer />
    </div>
  );
}