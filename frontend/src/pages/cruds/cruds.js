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
                {/* Adicione mais se quiser */}
            </div>
        </main>

      <Footer />
    </div>
  );
};

export default Cruds;
