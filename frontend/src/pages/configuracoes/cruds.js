import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

//CSS
import "../../components/styles/telas_opcoes.css";

const Cruds = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/solicitacoes/")
      .then(res => setSolicitacoes(res.data))
      .catch(err => console.error("Erro ao buscar solicitações:", err));
  }, []);

  
  return (
    <div className="colunas-container">
      <main className="container">
        <h1 className="colunas-title">Gestão do Sistema</h1>
        
        <div className="colunas-section-container">
          {/* Seção 1: Usuários e Grupos */}
          <section className="colunas-section">
            <h3>Usuários</h3>
            <div className="grid-colunas">
              <Link 
                to="/usuarios"
                className={`colunas-link ${hoveredCard === 'usuarios-ativos' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('usuarios-ativos')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-person-circle"></i> Usuários Ativos
              </Link>
              
              <Link 
                to="/usuarios/inativos"
                className={`colunas-link ${hoveredCard === 'usuarios-inativos' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('usuarios-inativos')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-person-circle"></i> Usuários Inativos
              </Link>
              
              <Link 
                to="/usuarios/selecionargrupo"
                className={`colunas-link ${hoveredCard === 'cadastro-grupo' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('cadastro-grupo')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-person-circle"></i> Cadastro Aluno/CRE/Coordenador
              </Link>
              
              <Link 
                to="/mandatos"
                className={`colunas-link ${hoveredCard === 'mandatos' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('mandatos')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-person-circle"></i> Mandatos
              </Link>
              
              <Link 
                to="/grupos"
                className={`colunas-link ${hoveredCard === 'grupos' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('grupos')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-people-fill"></i> Grupos
              </Link>
            </div>
          </section>

          {/* Seção 2: Cadastros Acadêmicos */}
          <section className="colunas-section">
            <h3>Cadastros Acadêmicos</h3>
            <div className="grid-colunas">
              <Link 
                to="/turmas"
                className={`colunas-link ${hoveredCard === 'turmas' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('turmas')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-people"></i> Turmas
              </Link>
              
              <Link 
                to="/disciplinas"
                className={`colunas-link ${hoveredCard === 'disciplinas' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('disciplinas')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-book"></i> Disciplinas
              </Link>
              
              <Link 
                to="/ppcs"
                className={`colunas-link ${hoveredCard === 'ppcs' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('ppcs')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-layout-text-window-reverse"></i> PPCs
              </Link>
              
              <Link 
                to="/cursos"
                className={`colunas-link ${hoveredCard === 'cursos' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('cursos')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-mortarboard"></i> Cursos
              </Link>
              
              <Link 
                to="/disponibilidades"
                className={`colunas-link ${hoveredCard === 'disponibilidades' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('disponibilidades')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-calendar-check"></i> Disponibilidade de Formulários
              </Link>
            </div>
          </section>

          {/* Seção 3: Motivos de Solicitações */}
          <section className="colunas-section">
            <h3>Motivos de Solicitações</h3>
            <div className="grid-colunas">
              <Link 
                to="/motivo_abono"
                className={`colunas-link ${hoveredCard === 'motivo-abono' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('motivo-abono')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-calendar-x-fill"></i> Abono de Faltas
              </Link>
              
              <Link 
                to="/motivo_exercicios"
                className={`colunas-link ${hoveredCard === 'motivo-exercicios' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('motivo-exercicios')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-journal-text"></i> Exercícios Domiciliares
              </Link>
              
              <Link 
                to="/motivo_dispensa"
                className={`colunas-link ${hoveredCard === 'motivo-dispensa' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard('motivo-dispensa')}
                onMouseLeave={() => setHoveredCard(null)}>
                <i className="bi bi-person-arms-up"></i> Dispensa de Educação Física
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Cruds;