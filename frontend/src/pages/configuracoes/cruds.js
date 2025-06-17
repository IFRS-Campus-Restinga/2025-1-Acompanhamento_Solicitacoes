import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/base/footer";
import HeaderCRE from "../../components/base/headers/header_cre";
import "./../../components/base/main.css";
import "./cruds.css";

const Cruds = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);

  // Estilo base para os cards de link
  const cardLinkStyle = {
    display: 'flex',
    flexDirection: 'row', // Alinhar ícone e texto na mesma linha
    alignItems: 'center',
    justifyContent: 'flex-start', // Alinhar conteúdo à esquerda
    padding: '15px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    textAlign: 'left',
    textDecoration: 'none',
    color: '#333',
    fontWeight: '600',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
    minHeight: '35px', // Altura mínima para os cards
    width: '100%', 
    border: '1px solid #eee',
  };

  // Estilo de hover para os cards de link (alterado para verde claro)
  const cardLinkHoverStyle = {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.12)',
    backgroundColor: '#e6ffe6', // Verde muito clarinho no hover
  };

  // Estilo para os ícones dentro dos cards (alterado para verde)
  const iconStyle = {
    fontSize: '1.8rem', // Tamanho adequado para ícones
    marginRight: '15px', // Espaçamento entre ícone e texto
    color: '#28a745', // Verde padrão
  };

  // Estado para controlar o hover de cada card individualmente
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/solicitacoes/")
      .then(res => setSolicitacoes(res.data))
      .catch(err => console.error("Erro ao buscar solicitações:", err));
  }, []);

  return (
    <div>
      <HeaderCRE />
      <main className="container" style={{ 
        padding: '20px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '20px', 
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
          transform: 'translateX(0px)' 
        }}>Configurações</h2> {/* Título principal */}
        
        {/* Container principal para as duas colunas */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-around', 
          gap: '40px', 
          padding: '20px',
          maxWidth: '1200px', 
          margin: '0 auto',
          width: '100%' 
        }}>

          {/* Seção 1: Usuários e Grupos */}
          <div style={{ 
            flex: '1 1 45%', 
            minWidth: '320px', 
            backgroundColor: '#f9f9f9',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            border: '1px solid #ddd',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h3 style={{ 
              marginBottom: '25px', 
              color: '#555', 
              fontSize: '2rem', 
              fontWeight: '600',
              borderBottom: '2px solid #218838', // Borda alterada para verde escuro
              paddingBottom: '12px'
            }}>Usuários</h3> {/* Subtítulo */}
            <div className="grid-cruds" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr', 
              gap: '20px', 
              width: '100%',
              maxWidth: '450px' 
            }}>
              <Link 
                className="crud-link" 
                to="/usuarios"
                style={hoveredCard === 'usuarios-ativos' ? {...cardLinkStyle, ...cardLinkHoverStyle} : cardLinkStyle}
                onMouseEnter={() => setHoveredCard('usuarios-ativos')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="bi bi-person-circle" style={iconStyle}></i> Usuários Ativos
              </Link>
              <Link 
                className="crud-link" 
                to="/usuarios/inativos"
                style={hoveredCard === 'usuarios-inativos' ? {...cardLinkStyle, ...cardLinkHoverStyle} : cardLinkStyle}
                onMouseEnter={() => setHoveredCard('usuarios-inativos')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="bi bi-person-circle" style={iconStyle}></i> Usuários Inativos
              </Link>
              <Link 
                className="crud-link" 
                to="/usuarios/selecionargrupo"
                style={hoveredCard === 'cadastro-grupo' ? {...cardLinkStyle, ...cardLinkHoverStyle} : cardLinkStyle}
                onMouseEnter={() => setHoveredCard('cadastro-grupo')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="bi bi-person-circle" style={iconStyle}></i> Cadastro Aluno/CRE/Coordenador
              </Link> 
              <Link 
                className="crud-link" 
                to="/mandatos"
                style={hoveredCard === 'mandatos' ? {...cardLinkStyle, ...cardLinkHoverStyle} : cardLinkStyle}
                onMouseEnter={() => setHoveredCard('mandatos')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="bi bi-person-circle" style={iconStyle}></i> Mandatos
              </Link>
              <Link 
                className="crud-link" 
                to="/grupos"
                style={hoveredCard === 'grupos' ? {...cardLinkStyle, ...cardLinkHoverStyle} : cardLinkStyle}
                onMouseEnter={() => setHoveredCard('grupos')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="bi bi-people-fill" style={iconStyle}></i> Grupos
              </Link>
            </div>
          </div>

          {/* Seção 2: Cadastrar (Demais Entidades) */}
          <div style={{ 
            flex: '1 1 45%',
            minWidth: '320px',
            backgroundColor: '#f9f9f9',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            border: '1px solid #ddd',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h3 style={{ 
              marginBottom: '25px', 
              color: '#555', 
              fontSize: '2rem', 
              fontWeight: '600',
              borderBottom: '2px solid #218838', // Borda alterada para verde escuro
              paddingBottom: '12px'
            }}>Cadastrar</h3> {/* Subtítulo */}
            <div className="grid-cruds" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr', 
              gap: '20px', 
              width: '100%',
              maxWidth: '450px'
            }}>
              <Link 
                className="crud-link" 
                to="/disponibilidades"
                style={hoveredCard === 'disponibilidades' ? {...cardLinkStyle, ...cardLinkHoverStyle} : cardLinkStyle}
                onMouseEnter={() => setHoveredCard('disponibilidades')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="bi bi-calendar-check" style={iconStyle}></i> Disponibilidade de Formulários
              </Link>
              <Link 
                className="crud-link" 
                to="/disciplinas"
                style={hoveredCard === 'disciplinas' ? {...cardLinkStyle, ...cardLinkHoverStyle} : cardLinkStyle}
                onMouseEnter={() => setHoveredCard('disciplinas')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="bi bi-book" style={iconStyle}></i> Disciplinas
              </Link>
              <Link 
                className="crud-link" 
                to="/ppcs"
                style={hoveredCard === 'ppcs' ? {...cardLinkStyle, ...cardLinkHoverStyle} : cardLinkStyle}
                onMouseEnter={() => setHoveredCard('ppcs')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="bi bi-layout-text-window-reverse" style={iconStyle}></i> PPCs
              </Link>
              <Link 
                className="crud-link" 
                to="/cursos"
                style={hoveredCard === 'cursos' ? {...cardLinkStyle, ...cardLinkHoverStyle} : cardLinkStyle}
                onMouseEnter={() => setHoveredCard('cursos')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="bi bi-mortarboard" style={iconStyle}></i> Cursos
              </Link>
              <Link 
                className="crud-link" 
                to="/motivo_abono"
                style={hoveredCard === 'motivo-abono' ? {...cardLinkStyle, ...cardLinkHoverStyle} : cardLinkStyle}
                onMouseEnter={() => setHoveredCard('motivo-abono')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="bi bi-calendar-x-fill" style={iconStyle}></i> Motivos Abono de Faltas
              </Link>
              <Link 
                className="crud-link" 
                to="/motivo_exercicios"
                style={hoveredCard === 'motivo-exercicios' ? {...cardLinkStyle, ...cardLinkHoverStyle} : cardLinkStyle}
                onMouseEnter={() => setHoveredCard('motivo-exercicios')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="bi bi-journal-text" style={iconStyle}></i> Motivos Exercícios Domiciliares
              </Link>
              <Link 
                className="crud-link" 
                to="/motivo_dispensa"
                style={hoveredCard === 'motivo-dispensa' ? {...cardLinkStyle, ...cardLinkHoverStyle} : cardLinkStyle}
                onMouseEnter={() => setHoveredCard('motivo-dispensa')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="bi bi-person-arms-up" style={iconStyle}></i> Motivos Dispensa de Educação Física
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cruds;
