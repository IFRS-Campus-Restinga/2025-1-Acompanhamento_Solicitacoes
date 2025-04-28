import axios from "axios";
import React, { useEffect, useState } from "react";

export default function FormularioExercicioDomiciliar() {
  const [cursos, setCursos] = useState([]);
  const [formData, setFormData] = useState({
    aluno_nome: "",
    email: "",
    matricula: "",
    curso: "",
    componentes_curriculares: "",
    motivo_solicitacao: "",
    outro_motivo: "",
    periodo_afastamento: "",
    documento_apresentado: "",
    outro_documento: "",
    arquivos: [],
    consegue_realizar_atividades: "",
  });

  useEffect(() => {
    axios.get("http://localhost:8000/cursos/")
      .then(res => setCursos(res.data))
      .catch(err => console.error(err));
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
    const data = new FormData();
    for (const key in formData) {
      if (key === "arquivos") {
        Array.from(formData.arquivos).forEach(file => {
          data.append("arquivos", file);
        });
      } else {
        data.append(key, formData[key]);
      }
    }

    axios.post("http://localhost:8000/solicitacoes/form_exercicio_domiciliar/", data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        alert("Solicitação enviada com sucesso!");
      })
      .catch(error => {
        alert("Erro ao enviar solicitação.");
        console.error(error);
      });
  };

  return (
    <div className="container">
      <h2>Solicitação de Exercícios Domiciliares</h2>

      <form onSubmit={handleSubmit} className="formulario" encType="multipart/form-data">
        <div className="form-group">
          <label>Nome completo:</label>
          <input type="text" name="aluno_nome" value={formData.aluno_nome} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>E-mail:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Número de matrícula:</label>
          <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Curso:</label>
          <select name="curso" value={formData.curso} onChange={handleChange} required>
            <option value="">Selecione um curso</option>
            {cursos.map(curso => (
              <option key={curso.id} value={curso.id}>{curso.nome}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Componentes curriculares e respectivos docentes:</label>
          <textarea name="componentes_curriculares" value={formData.componentes_curriculares} onChange={handleChange} rows="5" required />
        </div>

        <div className="form-group">
          <label>Motivo da solicitação:</label>
          <select name="motivo_solicitacao" value={formData.motivo_solicitacao} onChange={handleChange} required>
            <option value="">Selecione o motivo</option>
            <option value="saude">Problemas de saúde</option>
            <option value="maternidade">Licença maternidade</option>
            <option value="familiar">Acompanhamento de familiar</option>
            <option value="aborto_ou_falecimento">Aborto/Falecimento</option>
            <option value="adocao">Adoção de criança</option>
            <option value="conjuge">Cônjuge/companheiro</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        {formData.motivo_solicitacao === "outro" && (
          <div className="form-group">
            <label>Descreva o outro motivo:</label>
            <input type="text" name="outro_motivo" value={formData.outro_motivo} onChange={handleChange} />
          </div>
        )}

        <div className="form-group">
          <label>Período de afastamento:</label>
          <input type="text" name="periodo_afastamento" value={formData.periodo_afastamento} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Documento apresentado:</label>
          <select name="documento_apresentado" value={formData.documento_apresentado} onChange={handleChange} required>
            <option value="">Selecione o documento</option>
            <option value="atestado">Atestado médico</option>
            <option value="certidao_nascimento">Certidão de nascimento</option>
            <option value="termo_guarda">Termo judicial de guarda</option>
            <option value="certidao_obito">Certidão de óbito</option>
            <option value="justificativa_propria">Justificativa de próprio punho</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        {formData.documento_apresentado === "outro" && (
          <div className="form-group">
            <label>Descreva o outro documento:</label>
            <input type="text" name="outro_documento" value={formData.outro_documento} onChange={handleChange} />
          </div>
        )}

        <div className="form-group">
          <label>Anexar documentos (máx 5 arquivos):</label>
          <input type="file" name="arquivos" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Você consegue realizar atividades no Moodle?</label>
          <div>
            <label>
              <input type="radio" name="consegue_realizar_atividades" value={true} checked={formData.consegue_realizar_atividades === "true"} onChange={handleChange} /> Sim
            </label>
            <label>
              <input type="radio" name="consegue_realizar_atividades" value={false} checked={formData.consegue_realizar_atividades === "false"} onChange={handleChange} /> Não
            </label>
          </div>
        </div>

        <button type="submit" className="botao-enviar">
          Enviar Solicitação
        </button>
      </form>
    </div>
  );
}
