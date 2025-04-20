import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../../components/footer';
import Header from '../../../components/header';
import './cadastrar_motivo.css';

//POP-UPS IMPORTAÇÃO
import PopupConfirmacao from "../../../components/pop_ups/popup_confirmacao";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";

// PAGINAÇÃO
import Paginacao from "../../../components/UI/paginacao";

export default function ListarMotivoDispensa() {

    const [lista_motivo, setMotivo] = useState([]);
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [idAtual, setIdAtual] = useState(null);
    const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const [feedbackType, setFeedbackType] = useState(null);

    const [paginaAtual, setPaginaAtual] = useState(1);
    const [motivosPaginados, setMotivosPaginados] = useState([]);
    
    const navigate = useNavigate();

    const abrirPopup = (id) => {
        setPopupIsOpen(true);
        setIdAtual(id);
    }
    const fecharPopup = () => {
        setPopupIsOpen(false);
        setIdAtual(null);
    }

    const excluirMotivo = () => {
        axios.delete(`http://localhost:8000/solicitacoes/motivo_dispensa/${idAtual}/`
        ).then (() => {
            setMotivo(lista_motivo.filter((m) => m.id !== idAtual));
            setFeedbackMessage("Motivo excluído com sucesso!");
            setFeedbackType("success");
        }     
        ).catch ((err) => {
            setFeedbackMessage(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir motivo."}`);
            setFeedbackType("error");
        }).finally(() => {
            setFeedbackIsOpen(true);
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
                <div className="botao-cadastrar-wrapper">
          <Link to="/motivo_dispensa/cadastrar" className="botao-link" title="Criar Novo Motivo">
            <button className="botao-cadastrar">
              <i className="bi bi-plus-circle-fill"></i>
            </button>
          </Link>
        </div>
            <table className='tabela-motivos'>
                <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Ações</th>
                </tr>
                </thead>
                <tbody>
                {motivosPaginados.map((lista_motivo, index) => (
                    <tr key={lista_motivo.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}> 
                    <td>{lista_motivo.descricao}</td>
                    <td>
                        <div className="botoes-acoes">
                        <Link to={`/motivo_dispensa/${lista_motivo.id}`}>
                        <i className="bi bi-pencil-square icone-editar" title='Editar'></i>
                        </Link>
                        <button className='icone-botao' title='Excluir' onClick={() => abrirPopup(lista_motivo.id)}>
                        <i className="bi bi-trash3-fill icone-excluir"></i></button>
                        </div>
                    </td>

                    </tr>
                ))}
                
                {popupIsOpen && (
                            <PopupConfirmacao
                                message="Deseja excluir esse motivo?"
                                actions={popupActions}
                                onClose={fecharPopup}
                                />
                        )}
                        {feedbackIsOpen && (
                            <PopupFeedback
                            message={feedbackMessage}
                            type={feedbackType}
                            onClose={() => setFeedbackIsOpen(false)}
                          />
                          
                        )}
                <div className="botao-voltar-wrapper">
                    <button className="botao-voltar" onClick={() => navigate('/')}>
                    <i className="bi bi-arrow-left-circle"></i> Voltar
                    </button>
                </div>
                </tbody>
            </table>
            <Paginacao
                dados={lista_motivo}
                paginaAtual={paginaAtual}
                setPaginaAtual={setPaginaAtual}
                itensPorPagina={5}
                onDadosPaginados={setMotivosPaginados}
            />
            
            </main>
            <Footer />
        </div>
    );
}




