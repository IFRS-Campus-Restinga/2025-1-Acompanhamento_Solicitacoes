import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../../components/styles/telas_opcoes.css";

const AlunoNovaSolicitacao = () => {
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
        
        <div className="colunas-section-container">
          {/* PRIMEIRA FILEIRA: 4 Formulários */}
    
          <section className="colunas-section">
            <h2 className="tela-opcoes-titulo ">Solicitações</h2>
            <div className="grid-colunas">
              <Link 
                className="colunas-link" 
                to="/trancamento_matricula"
                onMouseEnter={() => setHoveredCard('trancamento_matricula')}
                onMouseLeave={() => setHoveredCard(null)}
                data-hovered={hoveredCard === 'trancamento_matricula'}
              >
                <i className="bi bi-box-arrow-right form-icon"></i>
                Solicitação de Trancamento de Matrícula
              </Link>

              <Link 
                className="colunas-link" 
                to="/trancamento_disciplina"
                onMouseEnter={() => setHoveredCard('trancamento_disciplina')}
                onMouseLeave={() => setHoveredCard(null)}
                data-hovered={hoveredCard === 'trancamento_disciplina'}
              >
                <i className="bi bi-x-octagon-fill form-icon"></i>
                Solicitação de Trancamento de Componente Curricular
              </Link>

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

              <Link 
                className="colunas-link" 
                to="/form_ativ_compl"
                onMouseEnter={() => setHoveredCard('form_ativ_compl')}
                onMouseLeave={() => setHoveredCard(null)}
                data-hovered={hoveredCard === 'form_ativ_compl'}
              >
                <i className="bi bi-card-list form-icon"></i>
                Entrega de Atividades Complementares
              </Link>
            </div>
          {/* SEGUNDA FILEIRA: 3 Formulários */}
            <div className="grid-colunas">
              <Link 
                className="colunas-link" 
                to="/dispensa_ed_fisica"
                onMouseEnter={() => setHoveredCard('dispensa_ed_fisica')}
                onMouseLeave={() => setHoveredCard(null)}
                data-hovered={hoveredCard === 'dispensa_ed_fisica'}
              >
                <i className="bi bi-person-arms-up form-icon"></i>
                Solicitação de Dispensa de Educação Física
              </Link>

              <Link 
                className="colunas-link" 
                to="/abono_falta"
                onMouseEnter={() => setHoveredCard('abono_falta')}
                onMouseLeave={() => setHoveredCard(null)}
                data-hovered={hoveredCard === 'abono_falta'}
              >
                <i className="bi bi-calendar-x-fill form-icon"></i>
                Solicitação de Justificativa / Abono de Faltas
              </Link>

              <Link 
                className="colunas-link" 
                to="/exercicio_domiciliar"
                onMouseEnter={() => setHoveredCard('exercicio_domiciliar')}
                onMouseLeave={() => setHoveredCard(null)}
                data-hovered={hoveredCard === 'exercicio_domiciliar'}
              >
                <i className="bi bi-house-check-fill form-icon"></i>
                Solicitação de Exercícios Domiciliares
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AlunoNovaSolicitacao;