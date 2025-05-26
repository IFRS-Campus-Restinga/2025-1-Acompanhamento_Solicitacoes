import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import "../../../components/formulario.css";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";

// Funções de validação e extração
const extractMatriculaFromEmail = (email) => {
  if (!email) return null;
  const match = email.match(/^([0-9]{8,}|[a-z]{2}[0-9]{6,})@/);
  return match ? match[1] : null;
};


const validateForm = (formData) => {
  const newErrors = {};
  if (!formData.motivo_solicitacao_id) newErrors.motivo_solicitacao_id = "Motivo é obrigatório.";
  if (!formData.data_inicio_afastamento) newErrors.data_inicio_afastamento = "Data inicial é obrigatória.";
  if (!formData.data_fim_afastamento) newErrors.data_fim_afastamento = "Data final é obrigatória.";

  if (formData.data_inicio_afastamento && formData.data_fim_afastamento && formData.data_inicio_afastamento > formData.data_fim_afastamento) {
    newErrors.data_fim_afastamento = "Data final não pode ser anterior à data inicial.";
  }
  if (!formData.matricula) newErrors.matricula = "Matrícula é obrigatória."; 
  if (!formData.curso) newErrors.curso = "Curso é obrigatório.";
  if (formData.perdeu_atividades && (!formData.disciplinas_selecionadas || formData.disciplinas_selecionadas.length === 0)) {
      newErrors.disciplinas_selecionadas = "Selecione as disciplinas em que perdeu atividades.";
  }

  return newErrors;
};



