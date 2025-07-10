import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BuscaUsuario from "../../../components/busca_usuario";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
import BotaoEnviarSolicitacao from '../../../components/UI/botoes/botao_enviar_solicitacao';
import { getAuthToken, getCookie } from "../../../services/authUtils"; // Importe getCookie

//CSS
import "../../../components/styles/formulario.css";
import "../../../components/UI/selecao/selecoes.css";

export default function FormularioDesistenciaVaga() {
    // Estados para controle de usuário e aluno
    const [userData, setUserData] = useState(null);
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);
    const [aluno, setAluno] = useState(null);
    const [alunoNaoEncontrado, setAlunoNaoEncontrado] = useState(false);
    const [userRole, setUserRole] = useState(null); // Novo estado para a role do usuário
    
    // Estados para dados do backend
    const [cursos, setCursos] = useState([]);
    const [motivosDesistencia, setMotivosDesistencia] = useState([]);
    const [isLoadingCursos, setIsLoadingCursos] = useState(true);
    const [isLoadingMotivos, setIsLoadingMotivos] = useState(true);
    
    // Estado para o formulário
    const [formData, setFormData] = useState({
     // Dados pessoais (obrigatórios para todos)
        nome_completo: "",
        email: "",
        cpf: "",
        
        // Curso (obrigatório)
        curso: "",
        
        // Motivo da desistência
        motivo_desistencia: "",
        descricao_motivo: "",
        
        // Informações adicionais
        recebe_auxilio_estudantil: false,
        menor_idade: false,
        
        // Documentos obrigatórios
        declaracao_biblioteca: null,
        atestado_vaga_nova_escola: null,
        doc_identificacao_responsavel: null,
        
        // Declaração final
        declaracao_final_acordo: false
    });
    
     // Estados para feedback e erros
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [msgErro, setMsgErro] = useState("");
    const [tipoPopup, setTipoPopup] = useState("sucesso");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Referência para controlar busca única
    const buscouAlunoRef = useRef(false);
    const navigate = useNavigate();

    // Callback para o BuscaUsuario
    const handleUsuario = useCallback((data) => {
        console.log("BuscaUsuario retornou:", data);
        setUserData(data);
        setCarregandoUsuario(false);
    }, []);

   // Redireciona se não houver usuário ou define a role
    useEffect(() => {
        if (!carregandoUsuario) {
            const role = getCookie('userRole');
            setUserRole(role);
            console.log("User Role detectada:", role);

            if (!userData) {
                if (role !== 'externo' && role !== 'responsavel') {
                    navigate("/");
                }
            } else {
                // Preenche dados iniciais baseados no userData
                if (role === 'externo' || role === 'responsavel') {
                    setFormData(prev => ({
                        ...prev,
                        nome_completo: userData.name || "",
                        email: userData.email || ""
                    }));
                }
            }
        }
    }, [carregandoUsuario, userData, navigate]);

    useEffect(() => {
        const buscarAluno = async () => {
            try {
                console.log("Buscando aluno pelo e-mail:", userData.email);
                const token = getAuthToken();
                const res = await axios.get(`http://localhost:8000/solicitacoes/usuarios/buscar-por-email/${userData.email}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data?.grupo_detalhes) {
                    const alunoReal = res.data.grupo_detalhes;
                    console.log("Objeto Aluno encontrado:", alunoReal);

                    setAluno(alunoReal);
                    setAlunoNaoEncontrado(false);

                    // Preenche dados do aluno automaticamente
                    setFormData(prev => ({
                        ...prev,
                        nome_completo: alunoReal.nome || userData.name || "",
                        email: userData.email || "",
                        cpf: alunoReal.cpf || "",
                        curso: alunoReal.curso_codigo || ""
                    }));
                } else {
                    console.error("Usuário encontrado, mas sem dados de Aluno.");
                    setAlunoNaoEncontrado(true);
                    setMsgErro("Dados de aluno não encontrados para este usuário.");
                    setTipoPopup("erro");
                    setPopupIsOpen(true);
                }
            } catch (err) {
                console.error("Erro ao buscar aluno:", err.response?.data || err.message);
                setAlunoNaoEncontrado(true);
                setMsgErro(err.response?.data?.message || "Erro ao buscar dados do aluno");
                setTipoPopup("erro");
                setPopupIsOpen(true);
            }
        };

        if (userData?.email && userRole === 'aluno' && !buscouAlunoRef.current) {
            buscouAlunoRef.current = true;
            buscarAluno();
        }
    }, [userData, userRole]);

 // Buscar lista de cursos
    useEffect(() => {
        const buscarCursos = async () => {
            try {
                const res = await axios.get("http://localhost:8000/solicitacoes/cursos");
                setCursos(res.data);
                setIsLoadingCursos(false);
            } catch (err) {
                console.error("Erro ao buscar cursos:", err);
                setMsgErro("Erro ao buscar lista de cursos.");
                setTipoPopup("erro");
                setPopupIsOpen(true);
                setIsLoadingCursos(false);
            }
        };

        buscarCursos();
    }, []);

    // Buscar motivos de desistência
    useEffect(() => {
        const buscarMotivosDesistencia = async () => {
            try {
                const token = getAuthToken();
                const res = await axios.get("http://localhost:8000/solicitacoes/motivos-desistencia/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMotivosDesistencia(res.data);
                setIsLoadingMotivos(false);
            } catch (err) {
                console.error("Erro ao buscar motivos de desistência:", err);
                setMsgErro("Erro ao buscar motivos de desistência.");
                setTipoPopup("erro");
                setPopupIsOpen(true);
                setIsLoadingMotivos(false);
            }
        };

        buscarMotivosDesistencia();
    }, []);

     // Manipular mudanças nos campos do formulário
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === "file") {
            setFormData(prev => ({
                ...prev,
                [name]: files[0] // Apenas um arquivo por campo
            }));
        } else if (type === "checkbox") {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Validações do formulário
    const validarFormulario = () => {
        // Campos obrigatórios
        if (!formData.nome_completo.trim()) {
            return "Nome completo é obrigatório.";
        }
        if (!formData.email.trim()) {
            return "E-mail é obrigatório.";
        }
        if (!formData.cpf.trim()) {
            return "CPF é obrigatório.";
        }
        if (!formData.curso) {
            return "Curso é obrigatório.";
        }
        if (!formData.motivo_desistencia) {
            return "Motivo da desistência é obrigatório.";
        }
        if (!formData.descricao_motivo.trim()) {
            return "Descrição do motivo é obrigatória.";
        }
        if (!formData.declaracao_biblioteca) {
            return "Certidão de nada consta da biblioteca é obrigatória.";
        }
        if (!formData.declaracao_final_acordo) {
            return "É necessário aceitar a declaração final.";
        }

        // Validações condicionais
        const motivoSelecionado = motivosDesistencia.find(m => m.id == formData.motivo_desistencia);
        if (motivoSelecionado && motivoSelecionado.descricao.toLowerCase().includes('transferência')) {
            if (!formData.atestado_vaga_nova_escola) {
                return "Atestado de vaga na nova escola é obrigatório para transferências.";
            }
        }

        if (formData.menor_idade && !formData.doc_identificacao_responsavel) {
            return "Documento de identificação do responsável é obrigatório para menores de idade.";
        }

        // Validação de CPF (formato básico)
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        if (!cpfRegex.test(formData.cpf)) {
            return "CPF deve estar no formato XXX.XXX.XXX-XX.";
        }

        return null;
    };

    // Enviar formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const erroValidacao = validarFormulario();
        if (erroValidacao) {
            setMsgErro(erroValidacao);
            setTipoPopup("erro");
            setPopupIsOpen(true);
            return;
        }

        setIsSubmitting(true);
        
        try {
            const dataToSubmit = new FormData();
            
            // Dados pessoais
            dataToSubmit.append("nome_completo", formData.nome_completo);
            dataToSubmit.append("email", formData.email);
            dataToSubmit.append("cpf", formData.cpf);
            
            // Curso e motivo
            dataToSubmit.append("curso", formData.curso);
            dataToSubmit.append("motivo_desistencia", formData.motivo_desistencia);
            dataToSubmit.append("descricao_motivo", formData.descricao_motivo);
            
            // Informações adicionais
            dataToSubmit.append("recebe_auxilio_estudantil", formData.recebe_auxilio_estudantil);
            dataToSubmit.append("menor_idade", formData.menor_idade);
            dataToSubmit.append("declaracao_final_acordo", formData.declaracao_final_acordo);
            
            // Documentos
            if (formData.declaracao_biblioteca) {
                dataToSubmit.append("declaracao_biblioteca", formData.declaracao_biblioteca);
            }
            if (formData.atestado_vaga_nova_escola) {
                dataToSubmit.append("atestado_vaga_nova_escola", formData.atestado_vaga_nova_escola);
            }
            if (formData.doc_identificacao_responsavel) {
                dataToSubmit.append("doc_identificacao_responsavel", formData.doc_identificacao_responsavel);
            }
            
            // Identificação do solicitante
            if (userRole === 'aluno' && aluno) {
                dataToSubmit.append("aluno_id", aluno.id);
            } else if ((userRole === 'externo' || userRole === 'responsavel') && userData?.id) {
                dataToSubmit.append("usuario_id", userData.id);
            }
            
            const token = getAuthToken();
            const response = await axios.post(
                "http://localhost:8000/solicitacoes/formularios/desistencia-vaga/",
                dataToSubmit,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    },
                }
            );
            
            setMsgErro("Formulário de desistência enviado com sucesso!");
            setTipoPopup("sucesso");
            setPopupIsOpen(true);
            
            // Redirecionar após 2 segundos
            setTimeout(() => navigate("/todas-solicitacoes"), 2000);
        } catch (error) {
            console.error("Erro no envio:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.details || 
                               error.response?.data?.error || 
                               error.response?.data?.message || 
                               "Erro ao enviar formulário";
            setMsgErro(errorMessage);
            setTipoPopup("erro");
            setPopupIsOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renderização condicional durante carregamento
    if (carregandoUsuario || userRole === null) {
        return (
            <>
                <BuscaUsuario dadosUsuario={handleUsuario} />
                <main className="container">
                    <div className="loading-container">
                        <p>Carregando usuário e permissões...</p>
                    </div>
                </main>
            </>
        );
    }

    // Renderização quando aluno não é encontrado E a role é 'aluno'
    if (userData && userRole === 'aluno' && alunoNaoEncontrado) {
        return (
            <div className="page-container">
                <main className="container">
                    <div className="error-container">
                        <h2>Aluno não encontrado no sistema</h2>
                        <p>Verifique se o e-mail está corretamente vinculado a um aluno.</p>
                    </div>
                </main>
                {popupIsOpen && (
                    <PopupFeedback
                        mensagem={msgErro}
                        tipo={tipoPopup}
                        onClose={() => setPopupIsOpen(false)}
                    />
                )}
            </div>
        );
    }
    // Renderização do formulário completo
    // Renderiza se for aluno e aluno carregado, OU se for externo e userData carregado
    if ((userRole === 'aluno' && aluno) || (userRole === 'externo' || userRole === 'responsavel') && userData) {
        return (
            <div className="page-container">
                <BuscaUsuario dadosUsuario={handleUsuario} />
                <main className="container">
                    <h2>Solicitação de Desistência de Vaga</h2>
                    <br></br>
                    <h6 className="descricao-formulario">
                        Ao preencher este formulário,<strong> desisto</strong> formalmente da minha vaga no IFRS Campus Restinga, <br></br>
                        conforme informações abaixo prestadas.
                    </h6>

                    <form className="formulario formulario-largura" onSubmit={handleSubmit}>

                        <div className="dados-aluno-container">
                            <div className="form-group">
                                <label>E-mail:<span className="obrigatorio">*</span></label>
                                <input 
                                        type="email" 
                                        id="email"
                                        name="email"
                                        value={formData.email} 
                                        onChange={handleChange}
                                        readOnly={userRole === 'aluno'}
                                        required
                                />
                            </div>

                            <div className="form-group">
                                <label>Nome Completo:<span className="obrigatorio">*</span></label>
                                <input  
                                    id="nome_completo"
                                    type="text"
                                    name="nome_completo"
                                    value={formData.nome_completo} 
                                    onChange={handleChange}
                                    readOnly={userRole === 'aluno'}
                                    required
                                />
                            </div>    
                             <div className="form-group">
                                <label htmlFor="cpf">CPF: <span className="obrigatorio">*</span></label>
                                <input 
                                    type="text" 
                                    id="cpf"
                                    name="cpf"
                                    value={formData.cpf} 
                                    onChange={handleChange}
                                    placeholder="XXX.XXX.XXX-XX"
                                    readOnly={userRole === 'aluno' && formData.cpf}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="curso">Curso: <span className="obrigatorio">*</span></label>
                                <select
                                    id="curso"
                                    name="curso"
                                    value={formData.curso}
                                    onChange={handleChange}
                                    disabled={userRole === 'aluno' || isLoadingCursos}
                                    required>
                                    <option value="">Selecione o curso</option>
                                    {cursos.map(curso => (
                                        <option key={curso.codigo} value={curso.codigo}>
                                            {curso.nome_completo || `${curso.nome} - ${curso.tipo_curso_display}`}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingCursos && <small>Carregando cursos...</small>}
                            </div>
                        </div>
                    
                        <div className="form-group">
                            <label htmlFor="motivo_solicitacao">Motivo da Solicitação: <span className="obrigatorio">*</span></label>
                            <select
                                id="motivo_solicitacao"
                                name="motivo_solicitacao"
                                value={formData.motivo_solicitacao}
                                onChange={handleChange}
                                required>
                                <option value="">Selecione o motivo</option>
                                {motivosDesistencia.map(motivo => (
                                    <option key={motivo.id} value={motivo.id}>
                                        {motivo.descricao}
                                    </option>
                                ))}
                            </select>
                        </div>

                         <div className="form-group">
                                <label htmlFor="descricao_motivo">Descrição do motivo: <span className="obrigatorio">*</span></label>
                                <textarea
                                    id="descricao_motivo"
                                    name="descricao_motivo"
                                    value={formData.descricao_motivo}
                                    onChange={handleChange}
                                    placeholder="Descreva detalhadamente o motivo da sua desistência"
                                    rows="4"
                                    required
                                />
                        </div>

                        <div className="form-group checkbox-group">
                                <label htmlFor="recebe_auxilio_estudantil">Recebe auxílio estudantil? <span className="obrigatorio">*</span></label>
                                <div className="radio-group">
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="recebe_auxilio_estudantil"
                                            value="true"
                                            checked={formData.recebe_auxilio_estudantil === true}
                                            onChange={(e) => setFormData(prev => ({...prev, recebe_auxilio_estudantil: true}))}
                                        />
                                        <span className="radio-text">Sim</span>
                                    </label>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="recebe_auxilio_estudantil"
                                            value="false"
                                            checked={formData.recebe_auxilio_estudantil === false}
                                            onChange={(e) => setFormData(prev => ({...prev, recebe_auxilio_estudantil: false}))}
                                        />
                                        <span className="radio-text">Não</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label htmlFor="menor_idade">Você é menor de idade (menor de 18 anos)? <span className="obrigatorio">*</span></label>
                                <div className="radio-group">
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="menor_idade"
                                            value="true"
                                            checked={formData.menor_idade === true}
                                            onChange={(e) => setFormData(prev => ({...prev, menor_idade: true}))}
                                        />
                                        <span className="radio-text">Sim</span>
                                    </label>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="menor_idade"
                                            value="false"
                                            checked={formData.menor_idade === false}
                                            onChange={(e) => setFormData(prev => ({...prev, menor_idade: false}))}
                                        />
                                        <span className="radio-text">Não</span>
                                    </label>
                                </div>
                            </div>
                             
                            <div className="form-group">
                                <label htmlFor="declaracao_biblioteca">
                                    Certidão de nada consta da Biblioteca: <span className="obrigatorio">*</span>
                                </label>
                                <input
                                    type="file"
                                    id="declaracao_biblioteca"
                                    name="declaracao_biblioteca"
                                    onChange={handleChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    required
                                />
                                <small>Faça upload de 1 arquivo aceito. O tamanho máximo é de 10 MB.</small>
                            </div>

                            {/* Documento condicional para transferências */}
                            {motivosDesistencia.find(m => m.id == formData.motivo_desistencia)?.descricao.toLowerCase().includes('transferência') && (
                                <div className="form-group">
                                    <label htmlFor="atestado_vaga_nova_escola">
                                        Atestado de vaga na nova escola: <span className="obrigatorio">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        id="atestado_vaga_nova_escola"
                                        name="atestado_vaga_nova_escola"
                                        onChange={handleChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        required
                                    />
                                    <small>Obrigatório para transferências. Tamanho máximo: 10 MB.</small>
                                </div>
                            )}

                            {/* Documento condicional para menores de idade */}
                            {formData.menor_idade && (
                                <div className="form-group">
                                    <label htmlFor="doc_identificacao_responsavel">
                                        Documento de identificação do responsável legal: <span className="obrigatorio">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        id="doc_identificacao_responsavel"
                                        name="doc_identificacao_responsavel"
                                        onChange={handleChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        required
                                    />
                                    <small>Obrigatório para menores de idade. Tamanho máximo: 10 MB.</small>
                                </div>
                            )}

                        {/* Seção: Declaração Final */}
                        <div className="secao-formulario declaracao-final">
                            <h3>DECLARAÇÃO FINAL</h3>
                            <div className="declaracao-box">
                                <p>
                                    <strong>DECLARO</strong>, para fins de direito, sob as penas da lei, que as informações prestadas 
                                    e documentos comprobatórios são verdadeiros e autênticos.
                                    Nada mais havendo a declarar e ciente das responsabilidades pelas declarações 
                                    prestadas, firmo o presente.
                                </p>
                                
                                <div className="form-group checkbox-group">
                                    <label className="checkbox-option">
                                        <input
                                            type="checkbox"
                                            name="declaracao_final_acordo"
                                            checked={formData.declaracao_final_acordo}
                                            onChange={handleChange}
                                            required
                                        />
                                        <span className="checkbox-text">De acordo</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="anexos">Anexos:</label>
                            <input
                                type="file"
                                id="anexos"
                                name="anexos"
                                onChange={handleChange}
                                multiple
                            />
                            <small>Selecione os documentos comprobatórios para a desistência.</small>
                        </div>

                    {/* Botão de envio */}
                  <BotaoEnviarSolicitacao isSubmitting={isSubmitting}/>
                        
                    </form>
                </main>
                {popupIsOpen && (
                    <PopupFeedback
                        mensagem={msgErro}
                        tipo={tipoPopup}
                        onClose={() => setPopupIsOpen(false)}
                    />
                )}
            </div>
        );
    }

    return null;
}
