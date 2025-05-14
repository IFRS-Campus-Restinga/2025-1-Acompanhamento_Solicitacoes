import axios from "axios";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import Footer from "../../../components/base/footer";
import Header from "../../../components/base/header";
import "../../../components/formulario.css";
import { validateForm } from "./validations";

const FormularioExercicioDomiciliar = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors }, setError, clearErrors, reset } = useForm();
  const [cursos, setCursos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [disciplinasDaTurma, setDisciplinasDaTurma] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  //const [emailInput, setEmailInput] = useState("");

  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const [isLoadingUsuario, setIsLoadingUsuario] = useState(false);
  const [erroBuscaUsuario, setErroBuscaUsuario] = useState("");
  const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);
  const [erroBuscaDisciplinas, setErroBuscaDisciplinas] = useState("");

  const motivoSolicitacao = watch("motivo_solicitacao");
  const documentoApresentado = watch("documento_apresentado");
  const cursoSelecionado = watch("curso");

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/cursos/")
      .then(res => setCursos(res.data))
      .catch(() => {
        console.error("Erro ao buscar cursos.");
        setMensagemPopup("Erro ao carregar lista de cursos.");
        setTipoMensagem("erro");
        setMostrarFeedback(true);
        setTimeout(() => setMostrarFeedback(false), 5000);
      });

    axios.get("http://localhost:8000/solicitacoes/turmas/")
      .then(res => setTurmas(res.data))
      .catch(() => {
        console.error("Erro ao buscar turmas.");
        setMensagemPopup("Erro ao carregar lista de turmas.");
        setTipoMensagem("erro");
        setMostrarFeedback(true);
        setTimeout(() => setMostrarFeedback(false), 5000);
      });
  }, []);

  useEffect(() => {
    const dataInicio = watch("data_inicio_afastamento");
    const dataFim = watch("data_fim_afastamento");
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      if (fim < inicio) {
        setValue("periodo_afastamento", 0);
        setError("data_fim_afastamento", { type: "manual", message: "A data final não pode ser antes da inicial." });
      } else {
        const diffDays = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;
        setValue("periodo_afastamento", diffDays);
        clearErrors("data_fim_afastamento");
      }
    } else {
      setValue("periodo_afastamento", "");
    }
  }, [watch("data_inicio_afastamento"), watch("data_fim_afastamento"), setValue, setError, clearErrors]);

  const handleEmailBlur = async (event) => {
    const currentEmailValue = event.target.value;
    if (!currentEmailValue || !currentEmailValue.includes('@')) {
      setErroBuscaUsuario("Por favor, insira um e-mail válido.");
      setValue("aluno_nome", "");
      setValue("matricula", "");
      return;
    }
    setIsLoadingUsuario(true);
    setErroBuscaUsuario("");
    try {
      const response = await axios.get(`http://localhost:8000/solicitacoes/usuarios/?email=${currentEmailValue}`);
      if (response.data && response.data.length > 0) {
        const usuario = response.data[0];
        setValue("aluno_nome", usuario.nome || "");
        if (usuario.papel === "Aluno" && usuario.papel_detalhes && usuario.papel_detalhes.matricula) {
          setValue("matricula", usuario.papel_detalhes.matricula || "");
        } else {
          setValue("matricula", "");
          setErroBuscaUsuario("Matrícula não encontrada para este utilizador ou utilizador não é um aluno.");
        }
        clearErrors("email");
        clearErrors("aluno_nome");
        clearErrors("matricula");
      } else {
        setValue("aluno_nome", "");
        setValue("matricula", "");
        setErroBuscaUsuario("Utilizador não encontrado com este e-mail.");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do utilizador:", error);
      setValue("aluno_nome", "");
      setValue("matricula", "");
      setErroBuscaUsuario("Erro ao buscar dados do utilizador. Tente novamente.");
    }
    setIsLoadingUsuario(false);
  };

  const handleTurmaChange = async (event) => {
    const selectedTurmaId = event.target.value;
    setTurmaSelecionada(selectedTurmaId);
    setValue("componentes_curriculares", "");
    setDisciplinasDaTurma([]);
    if (selectedTurmaId) {
      setIsLoadingDisciplinas(true);
      setErroBuscaDisciplinas("");
      try {
        const response = await axios.get(`http://localhost:8000/solicitacoes/turmas/${selectedTurmaId}/disciplinas/`);
        if (response.data && response.data.length > 0) {
          setDisciplinasDaTurma(response.data);
          const nomesDisciplinas = response.data.map(d => `${d.nome} (${d.codigo})`).join("\n");
          setValue("componentes_curriculares", nomesDisciplinas);
        } else {
          setValue("componentes_curriculares", "Nenhuma disciplina encontrada para esta turma.");
        }
      } catch (error) {
        console.error("Erro ao buscar disciplinas da turma:", error);
        setErroBuscaDisciplinas("Erro ao buscar disciplinas. Tente novamente.");
        setValue("componentes_curriculares", "");
      }
      setIsLoadingDisciplinas(false);
    }
  };

  const onSubmit = (data) => {
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
    Object.entries(data).forEach(([key, value]) => {
      if (key === "arquivos" && value instanceof FileList) {
        Array.from(value).forEach(file => formData.append("arquivos", file));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    axios.post("http://localhost:8000/solicitacoes/form_exercicio_domiciliar/", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
      .then(() => {
        setMensagemPopup("Solicitação enviada com sucesso!");
        setTipoMensagem("sucesso");
        setMostrarFeedback(true);
        reset(); // Limpa o formulário
        // Limpar estados adicionais se necessário
        setTurmaSelecionada("");
        setDisciplinasDaTurma([]);
        setValue("componentes_curriculares", "");
        setTimeout(() => setMostrarFeedback(false), 3000);
      })
      .catch((err) => {
        console.error("Erro ao enviar solicitação:", err.response?.data || err.message);
        let errorMsg = "Erro ao enviar solicitação. Tente novamente mais tarde.";
        if (err.response && err.response.data) {
          const backendData = err.response.data;
          if (typeof backendData === 'string') {
            errorMsg = backendData;
          } else if (typeof backendData === 'object' && backendData !== null) {
            const errorMessages = [];
            for (const key in backendData) {
              if (Object.prototype.hasOwnProperty.call(backendData, key)) {
                const value = backendData[key];
                if (Array.isArray(value)) {
                  errorMessages.push(`${key}: ${value.join(', ')}`);
                } else {
                 errorMessages.push(`${key}: ${JSON.stringify(value)}`);
                }
              }
            }
            if (errorMessages.length > 0) {
              errorMsg = errorMessages.join('; ');
            } else {
              try {
                errorMsg = JSON.stringify(backendData);
              } catch (e) { /* Mantém a mensagem padrão */ }
            }
          } else if (err.message) {
            errorMsg = err.message;
          }
        } else if (err.message) {
          errorMsg = err.message;
        }
        setMensagemPopup(errorMsg);
        setTipoMensagem("erro");
        setMostrarFeedback(true);
        setTimeout(() => setMostrarFeedback(false), 5000);
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
        <form onSubmit={handleSubmit(onSubmit)} className="formulario" encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              {...register("email", { required: "E-mail é obrigatório" })}
              onBlur={(e) => {
                const { onBlur } = register("email"); // Obtém o onBlur original do react-hook-form
                if (onBlur) onBlur(e); // Chama o onBlur original
                handleEmailBlur(e); // Chama a nossa função personalizada
              }}
              placeholder="Digite o e-mail do aluno"
            />
            {isLoadingUsuario && <p>A procurar utilizador...</p>}
            {erroBuscaUsuario && <span className="error-text">{erroBuscaUsuario}</span>}
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="aluno_nome">Nome completo:</label>
            <input type="text" id="aluno_nome" {...register("aluno_nome", { required: "Nome completo é obrigatório" })} readOnly style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }} />
            {errors.aluno_nome && <span className="error-text">{errors.aluno_nome.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="matricula">Número de matrícula:</label>
            <input type="text" id="matricula" {...register("matricula", { required: "Número de matrícula é obrigatório" })} readOnly style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }} />
            {errors.matricula && <span className="error-text">{errors.matricula.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="curso">Curso:</label>
            <select id="curso" {...register("curso", { required: "Curso é obrigatório" })}>
              <option value="">Selecione o curso</option>
              {cursos.map((curso) => (
                <option key={curso.codigo} value={curso.codigo}>{curso.nome}</option>
              ))}
            </select>
            {errors.curso && <span className="error-text">{errors.curso.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="turma">Turma:</label>
            <select
              id="turma"
              {...register("turma")} // Registar para validação ou envio se necessário
              value={turmaSelecionada}
              onChange={handleTurmaChange}
              disabled={!cursoSelecionado}
            >
              <option value="">Selecione a turma</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>{turma.nome}</option>
              ))}
            </select>
            {isLoadingDisciplinas && <p>A carregar disciplinas...</p>}
            {erroBuscaDisciplinas && <span className="error-text">{erroBuscaDisciplinas}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="componentes_curriculares">Disciplinas da Turma:</label>
            <textarea
              id="componentes_curriculares"
              {...register("componentes_curriculares")}
              placeholder="As disciplinas serão preenchidas ao selecionar a turma"
              readOnly
              rows="5"
              style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
            />
            {errors.componentes_curriculares && <span className="error-text">{errors.componentes_curriculares.message}</span>}
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
              {...register("periodo_afastamento")}
              readOnly
              style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
            />

            {/* Mostra erro vindo do back-end (como lista) */}
            {errors.periodo_afastamento?.message && Array.isArray(errors.periodo_afastamento.message) && (
              <div className="text-red-600 text-sm mt-1">
                {errors.periodo_afastamento.message[0]}
              </div>
            )}

            {/* Mostra erro padrão do react-hook-form */}
            {!Array.isArray(errors.periodo_afastamento?.message) && (
              <span className="text-red-600 text-sm mt-1">
                {errors.periodo_afastamento?.message}
              </span>
            )}
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
            {/* Botão de fechar removido, o popup some automaticamente */}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FormularioExercicioDomiciliar;

