import { Link } from "react-router-dom";
import "./botoes.css";

export default function BotaoEditar({ to, title = "Editar" }) {
  return (
    <Link to={to} title={title}>
      <i className="bi bi-pencil-square icone-editar"></i>
    </Link>
  );
}