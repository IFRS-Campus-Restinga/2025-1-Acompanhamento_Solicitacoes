import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../components/base/footer";
import Header from "../../../components/base/header";
import "../../../components/formulario.css";

export default function FormularioTrancamentoMatricula() {
  const { curso_codigo } = useParams();
  const [cursos, setCursos] = useState([]);
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
          className="formulario"
          encType="multipart/form-data"
        >
          <div className="form-group">
            <label>E-mail:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Nome completo:</label>
            <input
              type="text"
              name="aluno_nome"
              value={formData.aluno_nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Número de matrícula:</label>
            <input
              type="text"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Curso:</label>
            <select
              name="curso"
              value={formData.curso}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o curso</option>
              {cursos.map((curso) => (
                <option key={curso.codigo} value={curso.codigo}>
                  {curso.nome}
                </option>
              ))}
            </select>
          </div>

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
