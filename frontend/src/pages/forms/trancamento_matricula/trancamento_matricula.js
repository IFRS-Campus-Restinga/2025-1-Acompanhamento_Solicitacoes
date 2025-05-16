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
  const [formData, setFormData] = useState({
    motivo_solicitacao: "",
    arquivos: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/alunos/")
      .then((res) => setAlunos(res.data))
      .catch((err) => console.error("Erro ao buscar alunos:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8000/solicitacoes/cursos/")
      .then((res) => setCursos(res.data))
      .catch((err) => console.error("Erro ao buscar cursos:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, arquivos: files }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.motivo_solicitacao || !alunoSelecionado) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const data = new FormData();
    data.append("motivo_solicitacao", formData.motivo_solicitacao);
    data.append("aluno", alunoSelecionado.id);
    data.append("data_solicitacao", new Date().toISOString().split("T")[0]); // opcional, se o backend não preencher sozinho

    if (formData.arquivos) {
      Array.from(formData.arquivos).forEach((file) => {
        data.append("arquivos", file);
      });
    }

    axios
      .post("http://localhost:8000/solicitacoes/formularios-trancamento/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        alert("Solicitação enviada com sucesso!");
        navigate("/todas-solicitacoes");
      })
      .catch((error) => {
        console.error("Erro ao enviar:", error.response?.data || error);
        alert("Erro ao enviar solicitação. Verifique os dados e tente novamente.");
      });
  };

  return (
    <div>
      <Header />
      <main className="container">
        <h2>Solicitação de Trancamento de Matrícula</h2>

        <div className="descricao-formulario">
          <p>
            Este formulário destina-se à solicitação de trancamento total de matrícula.
          </p>
          <p>
            Conforme art. 123 da Organização Didática, o trancamento total da matrícula
            poderá ser concedido para estudantes dos cursos técnicos subsequentes e de
            graduação por, no máximo, 50% do tempo do curso.
          </p>
          <p>QUEM: Estudantes dos cursos subsequentes e do superior.</p>
          <p>
            QUANDO: Até a 4ª semana após o início das atividades letivas, conforme calendário.
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
                if (!value) {
                  setAlunoSelecionado(null);
                  return;
                }

                const aluno = alunos.find(
                  (a) => a.usuario.id === parseInt(value)
                );

                if (!aluno || !aluno.ppc || !aluno.ppc.curso) {
                  alert("Erro ao carregar dados do aluno selecionado.");
                  return;
                }

                setAlunoSelecionado(aluno);
              }}
              required
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
                <label>Matrícula:</label>
                <input type="text" value={alunoSelecionado.matricula} readOnly />
              </div>

              <div className="form-group">
                <label>Curso:</label>
                <input type="text" value={alunoSelecionado.ppc.curso.nome} readOnly />
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

          <div className="form-group">
            <label>Anexos (opcional):</label>
            <input
              type="file"
              name="arquivos"
              multiple
              onChange={handleChange}
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
