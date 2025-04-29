import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/base/footer";
import Header from "../../components/base/header";
import "./../configuracoes/cruds";

const NovaSolicitacao = () => {
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

        <h2>Formulários Disponíveis</h2>
        <div className="grid-cruds">
          <Link className="crud-link" to="/trancamento_disciplina">
            <i className="bi bi-x-circle"></i> Solicitação de Trancamento de Componente Curricular
          </Link>
          {/* FORMULARIO EXERCICIOS DOMICILIARES */}

          <Link className="crud-link" to="/exercicio_domiciliar">
            <i className="bi bi-house-check-fill"></i> Solicitação de Exercício Domiciliar
          </Link>
          
          <Link className="crud-link" to="/abono_falta">
            <i className="bi bi-calendar-x-fill"></i> Solicitação de Abono de Falta
          </Link>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NovaSolicitacao;
