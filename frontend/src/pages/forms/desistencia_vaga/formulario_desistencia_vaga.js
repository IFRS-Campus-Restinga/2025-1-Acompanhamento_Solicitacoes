import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BuscaUsuario from "../../../components/busca_usuario";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
import { FormPermissionWrapper } from "../../../components/PermissionWrapper";
//import VerificadorDisponibilidade from "../../../pages/disponibilidade/VerificadorDisponibilidade";

//CSS
import "../../../components/styles/formulario.css";

// Serviços de autenticação
import { getAuthToken } from "../../../services/authUtils";

export default function FormularioDesistenciaVaga() {
    // Estados para controle de usuário e aluno
    const [userData, setUserData] = useState(null);
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);
    const [aluno, setAluno] = useState(null);
    const [alunoNaoEncontrado, setAlunoNaoEncontrado] = useState(false);
    
    // Estados para curso e PPC
    const [curso, setCurso] = useState(null);
    const [ppc, setPpc] = useState(null);
    
    // Estados para motivos de dispensa
    const [motivosDesistencia, setMotivosDesistencia] = useState([]);
    const [isLoadingMotivos, setIsLoadingMotivos] = useState(true);
    
    // Estado para o formulário
    const [formData, setFormData] = useState({
        turma: "",
        ano_semestre_ingresso: "",
        motivo_solicitacao: "",
        observacoes: "",
        anexos: null
    });
    
    // Estados para feedback e erros
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [msgErro, setMsgErro] = useState("");
    const [tipoPopup, setTipoPopup] = useState("sucesso");
    
    // Referência para controlar busca única
    const buscouAlunoRef = useRef(false);
    const navigate = useNavigate();

    // Callback para o BuscaUsuario
    const handleUsuario = useCallback((data) => {
        console.log("BuscaUsuario retornou:", data);
        setUserData(data);
        setCarregandoUsuario(false);
    }, []);

    // Buscar aluno quando userData mudar
    useEffect(() => {
        if (userData && userData.email && !buscouAlunoRef.current) {
            buscouAlunoRef.current = true;
            buscarAluno(userData.email);
        }
    }, [userData]);

    // Buscar motivos de desistência
    useEffect(() => {
        const buscarMotivos = async () => {
            try {
                const token = getAuthToken();
                const response = await axios.get(
                    "http://127.0.0.1:8000/motivos_desistencia/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setMotivosDesistencia(response.data);
            } catch (error) {
                console.error("Erro ao buscar motivos de desistência:", error);
                setMsgErro("Erro ao carregar motivos de desistência");
                setTipoPopup("erro");
                setPopupIsOpen(true);
            } finally {
                setIsLoadingMotivos(false);
            }
        };

        buscarMotivos();
    }, []);

    const buscarAluno = async (email) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(
                `http://127.0.0.1:8000/aluno-info/?email=${email}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data) {
                setAluno(response.data);
                setCurso(response.data.curso);
                setPpc(response.data.ppc);
                setAlunoNaoEncontrado(false);
            }
        } catch (error) {
            console.error("Erro ao buscar aluno:", error);
            setAlunoNaoEncontrado(true);
            setAluno(null);
            setCurso(null);
            setPpc(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!aluno) {
            setMsgErro("Dados do aluno não encontrados");
            setTipoPopup("erro");
            setPopupIsOpen(true);
            return;
        }

        try {
            const token = getAuthToken();
            const formDataToSend = new FormData();
            
            // Adicionar dados do formulário
            formDataToSend.append('aluno', aluno.id);
            formDataToSend.append('turma', formData.turma);
            formDataToSend.append('ano_semestre_ingresso', formData.ano_semestre_ingresso);
            formDataToSend.append('motivo_solicitacao', formData.motivo_solicitacao);
            formDataToSend.append('observacoes', formData.observacoes);
            
            if (formData.anexos) {
                formDataToSend.append('anexos', formData.anexos);
            }

            const response = await axios.post(
                "http://127.0.0.1:8000/form_desistencia_vaga/",
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setMsgErro("Solicitação de desistência enviada com sucesso!");
            setTipoPopup("sucesso");
            setPopupIsOpen(true);
            
            // Limpar formulário
            setFormData({
                turma: "",
                ano_semestre_ingresso: "",
                motivo_solicitacao: "",
                observacoes: "",
                anexos: null
            });

        } catch (error) {
            console.error("Erro ao enviar formulário:", error);
            setMsgErro("Erro ao enviar solicitação. Tente novamente.");
            setTipoPopup("erro");
            setPopupIsOpen(true);
        }
    };

    return (
        <FormPermissionWrapper formType="desistencia_vaga">
            <div className="formulario-container">
                <main className="container">
                    <h2 className="formulario-titulo">Termo de Desistência de Vaga</h2>
                    
                    <div className="alert alert-info" role="alert">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Importante:</strong> Este formulário é para solicitar a desistência de sua vaga no curso.
                        Esta ação é irreversível e resultará no cancelamento de sua matrícula.
                    </div>

                    <BuscaUsuario onUsuario={handleUsuario} />

                    {carregandoUsuario && (
                        <div className="text-center my-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </div>
                        </div>
                    )}

                    {alunoNaoEncontrado && (
                        <div className="alert alert-warning" role="alert">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Aluno não encontrado. Verifique o email informado.
                        </div>
                    )}

                    {aluno && (
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">Dados do Aluno</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>Nome:</strong> {aluno.nome}</p>
                                        <p><strong>Matrícula:</strong> {aluno.matricula}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Curso:</strong> {curso?.nome}</p>
                                        <p><strong>PPC:</strong> {ppc?.codigo}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="formulario-form">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="turma" className="form-label">
                                    Turma <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="turma"
                                    name="turma"
                                    value={formData.turma}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="col-md-6 mb-3">
                                <label htmlFor="ano_semestre_ingresso" className="form-label">
                                    Ano/Semestre de Ingresso <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="ano_semestre_ingresso"
                                    name="ano_semestre_ingresso"
                                    value={formData.ano_semestre_ingresso}
                                    onChange={handleInputChange}
                                    placeholder="Ex: 2023.1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="motivo_solicitacao" className="form-label">
                                Motivo da Solicitação <span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-select"
                                id="motivo_solicitacao"
                                name="motivo_solicitacao"
                                value={formData.motivo_solicitacao}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selecione um motivo</option>
                                {isLoadingMotivos ? (
                                    <option disabled>Carregando motivos...</option>
                                ) : (
                                    motivosDesistencia.map((motivo) => (
                                        <option key={motivo.id} value={motivo.id}>
                                            {motivo.descricao}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="observacoes" className="form-label">
                                Observações
                            </label>
                            <textarea
                                className="form-control"
                                id="observacoes"
                                name="observacoes"
                                rows="4"
                                value={formData.observacoes}
                                onChange={handleInputChange}
                                placeholder="Informações adicionais sobre a solicitação..."
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="anexos" className="form-label">
                                Anexos (opcional)
                            </label>
                            <input
                                type="file"
                                className="form-control"
                                id="anexos"
                                name="anexos"
                                onChange={handleInputChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            <div className="form-text">
                                Formatos aceitos: PDF, DOC, DOCX, JPG, JPEG, PNG (máx. 10MB)
                            </div>
                        </div>

                        <div className="d-flex justify-content-between">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate(-1)}
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Voltar
                            </button>
                            
                            <button
                                type="submit"
                                className="btn btn-danger"
                                disabled={!aluno}
                            >
                                <i className="bi bi-send me-2"></i>
                                Enviar Solicitação
                            </button>
                        </div>
                    </form>

                    <PopupFeedback
                        isOpen={popupIsOpen}
                        onClose={() => setPopupIsOpen(false)}
                        message={msgErro}
                        tipo={tipoPopup}
                    />
                </main>
            </div>
        </FormPermissionWrapper>
    );
}

