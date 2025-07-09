import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../../components/styles/telas_opcoes.css";

const ExternoNovaSolicitacao = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/solicitacoes/")
      .then((res) => setSolicitacoes(res.data))
      .catch((err) => console.error("Erro ao buscar solicitações:", err));
  }, []);

  return (
    <div className="colunas-container">
      <main className="container">
        <h2 className="tela-opcoes-titulo ">Solicitações</h2>
        <div className="colunas-section-container">
          <section className="colunas-section">
            <div className="grid-colunas">
              <Link 
                className="colunas-link" 
                to="/desistencia_vaga"
                onMouseEnter={() => setHoveredCard('desistencia_vaga')}
                onMouseLeave={() => setHoveredCard(null)}
                data-hovered={hoveredCard === 'desistencia_vaga'}
              >
                <i className="bi bi-door-open-fill form-icon"></i>
                Termo de Desistência de Vaga
              </Link>
            </div>
          </section>  

        </div>
      </main>
    </div>
  );
};

export default ExternoNovaSolicitacao;