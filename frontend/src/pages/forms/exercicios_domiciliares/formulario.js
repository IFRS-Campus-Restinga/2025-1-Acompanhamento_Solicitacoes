import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import BuscaUsuario from "../../../components/busca_usuario"; // Mantido para a busca inicial do usuário
import "../../../components/formulario.css";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";

export default function FormularioExercicioDomiciliar() {
  // React Hook Form
  const { register, handleSubmit, setValue, watch, formState: { errors }, setError, clearErrors, reset } = useForm();
  
  // Estados para controle de usuário e aluno
  const [userData, setUserData] = useState(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);
  const [aluno, setAluno] = useState(null);
  const [alunoNaoEncontrado, setAlunoNaoEncontrado] = useState(false);
  
  // Estados para curso e PPC
  const [curso, setCurso] = useState(null);
  const [ppc, setPpc] = useState(null);
  
  // Estados para feedback e erros
  const [msgErro, setMsgErro] = useState("");
  const [tipoErro, setTipoErro] = useState("");
  const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);
  
  // Estados para disciplinas e períodos
  const [periodoSelecionado, setPeriodoSelecionado] = useState('');
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState([]);
  const [disciplinasFiltradas, setDisciplinasFiltradas] = useState([]);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState({});
  const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);
  const [erroBuscaDisciplinas, setErroBuscaDisciplinas] = useState("");
  
  // Estados para cálculo de período
  const [periodoCalculado, setPeriodoCalculado] = useState("");
  
  // Referência para controlar busca única
  const buscouAlunoRef = useRef(false);
  const navigate = useNavigate();
  
  // Campos observados do formulário
  const motivoSolicitacao = watch("motivo_solicitacao");
  const documentoApresentado = watch("documento_apresentado");
  const dataInicioAfastamento = watch("data_inicio_afastamento");
  const dataFimAfastamento = watch("data_fim_afastamento");

  // Callback para o BuscaUsuario
  const handleUsuario = (data) => {
    console.log("BuscaUsuario retornou:", data);
    setUserData(data);
    setCarregandoUsuario(false);
  };

  // Redireciona se não houver usuário
  useEffect(() => {
    if (!carregandoUsuario && !userData) {
      navigate("/");
    }
  }, [carregandoUsuario, userData, navigate]);

  // Busca aluno pelo e-mail quando userData estiver disponível
  useEffect(() => {
    const buscarAluno = async () => {
      try {
        console.log("Buscando aluno pelo e-mail:", userData.email);
        const res = await axios.get(`http://localhost:8000/solicitacoes/usuarios/${userData.email}/`);
        
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const alunoEncontrado = res.data[0];
          console.log("Aluno encontrado:", alunoEncontrado);
          setAluno(alunoEncontrado);
          setAlunoNaoEncontrado(false);
          
          // Buscar dados do curso e PPC após obter aluno
          if (alunoEncontrado.curso_codigo) {
            buscarDadosCurso(alunoEncontrado.curso_codigo);
          }
          
          if (alunoEncontrado.ppc_codigo) {
            buscarDadosPpc(alunoEncontrado.ppc_codigo);
          }
        } else {
          setAlunoNaoEncontrado(true);
          setMsgErro("Aluno não encontrado no sistema.");
          setTipoErro("erro");
          setFeedbackIsOpen(true);
        }
      } catch (err) {
        console.error("Erro ao buscar aluno:", err);
        setAlunoNaoEncontrado(true);
        setMsgErro(err.message || "Erro ao buscar dados do aluno");
        setTipoErro("erro");
        setFeedbackIsOpen(true);
      }
    };

    if (userData?.email && !buscouAlunoRef.current) {
      buscouAlunoRef.current = true;
      buscarAluno();
    }
  }, [userData]);

  // Buscar dados do curso
  const buscarDadosCurso = async (codigoCurso) => {
    try {
      console.log("Buscando dados do curso:", codigoCurso);
      const res = await axios.get(`http://localhost:8000/solicitacoes/cursos/${codigoCurso}/`);
      console.log("Dados do curso:", res.data);
      setCurso(res.data);
    } catch (error) {
      console.error("Erro ao buscar dados do curso:", error);
      setMsgErro("Erro ao buscar dados do curso.");
      setTipoErro("erro");
      setFeedbackIsOpen(true);
    }
  };

  // Buscar dados do PPC
  const buscarDadosPpc = async (codigoPpc) => {
    try {
      console.log("Buscando dados do PPC:", codigoPpc);
      const res = await axios.get(`http://localhost:8000/solicitacoes/ppcs/${codigoPpc}/`);
      console.log("Dados do PPC:", res.data);
      setPpc(res.data);
      
      // Gerar períodos disponíveis baseado no tipo do curso
      const tipoPeriodo = res.data.tipo_periodo; // 'SEMESTRAL' ou 'ANUAL'
      const periodos = tipoPeriodo === 'SEMESTRAL' 
        ? Array.from({length: 10}, (_, i) => ({value: `${i+1}º Semestre`, label: `${i+1}º Semestre`}))
        : Array.from({length: 5}, (_, i) => ({value: `${i+1}º Ano`, label: `${i+1}º Ano`}));
      
      setPeriodosDisponiveis(periodos);
    } catch (error) {
      console.error("Erro ao buscar dados do PPC:", error);
      setMsgErro("Erro ao buscar dados do PPC.");
      setTipoErro("erro");
      setFeedbackIsOpen(true);
    }
  };

  // Calcular período entre datas
  useEffect(() => {
    if (dataInicioAfastamento && dataFimAfastamento) {
      const inicio = new Date(dataInicioAfastamento);
      const fim = new Date(dataFimAfastamento);
      
      if (!isNaN(inicio) && !isNaN(fim)) {
        if (fim < inicio) {
          setPeriodoCalculado("");
          setError("data_fim_afastamento", { 
            type: "manual", 
            message: "A data final não pode ser antes da inicial." 
          });
        } else {
          const diffTime = Math.abs(fim - inicio);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          setPeriodoCalculado(`${diffDays} dias`);
          clearErrors("data_fim_afastamento");
        }
      } else {
        setPeriodoCalculado("");
      }
    } else {
      setPeriodoCalculado("");
    }
  }, [dataInicioAfastamento, dataFimAfastamento, setError, clearErrors]);

  // Buscar disciplinas quando um período for selecionado
  const handlePeriodoChange = async (e) => {
    const periodo = e.target.value;
    setPeriodoSelecionado(periodo);
    setDisciplinasSelecionadas({});
    
    if (!periodo || !aluno?.curso_codigo) {
      setDisciplinasFiltradas([]);
      return;
    }
    
    setIsLoadingDisciplinas(true);
    setErroBuscaDisciplinas("");
    
    try {
      console.log(`Buscando disciplinas para curso ${aluno.curso_codigo} e período ${periodo}`);
      const res = await axios.get(
        `http://localhost:8000/solicitacoes/formulario_trancamento_disciplina/disciplinas/${aluno.curso_codigo}/?periodo=${periodo}`
      );
      console.log("Disciplinas encontradas:", res.data);
      setDisciplinasFiltradas(res.data);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      setErroBuscaDisciplinas("Erro ao buscar disciplinas. Tente novamente.");
      setDisciplinasFiltradas([]);
    } finally {
      setIsLoadingDisciplinas(false);
    }
  };

  // Manipular seleção de disciplinas
  const handleDisciplinaChange = (event) => {
    const { name, checked } = event.target;
    setDisciplinasSelecionadas(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Enviar formulário
  const onSubmit = async (data) => {
    console.log("Dados do formulário para envio:", data);
    
    // Verificar se pelo menos uma disciplina foi selecionada
    const disciplinasSelecionadasArray = Object.keys(disciplinasSelecionadas).filter(k => disciplinasSelecionadas[k]);
    if (disciplinasSelecionadasArray.length === 0) {
      setMsgErro("Por favor, selecione pelo menos uma disciplina.");
      setTipoErro("erro");
      setFeedbackIsOpen(true);
      return;
    }
    
    try {
      // Preparar dados para envio
      const formData = new FormData();
      
      // Dados do aluno
      formData.append("aluno", aluno.id);
      formData.append("curso", aluno.curso_codigo);
      formData.append("ppc", aluno.ppc_codigo);
      
      // Dados do formulário
      formData.append("motivo_solicitacao", data.motivo_solicitacao);
      formData.append("data_inicio_afastamento", data.data_inicio_afastamento);
      formData.append("data_fim_afastamento", data.data_fim_afastamento);
      formData.append("documento_apresentado", data.documento_apresentado);
      formData.append("periodo", periodoSelecionado);
      
      // Campos condicionais
      if (data.motivo_solicitacao === "outro" && data.outro_motivo) {
        formData.append("outro_motivo", data.outro_motivo);
      }
      
      if (data.documento_apresentado === "outro" && data.outro_documento) {
        formData.append("outro_documento", data.outro_documento);
      }
      
      // Anexos
      if (data.anexos && data.anexos.length > 0) {
        for (let i = 0; i < data.anexos.length; i++) {
          formData.append("anexos", data.anexos[i]);
        }
      }
      
      // Atividades remotas
      formData.append("consegue_realizar_atividades_remotas", data.consegue_realizar_atividades_remotas || false);
      
      // Disciplinas selecionadas
      disciplinasSelecionadasArray.forEach(disciplinaId => {
        formData.append("disciplinas", disciplinaId);
      });
      
      console.log("FormData final:", Object.fromEntries(formData.entries()));
      
      // Enviar para a API
      const response = await axios.post(
        "http://localhost:8000/solicitacoes/formulario_exerc_dom/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log("Resposta da API (sucesso):", response.data);
      setMsgErro("Solicitação enviada com sucesso!");
      setTipoErro("sucesso");
      setFeedbackIsOpen(true);
      
      // Limpar formulário
      reset();
      setDisciplinasSelecionadas({});
      setDisciplinasFiltradas([]);
      setPeriodoSelecionado("");
      
      // Redirecionar após 2 segundos
      setTimeout(() => navigate('/minhas-solicitacoes'), 2000);
      
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error.response?.data || error.message);
      setMsgErro(error.response?.data?.message || "Erro ao enviar solicitação. Tente novamente.");
      setTipoErro("erro");
      setFeedbackIsOpen(true);
    }
  };

  // Renderização condicional durante carregamento
  if (carregandoUsuario) {
    return (
      <>
        <BuscaUsuario dadosUsuario={handleUsuario} />
        <HeaderAluno />
        <main className="container">
          <p>Carregando usuário...</p>
        </main>
        <Footer />
      </>
    );
  }

  // Renderização quando aluno não é encontrado
  if (userData && alunoNaoEncontrado) {
    return (
      <div className="page-container">
        <HeaderAluno onLogout={() => setUserData(null)} />
        <main className="container">
          <h2>Aluno não encontrado no sistema.</h2>
          <p>Verifique se o e-mail está corretamente vinculado a um aluno.</p>
        </main>
        <Footer />
        {feedbackIsOpen && (
          <PopupFeedback
            mensagem={msgErro}
            tipo={tipoErro}
            onClose={() => setFeedbackIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // Renderização do formulário completo
  if (userData && aluno) {
    return (
      <div className="page-container">
        {/* A busca de usuário é feita apenas uma vez no carregamento inicial */}
        <HeaderAluno onLogout={() => setUserData(null)} />
        <main className="container">
          <h2>Solicitação de Exercícios Domiciliares</h2>
          <h6>
            Conforme o Art. 141. da Organização Didática do IFRS, os Exercícios
            Domiciliares possibilitam ao estudante realizar atividades em seu
            domicílio, quando houver impedimento de frequência às aulas por um
            período superior a 15 (quinze) dias, de acordo com o Decreto 1.044/69
            e com a Lei 6.202/75, tendo suas faltas abonadas durante o período de
            afastamento. O atendimento através de Exercício Domiciliar é um
            processo em que a família e a Instituição devem atuar de forma
            colaborativa, para que o estudante possa realizar suas atividades sem
            prejuízo na sua vida acadêmica. A solicitação deverá ser protocolada
            em até 05 (cinco) dias úteis subsequentes ao início da ausência às
            atividades letivas.
          </h6>

          <div className="info-aluno">
            {/* EMAIL (Read Only) */}
            <div className="form-group">
              <label htmlFor="email">E-mail:</label>
              <input
                type="text"
                id="email"
                defaultValue={userData?.email || ''}
                readOnly
                style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
              />
            </div>

            {/* NOME (Read Only) */}
            <div className="form-group">
              <label htmlFor="nome_completo">Nome:</label>
              <input
                type="text"
                id="nome_completo"
                defaultValue={aluno?.nome || userData?.name || ''}
                readOnly
                style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
              />
            </div>

            {/* MATRÍCULA (Read Only) */}
            <div className="form-group">
              <label htmlFor="matricula">Matrícula:</label>
              <input
                type="text"
                id="matricula"
                defaultValue={aluno?.matricula || ''}
                readOnly
                style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
              />
            </div>

            {/* CURSO (Read Only) */}
            <div className="form-group">
              <label htmlFor="curso">Curso:</label>
              <input
                type="text"
                id="curso"
                defaultValue={curso?.nome || ''}
                readOnly
                style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Campos ocultos para IDs */}
            <input type="hidden" {...register("aluno_id")} value={aluno?.id || ''} />
            <input type="hidden" {...register("curso_codigo")} value={aluno?.curso_codigo || ''} />
            <input type="hidden" {...register("ppc_codigo")} value={aluno?.ppc_codigo || ''} />

            {/* Período */}
            <div className="form-group">
              <label htmlFor="periodo">Período:</label>
              <select
                id="periodo"
                {...register("periodo", { required: "Período é obrigatório" })}
                onChange={handlePeriodoChange}
                value={periodoSelecionado}
              >
                <option value="">Selecione o período</option>
                {periodosDisponiveis.map((periodo) => (
                  <option key={periodo.value} value={periodo.value}>
                    {periodo.label}
                  </option>
                ))}
              </select>
              {errors.periodo && <span className="error-text">{errors.periodo.message}</span>}
            </div>

            {/* Disciplinas */}
            <div className="form-group">
              <label>Disciplinas do Período:</label>
              {isLoadingDisciplinas && <p>Carregando disciplinas...</p>}
              {erroBuscaDisciplinas && <p className="error-message">{erroBuscaDisciplinas}</p>}
              
              {!isLoadingDisciplinas && disciplinasFiltradas.length > 0 ? (
                <div className="disciplinas-container">
                  {disciplinasFiltradas.map((disciplina) => (
                    <div key={disciplina.codigo} className="disciplina-checkbox">
                      <input
                        type="checkbox"
                        id={`disciplina-${disciplina.codigo}`}
                        name={disciplina.codigo}
                        checked={!!disciplinasSelecionadas[disciplina.codigo]}
                        onChange={handleDisciplinaChange}
                      />
                      <label htmlFor={`disciplina-${disciplina.codigo}`}>
                        {disciplina.nome} ({disciplina.codigo})
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                !isLoadingDisciplinas && periodoSelecionado && 
                <p>Nenhuma disciplina encontrada para este período.</p>
              )}
            </div>

            {/* Motivo da solicitação */}
            <div className="form-group">
              <label htmlFor="motivo_solicitacao">
                Motivo da solicitação:
              </label>
              <select
                id="motivo_solicitacao"
                {...register("motivo_solicitacao", {
                  required: "Motivo da solicitação é obrigatório",
                })}
              >
                <option value="">Selecione o motivo</option>
                <option value="saude">
                  Problemas de saúde, conforme inciso I do art. 142 da OD.
                </option>
                <option value="maternidade">
                  Licença maternidade, conforme inciso II do art. 142 da OD.
                </option>
                <option value="familiar">
                  Acompanhamento de familiar (primeiro grau) com problemas de
                  saúde, inciso III, art. 142 da OD.
                </option>
                <option value="aborto_ou_falecimento">
                  Gestantes que sofreram aborto, falecimento do recém-nascido ou
                  natimorto (IV, 142 OD)
                </option>
                <option value="adocao">
                  Adoção de criança, conforme inciso V, art. 142 da OD.
                </option>
                <option value="conjuge">
                  Licença cônjuge/companheiro de parturiente/puérperas, conforme
                  inciso VI do art. 142 da OD.
                </option>
                <option value="outro">Outro</option>
              </select>
              {errors.motivo_solicitacao && (
                <span className="error-text">{errors.motivo_solicitacao.message}</span>
              )}
            </div>

            {/* Outro motivo (condicional) */}
            {motivoSolicitacao === "outro" && (
              <div className="form-group">
                <label htmlFor="outro_motivo">Descreva o outro motivo:</label>
                <input
                  type="text"
                  id="outro_motivo"
                  {...register("outro_motivo", {
                    required: motivoSolicitacao === "outro" ? "Descreva o outro motivo" : false,
                  })}
                />
                {errors.outro_motivo && (
                  <span className="error-text">{errors.outro_motivo.message}</span>
                )}
              </div>
            )}

            {/* Documento apresentado */}
            <div className="form-group">
              <label htmlFor="documento_apresentado">
                Escolha o tipo de documento para justificar a sua solicitação:
              </label>
              <select
                id="documento_apresentado"
                {...register("documento_apresentado", {
                  required: "Escolher o tipo de documento é obrigatório",
                })}
              >
                <option value="">Selecione o documento</option>
                <option value="atestado">Atestado médico</option>
                <option value="certidao_nascimento">Certidão de nascimento</option>
                <option value="termo_guarda">Termo judicial de guarda</option>
                <option value="certidao_obito">Certidão de óbito</option>
                <option value="justificativa_propria">
                  Justificativa de próprio punho
                </option>
                <option value="outro">Outro</option>
              </select>
              {errors.documento_apresentado && (
                <span className="error-text">{errors.documento_apresentado.message}</span>
              )}
            </div>

            {/* Outro documento (condicional) */}
            {documentoApresentado === "outro" && (
              <div className="form-group">
                <label htmlFor="outro_documento">Descreva o outro documento:</label>
                <input
                  type="text"
                  id="outro_documento"
                  {...register("outro_documento", {
                    required: documentoApresentado === "outro" ? "Descreva o outro documento" : false,
                  })}
                />
                {errors.outro_documento && (
                  <span className="error-text">{errors.outro_documento.message}</span>
                )}
              </div>
            )}

            {/* Período de afastamento calculado */}
            <div className="form-group">
              <label htmlFor="periodo_afastamento">Período de afastamento (dias):</label>
              <input
                type="text"
                id="periodo_afastamento"
                value={periodoCalculado}
                readOnly
                style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
              />
            </div>

            {/* Datas de afastamento */}
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

            {/* Anexos */}
            <div className="form-group">
              <label htmlFor="anexos">Anexar documentos comprobatórios (PDF, JPG, PNG):</label>
              <input
                type="file"
                id="anexos"
                multiple
                {...register("anexos")}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            {/* Checkbox para atividades remotas */}
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="consegue_realizar_atividades_remotas"
                {...register("consegue_realizar_atividades_remotas")}
              />
              <label htmlFor="consegue_realizar_atividades_remotas">
                Declaro que possuo condições de realizar as atividades remotamente durante o período de afastamento.
              </label>
            </div>

            {/* Botão de envio */}
            <button type="submit" className="btn btn-primary">
              Enviar solicitação
            </button>
          </form>
        </main>
        <Footer />
        {feedbackIsOpen && (
          <PopupFeedback
            mensagem={msgErro}
            tipo={tipoErro}
            onClose={() => setFeedbackIsOpen(false)}
          />
        )}
      </div>
    );
  }

  return null;
}