import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Footer from "../../../components/footer";
import Header from "../../../components/header";
import Navbar from "../../../components/navbar";
import "./abono.css";

export default function ListarMotivosAbono() {
  const [motivos, setMotivos] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/solicitacoes/motivo_abono/")
      .then((res) => setMotivos(res.data))
      .catch((err) => console.error("Erro ao carregar motivos:", err));
  }, []);

  return (
    <div>
      <Header />
      <Navbar />
      <main className="container">
        <h2>Motivos de Abono</h2>

        <table className="tabela-motivos">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Tipo de Falta</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {motivos.map((motivo, index) => (
              <tr key={motivo.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                <td>{motivo.descricao}</td>
                <td>{motivo.tipo_falta}</td>
                <td>
                  <Link to={`/motivo_abono/${motivo.id}`}>
                    <button className="botao-editar">Editar</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="botao-cadastrar-wrapper">
          <Link to="/motivo_abono/cadastrar">
          <button className="botao-cadastrar">Cadastrar novo motivo</button>
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
