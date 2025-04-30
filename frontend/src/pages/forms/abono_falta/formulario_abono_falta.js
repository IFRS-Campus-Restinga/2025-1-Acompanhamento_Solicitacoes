import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
import "../../../components/formulario.css";

export default function FormularioAbonoFaltas() {
  const [motivos, setMotivos] = useState([]);
  const { curso_codigo } = useParams();
  const [cursos, setCursos] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    aluno_nome: "",
    matricula: "",
    curso:  curso_codigo || "",
    motivo_solicitacao_id: "",
    data_inicio_afastamento: "",
    data_fim_afastamento: "",
    anexos: [],
    acesso_moodle: false,
    perdeu_atividades: false,
  });
  const [errors, setErrors] = useState({});
  const [popupIsOpen, setPopupIsOpen] = useState(false);
  const [tipoPopup, setTipoPopup] = useState("success");
  const [mensagemPopup, setMensagemPopup] = useState("");

  // Carregar os cursos
  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/cursos/")
      .then(res => setCursos(res.data))
      .catch((err) => console.error("Erro ao buscar cursos:", err));
  }, []);

  // Carregar os motivos do servidor
  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/motivo_abono/")
      .then((response) => setMotivos(response.data))
      .catch((err) => {
        console.error("Erro ao buscar motivos:", err);
        setTipoPopup("error");
        setMensagemPopup("Erro ao carregar motivos.");
        setPopupIsOpen(true);
      });
  }, []);

  // Atualizar o estado do formulário e validar dados
  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    let newFormData = { ...formData };

    if (type === "file") {
      newFormData.anexos = files;
    } else {
      newFormData[name] = type === "checkbox" ? checked : value;
    }

    setFormData(newFormData);
    validateField(name, value); // Valida o campo individualmente ao modificar
  };

  // Validação individual dos campos
  const validateField = (name, value) => {
    let newErrors = { ...errors };

    // Validação para campos em branco
    if (!value.trim()) {
      newErrors[name] = "Este campo é obrigatório.";
    } else {
      delete newErrors[name];
    }

    setErrors(newErrors); // Atualiza os erros no estado
  };

  // Validação completa ao enviar o formulário
  const validateForm = () => {
    let formErrors = {};

    Object.keys(formData).forEach((key) => {
      if (!formData[key] || formData[key].toString().trim() === "") {
        formErrors[key] = "Este campo é obrigatório.";
      }
    });

    // Validação de datas (data_fim_afastamento)
    if (formData.data_inicio_afastamento && formData.data_fim_afastamento) {
      const inicio = new Date(formData.data_inicio_afastamento);
      const fim = new Date(formData.data_fim_afastamento);

      if (fim < inicio) {
        formErrors["data_fim_afastamento"] = "A data final não pode ser antes da data inicial.";
      }
    }

    setErrors(formErrors); // Exibe os erros no formulário
    console.log("Erros detectados:", formErrors);
    return Object.keys(formErrors).length === 0; // Retorna true se não houver erros
  };

  // Enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar se há erros ao validar todos os campos
    if (!validateForm()) {
      return; // Interrompe o envio até que os erros sejam corrigidos
    }

    const data = new FormData();

    for (const key in formData) {
      if (key === "anexos") {
        Array.from(formData.anexos).forEach((file) => {
          data.append("anexos", file);
        });
      } else {
        data.append(key, formData[key]);
      }
    }

    try {
      await axios.post("http://localhost:8000/solicitacoes/formulario_abono_falta/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTipoPopup("success");
      setMensagemPopup("Formulário enviado com sucesso!");
      setPopupIsOpen(true);
      setTimeout(() => (window.location.href = "/solicitacoes"), 2000);
    } catch (err) {
      console.error("Erro ao enviar formulário:", err.response || err);
      setTipoPopup("error");
      setMensagemPopup("Erro ao enviar o formulário.");
      setPopupIsOpen(true);
    }
  };

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Formulário de Abono de Faltas</h2>
        <form onSubmit={handleSubmit} className="formulario" encType="multipart/form-data">
        <div className="form-group">
            <label>E-mail:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Nome do Aluno:</label>
            <input
              type="text"
              name="aluno_nome"
              value={formData.aluno_nome}
              onChange={handleChange}
            />
            {errors.aluno_nome && <span className="error-text">{errors.aluno_nome}</span>}
          </div>
          <div className="form-group">
            <label>Matrícula:</label>
            <input
              type="text"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
            />
            {errors.matricula && <span className="error-text">{errors.matricula}</span>}
          </div>
          <div className="form-group">
            <label>Curso:</label>
            <select 
              name="curso" 
              value={formData.curso} 
              onChange={handleChange} 
            >
              <option value="">Selecione o curso</option>
              {cursos.map((curso) => (
                <option key={curso.codigo} value={curso.codigo}>
                  {curso.nome}
                </option>
              ))}
            </select>
            {errors.curso && <span className="error-text">{errors.curso}</span>}
          </div>
          <div className="form-group">
            <label>Motivo da Solicitação:</label>
            <select
              name="motivo_solicitacao_id"
              value={formData.motivo_solicitacao_id}
              onChange={handleChange}
            >
              <option value="">Selecione um motivo</option>
              {motivos.map((motivo) => (
                <option key={motivo.id} value={motivo.id}>
                  {motivo.descricao}
                </option>
              ))}
            </select>
            {errors.motivo_solicitacao_id && <span className="error-text">{errors.motivo_solicitacao_id}</span>}
          </div>
          <div className="form-group">
            <fieldset className="periodo-afastamento">
              <legend className="titulo-afastamento">Período de Afastamento</legend>
              <div className="datas-container">
                <div className="form-group">
                  <label>Data de Início:</label>
                  <input
                    type="date"
                    name="data_inicio_afastamento"
                    value={formData.data_inicio_afastamento}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Data de Fim:</label>
                  <input
                    type="date"
                    name="data_fim_afastamento"
                    value={formData.data_fim_afastamento}
                    onChange={handleChange}
                  />
                  {errors.data_fim_afastamento && <span className="error-text">{errors.data_fim_afastamento}</span>}
                </div>
              </div>
            </fieldset>
          </div>
          <div className="form-group">
            <label>Anexar Documentos (máx 5 arquivos):</label>
            <input
              type="file"
              name="anexos"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleChange}
            />
            {errors.anexos && <span className="error-text">{errors.anexos}</span>}
          </div>
          <div className="form-group"> 
            <label> 
              <input 
              type="checkbox" 
              name="acesso_moodle" 
              checked={formData.acesso_moodle} 
              onChange={handleChange} 
              /> 
              Acesso ao Moodle 
            </label> 
          </div>
          <div className="form-group"> 
            <label> 
              <input 
              type="checkbox" 
              name="perdeu_atividades" 
              checked={formData.perdeu_atividades} 
              onChange={handleChange} 
              /> 
              Perdeu Atividades Avaliativas
            </label> 
          </div>
          <button type="submit" className="botao-enviar">
            Enviar
          </button>
        </form>
      </main>
      <PopupFeedback
        show={popupIsOpen}
        mensagem={mensagemPopup}
        tipo={tipoPopup}
        onClose={() => setPopupIsOpen(false)}
      />
      <Footer />
    </div>
  );
}
