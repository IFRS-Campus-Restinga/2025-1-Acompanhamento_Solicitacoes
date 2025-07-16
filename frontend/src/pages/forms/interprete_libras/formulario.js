import axios from "axios";
import { useEffect, useState } from "react";
import { getGoogleUser } from "../../../services/authUtils";
import { useNavigate } from "react-router-dom";

export default function FormularioInterpreteLibras() {
    const [formulario, setFormulario] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        setUsuario(getGoogleUser());
        console.log(usuario);
        setCarregando(false);
    }, [])

    useEffect(() => {
        if (!carregando && !usuario) {
            navigate('/');
        }
    }, [usuario, carregando, navigate]);


    const handleSubmit = (e) => {
        e.PreventDefault();

    }

    if (usuario && !carregando) {
        return (
            <div className="page-container">
                <main className="container">
                    <h2>Solicitação de Intérprete de Libras</h2>
                    <form className="formulario formulario-largura" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome do aluno: </label>
                        <input type="text" value={usuario.name} disabled readOnly></input>
                    </div>
                    <div className="form-group">
                        <label>Email: </label>
                        <input type="text" value={usuario.email} disabled readOnly></input>
                    </div>
                    <div className="form-group">
                        <label>Finalidade: </label>
                        <select required>
                            <option value="">Selecione </option>
                            <option value="ATENDIMENTOPROF">Atendimento com professor da disciplina</option>
                            <option value="EXTRACLASSE">Atividade extra classe</option>
                            <option value="APOIO">Apoio do intérprete educacional</option>
                            <option value="ATENDIMENTOENSINO">Atendimento com ensino (Orientação educacional/Assistência Estudantil/Registros escolares/Gestão escolar)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Professor(a): </label>
                        <input type="text"></input>
                    </div>
                    <div className="form-group">
                        <label>Disciplina: </label>
                        <input type="text"></input>
                    </div>
                    <div className="form-group">
                        <label>Data: </label><br></br>
                        <input type="date"></input>
                    </div>
                    <div className="form-group">
                        <label>Hora de início: </label><br></br>
                        <input type="time"></input>
                    </div>
                    <div className="form-group">
                        <label>Hora de término: </label><br></br>
                        <input type="time"></input>
                    </div>
                    <div className="form-group">
                        <label>Local/Sala do Campus: </label>
                        <input type="text"></input>
                    </div>
                        
                    </form>
                </main>
            </div>
        )
    }
    

}