import './cadastrar_motivo.css';
import Header from '../../../components/header';
import Footer from '../../../components/footer';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Navbar from '../../../components/navbar';
import '../../../var.css';
import { Link } from 'react-router-dom';
import Popup from '../../../components/popup';

export default function Cadastrar_motivo() {

    const [lista_motivo, setMotivo] = useState([]);
    const [popupIsOpen, setPopup] = useState(false);
    const [idAtual, setId] = useState(null)

    const abrirPopup = (id) => {
        setPopup(true);
        setId(id)
    }
    const fecharPopup = () => setPopup(false);

    const excluirMotivo = (id) => useEffect(() => {
        axios.delete(`http://localhost:8000/solicitacoes/motivo_dispensa/${id}`
        ).then ((response) => 
            setMotivo(response.data)
        ).catch ((error) =>
            console.log(error)
        )
}, [])


    const popupActions = [
        {
          label: "Confirmar",
          className: "btn btn-confirm",
          onClick: () => excluirMotivo(id)
        },
        {
          label: "Cancelar",
          className: "btn btn-cancel",
          onClick: () => alert("Cancelado."),
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
            <Navbar />
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
                        <button className='botao-editar' onClick={editar_motivo(lista_motivo.id)}>Editar</button>
                    </td>
                    <td>
                        <button className='botao-excluir' onClick={() => abrirPopup(lista_motivo.id)}>Excluir</button>
                        {popupIsOpen && (
                            <Popup
                                message="Deseja excluir esse motivo?"
                                actions={popupActions}
                                onClose={fecharPopup}
                                />
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </main>
            <Footer />
            
        </div>
    );
}




