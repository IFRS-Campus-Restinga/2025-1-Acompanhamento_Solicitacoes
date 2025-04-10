import axios from "axios";
import React from "react";
import { Route, BrowserRouter as Router, Routes} from "react-router-dom";
//import { Link } from "react-router-dom";
import "./App.css";
import Alunos from "./pages/alunos/lista_alunos";
import Home from "./pages/home";
//import Solicitacoes from "./pages/solicitacoes";
import "./var.css";
import ListarMotivosAbono from "./pages/motivos/abono/lista_abono";
import CadastrarAtualizarAbono from "./pages/motivos/abono/cadastrar_atualizar_abono";

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

            {/* Motivos de Abono */}
            <Route path="/motivo_abono/" element={<ListarMotivosAbono />} />
            <Route path="/motivo_abono/cadastrar" element={<CadastrarAtualizarAbono />} />
            <Route path="/motivo_abono/:id" element={<CadastrarAtualizarAbono />} />
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