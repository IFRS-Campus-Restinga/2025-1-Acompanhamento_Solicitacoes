import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {
  state = {
    isConnected: false,
    courses: [],
    error: null,
  };

  // Função assíncrona que busca os cursos e retorna os dados
  async testeCurso() {
    const res = await axios.get('http://localhost:8000/solicitacoes/cursos/');
    return res.data;
  }

  async componentDidMount() {
    try {
      // Aguarda a Promise de testeCurso e obtém os dados
      const courses = await this.testeCurso();
      // Atualiza o state com os cursos e sinaliza que a conexão foi bem-sucedida
      this.setState({ courses, isConnected: true });
    } catch (err) {
      // Em caso de erro, atualiza o state com a informação do erro
      this.setState({ isConnected: false, error: err });
    }
  }

  render() {
    const { isConnected, courses, error } = this.state;
    return (
      <div className="p-4">
        {isConnected ? (
          <>
            <p className="text-green-600 font-semibold">CONEXÃO BEM SUCEDIDA</p>
            <ul>
              {courses.map((course) => (
                <li key={course.codigo}>
                  {course.nome} (Código: {course.codigo})
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-red-600">
            Falha na conexão com a API {error && `- ${error.message}`}
          </p>
        )}
      </div>
    );
  }
}

export default App;
