import './cadastrar_motivo.css';
import Header from '../../../components/header';
import Footer from '../../../components/footer';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Popup from '../../../components/popup';
import Feedback from '../../../components/feedback';

export default function Cadastrar_motivo() {

    const [lista_motivo, setMotivo] = useState([]);
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [idAtual, setIdAtual] = useState(null);
    const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const [feedbackType, setFeedbackType] = useState(null);

    const abrirPopup = (id) => {
        setPopupIsOpen(true);
        setIdAtual(id);
    }
    const fecharPopup = () => {
        setPopupIsOpen(false);
        setIdAtual(null);
    }

    const excluirMotivo = (id) => {
        axios.delete(`http://localhost:8000/solicitacoes/motivo_dispensa/${id}`
        ).then ((res) => 
            setMotivo(res.data),
            setFeedbackMessage("Motivo excluído com sucesso!"),
            setFeedbackType("success"),
        ).catch ((err) =>
            setFeedbackMessage(`Erro ${err.response?.status} || "": ${err.response?.data?.detail || "Erro ao excluir motivo."}`),
            setFeedbackType("error"),
        ).finally(() => {
            setFeedbackIsOpen(true)
        })

    };


    const popupActions = [
        {
          label: "Confirmar",
          className: "btn btn-confirm",
          onClick: () => excluirMotivo(idAtual)
        },
        {
          label: "Cancelar",
          className: "btn btn-cancel",
          onClick: () => fecharPopup(),
        },
      ];

    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/motivo_dispensa/"
        ).then ((response) => 
            setMotivo(response.data)
        ).catch ((error) =>
            console.log(error)
        )
}, []);
    

    return (
        <div>
            <Header />
            <main className='container'>
                <h2>Motivos de dispensa de educação física</h2>
            <table className='tabela-motivos'>
                <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Ações</th>
                </tr>
                </thead>
                <tbody>
                {lista_motivo.map((lista_motivo) => (
                    <tr key={lista_motivo.id}> 
                    <td>{lista_motivo.descricao}</td>
                    <td>
                        <button className='botao-editar'>Editar</button>
                    </td>
                    <td>
                        <button className='botao-excluir' onClick={() => abrirPopup(lista_motivo.id)}>Excluir</button>
                        
                    </td>
                    </tr>
                ))}
                {popupIsOpen && (
                            <Popup
                                message="Deseja excluir esse motivo?"
                                actions={popupActions}
                                onClose={fecharPopup}
                                />
                        )}
                        {feedbackIsOpen && (
                            <Feedback
                            message={feedbackMessage}
                            type={feedbackType}
                            onClose={() => setFeedbackIsOpen(false)}
                          />
                        )}
                        
                </tbody>
            </table>
            </main>
            <Footer />
            
        </div>
    );
}




