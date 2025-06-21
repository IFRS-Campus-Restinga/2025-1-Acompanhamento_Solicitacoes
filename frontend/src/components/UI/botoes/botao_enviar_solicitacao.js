import "./botoes.css";

import PropTypes from 'prop-types';

const BotaoEnviarSolicitacao = ({ 
  isSubmitting, 
  texto = "Enviar Solicitação", 
  textoCarregando = "Enviando...",
  className = "" 
}) => {
  return (
    <button 
      type="submit" 
      disabled={isSubmitting}
      className={`botao-enviar-solicitacao ${isSubmitting ? 'loading' : ''} ${className}`}
      aria-busy={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span className="spinner" aria-hidden="true"></span>
          {textoCarregando}
        </>
      ) : (
        texto
      )}
    </button>
  );
};

BotaoEnviarSolicitacao.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  texto: PropTypes.string,
  textoCarregando: PropTypes.string,
  className: PropTypes.string
};

export default BotaoEnviarSolicitacao;