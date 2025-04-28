import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
import "../../../components/formulario.css";

export default function FormularioAbonoFaltas() {
  const [motivos, setMotivos] = useState([]);
  const [formData, setFormData] = useState({
    aluno_nome: "",
    email: "",
    matricula: "",
    acesso_moodle: false,
    perdeu_atividades: false,
    motivo_solicitacao_id: "",
    data_inicio_afastamento: "",
    data_fim_afastamento: "",
    anexos: [],
  });
  const [popupIsOpen, setPopupIsOpen] = useState(false);
  const [tipoPopup, setTipoPopup] = useState("success");
  const [mensagemPopup, setMensagemPopup] = useState("");

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

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === "file") {
      setFormData({ ...formData, anexos: files });
    } else {
      setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    await axios
      .post("http://localhost:8000/solicitacoes/formulario_abono_falta/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setTipoPopup("success");
        setMensagemPopup("Formulário enviado com sucesso!");
        setPopupIsOpen(true);
        setTimeout(() => (window.location.href = "/solicitacoes"), 2000);
      })
      .catch((err) => {
        console.error("Erro ao enviar formulário:", err);
        setTipoPopup("error");
        setMensagemPopup("Erro ao enviar o formulário.");
        setPopupIsOpen(true);
      });
  };

  return (
    <div>
      <Header />
      <main  className="container">
      <h2>Formulário de Abono de Faltas</h2>
      <form onSubmit={handleSubmit} className="formulario" encType="multipart/form-data">
        <div className="form-group">
          <label>Motivo da Solicitação:</label>
          <select
            name="motivo_solicitacao_id"
            value={formData.motivo_solicitacao_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecione um motivo</option>
            {motivos.map((motivo) => (
              <option key={motivo.id} value={motivo.id}>
                {motivo.descricao}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Data de Início:</label>
          <input
            type="date"
            name="data_inicio_afastamento"
            value={formData.data_inicio_afastamento}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Data de Fim:</label>
          <input
            type="date"
            name="data_fim_afastamento"
            value={formData.data_fim_afastamento}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Acesso ao Moodle:</label>
          <input
            type="checkbox"
            name="acesso_moodle"
            checked={formData.acesso_moodle}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Perdeu Atividades:</label>
          <input
            type="checkbox"
            name="perdeu_atividades"
            checked={formData.perdeu_atividades}
            onChange={handleChange}
          />
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
        </div>
        <button type="submit" className="botao-enviar">
          Enviar
        </button>
      </form>
      <PopupFeedback
        show={popupIsOpen}
        mensagem={mensagemPopup}
        tipo={tipoPopup}
        onClose={() => setPopupIsOpen(false)}
      />
      </main>
      <Footer />
    </div>
  );
}
