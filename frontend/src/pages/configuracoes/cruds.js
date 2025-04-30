import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import "./../../components/base/main.css";
import "./cruds.css";

const Cruds = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/solicitacoes/")
      .then(res => setSolicitacoes(res.data))
      .catch(err => console.error("Erro ao buscar solicitações:", err));
  }, []);

  return (
    <div>
      <Header />
      <main className="container">
        <h2>CRUDs Disponíveis</h2>
        <div className="grid-cruds">
          <Link className="crud-link" to="/usuarios">
            <i className="bi bi-person-circle"></i> Usuários
          </Link>
          <Link className="crud-link" to="/usuarios/cadastro">
            <i className="bi bi-person-circle"></i> Cadastro Aluno/CRE/Coordenador
          </Link>
          <Link className="crud-link" to="/grupos">
            <i className="bi bi-people-fill"></i> Grupos
          </Link>
          <Link className="crud-link" to="/turmas">
            <i className="bi bi-people"></i> Turmas
          </Link>
          <Link className="crud-link" to="/disciplinas">
            <i className="bi bi-book"></i> Disciplinas
          </Link>
          <Link className="crud-link" to="/ppcs">
            <i className="bi bi-layout-text-window-reverse"></i> PPCs
          </Link>
          <Link className="crud-link" to="/cursos">
            <i className="bi bi-mortarboard"></i> Cursos
          </Link>
          <Link className="crud-link" to="/motivo_abono">
            <i className="bi bi-calendar-x-fill"></i> Abono de Faltas
          </Link>
          <Link className="crud-link" to="/motivo_exercicios">
            <i className="bi bi-journal-text"></i> Exercícios Domiciliares
          </Link>
          <Link className="crud-link" to="/motivo_dispensa">
            <i className="bi bi-person-arms-up"></i> Dispensa de Educação Física
          </Link>
        </div>
        <br />
        <h2>Formulários Disponíveis</h2>
        <div className="grid-cruds">
          <Link className="crud-link" to="/trancamento_disciplina">
            <i className="bi bi-x-circle"></i> Solicitação de Trancamento de Componente Curricular
          </Link>
          {/* FORMULARIO EXERCICIOS DOMICILIARES */}

         <Link className="crud-link" to="/exercicio_domiciliar">
          <i className="bi bi-house-check-fill"></i> Solicitação de Exercício Domiciliar
        </Link>

        <Link className="crud-link" to="/dispensa_ed_fisica">
          <i className="bi bi-person-arms-up"></i>Solicitação de Dispensa de Educação Física
        </Link>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cruds;
