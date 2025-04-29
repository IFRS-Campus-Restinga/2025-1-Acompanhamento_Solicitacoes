import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../components/base/footer";
import Header from "../../../components/base/header";
import "../../../components/formulario.css";

export default function FormularioExercicioDomiciliar() {
  const { curso_codigo } = useParams();
  const [cursos, setCursos] = useState([]);
  const [formData, setFormData] = useState({
    aluno_nome: "",
    email: "",
    matricula: "",
    curso:  curso_codigo || "",
    componentes_curriculares: "",
    motivo_solicitacao: "",
    outro_motivo: "",
    periodo_afastamento: "",
    documento_apresentado: "",
    outro_documento: "",
    arquivos: [],
    consegue_realizar_atividades: "",
  });
  
  const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [msgErro, setMsgErro] = useState([]);
    const [mensagemErro, setMensagemErro] = useState("");

    const popupActions = [
        {
            label: "Fechar",
            className: "btn btn-cancel",
            onClick: () => {
                setPopupIsOpen(false);
                navigate("/solicitacoes");
            }
        }
    ];

    const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/cursos/")
      .then(res => setCursos(res.data))
      .catch((err) => console.error("Erro ao buscar cursos:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, arquivos: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      if (key === "arquivos") {
        Array.from(formData.arquivos).forEach(file => {
          data.append("arquivos", file);
        });
      } else {
        data.append(key, formData[key]);
      }
    }

    axios.post("http://localhost:8000/solicitacoes/form_exercicio_domiciliar/", data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        alert("Solicitação enviada com sucesso!");
      })
      .catch(error => {
        alert("Erro ao enviar solicitação.");
        console.error(error);
      });
  };

  return (
    <div>
      <Header />
      <main className="container">
      <h2>Solicitação de Exercícios Domiciliares</h2>
      <h6>Conforme o Art. 141. da Organização Didática do IFRS, os Exercícios Domiciliares 
        possibilitam ao estudante realizar atividades em seu domicílio, quando houver 
        impedimento de frequência às aulas por um período superior a 15 (quinze) dias, 
        de acordo com o Decreto 1.044/69 e com a Lei 6.202/75, tendo suas faltas abonadas durante 
        o período de afastamento. O atendimento através de Exercício Domiciliar é um processo 
        em que a família e a Instituição devem atuar de forma colaborativa, para que o estudante
        possa realizar suas atividades sem prejuízo na sua vida acadêmica. 
        A solicitação deverá ser protocolada em até 05 (cinco) dias úteis 
        subsequentes ao início da ausência às atividades letivas.</h6>

      <form onSubmit={handleSubmit} className="formulario" encType="multipart/form-data">

        <div className="form-group">
          <label>E-mail:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Nome completo:</label>
          <input type="text" name="aluno_nome" value={formData.aluno_nome} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Número de matrícula:</label>
          <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} required />
        </div>


        <div className="form-group">
                        <label>Curso:</label>
                        <select name="curso" value={formData.curso} onChange={handleChange} required>
                            <option value="">Selecione o curso</option>
                            {cursos.map((curso) => (
                                <option key={curso.codigo} value={curso.codigo}>
                                    {curso.nome}
                                </option>
                            ))}
                        </select>
                    </div>

        <div className="form-group">
          <label>Escreva em quais componentes curriculares que você está matriculado e seus respectivos docentes:</label>
          <textarea name="componentes_curriculares" placeholder="Sua resposta" value={formData.componentes_curriculares} onChange={handleChange} rows="5" required />
        </div>

        <div className="form-group">
          <label>Motivo da solicitação:</label>
          <select name="motivo_solicitacao" value={formData.motivo_solicitacao} onChange={handleChange} required>
            <option value="">Selecione o motivo</option>
            <option value="saude">Problemas de saúde, conforme inciso I do art. 142 da OD.</option>
            <option value="maternidade">Licença maternidade, conforme inciso II do art. 142 da OD.</option>
            <option value="familiar">Acompanhamento de familiar (primeiro grau) com problemas de saúde, inciso III, art. 142 da OD.</option>
            <option value="aborto_ou_falecimento">Gestantes que sofreram aborto, falecimento do recém-nascido ou natimorto (IV, 142 OD)</option>
            <option value="adocao">Adoção de criança, conforme inciso V, art. 142 da OD.</option>
            <option value="conjuge">Licença cônjuge/companheiro de parturiente/puérperas, conforme inciso VI do art. 142 da OD.</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        {formData.motivo_solicitacao === "outro" && (
          <div className="form-group">
            <label>Descreva o outro motivo:</label>
            <input type="text" name="outro_motivo" value={formData.outro_motivo} onChange={handleChange} />
          </div>
        )}

        <div className="form-group">
          <label>Período de afastamento:</label>
          <p>Informe a(s) data(s) que aparece(m) no seu atestado/documento. Por exemplo: "60 dias a partir de 11/04/2025" ou "De 11/04 a 15/05/2025". </p>
          <input type="text" name="periodo_afastamento" value={formData.periodo_afastamento} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Escolha o tipo de documento para justificar a sua solicitação:</label>
          <select name="documento_apresentado" value={formData.documento_apresentado} onChange={handleChange} required>
            <option value="">Selecione o documento</option>
            <option value="atestado">Atestado médico</option>
            <option value="certidao_nascimento">Certidão de nascimento</option>
            <option value="termo_guarda">Termo judicial de guarda</option>
            <option value="certidao_obito">Certidão de óbito</option>
            <option value="justificativa_propria">Justificativa de próprio punho</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        {formData.documento_apresentado === "outro" && (
          <div className="form-group">
            <label>Descreva o outro documento:</label>
            <input type="text" name="outro_documento" value={formData.outro_documento} onChange={handleChange} />
          </div>
        )}

        <div className="form-group">
          <label>Anexe o(s) seu(s) documento(s) (máx 5 arquivos):</label>
          <input type="file" name="arquivos" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Você consegue realizar as atividades escolares pelo Moodle, de forma remota?</label>
          <div>
            <label>
              <input type="radio" name="consegue_realizar_atividades" value={true} checked={formData.consegue_realizar_atividades === "true"} onChange={handleChange} /> Sim
            </label>
            <label>
              <input type="radio" name="consegue_realizar_atividades" value={false} checked={formData.consegue_realizar_atividades === "false"} onChange={handleChange} /> Não
            </label>
          </div>
        </div>
        <button type="submit" className="submit-button">Enviar</button>
      </form>
      </main>
      <Footer />
    </div>
  );
}
