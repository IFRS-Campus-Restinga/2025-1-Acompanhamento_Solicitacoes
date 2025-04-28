import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from "../../../components/base/footer";
import Header from "../../../components/base/header";
import Popup from '../../../components/popup';

// PAGINAÇÃO
import Paginacao from "../../../components/UI/paginacao";

//BOTÕES
import BotaoCadastrar from "../../../components/UI/botoes/botao_cadastrar";
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";

export default function ListarMotivoDispensa() {

    const [lista_motivo, setMotivo] = useState([]);
    const [popupMsg, setPopupMsg] = useState(null);
    const [popupType, setPopupType] = useState(null);
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [idAtual, setIdAtual] = useState(null);

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
        }     
        ).catch ((err) => {
            setPopupMsg(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir motivo."}`);
            setPopupType("error");
            setPopupIsOpen(true);
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
                
                {/* Botão de cadastrar */}
                <BotaoCadastrar to="/motivo_dispensa/cadastrar" title="Criar Novo Motivo" />

            <table className='tabela-cruds'>
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
                            <Popup
                                title="Excluir motivo"
                                message="Deseja excluir esse motivo?"
                                actions={popupActions}
                                msgType="popup"
                                />
                        )}

                <BotaoVoltar onClick={() => navigate("/")} />
                    
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




