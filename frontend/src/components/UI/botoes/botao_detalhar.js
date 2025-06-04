import { Link } from "react-router-dom";
import "./botoes.css";

export default function BotaoDetalhar({ to, title = "Ver detalhes" }) {
  return (
    <Link to={to} title={title} className="icone-botao">
      <i className="bi bi-eye-fill icone-detalhar"></i>
    </Link>
  );
}