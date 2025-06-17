import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../../components/base/footer";
import HeaderAluno from "../../../components/base/headers/header_aluno";
import "./../../configuracoes/cruds"; // Mantenha este import se ele contiver estilos necessários para Link

const AlunoNovaSolicitacao = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/solicitacoes/")
      .then((res) => setSolicitacoes(res.data))
      .catch((err) => console.error("Erro ao buscar solicitações:", err));
  }, []);

  // Estilo base para os cards de formulário
  const formCardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    textDecoration: 'none',
    color: '#333',
    fontWeight: '600',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
    minHeight: '150px', // Altura mínima para os cards
    width: '100%', // Define a largura para ocupar o espaço do grid
    border: '1px solid #eee'
  };

  // Estilo de hover para os cards de formulário (agora em verde claro)
  const formCardHoverStyle = {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    backgroundColor: '#e6ffe6' // Verde muito clarinho no hover
  };

  // Estilo para os ícones dentro dos cards (agora em verde)
  const iconStyle = {
    fontSize: '2.5rem',
    marginBottom: '10px',
    color: '#28a745' // Verde padrão para os ícones
  };

  // Estado para controlar o hover de cada card individualmente
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div>
      <HeaderAluno />
      <main className="container" style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '50px', // Mantido 50px de margem inferior do título
          color: '#333', 
          fontSize: '2rem', 
          fontWeight: '700',
          letterSpacing: '0.5px',
          borderBottom: '3px solid #218838', // Borda alterada para verde escuro
          paddingBottom: '15px',
          display: 'inline-block',
          width: 'auto',
          maxWidth: '100%',
          boxSizing: 'border-box',
          transform: 'translateX(40px)' // Mantido o deslocamento para a direita
        }}>Formulários - IFRS Restinga</h2>
        
        {/* Container principal para as linhas de formulários */}
        <div style={{
          display: 'flex',
          flexDirection: 'column', // Empilha as linhas verticalmente
          alignItems: 'center', // Centraliza as linhas horizontalmente
          gap: '30px', // Espaçamento entre as linhas
          maxWidth: '1200px', // Limite de largura para o grupo de formulários
          width: '100%',
        }}>

          {/* PRIMEIRA FILEIRA: 4 Formulários */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(240px, 1fr))', // 4 colunas de largura igual
            gap: '30px', // Espaçamento entre os itens
            width: '100%', // Ocupa a largura total do container pai (maxWidth: 1200px)
            boxSizing: 'border-box'
          }}>
            {/* Trancamento de Matrícula */}
            <Link 
              className="crud-link" 
              to="/trancamento_matricula"
              style={hoveredCard === 'trancamento_matricula' ? {...formCardStyle, ...formCardHoverStyle} : formCardStyle}
              onMouseEnter={() => setHoveredCard('trancamento_matricula')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <i className="bi bi-box-arrow-right" style={iconStyle}></i>
              Solicitação de Trancamento de Matrícula
            </Link>

            {/* Trancamento de Componente Curricular */}
            <Link 
              className="crud-link" 
              to="/trancamento_disciplina"
              style={hoveredCard === 'trancamento_disciplina' ? {...formCardStyle, ...formCardHoverStyle} : formCardStyle}
              onMouseEnter={() => setHoveredCard('trancamento_disciplina')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <i className="bi bi-x-octagon-fill" style={iconStyle}></i>
              Solicitação de Trancamento de Componente Curricular
            </Link>

            {/* Termo de Desistência de Vaga */}
            <Link 
              className="crud-link" 
              to="/desistencia_vaga"
              style={hoveredCard === 'desistencia_vaga' ? {...formCardStyle, ...formCardHoverStyle} : formCardStyle}
              onMouseEnter={() => setHoveredCard('desistencia_vaga')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <i className="bi bi-door-open-fill" style={iconStyle}></i>
              Termo de Desistência de Vaga
            </Link>

            {/* Entrega de Atividades Complementares */}
            <Link 
              className="crud-link" 
              to="/form_ativ_compl"
              style={hoveredCard === 'form_ativ_compl' ? {...formCardStyle, ...formCardHoverStyle} : formCardStyle}
              onMouseEnter={() => setHoveredCard('form_ativ_compl')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <i className="bi bi-card-list" style={iconStyle}></i>
              Entrega de Atividades Complementares
            </Link>
          </div>

          {/* SEGUNDA FILEIRA: 3 Formulários */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(240px, 1fr))', 
            gap: '30px', // Espaçamento entre os itens
            width: 'calc(75% - 20px)', // Aproximadamente 3/4 da largura da linha de cima, ajustado pelo gap
            maxWidth: '900px', // Largura máxima para 3 cards (3*280 + 2*30)
            margin: '0 auto', // Centraliza este grid dentro do container pai
            boxSizing: 'border-box'
          }}>
            {/* Solicitação de Dispensa de Educação Física */}
            <Link 
              className="crud-link" 
              to="/dispensa_ed_fisica"
              style={hoveredCard === 'dispensa_ed_fisica' ? {...formCardStyle, ...formCardHoverStyle} : formCardStyle}
              onMouseEnter={() => setHoveredCard('dispensa_ed_fisica')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <i className="bi bi-person-arms-up" style={iconStyle}></i>
              Solicitação de Dispensa de Educação Física
            </Link>

            {/* Solicitação de Justificativa / Abono de Faltas */}
            <Link 
              className="crud-link" 
              to="/abono_falta"
              style={hoveredCard === 'abono_falta' ? {...formCardStyle, ...formCardHoverStyle} : formCardStyle}
              onMouseEnter={() => setHoveredCard('abono_falta')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <i className="bi bi-calendar-x-fill" style={iconStyle}></i>
              Solicitação de Justificativa / Abono de Faltas
            </Link>

            {/* Solicitação de Exercícios Domiciliares */}
            <Link 
              className="crud-link" 
              to="/exercicio_domiciliar"
              style={hoveredCard === 'exercicio_domiciliar' ? {...formCardStyle, ...formCardHoverStyle} : formCardStyle}
              onMouseEnter={() => setHoveredCard('exercicio_domiciliar')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <i className="bi bi-house-check-fill" style={iconStyle}></i>
              Solicitação de Exercícios Domiciliares
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AlunoNovaSolicitacao;
