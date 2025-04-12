import axios from "axios";
import React, { useEffect, useState } from "react";
import Footer from "../components/footer";
import Header from "../components/header";


const Cursos = () => {
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/solicitacoes/cursos/")
      .then(res => setCursos(res.data))
      .catch(err => console.error("Erro ao buscar cursos:", err));
  }, []);

  return (
    <div>
      <Header />
      <main>
        <h2>Lista de Cursos</h2>
        <ul>
          {cursos.map((curso) => ( // Corrigido para "curso"
            <li key={curso.id}>{curso.nome}</li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default Cursos;