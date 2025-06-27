import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";

// Components
import BuscaUsuario from "../../../components/busca_usuario";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
import BotaoEnviarSolicitacao from '../../../components/UI/botoes/botao_enviar_solicitacao';

// CSS
import "../../../components/styles/formulario.css";

// Serviços de autenticação e API
import { getAuthToken } from "../../../services/authUtils";
import api from "../../../services/api"; 

export default function FormularioTrancamentoMatricula() {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [userData, setUserData] = useState(null);
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);
    
    const [msgErro, setMsgErro] = useState("");
    const [tipoErro, setTipoErro] = useState("");
    const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();

    const handleUsuario = useCallback((data) => {
        setUserData(data);
        setCarregandoUsuario(false);
    }, []);

    useEffect(() => {
        if (!carregandoUsuario && !userData) {
            navigate("/");
        }
    }, [carregandoUsuario, userData, navigate]);

    
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        
        const formData = new FormData();
        formData.append('motivo_solicitacao', data.motivo_solicitacao);

        if (data.arquivos && data.arquivos.length > 0) {
            Array.from(data.arquivos).forEach((file) => {
                formData.append('anexos', file); 
            });
        }

        try {
            const token = getAuthToken();
            
            const response = await api.post(
                'formularios/trancamento-matricula/',
                formData,
                {
                    headers: { 
                        "Authorization": `Bearer ${token}`
                    },
                }
            );

            setMsgErro("Solicitação enviada com sucesso!");
            setTipoErro("sucesso");
            setFeedbackIsOpen(true);
            setTimeout(() => navigate("/aluno/minhas-solicitacoes"), 2000);

        } catch (error) {
            const errorMessage = error.response?.data?.detail || 
                                 JSON.stringify(error.response?.data) ||
                                 error.message || 
                                 "Erro ao enviar solicitação.";
            
            setMsgErro(errorMessage);
            setTipoErro("erro");
            setFeedbackIsOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };
      
    if (carregandoUsuario) {
        return (
            <>
                <BuscaUsuario dadosUsuario={handleUsuario} />
                <main className="container"><p>Carregando usuário...</p></main>
            </>
        );
    }

    if (!userData) {
        return null; 
    }
    
    return (
        <div className="page-container">
            <BuscaUsuario dadosUsuario={handleUsuario} />
            <main className="container">
                <h2>Solicitação de Trancamento de Matrícula</h2>
                <br></br>
                
                {/* ADICIONADO: Descrição do formulário de volta */}
                <h6 className="descricao-formulario">
                  Este formulário destina-se à solicitação de <strong> trancamento total de matrícula</strong>.
                  É importante ressaltar que o trancamento total de matrícula não é permitido para estudantes ingressantes, 
                  alunos de cursos integrados e aqueles matriculados na modalidade de Educação de Jovens e Adultos (EJA).
                  <br></br>Ao solicitar o trancamento de matrícula, o/a estudante declara estar ciente de que esta medida é válida <strong> por um período letivo</strong>. 
                  A renovação da solicitação de trancamento total da matrícula é obrigatória a cada período letivo. 
                  O não cumprimento desse procedimento resultará no <strong>cancelamento automático da matrícula</strong>.
                  Ressalta-se que o trancamento não será concedido caso o curso em que o estudante estiver matriculado esteja em processo de extinção.
                  <hr></hr><strong>IMPORTANTE:</strong> O trancamento total de matrícula é permitido até a quarta semana após o início das atividades letivas, conforme estabelecido em nosso calendário acadêmico.
                </h6>

                <form onSubmit={handleSubmit(onSubmit)} className="formulario formulario-largura">
                
                    <div className="dados-aluno-container">
                        {/* Campos de exibição dos dados do aluno */}
                        <div className="form-group">
                            <label>E-mail:</label>
                            <input type="email" readOnly value={userData?.email || ""} />
                        </div>
                        <div className="form-group">
                            <label>Nome Completo:</label>
                            <input type="text" readOnly value={userData?.name || ""}/>
                        </div>

                        {/* ADICIONADO: Campo de Matrícula para exibição */}
                        {userData.grupo_detalhes?.matricula && (
                            <div className="form-group">
                                <label>Matrícula:</label>
                                <input type="text" readOnly value={userData.grupo_detalhes.matricula}/>
                            </div>
                        )}
                        
                        {/* ADICIONADO: Campo de Curso para exibição */}
                        {userData.grupo_detalhes?.curso_nome && (
                            <div className="form-group">
                                <label>Curso:</label>
                                <input type="text" readOnly value={userData.grupo_detalhes.curso_nome}/>
                            </div>
                        )}
                    
                        {/* Campos de entrada do usuário */}
                        <div className="form-group">
                            <label>Justificativa:</label>
                            <textarea
                                {...register("motivo_solicitacao", { 
                                    required: "Justificativa é obrigatória",
                                    minLength: {
                                        value: 20,
                                        message: "Mínimo 20 caracteres"
                                    }
                                })}
                                rows="5"
                            />
                            {errors.motivo_solicitacao && (
                                <span className="error-text">{errors.motivo_solicitacao.message}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Anexos (opcional):</label>
                            <input
                                type="file"
                                {...register("arquivos")}
                                multiple
                            />
                        </div>    
                    </div>  

                    <BotaoEnviarSolicitacao isSubmitting={isSubmitting}/>
                </form>
            </main>
            {feedbackIsOpen && (
                <PopupFeedback
                    mensagem={msgErro}
                    tipo={tipoErro}
                    onClose={() => setFeedbackIsOpen(false)}
                />
            )}
        </div>
    );
}
