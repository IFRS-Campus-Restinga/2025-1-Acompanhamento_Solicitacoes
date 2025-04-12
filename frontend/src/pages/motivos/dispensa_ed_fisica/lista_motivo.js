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
                        <button className='botao-excluir' onClick={excluir_motivo(lista_motivo.id)}>Excluir</button>
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

function excluir_motivo(motivo_id) {
    const btnConfirmar = {Popup}.document.getElementById("btnConfirmar");
    const btnCancelar = document.getElementById("btnCancelar");
    const popup = {Popup}.document.getElementById("popup");

    popup.show();

    btnConfirmar.addEventListener("click", () => {
            axios.delete("http//:localhost:8000/solicitacoes/motivo_dispensa/" + motivo_id
            ).then(
                console.log("Motivo excluído com sucesso!!")
            ).catch((error) => console.log(error)
            ).finally(popup.close())
    });

    btnCancelar.addEventListener("click", () => {
        popup.close();
    });

}

