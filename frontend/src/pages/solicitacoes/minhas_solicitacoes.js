import axios from "axios";
import React, { useEffect, useState } from "react";
import Footer from "../components/footer";
import Header from "../components/header";

const Solicitacoes = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/solicitacoes/")
      .then(res => setSolicitacoes(res.data))
      .catch(err => console.error("Erro ao buscar solicitações:", err));
  }, []);

  return (
    <div>
      <Header />
      <main>
        <h2>Solicitações de Alunos</h2>
        <ul>
          {solicitacoes.map((solicitacao) => (
            <li key={solicitacao.id}>
              {solicitacao.aluno} - {solicitacao.status}
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default Solicitacoes;
