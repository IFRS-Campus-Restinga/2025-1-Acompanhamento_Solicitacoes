import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    curso: curso_codigo || "",
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
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/cursos/")
      .then(res => setCursos(res.data))
      .catch((err) => console.error("Erro ao buscar cursos:", err));
  }, []);

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/motivo_abono/")
      .then((response) => setMotivos(response.data))
      .catch((err) => {
        console.error("Erro ao buscar motivos:", err);
        setTipoPopup("error");
        setMensagemPopup("Erro ao carregar motivos.");
        setPopupIsOpen(true);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    let updatedFormData = { ...formData };

    if (type === "file") {
      updatedFormData.anexos = files;
    } else {
      updatedFormData[name] = type === "checkbox" ? checked : value;
    }

    setFormData(updatedFormData);
    validateField(name, value, updatedFormData);
  };

  const validateField = (name, value, currentFormData = formData) => {
    let newErrors = { ...errors };

    // Campo obrigatório
    if (!value.toString().trim()) {
      newErrors[name] = "Este campo é obrigatório.";
    } else {
      delete newErrors[name];
    }

    const optionalFields = ["perdeu_atividades"];
    if (!optionalFields.includes(name)) {
      if (!value || value.toString().trim() === "") {
        newErrors[name] = "Este campo é obrigatório.";
      } else {
        delete newErrors[name];
      }
    }

    // Validação cruzada: data final não pode ser anterior à data inicial
    if (
      (name === "data_inicio_afastamento" || name === "data_fim_afastamento") &&
      currentFormData.data_inicio_afastamento &&
      currentFormData.data_fim_afastamento
    ) {
      const inicio = new Date(currentFormData.data_inicio_afastamento);
      const fim = new Date(currentFormData.data_fim_afastamento);

      if (fim < inicio) {
        newErrors.data_fim_afastamento = "A data final não pode ser antes da data inicial.";
      } else {
        delete newErrors.data_fim_afastamento;
      }
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    let formErrors = {};

    Object.keys(formData).forEach((key) => {
      if (["perdeu_atividades"].includes(key)) return; // Campo opcional
      if (!formData[key] || formData[key].toString().trim() === "") {
        formErrors[key] = "Este campo é obrigatório.";
      }
    });

    if (formData.data_inicio_afastamento && formData.data_fim_afastamento) {
      const inicio = new Date(formData.data_inicio_afastamento);
      const fim = new Date(formData.data_fim_afastamento);

      if (fim < inicio) {
        formErrors.data_fim_afastamento = "A data final não pode ser antes da data inicial.";
      }
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

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
      const response = await axios.post("http://localhost:8000/solicitacoes/formulario_abono_falta/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Solicitação criada:", response.data);
      setTipoPopup("success");
      setMensagemPopup("Formulário enviado com sucesso!");
      setPopupIsOpen(true);
      setTimeout(() => navigate("/todas-solicitacoes"), 2000);
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
        <h2>Formulário de Abono e Justificativa de Faltas</h2>
        <div className="descricao-formulario">
          <p>
          Este é o formulário destinado para a solicitação de justificativa ou abono de faltas e 
          solicitação de avaliação de segunda chamada.
          </p>
          <p>
          O aluno que faltar poderá encaminhar junto à Coordenação do Curso a solicitação de justificativa 
          de faltas. Caso tenha ocorrido atividade avaliativa na data da falta, o estudante deverá solicitar 
          a avaliação de segunda chamada no mesmo formulário. É necessário anexar documento comprobatório do 
          motivo da falta.
          </p>
          <p>
          Neste mesmo formulário, o estudante também poderá solicitar o abono de faltas, que será encaminhado 
          junto à Coordenação do Curso para análise. Caso tenha ocorrido atividade avaliativa na data da 
          ausência, o estudante deverá solicitar a avaliação de segunda chamada no mesmo formulário. 
          É necessário anexar documento comprobatório do motivo do abono de faltas.
          </p>
          <p>QUEM: Todos os Estudantes.</p>
          <p>O prazo para entrega de documento que justifique a falta deverá ser de até 04 (quatro) dias úteis,
             após o término da vigência do documento.</p>
          <p>
          Após entrega do formulário, a coordenação de curso fará a análise da solicitação e a CRE 
          tem até 5 (cinco) dias úteis para inserir os resultados no sistema. Este prazo pode ser 
          estendido conforme as demandas da coordenação de curso e/ou do setor. O resultado pode ser 
          conferido no sistema acadêmico.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="formulario" encType="multipart/form-data">
        <div className="form-group">
            <label>E-mail:</label>
            <input
              type="email"
              name="email"
              //readOnly style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
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
              //readOnly style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
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
              //readOnly style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
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
                  ({motivo.tipo_falta}) - {motivo.descricao}
                </option>
              ))}
            </select>
            {errors.motivo_solicitacao_id && <span className="error-text">{errors.motivo_solicitacao_id}</span>}
          </div>
          <div className="form-group">
          <label>Período de afastamento:</label>
            <fieldset className="periodo-afastamento">
                <div className="datas-container">
                  <div className="form-group">
                    <label>Data inicial:</label>
                    <input
                      type="date"
                      name="data_inicio_afastamento"
                      value={formData.data_inicio}
                      onChange={handleChange}/>
                  </div>
                  <div className="form-group">
                    <label>Data final:</label>
                    <input
                      type="date"
                      name="data_fim_afastamento"
                      value={formData.data_fim}
                      onChange={handleChange}/>
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
              Acesso ao Moodle?
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
              Perdeu Atividades Avaliativas?
            </label> 
          </div>
          <button type="submit" className="submit-button">
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
