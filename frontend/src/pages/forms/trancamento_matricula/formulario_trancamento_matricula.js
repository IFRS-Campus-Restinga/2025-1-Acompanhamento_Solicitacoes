import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";

// Components
import BuscaUsuario from "../../../components/busca_usuario";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
import BotaoEnviarSolicitacao from '../../../components/UI/botoes/botao_enviar_solicitacao';

//import VerificadorDisponibilidade from "../../../pages/disponibilidade/VerificadorDisponibilidade";
//<VerificadorDisponibilidade tipoFormulario="TRANCAMENTOMATRICULA">

//CSS
import "../../../components/styles/formulario.css";

// Serviços de autenticação
import { getAuthToken } from "../../../services/authUtils";

export default function FormularioTrancamentoMatricula() {

   const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm();

  // Estados para controle de usuário e aluno
  const [userData, setUserData] = useState(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);
  const [aluno, setAluno] = useState(null);
  const [alunoNaoEncontrado, setAlunoNaoEncontrado] = useState(false);
  
  // Estados para curso e PPC
  const [curso, setCurso] = useState(null);
  const [ppc, setPpc] = useState(null);
  const [loadingPpc, setLoadingPpc] = useState(false);
  
  // Estados para feedback e erros
  const [msgErro, setMsgErro] = useState("");
  const [tipoErro, setTipoErro] = useState("");
  const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);

  // Estado de loading para enviar os dados do forms para solicitacao
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para o formulário
  const [formData, setFormData] = useState({
    motivo_solicitacao: "",
    arquivos: null,
  });
  
  // Referência para controlar busca única
  const buscouAlunoRef = useRef(false);
  const navigate = useNavigate();

  // Callback para o BuscaUsuario
  const handleUsuario = useCallback((data) => {
    console.log("BuscaUsuario retornou:", data);
    setUserData(data);
    setCarregandoUsuario(false);
  }, []);

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
        const token = getAuthToken();
        const res = await axios.get(`http://localhost:8000/solicitacoes/usuarios/buscar-por-email/${userData.email}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data) {
          const usuarioEncontrado = res.data;
          console.log("Usuário encontrado na API:", usuarioEncontrado);

          // Verifique se o usuário tem um objeto Aluno associado (grupo_detalhes)
          if (usuarioEncontrado?.grupo_detalhes) {
            const alunoReal = usuarioEncontrado.grupo_detalhes;
            console.log("Objeto Aluno encontrado (grupo_detalhes):", alunoReal);

            setAluno(alunoReal);
            setAlunoNaoEncontrado(false);

            // Buscar dados do curso e PPC após obter aluno
            if (alunoReal?.curso_codigo) {
              buscarDadosCurso(alunoReal.curso_codigo);
            }
            
            if (alunoReal?.ppc_codigo) {
              buscarDadosPpc(alunoReal.ppc_codigo);
            }
          } else {
            console.error("Usuário encontrado, mas sem dados de Aluno (grupo_detalhes).");
            setAlunoNaoEncontrado(true);
            setMsgErro("Dados de aluno não encontrados para este usuário.");
            setTipoErro("erro");
            setFeedbackIsOpen(true);
          }
        } else {
          setAlunoNaoEncontrado(true);
          setMsgErro("Aluno não encontrado no sistema.");
          setTipoErro("erro");
          setFeedbackIsOpen(true);
        }


      } catch (err) {
        console.error("Erro ao buscar aluno:", err.response?.data || err.message);
        setAlunoNaoEncontrado(true);
        setMsgErro(err.response?.data?.message || "Erro ao buscar dados do aluno");
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
      const token = getAuthToken();
      const res = await axios.get(`http://localhost:8000/solicitacoes/cursos/${codigoCurso}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      setLoadingPpc(true);
      console.log("Buscando dados do PPC:", codigoPpc);
      const token = getAuthToken();
      const res = await axios.get(`http://localhost:8000/solicitacoes/ppcs/${codigoPpc}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Dados do PPC:", res.data);
      setPpc(res.data);
    } catch (error) {
      console.error("Erro ao buscar dados do PPC:", error);
      setMsgErro("Erro ao buscar dados do PPC.");
      setTipoErro("erro");
      setFeedbackIsOpen(true);
    } finally {
      setLoadingPpc(false);
    }
  };

  // Manipular mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Enviar formulário

  const onSubmit = async (data) => {
  setIsSubmitting(true);
    if (!data.motivo_solicitacao || !data.auxilio_estudantil) {
      setMsgErro("Preencha todos os campos obrigatórios");
      setTipoErro("erro");
      setFeedbackIsOpen(true);
      return;
    }
  
    try {
      // Validação inicial dos dados obrigatórios
      if (!aluno?.id || !curso?.codigo || !ppc?.codigo || !userData?.id) {
        throw new Error("Dados incompletos do aluno/curso. Recarregue a página e tente novamente.");
      }
      const formData = new FormData();
      
      // Dados básicos do formulário
      formData.append('motivo_solicitacao', data.motivo_solicitacao);
      formData.append('auxilio_estudantil', data.auxilio_estudantil);
      
      // Dados do aluno (dos inputs dos Cookies)
      formData.append('aluno_id', aluno.id);
      formData.append('matricula', aluno.matricula);
      formData.append('curso_id', data.curso_id);
      formData.append('curso_codigo', curso.codigo);
      formData.append('ppc_codigo', ppc.codigo);
      formData.append('usuario_solicitante', userData.id);

      //Metadados automáticos
      formData.append('data_solicitacao', new Date().toISOString().split('T')[0]);
      formData.append('status', 'pendente');
      formData.append('tipo_solicitacao', 'TRANCAMENTO_MATRICULA');
      
      //Arquivos anexos (opcional)
      if (data.arquivos && data.arquivos.length > 0) {
        Array.from(data.arquivos).forEach((file, index) => {
          formData.append(`arquivo_${index}`, file); // Nomeação explícita
        });
      }

      const token = getAuthToken();
      const response = await axios.post(
        "http://localhost:8000/solicitacoes/formularios-trancamento/",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          },
          timeout: 10000 // Timeout de 10 segundos
        }
      );

      // Feedback de sucesso  
      setMsgErro("Solicitação de trancamento de matrícula enviada com sucesso!");
      setTipoErro("sucesso");
      setFeedbackIsOpen(true);

      // Redirecionamento com delay  
      setTimeout(() => navigate("/aluno/minhas-solicitacoes"), 2000);

    } catch (error) {
    console.error("Erro detalhado:", error);
    
    // Tratamento refinado de erros
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        "Erro desconhecido ao enviar solicitação";
    
    setMsgErro(errorMessage);
    setTipoErro("erro");
    setFeedbackIsOpen(true);
    
    // Log adicional para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error("Detalhes do erro:", {
        config: error.config,
        response: error.response
      });
    }
  } finally {
    setIsSubmitting(false);
  }
};
      
  // Renderização condicional durante carregamento
  if (carregandoUsuario) {
    return (
      <>
        <BuscaUsuario dadosUsuario={handleUsuario} />
        <main className="container">
          <p>Carregando usuário...</p>
        </main>
      </>
    );
  }

  // Renderização quando aluno não é encontrado
  if (userData && alunoNaoEncontrado) {
    return (
      <div className="page-container">
        <main className="container">
          <h2>Aluno não encontrado no sistema.</h2>
          <p>Verifique se o e-mail está corretamente vinculado a um aluno.</p>
        </main>
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
          <BuscaUsuario dadosUsuario={handleUsuario} />
          <main className="container">
            <h2>Solicitação de Trancamento de Matrícula</h2>
            <br></br>
            <h6 className="descricao-formulario">
              Este formulário destina-se à solicitação de <strong> trancamento total de matrícula</strong>.
              É importante ressaltar que o trancamento total de matrícula não é permitido para estudantes ingressantes, 
              alunos de cursos integrados e aqueles matriculados na modalidade de Educação de Jovens e Adultos (EJA).
              <br></br>Ao solicitar o trancamento de matrícula, o/a estudante declara estar ciente de que esta medida é válida <strong> por um período letivo</strong>. 
              A renovação da solicitação de trancamento total da matrícula é obrigatória a cada período letivo. 
              O não cumprimento desse procedimento resultará no <strong>cancelamento automático da matrícula</strong>.
              Ressalta-se que o trancamento não será concedido caso o curso em que o estudante estiver matriculado esteja em processo de extinção.
              <hr></hr><strong>IMPORTANTE:</strong> O trancamento total de matrícula é permitido até a quarta semana após o início das atividades letivas, conforme estabelecido em nosso calendário acadêmico.
            </h6>

            <form onSubmit={handleSubmit(onSubmit)} className="formulario formulario-largura" encType="multipart/form-data">
            
            <div className="dados-aluno-container">
              <div className="form-group">
                <label>E-mail:</label>
                <input type="email" id="email" readOnly {...register("email")} value={userData?.email || ""} />
              </div>
              <div className="form-group">
                <label>Nome Completo:</label>
                <input type="text" id="nome_completo" readOnly {...register("nome_completo")} value={aluno?.nome || userData?.name || ""}/>
              </div>
              <div className="form-group">
                <label>Matrícula:</label>
                <input type="text" id="matricula" readOnly {...register("matricula")}  value={aluno?.matricula || ""}/>
              </div>
              
              {loadingPpc && <p>A carregar dados do curso/PPC...</p>}
              
              {curso && (
                <div className="form-group">
                  <label>Curso:</label>
                  <input type="text" id="curso" readOnly {...register("curso")}  value={curso?.nome || ""} />
                  {/* Campo oculto para o ID do curso */}
                  <input type="hidden" {...register("curso_id")} value={curso?.nome || ""} />
                  {/* Campos ocultos para códigos de aluno e PPC */}
                  <input type="hidden" {...register("aluno_id")} value={aluno?.id || ""} />
                  <input type="hidden" {...register("curso_codigo")}value={curso?.codigo || ""} />
                  <input type="hidden" {...register("ppc_codigo")} value={ppc?.codigo || ""}/>
                  {/* Data atual automática */}
                  <input type="hidden" {...register("data_solicitacao")} value={new Date().toISOString().split('T')[0]}/>

                  {/* Status padrão */}
                  <input type="hidden" {...register("status")} value="pendente"/>

                  {/* Tipo de solicitação */}
                  <input type="hidden" {...register("tipo_solicitacao")} value="TRANCAMENTO_MATRICULA"/>
                </div>
              )}
     
              {/* Campo para ver se o aluno recebe auxilio*/}
                <div className="form-group">
                    <label>Recebe auxílio estudantil?</label>
                    <select
                        {...register("auxilio_estudantil", { required: "Este campo é obrigatório." })}
                    >
                        <option value="">Selecione</option>
                        <option value={true}>Sim</option>
                        <option value={false}>Não</option>
                    </select>
                    {errors.auxilio_estudantil && <span className="error-text">{errors.auxilio_estudantil.message}</span>}
                </div>
          
              <div className="form-group">
                <label>Justificativa:</label>
                <textarea
                  {...register("motivo_solicitacao", { 
                  required: "Justificativa é obrigatória",
                  minLength: {
                    value: 20,
                    message: "Mínimo 20 caracteres"
                  }
                })}
                rows="5"
              />
              {errors.motivo_solicitacao && (
                <span className="error-text">{errors.motivo_solicitacao.message}</span>
              )}
              </div>

              <div className="form-group">
                <label>Anexos (opcional):</label>
                <input
                  type="file"
                  {...register("arquivos")}
                  multiple
                />
              </div>    
            </div>  

            <BotaoEnviarSolicitacao isSubmitting={isSubmitting}/>

            </form>
          </main>
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
