import axios from "axios";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../components/base/footer";
import Header from "../../../components/base/header";
import "../../../components/formulario.css";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";

export default function FormularioExercicioDomiciliar() {
  const { curso_codigo } = useParams();
  const [cursos, setCursos] = useState([]);
  const [periodoAfastamento, setPeriodoAfastamento] = useState(0);
    
  const [formData, setFormData] = useState({

    aluno_nome: "",
    email: "",
    matricula: "",
    curso: curso_codigo || "",
    componentes_curriculares: "",
    motivo_solicitacao: "",
    outro_motivo: "",
    data_inicio_afastamento: "",
    data_fim_afastamento: "",
    periodo_afastamento: 0,
    documento_apresentado: "",
    outro_documento: "",
    arquivos: [],
    consegue_realizar_atividades: "",
  });

  //POP UPS 
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
 

  const [msgErro, setMsgErro] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [turmas, setTurmas] = useState([]); // Vamos adicionar o estado para turmas
  const [componentesTurma, setComponentesTurma] = useState([]); // Estado para os componentes da turma

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/cursos/")
      .then(res => setCursos(res.data))
      .catch((err) => console.error("Erro ao buscar cursos:", err));

    // Exemplo de como buscar a lista de turmas (adapte a sua API)
    axios.get("http://localhost:8000/api/listar_turmas/")
      .then(res => setTurmas(res.data))
      .catch((err) => console.error("Erro ao buscar turmas:", err));

  }, []);

  useEffect(() => {
    if (formData.data_inicio_afastamento && formData.data_fim_afastamento) {
      const inicio = new Date(formData.data_inicio_afastamento);
      const fim = new Date(formData.data_fim_afastamento);

      if (fim < inicio) {
        setMensagemPopup("A data final não pode ser anterior à data inicial.");
        setTipoMensagem("erro");
        setMostrarFeedback(true);
        setPeriodoAfastamento(0);
      }else{

      const diffTime = Math.abs(fim - inicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setPeriodoAfastamento(diffDays);

      }
    }
  }, [formData.data_inicio_afastamento, formData.data_fim_afastamento]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    setFormData(updatedFormData);

    // Se o campo for o de e-mail, busca as informações do usuário
    if (name === 'email') {
      buscarInfoUsuario(value);
    }
  };

  const buscarInfoUsuario = async (email) => {
    if (email) {
      try {
        const response = await axios.get(`http://localhost:8000/api/buscar_info_usuario/?email=${email}`);
        if (response.data) {
          setFormData(prevData => ({
            ...prevData,
            aluno_nome: response.data.nome_completo || '',
            matricula: response.data.matricula || '',
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error);
        setFormData(prevData => ({
          ...prevData,
          aluno_nome: '',
          matricula: '',
        }));
        // Opcional: mostrar uma mensagem de erro para o usuário
      }
    } else {
      setFormData(prevData => ({
        ...prevData,
        aluno_nome: '',
        matricula: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.aluno_nome || !formData.email || !formData.matricula || !formData.componentes_curriculares ||
      !formData.motivo_solicitacao || !formData.data_inicio_afastamento || !formData.data_fim_afastamento || !formData.documento_apresentado || !formData.curso) {
      setMensagemPopup("Todos os campos obrigatórios devem ser preenchidos!");
      setTipoMensagem("erro");
      setMostrarFeedback(true);

      return;
    }

    if (formData.motivo_solicitacao === "outro" && !formData.outro_motivo) {
      setMensagemPopup("Por favor, descreva o motivo da solicitação.");
      setTipoMensagem("erro");
      setMostrarFeedback(true);

      return;
    }
    if (formData.documento_apresentado === "outro" && !formData.outro_documento) {
      setMensagemPopup("Por favor, descreva o documento apresentado.");
      setTipoMensagem("erro");
      setMostrarFeedback(true);
      return;
    }

    const dataInicio = new Date(formData.data_inicio_afastamento);
    const dataFim = new Date(formData.data_fim_afastamento);


    if (!dataInicio || !dataFim || periodoAfastamento <= 0) {
    setMensagemPopup("Preencha as datas corretamente.");
    setTipoMensagem("erro");
    setMostrarFeedback(true);
    return;
    }

    const diffEmDias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24)) + 1;

    const dados = {
      data_inicio_afastamento: formData.dataInicioAfastamento,
      data_fim_afastamento: formData.dataFimAfastamento,
      periodo_afastamento: diffEmDias,
    };

    axios.post("http://localhost:8000/solicitacoes/form_exercicio_domiciliar/", dados, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(() => {
      setMensagemPopup("Solicitação enviada com sucesso!");
      setTipoMensagem("sucesso");
      setMostrarFeedback(true);
    })
    .catch(error => {
      setMensagemPopup("Erro ao enviar solicitação.");
      setTipoMensagem("erro");
      setMostrarFeedback(true);
    });


    const data = new FormData();
    data.append("data_inicio_afastamento", new Date(formData.data_inicio_afastamento).toISOString().split("T")[0]);
    data.append("data_fim_afastamento", new Date(formData.data_fim_afastamento).toISOString().split("T")[0]);
    data.append("periodo_afastamento", formData.periodo_afastamento);

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "arquivos") {
          Array.from(value).forEach(file => data.append("arquivos", file));
        } else {
          data.append(key, value);
        }
      });


    axios.post("http://localhost:8000/solicitacoes/form_exercicio_domiciliar/", data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        setMensagemPopup("Solicitação enviada com sucesso!");
        setTipoMensagem("sucesso");
        setMostrarFeedback(true);
      })
      .catch(error => {
        if (error.response) {
          console.error("Erro na resposta:", error.response.data);
          setMensagemPopup("Erro ao enviar solicitação.");
          setTipoMensagem("erro");
          setMostrarFeedback(true);
        } else if (error.request) {
          setMensagemPopup("Erro na requisição. Tente novamente.");
          setTipoMensagem("erro");
          setMostrarFeedback(true);
        } else {
          setMensagemPopup("Erro desconhecido. Verifique o console.");
          setTipoMensagem("erro");
          setMostrarFeedback(true);
        }
      });

  };

    const handleTurmaChange = async (event) => {
    const turmaId = event.target.value;
    if (turmaId) {
      try {
        const response = await axios.get(`http://localhost:8000/api/buscar_componentes_turma/?turma_id=${turmaId}`);
        if (response.data) {
          // Formate os dados para exibir na textarea (ou em outro componente se preferir)
          const componentesFormatados = response.data.map(comp => `${comp.nome}`).join('\n');
          setFormData(prevData => ({
            ...prevData,
            componentes_curriculares: componentesFormatados,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar componentes da turma:", error);
        setFormData(prevData => ({
          ...prevData,
          componentes_curriculares: '',
        }));
      }
    } else {
      setFormData(prevData => ({
        ...prevData,
        componentes_curriculares: '',
      }));
      setComponentesTurma([]);
    }
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
            <input type="text" name="aluno_nome" value={formData.aluno_nome} readOnly style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }} required />
          </div>

          <div className="form-group">
            <label>Número de matrícula:</label>
            <input type="text" name="matricula" value={formData.matricula} readOnly style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }} required />
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

          {/* Novo campo para selecionar a turma */}
          <div className="form-group">
            <label>Turma:</label>
            <select name="turma" onChange={handleTurmaChange}>
              <option value="">Selecione a turma</option>
              {turmas.map(turma => (
                <option key={turma.id} value={turma.id}>{turma.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Componentes Curriculares em que está matriculado e seus respectivos docentes:</label>
            <textarea name="componentes_curriculares" placeholder="Os componentes serão preenchidos ao selecionar a turma" value={formData.componentes_curriculares} rows="5" readOnly style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }} required />
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
            <input
              type="text"
              name="periodo_afastamento"
              value={formData.periodo_afastamento}
              readOnly
              style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }} />

            <fieldset className="periodo-afastamento">
              <div className="datas-container">
                <div className="form-group">
                  <label>Data inicial:</label>
                  <input
                    type="date"
                    name="data_inicio_afastamento"
                    value={formData.data_inicio_afastamento}
                    onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Data final:</label>
                  <input
                    type="date"
                    name="data_fim_afastamento"
                    value={formData.data_fim_afastamento}
                    onChange={handleChange} />
                </div>
              </div>
            </fieldset>
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

      <PopupFeedback
        show={mostrarFeedback}
        mensagem={mensagemPopup}
        tipo={tipoMensagem}
        onClose={() => setMostrarFeedback(false)}
      />

      </main>
      <Footer />
    </div>
  );
}