export default function FormularioAbonoFaltas() {
  const [motivos, setMotivos] = useState([]);
  const { curso_codigo } = useParams();
  const [cursos, setCursos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [mostrarSelecaoDisciplinas, setMostrarSelecaoDisciplinas] = useState(false);
  const [filtroDisciplina, setFiltroDisciplina] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    aluno_nome: "",
    matricula: "",
    curso: curso_codigo || "",
    motivo_solicitacao_id: "",
    data_inicio_afastamento: "",
    data_fim_afastamento: "",
    anexos: null, 
    acesso_moodle: false,
    perdeu_atividades: false,
    disciplinas_selecionadas: [],
  });
  const [errors, setErrors] = useState({});
  const [popupIsOpen, setPopupIsOpen] = useState(false);
  const [tipoPopup, setTipoPopup] = useState("success");
  const [mensagemPopup, setMensagemPopup] = useState("");
  const navigate = useNavigate();

  const [isLoadingUsuario, setIsLoadingUsuario] = useState(false);
  const [erroBuscaUsuario, setErroBuscaUsuario] = useState("");
  const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);
  const [erroBuscaDisciplinas, setErroBuscaDisciplinas] = useState("");
  const [isLoadingMatricula, setIsLoadingMatricula] = useState(false);
  const [alunoInfo, setAlunoInfo] = useState(null); 
  const [cursoNome, setCursoNome] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const readonlyStyle = { backgroundColor: "#e9ecef", cursor: "not-allowed" };

  // --- Funções de busca de dados --- 
  const buscarNomeCurso = async (cursoCodigo) => {
    if (!cursoCodigo) return;
    try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/cursos/${cursoCodigo}/`);
      if (response.data && response.data.nome) {
        setCursoNome(response.data.nome);
      }
    } catch (error) {
      console.error("Erro ao buscar nome do curso (API específica):", error);
      try {
        const allCursosResponse = await axios.get(`http://localhost:8000/solicitacoes/cursos/`);
        const cursoEncontrado = allCursosResponse.data.find(c => 
          c.codigo === cursoCodigo || 
          (c.codigo && cursoCodigo && c.codigo.toLowerCase() === cursoCodigo.toLowerCase())
        );
        if (cursoEncontrado && cursoEncontrado.nome) {
          setCursoNome(cursoEncontrado.nome);
        }
      } catch (fallbackError) {
        console.error("Erro ao buscar nome do curso (fallback):", fallbackError);
      }
    }
  };

  const buscarMatriculaComFallback = async (email, nome) => {
    const matriculaFromEmail = extractMatriculaFromEmail(email);
    if (matriculaFromEmail) {
      setFormData(prev => ({ ...prev, matricula: matriculaFromEmail }));
      buscarInfoAluno(email, matriculaFromEmail);
      return;
    }
    setIsLoadingUsuario(true);
    try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/usuarios-email/?email=${email}`);
      if (response.data?.length > 0) {
        const usuario = response.data[0];
        if (usuario.papel === "Aluno" && usuario.papel_detalhes?.matricula) {
          setFormData(prev => ({ ...prev, matricula: usuario.papel_detalhes.matricula }));
          buscarInfoAluno(email, usuario.papel_detalhes.matricula);
          setIsLoadingUsuario(false);
          return;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar usuário pelo e-mail:", error);
    } finally {
      setIsLoadingUsuario(false);
    }
    setIsLoadingMatricula(true);
    try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/alunos/listar`);
      if (response.data && Array.isArray(response.data)) {
        const alunoEncontrado = response.data.find(aluno => 
          (aluno.usuario?.nome && nome && aluno.usuario.nome.toLowerCase().includes(nome.toLowerCase())) ||
          (aluno.usuario?.nome && nome && nome.toLowerCase().includes(aluno.usuario.nome.toLowerCase()))
        );
        if (alunoEncontrado && alunoEncontrado.matricula) {
          setFormData(prev => ({ ...prev, matricula: alunoEncontrado.matricula }));
          buscarInfoAluno(email, alunoEncontrado.matricula);
          setIsLoadingMatricula(false);
          return;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setIsLoadingMatricula(false);
    }
    setErrors(prev => ({ ...prev, matricula: "Matrícula não encontrada. Verifique ou preencha manualmente." }));
  };


  const buscarInfoAluno = async (email, matricula) => {
     try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/alunos/?email=${email}`);
      if (response.data) {
        setAlunoInfo(response.data); 
        if (response.data.ppc?.curso) {
          const cursoCodigo = response.data.ppc.curso.codigo;
          if (!formData.curso || formData.curso !== cursoCodigo) {
             setFormData(prev => ({ ...prev, curso: cursoCodigo }));
          }
          if (response.data.ppc.curso.nome) {
            setCursoNome(response.data.ppc.curso.nome);
          }
          if (response.data.ppc?.codigo) {
            buscarDisciplinas(response.data.ppc.codigo);
          return; 
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar informações do aluno pelo endpoint alunos-info:", error);
    }
    try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/alunos/listar`);
      if (response.data && Array.isArray(response.data)) {
        const alunoEncontrado = response.data.find(aluno => aluno.matricula === matricula);
        if (alunoEncontrado) {
          setAlunoInfo(alunoEncontrado); 
          if (alunoEncontrado.ppc) {
            const ppcDetails = alunoEncontrado.ppc;
            if (typeof ppcDetails === 'string' || typeof ppcDetails === 'number') {
              buscarCursoPorPpc(ppcDetails);
            } else if (ppcDetails.curso) {
              const cursoDetails = ppcDetails.curso;
              const cursoCodigo = cursoDetails.codigo || cursoDetails;
              if (!formData.curso || formData.curso !== cursoCodigo) {
                 setFormData(prev => ({ ...prev, curso: cursoCodigo }));
              }
              if (cursoDetails.nome) setCursoNome(cursoDetails.nome);
              else if (cursoDetails.details?.nome) setCursoNome(cursoDetails.details.nome);
              else if (alunoEncontrado.ppc.curso_details?.nome) setCursoNome(alunoEncontrado.ppc.curso_details.nome);
            } else if (ppcDetails.codigo) {
               buscarCursoPorPpc(ppcDetails.codigo);
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar alunos pelo endpoint listar (fallback):", error);
    }
  };

   useEffect(() => {
      if (alunoInfo?.ppc?.codigo) {
          buscarDisciplinas(alunoInfo.ppc.codigo);
      }
    }, [alunoInfo]);

  const buscarCursoPorPpc = async (ppcCodigo) => {
    if (!ppcCodigo) return;
    try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/ppcs/${ppcCodigo}/`);
      if (response.data?.curso) {
        const cursoDetails = response.data.curso;
        const cursoCodigo = cursoDetails.codigo || cursoDetails;
         if (!formData.curso || formData.curso !== cursoCodigo) {
             setFormData(prev => ({ ...prev, curso: cursoCodigo }));
         }
        if (cursoDetails.nome) {
          setCursoNome(cursoDetails.nome);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar curso por PPC:", error);
    }
  };

  console.log("Aluno recebido:", alunoInfo);
  console.log("Código do PPC:", alunoInfo?.ppc?.codigo);


  const buscarDisciplinas = async (ppcCodigo) => {
    if (!ppcCodigo) {
        setDisciplinas([]);
        setErroBuscaDisciplinas("PPC não fornecido.");
        return;
    }

    try {
        const url = `http://localhost:8000/solicitacoes/disciplinas/?ppc_id=${encodeURIComponent(ppcCodigo)}`;
        console.log("URL da requisição:", url); // Depuração
        const response = await axios.get(url);
        console.log("Resposta da API:", response.data);

        if (response.data && response.data.length > 0) {
            setDisciplinas(response.data);
        } else {
            setErroBuscaDisciplinas("Nenhuma disciplina encontrada.");
        }
    } catch (error) {
        console.error("Erro ao buscar disciplinas:", error);
        setErroBuscaDisciplinas("Erro ao carregar disciplinas.");
    }
};




  /*const carregarDisciplinasDoCurso = async (cursoCodigo) => {
    if (!cursoCodigo) {
      setDisciplinas([]); 
      setErroBuscaDisciplinas("Código do curso não fornecido.");
      return;
    }
    setIsLoadingDisciplinas(true);
    setErroBuscaDisciplinas("");
    setDisciplinas([]); 
    try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/disciplinas-por-curso/?curso_codigo=${encodeURIComponent(cursoCodigo)}`);
      if (response.data && response.data.length > 0) {
        setDisciplinas(response.data);
      } else {
        setErroBuscaDisciplinas("Nenhuma disciplina encontrada para este curso.");
      }
    } catch (error) {
      console.error(`Erro ao buscar disciplinas para o curso ${cursoCodigo}:`, error);
      setErroBuscaDisciplinas("Erro ao carregar disciplinas. Tente novamente.");
    } finally {
      setIsLoadingDisciplinas(false);
    }
  };*/


  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/cursos/")
      .then(res => {
        setCursos(res.data);
        if (formData.curso && !cursoNome) { 
          const cursoEncontrado = res.data.find(c => c.codigo === formData.curso);
          if (cursoEncontrado) setCursoNome(cursoEncontrado.nome);
          else buscarNomeCurso(formData.curso);
        }
      })
      .catch((err) => console.error("Erro ao buscar cursos:", err));
  }, [formData.curso]); 

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/motivo_abono/")
      .then((response) => setMotivos(response.data))
      .catch((err) => {
        console.error("Erro ao buscar motivos:", err);
      });
  }, []);


  useEffect(() => {
    const googleUser = localStorage.getItem("googleUser");
    if (googleUser) {
      try {
        const { email, name } = JSON.parse(googleUser);
        setFormData(prev => ({ ...prev, email: email, aluno_nome: name }));
        buscarMatriculaComFallback(email, name);
      } catch (error) {
        console.error("Erro ao processar dados do usuário:", error);
      }
    }
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;

    if (type === "checkbox") {
      if (name === "disciplinas_selecionadas") {
        setFormData(prev => ({
          ...prev,
          disciplinas_selecionadas: checked
            ? [...prev.disciplinas_selecionadas, value] 
            : prev.disciplinas_selecionadas.filter(id => id !== value)
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
        if (name === "perdeu_atividades") {
          setMostrarSelecaoDisciplinas(checked);
          if (!checked) {
            setFormData(prev => ({ ...prev, disciplinas_selecionadas: [] }));
          }
        }
      }
    } else if (type === "file") {
      if (files.length > 5) {
          setErrors(prev => ({ ...prev, anexos: "Você pode anexar no máximo 5 arquivos." }));
          event.target.value = null; 
          setFormData((prev) => ({ ...prev, anexos: null }));
      } else {
          setFormData((prev) => ({ ...prev, anexos: files }));
          if (errors.anexos) setErrors(prev => ({ ...prev, anexos: null }));
      }
    } else if (type === "select-multiple") {
      const selectedValues = Array.from(event.target.options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setFormData((prev) => ({ ...prev, [name]: selectedValues }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTipoPopup("error");
      setMensagemPopup("Por favor, corrija os erros indicados no formulário.");
      setPopupIsOpen(true);
      return;
    }

    // Verifica se temos o ID do aluno (essencial para o backend)
    if (!alunoInfo || !alunoInfo.id) {
        setTipoPopup("error");
        setMensagemPopup("Informações do aluno não carregadas. Não é possível enviar a solicitação.");
        setPopupIsOpen(true);
        return; 
    }

    setIsSubmitting(true);
    setErrors({});

    const dataToSend = new FormData();

    // Adiciona campos do estado formData que o backend espera
    dataToSend.append("matricula", formData.matricula);
    dataToSend.append("curso", formData.curso); 
    dataToSend.append("motivo_solicitacao_id", formData.motivo_solicitacao_id);
    dataToSend.append("data_inicio_afastamento", formData.data_inicio_afastamento);
    dataToSend.append("data_fim_afastamento", formData.data_fim_afastamento);
    dataToSend.append("acesso_moodle", formData.acesso_moodle);
    dataToSend.append("perdeu_atividades", formData.perdeu_atividades);
    
    // *** CAMPOS OBRIGATÓRIOS PARA O MODELO SOLICITACAO ***
    dataToSend.append("aluno", alunoInfo.id); // Envia o ID do aluno
    dataToSend.append("data_solicitacao", new Date().toISOString().split('T')[0]); // Data atual
    dataToSend.append("nome_formulario", "ABONOFALTAS"); // Chave do formulário
    // Adicione status e posse se o backend não definir padrão
    // dataToSend.append("status", "Em Análise"); 
    // dataToSend.append("posse_solicitacao", "Aluno");

    
    if (formData.disciplinas_selecionadas && formData.disciplinas_selecionadas.length > 0) {
      
      formData.disciplinas_selecionadas.forEach(disciplinaId => {
          // Verifica se o valor é um ID numérico ou string que pode ser convertida
          const id = parseInt(disciplinaId, 10);
          if (!isNaN(id)) {
             dataToSend.append("disciplinas_selecionadas", id);
          } else {
             console.warn("Valor inválido encontrado em disciplinas_selecionadas:", disciplinaId);
             // Se o backend espera nomes, use: dataToSend.append("disciplinas_selecionadas", disciplinaId);
          }
      });
    }

    // Adiciona os arquivos anexados
    if (formData.anexos) {
      for (let i = 0; i < formData.anexos.length; i++) {
        dataToSend.append("anexos", formData.anexos[i]);
      }
    }

    console.log("Enviando dados para /solicitacoes/todas-solicitacoes/ ...");
    // Log para depuração (opcional)
    // for (let pair of dataToSend.entries()) { console.log(pair[0]+ ": " + pair[1]); }

    try {
      // *** ENDPOINT CORRETO ***
      const response = await axios.post("http://localhost:8000/solicitacoes/todas-solicitacoes/", dataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          // Adicionar autenticação se necessário
        },
      });

      console.log("Resposta da API:", response.data);
      setTipoPopup("success");
      setMensagemPopup("Solicitação de Abono de Faltas enviada com sucesso!");
      setPopupIsOpen(true);
      setTimeout(() => navigate("/aluno/minhas-solicitacoes"), 2000); 

    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      setTipoPopup("error");
      let errorMsg = "Erro ao enviar solicitação. Tente novamente.";
      if (error.response && error.response.data) {
        console.error("Detalhes do erro do backend:", error.response.data);
        const backendErrors = error.response.data;
        const formattedErrors = Object.entries(backendErrors)
          .map(([field, messages]) => {
             const msgText = Array.isArray(messages) ? messages.join(", ") : messages;
             const fieldName = field === 'non_field_errors' ? 'Erro geral' : field;
             return `${fieldName}: ${msgText}`;
           })
          .join("; ");
        if (formattedErrors) {
          errorMsg = `Erro no envio: ${formattedErrors}`;
        }
        setErrors(typeof backendErrors === 'object' ? backendErrors : {});
      }
      setMensagemPopup(errorMsg);
      setPopupIsOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectClick = (event) => {
    const codigo = event.target.value;

    setFormData(prev => ({
        ...prev,
        disciplinas_selecionadas: prev.disciplinas_selecionadas.includes(codigo)
            ? prev.disciplinas_selecionadas.filter(item => item !== codigo) // Remove se já estiver selecionado
            : [...prev.disciplinas_selecionadas, codigo] // Adiciona se ainda não estiver
    }));

    event.target.selected = !event.target.selected; // Alterna visualmente a seleção
};


  
    
  // Função para remover disciplina selecionada
  const handleRemoveDisciplina = (idToRemove) => {
    setFormData(prev => ({
      ...prev,
      disciplinas_selecionadas: prev.disciplinas_selecionadas.filter(id => id !== idToRemove)
    }));
  };


  return (
    <div>
      <HeaderAluno />
      <main className="container">
        <h2>Formulário de Solicitação de Abono de Faltas</h2>
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
        <form onSubmit={handleSubmit} className="formulario" noValidate>
          <div className="form-group">
            <label>Nome do Aluno:</label>
            <input type="text" name="aluno_nome" value={formData.aluno_nome} readOnly style={readonlyStyle} />
            {isLoadingUsuario && <span className="loading-text">Buscando dados...</span>}
            {erroBuscaUsuario && <span className="error-text">{erroBuscaUsuario}</span>}
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} readOnly style={readonlyStyle} />
          </div>

          <div className="form-group">
            <label htmlFor="matricula">Matrícula:</label> 
            <input
              id="matricula" 
              type="text"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange} 
              readOnly={!!alunoInfo} 
              style={alunoInfo ? readonlyStyle : {}}
              aria-describedby="matricula-error"
            />
            {isLoadingMatricula && <span className="loading-text">Buscando matrícula...</span>}
            {errors.matricula && <span id="matricula-error" className="error-text">{errors.matricula}</span>}
          </div>

          <div className="form-group">
            <label>Curso:</label>
            <input
              type="text"
              value={cursoNome || (formData.curso ? "Carregando nome..." : "Não definido")}
              readOnly
              style={readonlyStyle}
            />
            <input type="hidden" name="curso" value={formData.curso} />
            {errors.curso && <span className="error-text">{errors.curso}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="motivo_solicitacao_id">Motivo da Solicitação:</label>
            <select id="motivo_solicitacao_id" name="motivo_solicitacao_id" value={formData.motivo_solicitacao_id} onChange={handleChange} aria-describedby="motivo-error">
              <option value="">Selecione um motivo</option>
              {motivos.map((motivo) => (
                <option key={motivo.id} value={motivo.id}>
                  ({motivo.tipo_falta}) - {motivo.descricao}
                </option>
              ))}
            </select>
            {errors.motivo_solicitacao_id && <span id="motivo-error" className="error-text">{errors.motivo_solicitacao_id}</span>}
          </div>

          <div className="form-group">
            <label>Período de afastamento:</label>
            <fieldset className="periodo-afastamento">
              <legend className="sr-only">Período de afastamento</legend> 
              <div className="datas-container">
                <div className="form-group">
                  <label htmlFor="data_inicio_afastamento">Data inicial:</label>
                  <input id="data_inicio_afastamento" type="date" name="data_inicio_afastamento" value={formData.data_inicio_afastamento} onChange={handleChange} aria-describedby="data-inicio-error" />
                  {errors.data_inicio_afastamento && <span id="data-inicio-error" className="error-text">{errors.data_inicio_afastamento}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="data_fim_afastamento">Data final:</label>
                  <input id="data_fim_afastamento" type="date" name="data_fim_afastamento" value={formData.data_fim_afastamento} onChange={handleChange} aria-describedby="data-fim-error" />
                  {errors.data_fim_afastamento && <span id="data-fim-error" className="error-text">{errors.data_fim_afastamento}</span>}
                </div>
              </div>
            </fieldset>
          </div>

          <div className="form-group">
            <label htmlFor="anexos">Anexar Documentos (máx 5 arquivos, .pdf, .doc, .docx, .jpg, .png):</label>
            <input id="anexos" type="file" name="anexos" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleChange} aria-describedby="anexos-error" />
            {errors.anexos && <span id="anexos-error" className="error-text">{errors.anexos}</span>}
            {formData.anexos && Array.from(formData.anexos).map((file, index) => (
              <div key={index} style={{ fontSize: '0.8em', marginTop: '2px' }}>{file.name}</div>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="acesso_moodle">
              <input 
              type="checkbox" 
              id="acesso_moodle" 
              name="acesso_moodle" 
              checked={formData.acesso_moodle} 
              onChange={handleChange} />
              Tem acesso ao Moodle?
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="perdeu_atividades">
              <input 
              type="checkbox" 
              id="perdeu_atividades" 
              name="perdeu_atividades" 
              checked={formData.perdeu_atividades} 
              onChange={handleChange} />
              Perdeu Atividades Avaliativas durante o período?
            </label>
          </div>

          {mostrarSelecaoDisciplinas && (
            <div className="form-group">
              <label htmlFor="filtroDisciplina">Selecione as Disciplinas em que perdeu atividades:</label>
            <div className="barra-pesquisa">
            <i className="bi bi-search icone-pesquisa"></i>
            <input 
                id="filtroDisciplina" 
                type="text" placeholder="     Buscar disciplinas..." 
                value={filtroDisciplina} 
                onChange={(e) => setFiltroDisciplina(e.target.value)} 
                className="input-pesquisa" 
            />
        </div>

        {isLoadingDisciplinas ? (
            <div className="loading-text">Carregando disciplinas...</div>
        ) : Array.isArray(disciplinas) && disciplinas.length > 0 ? (
            <>
                {/* Lista de disciplinas disponíveis */}
                <select
                    multiple
                    size="5"
                    value={formData.disciplinas_selecionadas}
                    onClick={handleSelectClick}
                    disabled={!alunoInfo || disciplinas.length === 0}
                    required
                >
                    {disciplinas
                        .filter((disciplina) => disciplina.nome.toLowerCase().includes(filtroDisciplina.toLowerCase()))
                        .map((disciplina) => (
                            <option key={disciplina.codigo} value={disciplina.codigo}>
                                {disciplina.nome} ({disciplina.codigo})
                            </option>
                    ))}
                </select>

                {/* Mensagem de erro ou aviso */}
                {erroBuscaDisciplinas && <div className="erro">{erroBuscaDisciplinas}</div>}
                {disciplinas.length === 0 && (
                    <div className="aviso">Nenhuma disciplina disponível para seleção.</div>
                )}

                {/* Exibição das disciplinas selecionadas */}
                <div className="form-group">
                    <label>Disciplinas Selecionadas:</label>
                    <ul>
                        {formData.disciplinas_selecionadas.map((codigo) => {
                            const disciplina = disciplinas.find((d) => d.codigo === codigo);
                            return (
                                <li key={codigo}>
                                    {disciplina ? `${disciplina.nome} (${codigo})` : codigo}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveDisciplina(codigo)}
                                        className="remove-btn"
                                    >
                                        X
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </>
        ) : (
            <div className="info-text">{erroBuscaDisciplinas || "Nenhuma disciplina encontrada para o curso selecionado."}</div>
        )}

        {errors.disciplinas_selecionadas && <span className="error-text">{errors.disciplinas_selecionadas}</span>}
    </div>
)}
          
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </main>
      <PopupFeedback show={popupIsOpen} mensagem={mensagemPopup} tipo={tipoPopup} onClose={() => setPopupIsOpen(false)} />
      <Footer />
    </div>
  );
}

