import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import BuscaUsuario from "../../../components/busca_usuario";
import "../../../components/formulario.css";
import VerificadorDisponibilidade from "../../../pages/disponibilidade/VerificadorDisponibilidade";

export default function FormularioTrancamentoMatricula() {
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [ppcDetalhes, setPpcDetalhes] = useState(null);
  const [loadingPpc, setLoadingPpc] = useState(false);

  const [formData, setFormData] = useState({
    motivo_solicitacao: "", 
    arquivos: null, 
  });

  const [carregando, setCarregando] = useState(true);
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  const handleUsuario = (data) => {
        setUserData(data);
        console.log(data);
        setCarregando(false);
    };

    useEffect(() => {
        if (!carregando && !userData) {
            navigate("/");
        }
    }, [carregando, userData, navigate]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/alunos/") 
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setAlunos(res.data);
        } else {
          setAlunos([]);
        }
      })
      .catch((err) => {
        setAlunos([]);
        alert("Falha ao carregar a lista de alunos.");
      });
  }, []);

  useEffect(() => {
    if (alunoSelecionado && typeof alunoSelecionado.ppc !== 'undefined' && alunoSelecionado.ppc !== null) {
      const ppcCodigoOriginal = String(alunoSelecionado.ppc).trim();
      
      if (!ppcCodigoOriginal) { 
          setPpcDetalhes(null);
          setLoadingPpc(false); 
          return;
      }

      const ppcCodigoEncoded = encodeURIComponent(ppcCodigoOriginal);
      setLoadingPpc(true);
      setPpcDetalhes(null); 
      // CORREÇÃO: Removido /api/ da URL, assumindo que o endpoint de PPCs está sob /solicitacoes/ ou outro caminho direto.
      // Ajuste este caminho se o endpoint de detalhes do PPC for diferente (ex: /ppcs/ ou /algum-outro-app/ppcs/).
      const urlPpc = `http://localhost:8000/solicitacoes/ppcs/${ppcCodigoEncoded}/`; 
      axios
        .get(urlPpc) 
        .then((res) => {
          if (res.data && res.data.curso_details) { 
            setPpcDetalhes(res.data); 
          } else {
            alert(`Não foi possível carregar os detalhes completos do curso/PPC para o PPC código: ${ppcCodigoOriginal}. Verifique a estrutura da resposta da API: ${urlPpc}`);
          }
        })
        .catch((err) => {
          alert(`Falha ao carregar detalhes do PPC/Curso para o código ${ppcCodigoOriginal} na URL ${urlPpc}. Erro: ${err.message}`);
        })
        .finally(() => {
          setLoadingPpc(false);
        });
    } else {
      setPpcDetalhes(null); 
    }
  }, [alunoSelecionado]); 

  const handleAlunoChange = (e) => {
    const selectedAlunoId = e.target.value; 
    if (!selectedAlunoId) {
      setAlunoSelecionado(null);
      return;
    }
    const alunoObj = alunos.find((a) => String(a.id) === String(selectedAlunoId));
    if (alunoObj && alunoObj.usuario && typeof alunoObj.ppc !== 'undefined') {
        setAlunoSelecionado(alunoObj);
    } else {
        alert("Erro: Dados incompletos para o aluno selecionado. Verifique se a API de alunos está retornando o campo 'ppc' (código do PPC) e o objeto 'usuario'.");
        setAlunoSelecionado(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!alunoSelecionado) {
      alert("Por favor, selecione um aluno.");
      return;
    }
    if (!formData.motivo_solicitacao) {
      alert("A justificativa do trancamento é obrigatória.");
      return;
    }
    if (!ppcDetalhes || !ppcDetalhes.curso_details) { 
        alert("Aguarde o carregamento dos detalhes do curso/PPC do aluno ou verifique se o aluno possui um PPC válido antes de submeter.");
        return;
    }

    const dataToSubmit = new FormData();
    dataToSubmit.append("motivo_solicitacao", formData.motivo_solicitacao); 
    dataToSubmit.append("aluno", alunoSelecionado.id); 
    dataToSubmit.append("data_solicitacao", new Date().toISOString().split("T")[0]); 

    if (formData.arquivos && formData.arquivos.length > 0) {
      Array.from(formData.arquivos).forEach((file) => {
        dataToSubmit.append("arquivos", file); 
      });
    }
    
    try {
      await axios.post(
        "http://localhost:8000/solicitacoes/formularios-trancamento/", 
        dataToSubmit,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Solicitação de trancamento de matrícula enviada com sucesso!");
      navigate("/todas-solicitacoes"); 
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
      alert(errorMessage);
    }
  };

  if (carregando) {
          return (
              <>
                  <BuscaUsuario dadosUsuario={handleUsuario} />
                  <p>Carregando usuário...</p>
              </>
          );
      }

      if (userData) {
return (
    <VerificadorDisponibilidade tipoFormulario="TRANCAMENTOMATRICULA">
      <div>
        <HeaderAluno />
        <main className="container">
          <h2>Solicitação de Trancamento de Matrícula</h2>
          <div className="descricao-formulario">
            <p>
              Este formulário destina-se à solicitação de trancamento total de
              matrícula...
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="formulario formulario-largura"
            encType="multipart/form-data"
          >
            <div className="form-group">
              <label htmlFor="alunoSelect">Selecione o Aluno:</label>
              <select
                id="alunoSelect"
                value={alunoSelecionado ? alunoSelecionado.id : ""} 
                onChange={handleAlunoChange}
                required
              >
                <option value="">Selecione o aluno</option>
                {Array.isArray(alunos) && alunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.usuario ? aluno.usuario.nome : `Aluno ID ${aluno.id}`} ({aluno.matricula})
                  </option>
                ))}
              </select>
            </div>

            {alunoSelecionado && alunoSelecionado.usuario && (
              <div className="dados-aluno-container">
                <h3>Dados do Aluno Selecionado</h3>
                <div className="form-group">
                  <label>Nome:</label>
                  <input type="text" value={alunoSelecionado.usuario.nome || ""} readOnly />
                </div>
                <div className="form-group">
                  <label>E-mail:</label>
                  <input type="email" value={alunoSelecionado.usuario.email || ""} readOnly />
                </div>
                <div className="form-group">
                  <label>Matrícula:</label>
                  <input type="text" value={alunoSelecionado.matricula || ""} readOnly />
                </div>
                
                {loadingPpc && <p>A carregar dados do curso/PPC...</p>}
                
                {ppcDetalhes && ppcDetalhes.curso_details ? ( 
                  <>
                    <div className="form-group">
                      <label>Curso:</label>
                      <input type="text" value={ppcDetalhes.curso_details.nome || ""} readOnly /> 
                    </div>
                    <div className="form-group">
                      <label>PPC (Nome/Código):</label>
                      <input type="text" value={ppcDetalhes.nome || ppcDetalhes.codigo || "N/D"} readOnly />
                    </div>
                  </>
                ) : (
                  !loadingPpc && alunoSelecionado && typeof alunoSelecionado.ppc !== 'undefined' && alunoSelecionado.ppc && (
                    <p className="text-red-500">Não foi possível carregar os detalhes do curso/PPC para o código '{alunoSelecionado.ppc}'.</p>
                  )
                )}

                <div className="form-group">
                  <label>Ano de Ingresso:</label>
                  <input type="text" value={alunoSelecionado.ano_ingresso || ""} readOnly />
                </div>
              </div>
            )}

            <hr />
            <h3>Detalhes do Trancamento</h3>
            
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
      </div>
    </VerificadorDisponibilidade>
  );
      }
  
}