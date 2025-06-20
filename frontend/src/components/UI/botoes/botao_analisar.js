import "./botoes.css";

export default function BotaoAnalisar({ onClick, title = "Analisar Cadastro" }) {   
    return(
        <button
            onClick={onClick}
            title={title}
            className="icone-botao">
            <i className="bi bi-exclamation-square botao-analisar"></i>
        </button>
    );
}