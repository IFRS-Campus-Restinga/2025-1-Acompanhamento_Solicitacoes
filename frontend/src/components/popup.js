import React from "react";
import "./popup.css";

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
    
  );
}

export default Popup;