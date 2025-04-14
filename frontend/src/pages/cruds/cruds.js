import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/footer";
import Header from "../../components/header";
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
          <Link className="crud-link" to="/motivo_exercicios">
            <i className="bi bi-journal-text"></i> Exercícios Domiciliares
          </Link>
          <Link className="crud-link" to="/motivo_abono">
            <i className="bi bi-calendar-x-fill"></i> Abono de Falta
          </Link>
          <Link className="crud-link" to="/disciplinas">
            <i className="bi bi-book"></i> Disciplina
          </Link>
          <Link className="crud-link" to="/turmas">
            <i className="bi bi-people"></i> Turma
          </Link>
          <Link className="crud-link" to="/motivo_dispensa">
                <i className="bi bi-person-arms-up"></i> Dispensa de Educação Física
          </Link>
          <Link className="crud-link" to="/cursos">
            <i className="bi bi-mortarboard"></i> Cursos
          </Link>
          <Link className="crud-link" to="/ppcs">
            <i className="bi bi-layout-text-window-reverse"></i> PPC
          </Link>
          <Link className="crud-link" to="/usuarios">
            <i className="bi bi-person-circle"></i> Usuarios
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cruds;
