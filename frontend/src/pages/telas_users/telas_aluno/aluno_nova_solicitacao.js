import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import "./../../configuracoes/cruds";

const AlunoNovaSolicitacao = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/solicitacoes/")
      .then((res) => setSolicitacoes(res.data))
      .catch((err) => console.error("Erro ao buscar solicitações:", err));
  }, []);

  return (
    <div>
      <HeaderAluno />
      <main className="container">
          <h2>Solicitações Disponíveis</h2>
        <div className="grid-cruds">
          <Link className="crud-link" to="/trancamento_matricula">
            <i className="bi bi-box-arrow-right"></i> Solicitação de Trancamento
            de Matrícula
          </Link>
          <Link className="crud-link" to="/trancamento_disciplina">
            <i className="bi bi-x-octagon-fill"></i> Solicitação de Trancamento de
            Componente Curricular
          </Link>
          {/* Form de desistencia de vaga*/}
          <Link className="crud-link" to="/desistencia_vaga">
            <i className="bi bi-door-open-fill"></i> Termo de Desistência de Vaga
          </Link>
          <Link className="crud-link" to="/dispensa_ed_fisica">
          <i class="bi bi-person-arms-up"></i> Solicitação de Dispensa de Educação Física
          </Link>
          <Link className="crud-link" to="/abono_falta">
            <i className="bi bi-calendar-x-fill"></i> Solicitação de Justificativa / Abono de
            Faltas
          </Link>
          {/* FORMULARIO EXERCICIOS DOMICILIARES */}
          <Link className="crud-link" to="/exercicio_domiciliar">
            <i className="bi bi-house-check-fill"></i> Solicitação de Exercícios
            Domiciliares
          </Link>
          <Link className="crud-link" to="/form_ativ_compl">
            <i class="bi bi-card-list"></i> Entrega de Atividades Complementares
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AlunoNovaSolicitacao;
