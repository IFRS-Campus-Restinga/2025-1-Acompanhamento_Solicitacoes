import axios from "axios";
import React, { useEffect, useState } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import Navbar from "../../components/navbar";

const Alunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [error, setError] = useState(null); // Estado de erro

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/solicitacoes/alunos/cadastrar")
      .then(res => {
        setAlunos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar página de primeiro acesso:", err);
        setError("Não foi possível carregar o cadastro de alunos.");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Header />
      <Navbar />
      <main>
        <h1>Primeiro Acesso</h1>

        {/* Mensagem de erro */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Indicador de carregamento */}
        {loading ? (
          <p>Carregando alunos...</p>
        ) : (
          <table border="1">
            <thead>
              <tr>
                <th>Nome Completo</th>
                <th>CPF</th>
                <th>Matrícula</th>
                <th>Email</th>
                <th>Turma</th>
                <th>Ano de Ingresso</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                  <td>{aluno.nome}</td>
                  <td>{aluno.cpf}</td>
                  <td>{aluno.matricula}</td>
                  <td>{aluno.email}</td>
                  <td>{aluno.turma}</td>
                  <td>{aluno.ano_ingresso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Alunos;
