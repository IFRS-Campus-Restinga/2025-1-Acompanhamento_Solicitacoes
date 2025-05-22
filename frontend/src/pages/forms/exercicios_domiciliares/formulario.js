import axios from "axios";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import "../../../components/formulario.css";
import { extractMatriculaFromEmail, validateForm, validateMatricula } from "./validations";

const FormularioExercicioDomiciliar = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors }, setError, clearErrors, reset } = useForm();

  const [cursos, setCursos] = useState([]);
  const [disciplinasDoPpc, setDisciplinasDoPpc] = useState([]);
  const [disciplinasFiltradas, setDisciplinasFiltradas] = useState([]);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState("");
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState([]);

  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const [isLoadingUsuario, setIsLoadingUsuario] = useState(false);
  const [erroBuscaUsuario, setErroBuscaUsuario] = useState("");
  const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);
  const [erroBuscaDisciplinas, setErroBuscaDisciplinas] = useState("");
  const [isLoadingMatricula, setIsLoadingMatricula] = useState(false);

  const motivoSolicitacao = watch("motivo_solicitacao");
  const documentoApresentado = watch("documento_apresentado");
  const cursoSelecionado = watch("curso");

  const [periodoCalculado, setPeriodoCalculado] = useState(0);
  const [alunoInfo, setAlunoInfo] = useState(null);
  const [tipoPeriodoCurso, setTipoPeriodoCurso] = useState(null); // "ANUAL" ou "SEMESTRAL"
  const [cursoNome, setCursoNome] = useState(""); // Estado para armazenar o nome do curso

  // Períodos anuais e semestrais
  const PERIODOS_ANUAIS = [
    { value: "1º Ano", label: "1º Ano" },
    { value: "2º Ano", label: "2º Ano" },
    { value: "3º Ano", label: "3º Ano" },
    { value: "4º Ano", label: "4º Ano" },
  ];

  const PERIODOS_SEMESTRAIS = [
    { value: "1º Semestre", label: "1º Semestre" },
    { value: "2º Semestre", label: "2º Semestre" },
    { value: "3º Semestre", label: "3º Semestre" },
    { value: "4º Semestre", label: "4º Semestre" },
    { value: "5º Semestre", label: "5º Semestre" },
    { value: "6º Semestre", label: "6º Semestre" },
    { value: "7º Semestre", label: "7º Semestre" },
    { value: "8º Semestre", label: "8º Semestre" },
    { value: "9º Semestre", label: "9º Semestre" },
    { value: "10º Semestre", label: "10º Semestre" },
  ];

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/cursos/")
      .then(res => {
        console.log("Cursos carregados:", res.data);
        setCursos(res.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar cursos:", error);
        setMensagemPopup("Erro ao carregar lista de cursos.");
        setTipoMensagem("erro");
        setMostrarFeedback(true);
        setTimeout(() => setMostrarFeedback(false), 5000);
      });
  }, []);

  useEffect(() => {
    // Verifica se há dados do usuário no localStorage
    const googleUser = localStorage.getItem('googleUser');
    if (googleUser) {
      const { email, name } = JSON.parse(googleUser);
      setValue("email", email);
      setValue("aluno_nome", name);

      // Tenta obter a matrícula usando a lógica de fallback
      buscarMatriculaComFallback(email, name);
    }
  }, [setValue, clearErrors]);

  // Nova função para buscar matrícula com fallback
  const buscarMatriculaComFallback = async (email, nome) => {
    // Primeiro tenta extrair matrícula do e-mail
    const matriculaFromEmail = extractMatriculaFromEmail(email);
    if (matriculaFromEmail) {
      setValue("matricula", matriculaFromEmail);
      clearErrors("matricula");
      
      // Se encontrou matrícula no e-mail, busca informações adicionais do aluno
      buscarInfoAluno(email, matriculaFromEmail);
      return;
    }
    
    // Se não conseguiu extrair do e-mail, busca pelo e-mail na API de usuários
    setIsLoadingUsuario(true);
    try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/usuarios-email/?email=${email}`);
      console.log("Resposta da API de usuários:", response.data);
      
      if (response.data?.length > 0) {
        const usuario = response.data[0];
        
        // Se o usuário tem matrícula nos papel_detalhes, usa essa matrícula
        if (usuario.papel === "Aluno" && usuario.papel_detalhes?.matricula) {
          setValue("matricula", usuario.papel_detalhes.matricula);
          clearErrors("matricula");
          
          // Busca informações adicionais do aluno
          buscarInfoAluno(email, usuario.papel_detalhes.matricula);
          return;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar usuário pelo e-mail:", error);
    } finally {
      setIsLoadingUsuario(false);
    }
    
    // Se ainda não encontrou a matrícula, busca pelo nome na API de alunos
    setIsLoadingMatricula(true);
    try {
      // Busca todos os alunos
      const response = await axios.get(`http://localhost:8000/solicitacoes/alunos/listar`);
      console.log("Resposta da API de alunos:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Procura por um aluno com nome similar
        const alunoEncontrado = response.data.find(aluno => 
          aluno.usuario?.nome?.toLowerCase().includes(nome.toLowerCase()) ||
          nome.toLowerCase().includes(aluno.usuario?.nome?.toLowerCase())
        );
        
        if (alunoEncontrado && alunoEncontrado.matricula) {
          setValue("matricula", alunoEncontrado.matricula);
          clearErrors("matricula");
          
          // Busca informações adicionais do aluno
          buscarInfoAluno(email, alunoEncontrado.matricula);
          return;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setIsLoadingMatricula(false);
    }
    
    // Se chegou aqui, não conseguiu encontrar a matrícula
    setErroBuscaUsuario("Não foi possível encontrar a matrícula. Por favor, entre em contato com a secretaria.");
  };

  const buscarInfoAluno = async (email, matricula) => {
  try {
    // Primeiro tenta buscar pelo novo endpoint específico de informações do aluno
    const response = await axios.get(`http://localhost:8000/solicitacoes/alunos-info/?email=${email}` );
    console.log("Resposta da API alunos-info:", response.data);
    
    if (response.data) {
      setAlunoInfo(response.data);
      
      // Verifica se temos informações do PPC e do curso
      if (response.data.ppc) {
        console.log("PPC encontrado:", response.data.ppc);
        
        // Armazena o código do PPC em um campo oculto
        setValue("ppc_codigo", response.data.ppc.codigo);
        
        // Verifica se o PPC tem curso
        if (response.data.ppc.curso) {
          console.log("Curso encontrado via PPC:", response.data.ppc.curso);
          setValue("curso", response.data.ppc.curso.codigo);
          setCursoNome(response.data.ppc.curso.nome);
          
          // Define o tipo de período do curso (anual ou semestral)
          if (response.data.ppc.curso.tipo_periodo) {
            setTipoPeriodoCurso(response.data.ppc.curso.tipo_periodo);
            
            // Define os períodos disponíveis com base no tipo de período
            if (response.data.ppc.curso.tipo_periodo === "ANUAL") {
              setPeriodosDisponiveis(PERIODOS_ANUAIS);
            } else if (response.data.ppc.curso.tipo_periodo === "SEMESTRAL") {
              setPeriodosDisponiveis(PERIODOS_SEMESTRAIS);
            }
          }
          
          // Carrega as disciplinas do PPC
          carregarDisciplinasPorPpc(response.data.ppc.codigo);
        }
      }
      return;
    }
  } catch (error) {
    console.error("Erro ao buscar informações do aluno pelo endpoint alunos-info:", error);
  }
  
  // Se não conseguiu pelo endpoint específico, tenta o fallback
  try {
    // Busca todos os alunos
    const response = await axios.get(`http://localhost:8000/solicitacoes/alunos/listar` );
    console.log("Resposta da API alunos/listar:", response.data);
    
    if (response.data && Array.isArray(response.data)) {
      // Procura por um aluno com a matrícula correspondente
      const alunoEncontrado = response.data.find(aluno => aluno.matricula === matricula);
      
      if (alunoEncontrado) {
        console.log("Aluno encontrado na lista:", alunoEncontrado);
        setAlunoInfo(alunoEncontrado);
        
        // Verifica se temos informações do PPC
        if (alunoEncontrado.ppc) {
          console.log("PPC encontrado:", alunoEncontrado.ppc);
          
          // Se o PPC é apenas um código (não um objeto completo)
          if (typeof alunoEncontrado.ppc === 'string' || typeof alunoEncontrado.ppc === 'number') {
            // Armazena o código do PPC em um campo oculto
            setValue("ppc_codigo", alunoEncontrado.ppc);
            
            // Busca o curso pelo código do PPC
            buscarCursoPorPpc(alunoEncontrado.ppc);
          } else {
            // Se o PPC é um objeto completo
            setValue("ppc_codigo", alunoEncontrado.ppc.codigo);
            
            if (alunoEncontrado.ppc.curso) {
              setValue("curso", alunoEncontrado.ppc.curso.codigo);
              setCursoNome(alunoEncontrado.ppc.curso.nome);
              
              // Define o tipo de período do curso
              if (alunoEncontrado.ppc.curso.tipo_periodo) {
                setTipoPeriodoCurso(alunoEncontrado.ppc.curso.tipo_periodo);
                
                if (alunoEncontrado.ppc.curso.tipo_periodo === "ANUAL") {
                  setPeriodosDisponiveis(PERIODOS_ANUAIS);
                } else if (alunoEncontrado.ppc.curso.tipo_periodo === "SEMESTRAL") {
                  setPeriodosDisponiveis(PERIODOS_SEMESTRAIS);
                }
              }
            } else {
              buscarCursoPorPpc(alunoEncontrado.ppc.codigo);
            }
          }
          
          // Carrega as disciplinas do PPC
          carregarDisciplinasPorPpc(typeof alunoEncontrado.ppc === 'object' ? alunoEncontrado.ppc.codigo : alunoEncontrado.ppc);
        }
      }
    }
  } catch (error) {
    console.error("Erro ao buscar alunos pelo endpoint listar:", error);
  }
};


  // Nova função para buscar curso por PPC
  const buscarCursoPorPpc = async (ppcCodigo) => {
    try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/ppcs/${ppcCodigo}/`);
      console.log("Resposta da API de PPC:", response.data);
      
      if (response.data && response.data.curso) {
        console.log("Curso encontrado via API de PPC:", response.data.curso);
        setValue("curso", response.data.curso.codigo);
        setCursoNome(response.data.curso.nome);
        
        // Define o tipo de período do curso (anual ou semestral)
        if (response.data.curso.tipo_periodo) {
          setTipoPeriodoCurso(response.data.curso.tipo_periodo);
          
          // Define os períodos disponíveis com base no tipo de período
          if (response.data.curso.tipo_periodo === "ANUAL") {
            setPeriodosDisponiveis(PERIODOS_ANUAIS);
          } else if (response.data.curso.tipo_periodo === "SEMESTRAL") {
            setPeriodosDisponiveis(PERIODOS_SEMESTRAIS);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar curso por PPC:", error);
    }
  };

  // Função para carregar disciplinas do PPC
  const carregarDisciplinasPorPpc = async (ppcCodigo) => {
    if (!ppcCodigo) return;
    
    setIsLoadingDisciplinas(true);
    setErroBuscaDisciplinas("");
    
    try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/ppcs/${ppcCodigo}/disciplinas/`);
      console.log("Resposta da API de disciplinas por PPC:", response.data);
      
      if (response.data && response.data.length > 0) {
        setDisciplinasDoPpc(response.data);
        // Não filtramos ainda por período, isso será feito quando o usuário selecionar um período
      } else {
        setDisciplinasDoPpc([]);
        setDisciplinasFiltradas([]);
        setErroBuscaDisciplinas("Nenhuma disciplina encontrada para este PPC.");
      }
    } catch (error) {
      console.error("Erro ao carregar disciplinas:", error);
      setErroBuscaDisciplinas("Erro ao buscar disciplinas. Tente novamente.");
    } finally {
      setIsLoadingDisciplinas(false);
    }
  };

  // Função para filtrar disciplinas por período
  const handlePeriodoChange = (event) => {
    const periodo = event.target.value;
    setPeriodoSelecionado(periodo);
    
    if (!periodo) {
      setDisciplinasFiltradas([]);
      setDisciplinasSelecionadas([]);
      return;
    }
    
    // Filtra as disciplinas pelo período selecionado
    const disciplinasFiltradas = disciplinasDoPpc.filter(
      disciplina => disciplina.periodo === periodo
    );
    
    console.log("Disciplinas filtradas por período:", disciplinasFiltradas);
    setDisciplinasFiltradas(disciplinasFiltradas);
    setDisciplinasSelecionadas([]); // Limpa as seleções anteriores
  };

  // Função para lidar com a seleção de disciplinas (checkboxes)
  const handleDisciplinaChange = (event, disciplina) => {
    const { checked } = event.target;
    
    if (checked) {
      setDisciplinasSelecionadas(prev => [...prev, disciplina]);
    } else {
      setDisciplinasSelecionadas(prev => prev.filter(d => d.codigo !== disciplina.codigo));
    }
  };

  useEffect(() => {
    const dataInicio = watch("data_inicio_afastamento");
    const dataFim = watch("data_fim_afastamento");

    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);

      if (fim < inicio) {
        setPeriodoCalculado(0);
        setError("data_fim_afastamento", { type: "manual", message: "A data final não pode ser antes da inicial." });
      } else {
        const diffDays = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;
        setPeriodoCalculado(diffDays);
        clearErrors("data_fim_afastamento");
      }
    } else {
      setPeriodoCalculado(0);
    }
  }, [watch("data_inicio_afastamento"), watch("data_fim_afastamento"), setError, clearErrors]);

  const handleEmailBlur = async (event) => {
    const currentEmailValue = event.target.value.trim();

    if (!currentEmailValue || !currentEmailValue.includes('@')) {
      setErroBuscaUsuario("Por favor, insira um e-mail válido.");
      setValue("aluno_nome", "");
      setValue("matricula", "");
      return;
    }

    // Busca o nome do usuário primeiro
    setIsLoadingUsuario(true);
    let nomeUsuario = "";
    
    try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/usuarios-email/?email=${currentEmailValue}`);
      console.log("Resposta da API de usuários por email:", response.data);
      
      if (response.data?.length > 0) {
        const usuario = response.data[0];
        nomeUsuario = usuario.nome || "";
        setValue("aluno_nome", nomeUsuario);
        clearErrors("aluno_nome");
      } else {
        setValue("aluno_nome", "");
        setValue("matricula", "");
        setErroBuscaUsuario("Utilizador não encontrado com este e-mail.");
        setIsLoadingUsuario(false);
        return;
      }
    } catch (error) {
      console.error("Erro ao buscar nome do usuário:", error);
      setErroBuscaUsuario("Erro ao buscar dados. Tente novamente.");
      setIsLoadingUsuario(false);
      return;
    }
    
    // Agora que temos o nome, buscamos a matrícula com a lógica de fallback
    await buscarMatriculaComFallback(currentEmailValue, nomeUsuario);
    setIsLoadingUsuario(false);
  };

  const onSubmit = async (data) => {
    // Verificar se pelo menos uma disciplina foi selecionada
    if (disciplinasSelecionadas.length === 0) {
      setError("disciplinas", { type: "manual", message: "Selecione pelo menos uma disciplina." });
      setMensagemPopup("Selecione pelo menos uma disciplina.");
      setTipoMensagem("erro");
      setMostrarFeedback(true);
      setTimeout(() => setMostrarFeedback(false), 5000);
      return;
    }

    const formErrors = validateForm(data);

    if (Object.keys(formErrors).length > 0) {
      Object.entries(formErrors).forEach(([fieldName, message]) => {
        setError(fieldName, { type: "manual", message: message });
      });

      setMensagemPopup("Preencha os campos obrigatórios corretamente.");
      setTipoMensagem("erro");
      setMostrarFeedback(true);
      setTimeout(() => setMostrarFeedback(false), 5000);
      return;
    }

    const formData = new FormData();

    // Adiciona as disciplinas selecionadas
    disciplinasSelecionadas.forEach(disciplina => {
      formData.append('disciplinas', disciplina.codigo);
    });

    // Cria uma string com as disciplinas selecionadas para o campo componentes_curriculares
    const disciplinasTexto = disciplinasSelecionadas
      .map(d => `${d.nome} (${d.codigo})`)
      .join("\n");
    
    formData.append('aluno_email', data.email);
    formData.append('curso_codigo', data.curso);
    formData.append('ppc_codigo', data.ppc_codigo); // Campo PPC oculto
    formData.append('periodo', periodoSelecionado); // Período selecionado
    formData.append('componentes_curriculares', disciplinasTexto); // Texto das disciplinas selecionadas
    formData.append('data_inicio_afastamento', data.data_inicio_afastamento);
    formData.append('data_fim_afastamento', data.data_fim_afastamento);
    formData.append('periodo_afastamento', periodoCalculado.toString()); // Convertido para string
    formData.append('motivo_solicitacao', data.motivo_solicitacao);
    formData.append('documento_apresentado', data.documento_apresentado);
    formData.append('consegue_realizar_atividades', data.consegue_realizar_atividades);
    
    if (data.outro_motivo) formData.append('outro_motivo', data.outro_motivo);
    if (data.outro_documento) formData.append('outro_documento', data.outro_documento);
    if (data.arquivos) {
      Array.from(data.arquivos).forEach(file => {
        formData.append('arquivos', file);
      });
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/solicitacoes/form_exercicio_domiciliar/",
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      console.log("Resposta do envio do formulário:", response.data);

      setMensagemPopup("Solicitação enviada com sucesso!");
      setTipoMensagem("sucesso");
      setMostrarFeedback(true);
      
      // Limpa o formulário
      reset();
      setPeriodoSelecionado("");
      setDisciplinasDoPpc([]);
      setDisciplinasFiltradas([]);
      setDisciplinasSelecionadas([]);
      setPeriodosDisponiveis([]);
      setTipoPeriodoCurso(null);
      setCursoNome("");
      
      setTimeout(() => setMostrarFeedback(false), 3000);
    } catch (err) {
      console.error("Erro ao enviar solicitação:", err.response?.data || err.message);
      let errorMsg = "Erro ao enviar solicitação. Tente novamente mais tarde.";
      
      if (err.response && err.response.data) {
        const backendData = err.response.data;
        if (typeof backendData === 'string') {
          errorMsg = backendData;
        } else if (typeof backendData === 'object') {
          errorMsg = Object.entries(backendData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
        }
      }
      
      setMensagemPopup(errorMsg);
      setTipoMensagem("erro");
      setMostrarFeedback(true);
      setTimeout(() => setMostrarFeedback(false), 5000);
    }
  };

  return (
    <div>
      <HeaderAluno />
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
          
        <form onSubmit={handleSubmit(onSubmit)} className="formulario" encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              {...register("email", { required: "E-mail é obrigatório" })}
              onBlur={(e) => {
                const { onBlur } = register("email");
                if (onBlur) onBlur(e);
                handleEmailBlur(e);
              }}
              placeholder="Digite o e-mail do aluno"
              readOnly={!!localStorage.getItem('googleUser')}
              style={localStorage.getItem('googleUser') ? { backgroundColor: "#e9ecef", cursor: "not-allowed" } : {}}
            />
            {(isLoadingUsuario || isLoadingMatricula) && <p>A procurar informações do usuário...</p>}
            {erroBuscaUsuario && <span className="error-text">{erroBuscaUsuario}</span>}
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="aluno_nome">Nome completo:</label>
            <input 
              type="text" 
              id="aluno_nome" 
              {...register("aluno_nome", { required: "Nome completo é obrigatório" })} 
              readOnly 
              style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }} 
            />
            {errors.aluno_nome && <span className="error-text">{errors.aluno_nome.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="matricula">Número de matrícula:</label>
            <input 
              type="text" 
              id="matricula" 
              {...register("matricula", { 
                required: "Número de matrícula é obrigatório",
                validate: (value) => validateMatricula(value) || true
              })} 
              readOnly 
              style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }} 
            />
            {errors.matricula && <span className="error-text">{errors.matricula.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="curso">Curso:</label>
            <input 
              type="text" 
              id="curso_nome" 
              value={cursoNome}
              readOnly 
              style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }} 
            />
            <input 
              type="hidden" 
              id="curso" 
              {...register("curso", { required: "Curso é obrigatório" })} 
            />
            {errors.curso && <span className="error-text">{errors.curso.message}</span>}
          </div>

          {/* Campo PPC oculto */}
          <input 
            type="hidden" 
            id="ppc_codigo" 
            {...register("ppc_codigo")} 
          />

          <div className="form-group">
            <label htmlFor="periodo">Período:</label>
            <select
              id="periodo"
              {...register("periodo", { required: "Período é obrigatório" })}
              value={periodoSelecionado}
              onChange={handlePeriodoChange}
              disabled={!tipoPeriodoCurso || periodosDisponiveis.length === 0}
            >
              <option value="">Selecione o período</option>
              {periodosDisponiveis.map((periodo) => (
                <option key={periodo.value} value={periodo.value}>{periodo.label}</option>
              ))}
            </select>
            {isLoadingDisciplinas && <p>A carregar períodos...</p>}
            {errors.periodo && <span className="error-text">{errors.periodo.message}</span>}
          </div>

          <div className="form-group">
            <label>Disciplinas do Período:</label>
            {isLoadingDisciplinas ? (
              <p>A carregar disciplinas...</p>
            ) : erroBuscaDisciplinas ? (
              <span className="error-text">{erroBuscaDisciplinas}</span>
            ) : disciplinasFiltradas.length > 0 ? (
              <div className="disciplinas-container">
                {disciplinasFiltradas.map((disciplina) => (
                  <div key={disciplina.codigo} className="disciplina-checkbox">
                    <input
                      type="checkbox"
                      id={`disciplina-${disciplina.codigo}`}
                      checked={disciplinasSelecionadas.some(d => d.codigo === disciplina.codigo)}
                      onChange={(e) => handleDisciplinaChange(e, disciplina)}
                    />
                    <label htmlFor={`disciplina-${disciplina.codigo}`}>
                      {disciplina.nome} ({disciplina.codigo})
                    </label>
                  </div>
                ))}
              </div>
            ) : periodoSelecionado ? (
              <p>Nenhuma disciplina encontrada para este período.</p>
            ) : (
              <p>Selecione um período para ver as disciplinas disponíveis.</p>
            )}
            {errors.disciplinas && <span className="error-text">{errors.disciplinas.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="motivo_solicitacao">Motivo da solicitação:</label>
            <select id="motivo_solicitacao" {...register("motivo_solicitacao", { required: "Motivo da solicitação é obrigatório" })}>
              <option value="">Selecione o motivo</option>
              <option value="saude">Problemas de saúde, conforme inciso I do art. 142 da OD.</option>
              <option value="maternidade">Licença maternidade, conforme inciso II do art. 142 da OD.</option>
              <option value="familiar">Acompanhamento de familiar (primeiro grau) com problemas de saúde, inciso III, art. 142 da OD.</option>
              <option value="aborto_ou_falecimento">Gestantes que sofreram aborto, falecimento do recém-nascido ou natimorto (IV, 142 OD)</option>
              <option value="adocao">Adoção de criança, conforme inciso V, art. 142 da OD.</option>
              <option value="conjuge">Licença cônjuge/companheiro de parturiente/puérperas, conforme inciso VI do art. 142 da OD.</option>
              <option value="outro">Outro</option>
            </select>
            {errors.motivo_solicitacao && <span className="error-text">{errors.motivo_solicitacao.message}</span>}
          </div>

          {motivoSolicitacao === "outro" && (
            <div className="form-group">
              <label htmlFor="outro_motivo">Descreva o outro motivo:</label>
              <input type="text" id="outro_motivo" {...register("outro_motivo", { required: motivoSolicitacao === "outro" ? "Descreva o outro motivo" : false })} />
              {errors.outro_motivo && <span className="error-text">{errors.outro_motivo.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="periodo_afastamento">Período de afastamento (dias):</label>
            <input
              type="text"
              id="periodo_afastamento"
              value={periodoCalculado}
              readOnly
              style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
            />
            {errors.periodo_afastamento && <span className="error-text">{errors.periodo_afastamento.message}</span>}
          </div>

          <fieldset className="periodo-afastamento">
            <legend>Datas do Afastamento</legend>
            <div className="datas-container">
              <div className="form-group">
                <label htmlFor="data_inicio_afastamento">Data inicial:</label>
                <input
                  type="date"
                  id="data_inicio_afastamento"
                  {...register("data_inicio_afastamento", { required: "Data inicial é obrigatória" })}
                />
                {errors.data_inicio_afastamento && <span className="error-text">{errors.data_inicio_afastamento.message}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="data_fim_afastamento">Data final:</label>
                <input
                  type="date"
                  id="data_fim_afastamento"
                  {...register("data_fim_afastamento", { required: "Data final é obrigatória" })}
                />
                {errors.data_fim_afastamento && <span className="error-text">{errors.data_fim_afastamento.message}</span>}
              </div>
            </div>
          </fieldset>

          <div className="form-group">
            <label htmlFor="documento_apresentado">Escolha o tipo de documento para justificar a sua solicitação:</label>
            <select id="documento_apresentado" {...register("documento_apresentado", { required: "Escolher o tipo de documento é obrigatório" })}>
              <option value="">Selecione o documento</option>
              <option value="atestado">Atestado médico</option>
              <option value="certidao_nascimento">Certidão de nascimento</option>
              <option value="termo_guarda">Termo judicial de guarda</option>
              <option value="certidao_obito">Certidão de óbito</option>
              <option value="justificativa_propria">Justificativa de próprio punho</option>
              <option value="outro">Outro</option>
            </select>
            {errors.documento_apresentado && <span className="error-text">{errors.documento_apresentado.message}</span>}
          </div>

          {documentoApresentado === "outro" && (
            <div className="form-group">
              <label htmlFor="outro_documento">Descreva o outro documento:</label>
              <input type="text" id="outro_documento" {...register("outro_documento", { required: documentoApresentado === "outro" ? "Descreva o outro documento" : false })} />
              {errors.outro_documento && <span className="error-text">{errors.outro_documento.message}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="arquivos">Anexe o(s) seu(s) documento(s) (máx 5 arquivos):</label>
            <input
              type="file"
              id="arquivos"
              {...register("arquivos")}
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {errors.arquivos && <span className="error-text">{errors.arquivos.message}</span>}
          </div>

          <div className="form-group">
            <label>Você consegue realizar as atividades escolares pelo Moodle, de forma remota?</label>
            <div>
              <label htmlFor="consegue_sim">
                <input type="radio" id="consegue_sim" {...register("consegue_realizar_atividades", { required: "Selecione uma opção" })} value="true" /> Sim
              </label>
              <label htmlFor="consegue_nao">
                <input type="radio" id="consegue_nao" {...register("consegue_realizar_atividades", { required: "Selecione uma opção" })} value="false" /> Não
              </label>
            </div>
            {errors.consegue_realizar_atividades && <span className="error-text">{errors.consegue_realizar_atividades.message}</span>}
          </div>

          <button type="submit" className="submit-button">Enviar</button>
        </form>

        {mostrarFeedback && (
          <div className={`popup-feedback ${tipoMensagem}`}>
            <p>{mensagemPopup}</p>
            {/* Popup some automaticamente */}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FormularioExercicioDomiciliar;
