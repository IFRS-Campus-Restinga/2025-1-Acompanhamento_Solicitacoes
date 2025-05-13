import axios from "axios";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import Footer from "../../../components/base/footer";
import Header from "../../../components/base/header";
import "../../../components/formulario.css";
import { validateForm } from "./validations";

const FormularioExercicioDomiciliar = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [cursos, setCursos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemPopup, setMensagemPopup] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  // Observa valores de motivo e documento para exibir campos adicionais
  const motivoSolicitacao = watch("motivo_solicitacao");
  const documentoApresentado = watch("documento_apresentado");

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/cursos/")
      .then(res => setCursos(res.data))
      .catch(() => console.error("Erro ao buscar cursos."));

    axios.get("http://localhost:8000/solicitacoes/turmas/")
      .then(res => setTurmas(res.data))
      .catch(() => console.error("Erro ao buscar turmas."));

    axios.get("http://localhost:8000/solicitacoes/buscar_info_usuario/")
      .then(res => {
        setValue("aluno_nome", res.data.nome_completo || "");
        setValue("email", res.data.email || "");
        setValue("matricula", res.data.matricula || "");
      })
      .catch(() => console.error("Erro ao buscar dados do usuário."));
  }, []);

  const onSubmit = (data) => {
    const formErrors = validateForm(data);
    if (Object.keys(formErrors).length > 0) {
      setMensagemPopup("Preencha os campos obrigatórios corretamente.");
      setTipoMensagem("erro");
      setMostrarFeedback(true);
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "arquivos") {
        Array.from(value).forEach(file => formData.append("arquivos", file));
      } else {
        formData.append(key, value);
      }
    });

    axios.post("http://localhost:8000/solicitacoes/form_exercicio_domiciliar/", formData,{
     headers: { "Content-Type": "multipart/form-data" }
    })
      .then(() => {
        setMensagemPopup("Solicitação enviada com sucesso!");
        setTipoMensagem("sucesso");
        setMostrarFeedback(true);
      })
      .catch(() => {
        setMensagemPopup("Erro ao enviar solicitação.");
        setTipoMensagem("erro");
        setMostrarFeedback(true);
      });
  };

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Solicitação de Exercícios Domiciliares</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="formulario" encType="multipart/form-data">

          <div className="form-group">
            <label>E-mail:</label>
            <input type="email" {...register("email", { required: "E-mail é obrigatório" })} readOnly style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }} />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Nome completo:</label>
            <input type="text" {...register("aluno_nome", { required: "Nome completo é obrigatório" })} readOnly style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }} />
          </div>

          <div className="form-group">
            <label>Número de matrícula:</label>
            <input type="text" {...register("matricula", { required: "Número de matrícula é obrigatório" })} readOnly style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }} />
          </div>

          <div className="form-group">
            <label>Curso:</label>
            <select {...register("curso", { required: "Curso é obrigatório" })}>
              <option value="">Selecione o curso</option>
              {cursos.map((curso) => (
                <option key={curso.codigo} value={curso.codigo}>{curso.nome}</option>
              ))}
            </select>
            {errors.curso && <span className="error-text">{errors.curso.message}</span>}
          </div>

          <div className="form-group">
            <label>Motivo da solicitação:</label>
            <select {...register("motivo_solicitacao", { required: "Motivo da solicitação é obrigatório" })}>
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
              <label>Descreva o outro motivo:</label>
              <input type="text" {...register("outro_motivo", { required: "Descreva o outro motivo" })} />
            </div>
          )}

          <div className="form-group">
            <label>Período de afastamento:</label>
            <fieldset className="periodo-afastamento">
              <div className="datas-container">
                <div className="form-group">
                  <label>Data inicial:</label>
                  <input type="date" {...register("data_inicio_afastamento", { required: "Data inicial é obrigatória" })} />
                </div>
                <div className="form-group">
                  <label>Data final:</label>
                  <input type="date" {...register("data_fim_afastamento", { required: "Data final é obrigatória" })} />
                </div>
              </div>
            </fieldset>
            {errors.data_inicio_afastamento && <span className="error-text">{errors.data_inicio_afastamento.message}</span>}
            {errors.
            data_fim_afastamento && <span className="error-text">{errors.data_fim_afastamento.message}</span>}
          </div>

           <div className="form-group">
            <label>Escolha o tipo de documento para justificar a sua solicitação:</label>
            <select {...register("documento_apresentado", { required: "Escolher o tipo de documento é obrigatório" })}>
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
              <label>Descreva o outro documento:</label>
              <input type="text" {...register("outro_documento", { required: "Descreva o outro documento" })} />
            </div>
          )}

          <div className="form-group">
            <label>Anexe o(s) seu(s) documento(s) (máx 5 arquivos):</label>
            <input 
            type="file" 
            {...register("arquivos")} 
            multiple 
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
            />
          {errors.arquivos && <span className="error-text">{errors.arquivos.message}</span>}
          </div>

          <div className="form-group">
            <label>Você consegue realizar as atividades escolares pelo Moodle, de forma remota?</label>
            <div>
            <label>
              <input 
                type="radio" 
                {...register("consegue_realizar_atividades", { required: "Selecione uma opção" })} 
                value="true" 
              /> Sim
            </label>
            <label>
              <input 
                type="radio" 
                {...register("consegue_realizar_atividades", { required: "Selecione uma opção" })} 
                value="false" 
              /> Não
            </label>
          </div>
          {errors.consegue_realizar_atividades && <span className="error-text">{errors.consegue_realizar_atividades.message}</span>}
        </div>

          <button type="submit" className="submit-button">Enviar</button>
        </form>

        {mostrarFeedback && (
          <div className={`popup-feedback ${tipoMensagem}`}>
            <p>{mensagemPopup}</p>
            <button onClick={() => setMostrarFeedback(false)}>Fechar</button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FormularioExercicioDomiciliar;
