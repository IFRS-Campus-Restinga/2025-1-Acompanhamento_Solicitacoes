import axios, { Axios } from "axios";
import { useEffect, useState } from "react";
import { getAuthToken, getGoogleUser } from "../../../services/authUtils";
import { useNavigate } from "react-router-dom";
import BotaoEnviarSolicitacao from "../../../components/UI/botoes/botao_enviar_solicitacao";

export default function FormularioInterpreteLibras() {
    const [formulario, setFormulario] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [id, setId] = useState(null);

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


    const handleSubmit = () => {
        try {
            const res = axios.get(`http://localhost:8000/solicitacoes/usuarios/buscar-por-email/${usuario.email}/`, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
            })
            setId(res.data);
            setFormulario(prev => ({
                ...prev,
                "aluno": res.data?.grupo_detalhes.id
            }))
        }
        catch (err) {
            alert(err);
        }

            try {
                const res = axios.post('http://localhost:8000/solicitacoes/form_interp_libras/', formulario, {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`
                    }
                })
                navigate('/aluno/minhas-solicitacoes');
            }
            catch (err) {
                alert(err);
            }
    }

    const handleChangeProfessor = (e) => {
        setFormulario(prev => ({
            ...prev,
            "professor": e
        }));
        console.log(formulario);
    }

    const handleChangeFinalidade = (e) => {
        setFormulario(prev => ({
            ...prev,
            "finalidade": e
        }));
        console.log(formulario);
    }

    const handleChangeDisciplina = (e) => {
        setFormulario(prev => ({
            ...prev,
            "disciplina": e
        }));
        console.log(formulario);
    }

    const handleChangeData = (e) => {
        setFormulario(prev => ({
            ...prev,
            "data": e
        }));
        console.log(formulario);
    }

    const handleChangeHoraInicio = (e) => {
        setFormulario(prev => ({
            ...prev,
            "horario_inicio": e
        }));
        console.log(formulario);
    }

    const handleChangeHoraTermino = (e) => {
        setFormulario(prev => ({
            ...prev,
            "horario_termino": e
        }));
        console.log(formulario);
    }

    const handleChangeLocalSala = (e) => {
        setFormulario(prev => ({
            ...prev,
            "local_sala_campus": e
        }));
        console.log(formulario);
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
                        <select required onChange={(e) => handleChangeFinalidade(e.target.value)}>
                            <option value="">Selecione </option>
                            <option value="ATENDIMENTOPROF">Atendimento com professor da disciplina</option>
                            <option value="EXTRACLASSE">Atividade extra classe</option>
                            <option value="APOIO">Apoio do intérprete educacional</option>
                            <option value="ATENDIMENTOENSINO">Atendimento com ensino (Orientação educacional/Assistência Estudantil/Registros escolares/Gestão escolar)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Professor(a): </label>
                        <input type="text" onChange={(e) => handleChangeProfessor(e.target.value)}></input>
                    </div>
                    <div className="form-group">
                        <label>Disciplina: </label>
                        <input type="text" onChange={(e) => handleChangeDisciplina(e.target.value)}></input>
                    </div>
                    <div className="form-group">
                        <label>Data: </label><br></br>
                        <input type="date" onChange={(e) => handleChangeData(e.target.value)}></input>
                    </div>
                    <div className="form-group">
                        <label>Hora de início: </label><br></br>
                        <input type="time" onChange={(e) => handleChangeHoraInicio(e.target.value)}></input>
                    </div>
                    <div className="form-group">
                        <label>Hora de término: </label><br></br>
                        <input type="time" onChange={(e) => handleChangeHoraTermino(e.target.value)}></input>
                    </div>
                    <div className="form-group">
                        <label>Local/Sala do Campus: </label>
                        <input type="text" onChange={(e) => handleChangeLocalSala(e.target.value)}></input>
                    </div>
                    <button type="submit" className="botao-generico">Enviar</button>
                    </form>
                    
                </main>
            </div>
        )
    }
    

}