import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../components/base/footer";
import Header from "../../../components/base/header";
import "../../../components/formulario.css";

export default function FormularioTrancamentoMatricula() {
  const { curso_codigo } = useParams();
  const [cursos, setCursos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/alunos/")
      .then((res) => setAlunos(res.data))
      .catch((err) => console.error("Erro ao buscar alunos:", err));
  }, []);

  const [formData, setFormData] = useState({
    aluno_nome: "",
    email: "",
    matricula: "",
    curso: curso_codigo || "",
    motivo_solicitacao: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/cursos/")
      .then((res) => setCursos(res.data))
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

    if (
      !formData.aluno_nome ||
      !formData.email ||
      !formData.matricula ||
      !formData.motivo_solicitacao ||
      !formData.curso
    ) {
      alert("Todos os campos obrigatórios devem ser preenchidos!");
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      if (key === "arquivos") {
        Array.from(formData.arquivos).forEach((file) => {
          data.append("arquivos", file);
        });
      } else {
        data.append(key, formData[key]);
      }
    }

    axios
      .post(
        "http://localhost:8000/solicitacoes/formularios-trancamento/",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
      .then(() => {
        alert("Solicitação enviada com sucesso!");
        navigate("/solicitacoes");
      })
      .catch((error) => {
        console.error("Erro ao enviar:", error);
        alert(
          "Erro ao enviar solicitação. Verifique os dados e tente novamente."
        );
      });
  };

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Solicitação de Trancamento de Matrícula</h2>

        <div className="descricao-formulario">
          <p>
            Este formulário destina-se à solicitação de trancamento total de
            matrícula.
          </p>
          <p>
            Conforme art. 123 da Organização Didática, o trancamento total da
            matrícula poderá ser concedido para estudantes dos cursos técnicos
            subsequentes e de graduação por, no máximo, 50% (cinquenta por
            cento) do tempo do curso, considerando períodos letivos consecutivos
            ou não.
          </p>
          <p>QUEM: Estudantes dos cursos subsequentes e do superior.</p>
          <p>
            QUANDO: A solicitação de trancamento total de matrícula poderá ser
            feita até a quarta semana após o início das atividades letivas,
            conforme estabelecido em nosso calendário acadêmico.
          </p>
          <p>
            Após entrega do formulário, a coordenação de curso fará a análise da
            solicitação em até 7 (sete) dias e a CRE tem até 5 (cinco) dias
            úteis para inserir os resultados no sistema...
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="formulario formulario-largo"
          encType="multipart/form-data"
        >
          <div className="form-group">
            <label>Selecione o aluno:</label>
            <select
              onChange={(e) => {
                const value = e.target.value;

                // Verifica se o valor está vazio (significa que o usuário desmarcou a seleção)
                if (!value) {
                  setAlunoSelecionado(null);
                  setFormData((prev) => ({
                    ...prev,
                    aluno: "",
                    aluno_nome: "",
                    matricula: "",
                    curso: "",
                    ppc: "",
                  }));
                  return; // Não continua o fluxo
                }

                const aluno = alunos.find(
                  (a) => a.usuario.id === parseInt(value)
                );

                if (!aluno || !aluno.ppc || !aluno.ppc.curso) {
                  alert("Erro ao carregar dados do aluno selecionado.");
                  console.log(
                    aluno + " ++ " + aluno.ppc + " ++ " + aluno.ppc.curso
                  );
                  return;
                }

                setAlunoSelecionado(aluno);
                setFormData((prev) => ({
                  ...prev,
                  aluno: aluno.usuario.id,
                  aluno_nome: aluno.usuario.nome,
                  matricula: aluno.matricula,
                  curso: aluno.ppc.curso.nome,
                  ppc: aluno.ppc.codigo,
                }));
              }}
            >
              <option value="">Selecione o aluno</option>
              {alunos.map((aluno) => (
                <option key={aluno.usuario.id} value={aluno.usuario.id}>
                  {aluno.usuario.nome}
                </option>
              ))}
            </select>
          </div>

          {alunoSelecionado && (
            <>
              <div className="form-group">
                <label>Nome:</label>
                <input
                  type="text"
                  value={alunoSelecionado.usuario.nome}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Matrícula:</label>
                <input
                  type="text"
                  value={alunoSelecionado.matricula}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Curso:</label>
                <input
                  type="text"
                  value={alunoSelecionado.ppc.curso.nome}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>PPC:</label>
                <input type="text" value={alunoSelecionado.ppc.codigo} readOnly />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Justificativa do trancamento:</label>
            <textarea
              name="motivo_solicitacao"
              value={formData.motivo_solicitacao}
              onChange={handleChange}
              rows="5"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Enviar
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
