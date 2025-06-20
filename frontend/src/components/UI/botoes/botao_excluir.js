import "./botoes.css";

export default function BotaoExcluir({ onClick, title = "Excluir" }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="icone-botao">
      <i className="bi bi-trash3-fill icone-excluir"></i>
    </button>
  );
}    