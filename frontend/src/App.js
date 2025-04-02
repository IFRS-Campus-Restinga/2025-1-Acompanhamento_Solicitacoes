import axios from "axios";
import React from "react";
import { Route, BrowserRouter as Router, Routes} from "react-router-dom";
//import { Link } from "react-router-dom";
import "./App.css";
import Alunos from "./pages/alunos/lista_alunos";
import Home from "./pages/home";
//import Solicitacoes from "./pages/solicitacoes";
import "./var.css";

class App extends React.Component {
  state = {
    isConnected: false,
  };

  componentDidMount() {
    axios.get("http://localhost:8000/solicitacoes/alunos/")
      .then(() => this.setState({ isConnected: true }))
      .catch(err => {
        console.error("Erro na conexão:", err);
        this.setState({ isConnected: false });
      });
  }

  render() {
    return (
      <Router>
        {/* Barra de navegação adicionada */}
         {/*
        <nav>
          <Link to="/">Início</Link>
          <Link to="/alunos">Alunos</Link>
          <Link to="/home">Home</Link>
        </nav>
         */}

        {this.state.isConnected ? (
          <Routes>
            <Route path="/" element={<Alunos />} />
            <Route path="/home" element={<Home />} />
            <Route path="/alunos" element={<Alunos />} />
          </Routes>
        ) : (
          <div className="error-container">
            <h2>Erro de Conexão</h2>
            <p>Não foi possível conectar ao servidor. Verifique sua conexão com o backend.</p>
          </div>
        )}
      </Router>
    );
  }
}

export default App;