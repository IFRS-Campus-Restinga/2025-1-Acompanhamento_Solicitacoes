import React from "react";
import "./popup.css";

//Popup customizável que recebe uma mensagem (message) com uma lista de botões (actions)

const Popup = ({message, actions = [], onClose }) => {

  return (
      <div className="popup-backdrop">
      <div className="popup-box">
        <p>{message}</p>
        <div className="popup-actions">
          {actions.map(({label, onClick, className}, idx) => (
            <button 
              key={idx}
              className={className} 
              onClick={() =>{
                onClick(); //ação que será disparada ao clicar no botão
                onClose(); //ação que será disparada ao fechar o popup
              }
            }
            >
              {label}
              </button>
          ))}
        </div>
      </div>
    </div>
    
  );
}

export default Popup;