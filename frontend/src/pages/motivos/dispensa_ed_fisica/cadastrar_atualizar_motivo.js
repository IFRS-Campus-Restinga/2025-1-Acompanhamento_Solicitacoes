import { useEffect, useState } from "react";

//POP-UPS IMPORTAÇÃO

import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Popup from "../../../components/pop_ups/popup_feedback";

export default function CadastrarAtualizarMotivoDispensa() {
  const [popupMsg, setPopupMsg] = useState(null);
  const [msgType, setMsgType] = useState(null);
  const [popupIsOpen, setPopupIsOpen] = useState(false);
  const [descricao, setDescricao] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const popupActions = [
    {
      label: "Fechar",
      className: "btn btn-cancel",
      onClick: () => {
        setPopupIsOpen(false);
        navigate('/motivo_dispensa');
      }
    }
  ];

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/solicitacoes/motivo_dispensa/${id}/`)
        .then((res) => {
          setDescricao(res.data.descricao);
        })
        .catch((err) => {
          setPopupMsg(`Erro ${err.response?.status}: ${err.response?.data?.detail}`);
          setMsgType("error");
          setPopupIsOpen(true);
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dados = { descricao };

    const requisicao = id
      ? axios.put(`http://localhost:8000/solicitacoes/motivo_dispensa/${id}/`, dados)
      : axios.post("http://localhost:8000/solicitacoes/motivo_dispensa/", dados);

    requisicao
      .then(() => {
        navigate("/motivo_dispensa"); // ✅ Redireciona após sucesso
      })
      .catch((err) => {
        setPopupMsg(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao salvar motivo."}`);
        setMsgType("error");
        setPopupIsOpen(true);
      });
  };

  return (
    <div>
      <main className="container form-container">
        <h2>{id ? "Editar Motivo de Dispensa de Educação Física" : "Cadastrar Novo Motivo de Dispensa de Educação Física"}</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Descrição:</label>
            <textarea
              className="input-area"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              maxLength="200"
              minLength="9"
            />
          </div>
          <button type="submit" className="submit-button">
            {id ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        {popupIsOpen && (
          <Popup
            message={popupMsg}
            actions={popupActions}
            msgType={msgType}
          />
        )}
      </main>
    </div>
  );
}
