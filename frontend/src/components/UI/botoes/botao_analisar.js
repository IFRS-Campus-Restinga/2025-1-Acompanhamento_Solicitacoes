import "./botoes.css";

export default function BotaoAnalisar({ onClick, title = "Analisar Cadastro" }) {   
    return(
        <button
            onClick={onClick}
            title={title}
            className="botao-analisar">
            <i class="bi bi-exclamation-circle"></i>
        </button>
    );
}