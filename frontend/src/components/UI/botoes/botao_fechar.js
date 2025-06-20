import "./botoes.css";

export default function BotaoFechar ({onClose}){
    return(
        <div className="modal-footer">
          <button onClick={onClose || (() => {})} className="close-button">
            Fechar
          </button>
        </div>
    );
}