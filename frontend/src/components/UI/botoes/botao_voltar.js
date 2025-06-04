import "./botoes.css";

export default function BotaoVoltar({ onClick }) {
  return (

    <div className="botao-voltar-wrapper">
        <button className="botao-voltar" onClick={(onClick)}>
        <i className="bi bi-arrow-left-circle"></i> Voltar
        </button>
    </div>

    );
}