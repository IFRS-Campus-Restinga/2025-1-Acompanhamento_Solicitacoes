import axios from "axios";
//import api from "./services/api";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';

import routes from "./routes/routes";

//CSS
import "./App.css";
import "./var.css";
//import GoogleRedirectHandler from './components/GoogleRedirectHandler';


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