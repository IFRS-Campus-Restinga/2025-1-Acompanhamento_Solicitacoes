import React from "react";
import "./popup_confirmacao.css";

const Popup = ({message, actions = [], onClose }) => {

  return (
    <dialog id="popup">
      <div className="popup-backdrop">
      <div className="popup-box">
        <p id={message}></p>
        <div className="popup-actions">
          {actions.map(({label, onClick}, idx) => (
            <button 
              key={idx}
              onClick={() =>{
                onClick();
                onClose();
              }
            }
            >
              {label}
              </button>
          ))}
        </div>
      </div>
    </div>
    </dialog>
    
  );
}

export default Popup;