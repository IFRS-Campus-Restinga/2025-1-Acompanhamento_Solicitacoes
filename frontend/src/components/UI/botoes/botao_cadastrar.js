import { Link } from "react-router-dom";
import "./botoes.css";

export default function BotaoCadastrar({ to, title = "Criar Novo", state = null }) {
  return (
    <div className="botao-cadastrar-wrapper">
      <Link
        to={to}
        {...(state ? { state } : {})} // ← só passa `state` se existir
        className="botao-link"
        title={title}
      >
        <button className="botao-cadastrar">
          <i className="bi bi-plus-circle-fill"></i>
        </button>
      </Link>
    </div>
  );
}