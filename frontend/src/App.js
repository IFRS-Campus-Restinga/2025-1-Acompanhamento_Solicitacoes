import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import React from "react";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import routes from "./routes/routes";
import "./var.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

class App extends React.Component {
  state = {
    isConnected: false,
  };

  componentDidMount() {
    axios.get("http://localhost:8000/solicitacoes/")
      .then(() => this.setState({ isConnected: true }))
      .catch(err => {
        console.error("Erro na conexão:", err);
        this.setState({ isConnected: false });
      });
  }

  render() {
    return (
      <Router>
        {this.state.isConnected ? (
          <Routes>{routes}</Routes>
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