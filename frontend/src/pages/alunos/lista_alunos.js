import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../components/base/headers/header";
import Footer from "../../components/footer";
import "./lista_alunos.css";

const Alunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [error, setError] = useState(null); // Estado de erro

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/solicitacoes/alunos/")
      .then(res => {
        setAlunos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar alunos:", err);
        setError("Não foi possível carregar a lista de alunos.");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Header />
      <main>
        <h2>Lista de Alunos</h2>

        {/* Mensagem de erro */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Indicador de carregamento */}
        {loading ? (
          <p>Carregando alunos...</p>
        ) : (
          <table border="1">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Matrícula</th>
                <th>Email</th>
                <th>Turma</th>
                <th>Ano de Ingresso</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td>{aluno.id}</td>
                  <td>{aluno.nome}</td>
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
