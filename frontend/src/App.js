import axios from "axios";
//import api from "./services/api";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';

import routes from "./routes/routes";

// Importe MainContent do novo caminho/nome
import MainContent from "./components/base/main_content"; // <--- Caminho e nome atualizados

import Home from "./pages/home";

import Footer from "./components/base/footer";
import HeaderSwitcher from "./components/base/headers/header_switcher";

//CSS
import "./App.css";
import "./components/base/main.css"; // <--- Importante para as regras CSS do <main>
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
          <div id="root">
            {/* HeaderSwitcher aqui */}
             <HeaderSwitcher /> {/* <-- AGORA USAMOS O SWITCHER AQUI */}
              <MainContent> {/* <--- Agora, MainContent envolve suas rotas */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  {routes}
                </Routes>
              </MainContent>
              <Footer/>
          </div>
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