import React, { useEffect, useRef } from "react";
import { Modal } from "bootstrap";
import "./popup.css";

const Popup = ({ title = "Aviso", message, actions = [], msgType = "popup" }) => {
  const modalRef = useRef(null);
  const bsModal = useRef(null);

  useEffect(() => {
    if (msgType === "popup" && modalRef.current) {
      // Inicializa modal Bootstrap
      bsModal.current = new Modal(modalRef.current, {
        backdrop: 'static', // Impede fechar clicando fora
        keyboard: false // Impede fechar com ESC
      });
      bsModal.current.show();

      // Limpeza ao desmontar
      return () => {
        bsModal.current.hide();
        document.body.classList.remove("modal-open");
        const backdrops = document.querySelectorAll(".modal-backdrop");
        backdrops.forEach(el => el.remove());
      };
    }
  }, [msgType]);

  return (
    <>
      {msgType === "popup" ? (
        <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5">{title}</h1>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => bsModal.current.hide()}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>{message}</p>
              </div>
              <div className="modal-footer">
                {actions.map(({ label, onClick, className }, idx) => (
                  <button
                    key={idx}
                    className={className}
                    onClick={() => {
                      onClick();
                      bsModal.current.hide();
                      // Limpa backdrop e modal-open manualmente
                      document.body.classList.remove("modal-open");
                      const backdrops = document.querySelectorAll(".modal-backdrop");
                      backdrops.forEach(el => el.remove());
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="popup-overlay">
          <p>{message}</p>
          <div className="popup-actions">
            {actions.map(({ label, onClick, className }, idx) => (
              <button key={idx} className={className} onClick={onClick}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
