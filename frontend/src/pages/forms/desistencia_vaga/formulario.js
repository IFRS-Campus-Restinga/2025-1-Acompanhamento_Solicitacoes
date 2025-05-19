import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import "../../../components/formulario.css";

export default function FormularioDesistenciaVaga() {
    const { curso_codigo } = useParams();
    const [cursos, setCursos] = useState([]);
    const [formData, setFormData] = useState({
        aluno_nome: "",
        email: "",
        matricula: "",
        motivo_solicitacao: "",
        tipo_curso: "",
        curso: curso_codigo || "",
        atestado_vaga_nova_escola: null,
        doc_identificacao_responsavel: null,
        declaracao_biblioteca: null,
        atestado_vaga_nova_escola: null,  // Novo campo para o arquivo de atestado
        doc_identificacao_responsavel: null,  // Novo campo para o arquivo de documento do responsável
        declaracao_biblioteca: null,  // Novo campo para a declaração de biblioteca
    });
  
  const [popupIsOpen, setPopupIsOpen] = useState(false);
  const [msgErro, setMsgErro] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");

  const popupActions = [
    {
        label: "Fechar",
        className: "btn btn-cancel",
        onClick: () => {
            setPopupIsOpen(false);
            navigate("/solicitacoes");
            }
        }
    ];
  
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/cursos/")  // Alterar para a URL da API que retorna os cursos
      .then((res) => setCursos(res.data))
      .catch((err) => console.error("Erro ao buscar cursos:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
  
    if (type === "file") {
      // Se for um campo de arquivo, adicione o arquivo correspondente no estado
      setFormData({
        ...formData,
        [name]: files[0],  // Apenas o primeiro arquivo
      });
    } else {
      // Para os outros campos, como texto, apenas atualiza o valor
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verificação de campos obrigatórios
    if (!formData.aluno_nome || !formData.email || !formData.matricula || !formData.tipo_curso || !formData.declaracao_biblioteca) {
      alert("Todos os campos obrigatórios devem ser preenchidos!");
      return;
    }

    // Se "Ensino Médio Integrado", verificar documentos adicionais
    if (formData.tipo_curso === "medio_integrado") {
      if (!formData.atestado_vaga_nova_escola) {
        alert("Atestado de vaga da nova escola é obrigatório para o Ensino Médio Integrado.");
        return;
      }
      if (!formData.doc_identificacao_responsavel) {
        alert("Documento de identificação do responsável é obrigatório para o Ensino Médio Integrado.");
        return;
      }
    }

    if (formData.tipo_curso === "superior") {
        if (!formData.curso) {
          alert("Selecione o curso para o tipo 'Curso Superior'.");
          return;
        }
      }
      


    const data = new FormData();

    // Adiciona os arquivos corretamente no FormData
    if (formData.atestado_vaga_nova_escola) {
      data.append("atestado_vaga_nova_escola", formData.atestado_vaga_nova_escola);
    }
    if (formData.doc_identificacao_responsavel) {
      data.append("doc_identificacao_responsavel", formData.doc_identificacao_responsavel);
    }
    data.append("declaracao_biblioteca", formData.declaracao_biblioteca);  // Já obrigatório
  
    // Adiciona os outros dados

    data.append("aluno_nome", formData.aluno_nome);
    data.append("email", formData.email);
    data.append("matricula", formData.matricula);
    data.append("motivo_solicitacao", formData.motivo_solicitacao);
    data.append("tipo_curso", formData.tipo_curso);
    if (formData.curso) {
        data.append("curso", formData.curso);
      }
    data.append("declaracao_biblioteca", formData.declaracao_biblioteca);

    if (formData.tipo_curso === "medio_integrado") {
        if (formData.tipo_curso === "medio_integrado") {
            if (formData.atestado_vaga_nova_escola)
              data.append("atestado_vaga_nova_escola", formData.atestado_vaga_nova_escola);
          
            if (formData.doc_identificacao_responsavel)
              data.append("doc_identificacao_responsavel", formData.doc_identificacao_responsavel);
          }
    }



    axios.post("http://localhost:8000/solicitacoes/form_desistencia_vaga/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      alert("Formulário enviado com sucesso!");
    })
    .catch((error) => {
      if (error.response) {
        console.error("Erro na resposta:", error.response.data);
        alert(`Erro: ${error.response.data.detail || "Erro ao enviar solicitação."}`);
      } else if (error.request) {
        console.error("Erro na requisição:", error.request);
        alert("Erro na requisição. Tente novamente.");
      } else {
        console.error("Erro desconhecido:", error.message);
        alert("Erro desconhecido. Verifique o console.");
      }
    });
  };

  return (
    <div >
      <HeaderAluno />
      <main className="container">
        <h1>Solicitação de Desistência de Vaga</h1>
            <h6><br></br>Este formulário destina-se a solicitação de desistência da vaga. Para desistir da vaga no IFRS Campus Restinga você deverá preencher o formulário, e anexar a documentação necessária, conforme segue:</h6>
        <form onSubmit={handleSubmit} className="formulario" encType="multipart/form-data">
        <div className="form-group">
          <label>Nome do Aluno:</label>
          <input
            type="text"
            name="aluno_nome"
            value={formData.aluno_nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Matrícula:</label>
          <input
            type="text"
            name="matricula"
            value={formData.matricula}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
            <label>Motivo da Solicitação:</label>
            <textarea
                name="motivo_solicitacao"
                value={formData.motivo_solicitacao}
                onChange={handleChange}
                required
            />
        </div>

        <div className="form-group">
          <label>Tipo de Curso:</label>
          <select
            name="tipo_curso"
            value={formData.tipo_curso}
            onChange={handleChange}
            required
          >
            <option value="">Selecione o tipo de curso</option>
            <option value="medio_integrado">Ensino Médio Integrado</option>
            <option value="subsequente">Curso Subsequente</option>
            <option value="eja">Curso EJA</option>
            <option value="superior">Curso Superior</option>
          </select>
        </div>


        {formData.tipo_curso === "superior" && (
        <div className="form-group">
          <label>Curso:</label>
          <select
            name="curso"
            value={formData.curso}
            onChange={handleChange}
          >
            <option value="">Selecione um curso</option>
            {cursos.map((curso) => (
              <option key={curso.codigo} value={curso.codigo}>
                {curso.nome}
              </option>
            ))}
          </select>
        </div>
        )}

        {formData.tipo_curso === "medio_integrado" && (
          <>
            <div className="form-group">
              <label>Atestado de Vaga da Nova Escola:</label>
              <input
                type="file"
                name="atestado_vaga_nova_escola"
                multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Documento de Identificação do Responsável:</label>
              <input
                type="file"
                name="doc_identificacao_responsavel"
                multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Declaração de Nada Consta da Biblioteca:</label>
          <small>
            Você pode obter a declaração de nada consta da biblioteca diretamente no sistema<br></br>
            <a href= "https://biblioteca.ifrs.edu.br/meupergamum" target="_blank">https://biblioteca.ifrs.edu.br/meupergamum</a>
          </small>
          <input
            type="file"
            name="declaracao_biblioteca"
            multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleChange}
            required
            />
        </div>

          <button type="submit" className="submit-button">Enviar</button>
      </form>
      </main>
      <Footer />
    </div>
  );
}
