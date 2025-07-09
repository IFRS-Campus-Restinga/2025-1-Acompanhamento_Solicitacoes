import React from 'react';
import { Link } from 'react-router-dom';
import { getAvailableForms, getUserRole } from '../../../utils/permissions';
import { PermissionDebugInfo } from '../../../components/PermissionWrapper';
import '../../../components/styles/telas_opcoes.css';

const ExternoHome = () => {
  const userRole = getUserRole();
  const availableForms = getAvailableForms();

  return (
    <main className="container">
      <h2 className="tela-opcoes-titulo">Área do Usuário Externo</h2>
      
      {/* Informação sobre o usuário atual */}
      <div className="alert alert-info mb-4" role="alert">
        <i className="bi bi-person-circle me-2"></i>
        <strong>Bem-vindo, usuário externo!</strong>
        <br />
        <small>
          Como usuário externo, você tem acesso limitado ao sistema. 
          Você pode apenas solicitar desistência de vaga.
        </small>
      </div>

      {/* Seção de formulários disponíveis */}
      <div className="colunas-section-container">
        <section className="colunas-section">
          <h3>Formulários Disponíveis</h3>
          <div className="grid-colunas">
            {availableForms.length > 0 ? (
              availableForms.map((form) => (
                <Link 
                  key={form.id}
                  className="colunas-link" 
                  to={form.path}
                  title={form.description}
                >
                  <i className="bi bi-door-open-fill form-icon"></i>
                  {form.name}
                </Link>
              ))
            ) : (
              <div className="alert alert-warning" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Nenhum formulário disponível para seu tipo de usuário.
              </div>
            )}
          </div>
        </section>

        {/* Seção de formulários não disponíveis */}
        <section className="colunas-section mt-4">
          <h3>Formulários Não Disponíveis</h3>
          <div className="alert alert-secondary" role="alert">
            <h6>Os seguintes formulários não estão disponíveis para usuários externos:</h6>
            <ul className="mb-0">
              <li>Abono de Falta</li>
              <li>Entrega de Atividades Complementares</li>
              <li>Trancamento de Disciplina</li>
              <li>Trancamento de Matrícula</li>
              <li>Exercícios Domiciliares</li>
            </ul>
            <hr />
            <small>
              <strong>Nota:</strong> Se você é um aluno ou responsável, 
              faça login com a conta apropriada para acessar todos os formulários.
            </small>
          </div>
        </section>
      </div>

      {/* Informações de debug (apenas em desenvolvimento) */}
      <PermissionDebugInfo />
    </main>
  );
};

export default ExternoHome;

