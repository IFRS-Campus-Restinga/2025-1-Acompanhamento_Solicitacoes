import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import BuscaUsuario from "../../../components/busca_usuario";
import "../../../components/formulario.css";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
import VerificadorDisponibilidade from "../../../pages/disponibilidade/VerificadorDisponibilidade";

// Serviços de autenticação
import { getAuthToken } from "../../../services/authUtils";

export default function FormularioTrancamentoMatricula() {
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aluno) {
      setMsgErro("Por favor, aguarde o carregamento dos dados do aluno.");
      setTipoErro("erro");
      setFeedbackIsOpen(true);
      return;
    }
    
    if (!formData.motivo_solicitacao) {
      setMsgErro("A justificativa do trancamento é obrigatória.");
      setTipoErro("erro");
      setFeedbackIsOpen(true);
      return;
    }

    const dataToSubmit = new FormData();
    dataToSubmit.append("motivo_solicitacao", formData.motivo_solicitacao);
    dataToSubmit.append("aluno", aluno.id);
    dataToSubmit.append("data_solicitacao", new Date().toISOString().split("T")[0]);

    if (formData.arquivos && formData.arquivos.length > 0) {
      Array.from(formData.arquivos).forEach((file) => {
        dataToSubmit.append("arquivos", file);
      });
    }
    
    try {
      const token = getAuthToken();
      await axios.post(
        "http://localhost:8000/solicitacoes/formularios-trancamento/",
        dataToSubmit,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          },
        }
      );
      
      setMsgErro("Solicitação de trancamento de matrícula enviada com sucesso!");
      setTipoErro("sucesso");
      setFeedbackIsOpen(true);
      
      // Limpar formulário
      setFormData({
        motivo_solicitacao: "",
        arquivos: null
      });
      
      // Redirecionar após 2 segundos
      setTimeout(() => navigate("/minhas-solicitacoes"), 2000);
    } catch (error) {
      let errorMessage = "Erro ao enviar solicitação.";
      if (error.response && error.response.data) {
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'string') {
          errorMessage = backendErrors;
        } else {
          errorMessage = Object.entries(backendErrors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
        }
      }
      
      setMsgErro(errorMessage);
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
      <VerificadorDisponibilidade tipoFormulario="TRANCAMENTOMATRICULA">
        <div className="page-container">
          <BuscaUsuario dadosUsuario={handleUsuario} />
          <HeaderAluno onLogout={() => setUserData(null)} />
          <main className="container">
            <h2>Solicitação de Trancamento de Matrícula</h2>
            <h6 className="descricao-formulario">
              Este formulário destina-se à solicitação de trancamento total de matrícula. 
              É importante ressaltar que o trancamento total de matrícula não é permitido para estudantes ingressantes, alunos de cursos integrados e aqueles matriculados na modalidade de Educação de Jovens e Adultos (EJA).
              Ao solicitar o trancamento de matrícula, o/a estudante declara estar ciente de que esta medida é válida por um período letivo. A renovação da solicitação de trancamento total da matrícula é obrigatória a cada período letivo. O não cumprimento desse procedimento resultará no cancelamento automático da matrícula.
              Ressalta-se que o trancamento não será concedido caso o curso em que o estudante estiver matriculado esteja em processo de extinção.
              IMPORTANTE: O trancamento total de matrícula é permitido até a quarta semana após o início das atividades letivas, conforme estabelecido em nosso calendário acadêmico.
            </h6>

            <div className="dados-aluno-container">
              <div className="form-group">
                <label>Nome:</label>
                <input type="text" value={aluno?.nome || userData?.name || ""} readOnly />
              </div>
              <div className="form-group">
                <label>E-mail:</label>
                <input type="email" value={userData?.email || ""} readOnly />
              </div>
              <div className="form-group">
                <label>Matrícula:</label>
                <input type="text" value={aluno?.matricula || ""} readOnly />
              </div>
              
              {loadingPpc && <p>A carregar dados do curso/PPC...</p>}
              
              {curso && (
                <div className="form-group">
                  <label>Curso:</label>
                  <input type="text" value={curso?.nome || ""} readOnly />
                </div>
              )}
              
              {ppc && (
                <div className="form-group">
                  <label>PPC (Nome/Código):</label>
                  <input type="text" value={ppc?.nome || ppc?.codigo || "N/D"} readOnly />
                </div>
              )}

              <div className="form-group">
                <label>Ano de Ingresso:</label>
                <input type="text" value={aluno?.ano_ingresso || ""} readOnly />
              </div>
            </div>

            <hr />
            <h3>Detalhes do Trancamento</h3>
            
            <form onSubmit={handleSubmit} className="formulario formulario-largo" encType="multipart/form-data">
              <div className="form-group">
                <label htmlFor="motivo_solicitacao">Justificativa do trancamento:</label>
                <textarea
                  id="motivo_solicitacao"
                  name="motivo_solicitacao"
                  value={formData.motivo_solicitacao}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="arquivos">Anexos (opcional):</label>
                <input
                  type="file"
                  id="arquivos"
                  name="arquivos"
                  multiple
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="submit-button" disabled={loadingPpc}>
                {loadingPpc ? "A Carregar..." : "Enviar Solicitação"}
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
      </VerificadorDisponibilidade>
    );
  }

  return null;
}
