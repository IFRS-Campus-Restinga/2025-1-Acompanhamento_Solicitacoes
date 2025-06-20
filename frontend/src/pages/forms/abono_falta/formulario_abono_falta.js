import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BuscaUsuario from "../../../components/busca_usuario";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
//import VerificadorDisponibilidade from "../../../pages/disponibilidade/VerificadorDisponibilidade";
//<VerificadorDisponibilidade tipoFormulario="ABONOFALTAS">

import "../../../components/styles/formulario.css";

// Serviços de autenticação
import { getAuthToken } from "../../../services/authUtils";

export default function FormularioAbonoFaltas() {
    // Estados para controle de usuário e aluno
    const [userData, setUserData] = useState(null);
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);
    const [aluno, setAluno] = useState(null);
    const [alunoNaoEncontrado, setAlunoNaoEncontrado] = useState(false);
    
    // Estados para curso e PPC
    const [curso, setCurso] = useState(null);
    const [ppc, setPpc] = useState(null);
    
    // Estados para disciplinas e motivos
    const [disciplinas, setDisciplinas] = useState([]);
    const [motivos, setMotivos] = useState([]);
    const [filtroDisciplina, setFiltroDisciplina] = useState("");
    const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);
    const [isLoadingMotivos, setIsLoadingMotivos] = useState(true);
    
    // Estado para o formulário
    const [formData, setFormData] = useState({
        matricula: "",
        curso: "",
        motivo_solicitacao_id: "",
        data_inicio_afastamento: "",
        data_fim_afastamento: "",
        anexos: null,
        acesso_moodle: false,
        perdeu_atividades: false,
        disciplinas_selecionadas: [],
    });
    
    // Estados para feedback e erros
    const [errors, setErrors] = useState({});
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [tipoPopup, setTipoPopup] = useState("sucesso");
    const [mensagemPopup, setMensagemPopup] = useState("");
    const [mostrarSelecaoDisciplinas, setMostrarSelecaoDisciplinas] = useState(false);
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

    // Redireciona se não houver usuário
    useEffect(() => {
        if (!carregandoUsuario && !userData) {
            navigate("/");
        }
    }, [carregandoUsuario, userData, navigate]);

    // Busca aluno pelo e-mail quando userData estiver disponível
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

                if (res.data) {
                    const usuarioEncontrado = res.data;
                    console.log("Usuário encontrado na API:", usuarioEncontrado);

                    // Verifique se o usuário tem um objeto Aluno associado (grupo_detalhes)
                    if (usuarioEncontrado?.grupo_detalhes) {
                        const alunoReal = usuarioEncontrado.grupo_detalhes;
                        console.log("Objeto Aluno encontrado (grupo_detalhes):", alunoReal);

                        setAluno(alunoReal);
                        setAlunoNaoEncontrado(false);
                        
                        // Atualizar o estado formData com os dados do aluno
                        setFormData(prev => ({
                            ...prev,
                            matricula: alunoReal.matricula || "",
                            curso: alunoReal.curso_codigo || ""
                        }));

                        // Buscar dados do curso e PPC após obter aluno
                        if (alunoReal?.curso_codigo) {
                            buscarDadosCurso(alunoReal.curso_codigo);
                        }
                        
                        if (alunoReal?.ppc_codigo) {
                            buscarDadosPpc(alunoReal.ppc_codigo);
                        }
                    } else {
                        console.error("Usuário encontrado, mas sem dados de Aluno (grupo_detalhes).");
                        setAlunoNaoEncontrado(true);
                        setMensagemPopup("Dados de aluno não encontrados para este usuário.");
                        setTipoPopup("erro");
                        setPopupIsOpen(true);
                    }
                } else {
                    setAlunoNaoEncontrado(true);
                    setMensagemPopup("Aluno não encontrado no sistema.");
                    setTipoPopup("erro");
                    setPopupIsOpen(true);
                }
            } catch (err) {
                console.error("Erro ao buscar aluno:", err.response?.data || err.message);
                setAlunoNaoEncontrado(true);
                setMensagemPopup(err.response?.data?.message || "Erro ao buscar dados do aluno");
                setTipoPopup("erro");
                setPopupIsOpen(true);
            }
        };

        if (userData?.email && !buscouAlunoRef.current) {
            buscouAlunoRef.current = true;
            buscarAluno();
        }
    }, [userData]);

    // Buscar dados do curso
    const buscarDadosCurso = async (codigoCurso) => {
        try {
            console.log("Buscando dados do curso:", codigoCurso);
            const token = getAuthToken();
            const res = await axios.get(`http://localhost:8000/solicitacoes/cursos/${codigoCurso}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Dados do curso:", res.data);
            setCurso(res.data);
        } catch (error) {
            console.error("Erro ao buscar dados do curso:", error);
            setMensagemPopup("Erro ao buscar dados do curso.");
            setTipoPopup("erro");
            setPopupIsOpen(true);
        }
    };

    // Buscar dados do PPC
    const buscarDadosPpc = async (codigoPpc) => {
        try {
            console.log("Buscando dados do PPC:", codigoPpc);
            const token = getAuthToken();
            const res = await axios.get(`http://localhost:8000/solicitacoes/ppcs/${codigoPpc}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Dados do PPC:", res.data);
            setPpc(res.data);
            
            // Buscar disciplinas do PPC
            buscarDisciplinas(codigoPpc);
        } catch (error) {
            console.error("Erro ao buscar dados do PPC:", error);
            setMensagemPopup("Erro ao buscar dados do PPC.");
            setTipoPopup("erro");
            setPopupIsOpen(true);
        }
    };

    // Buscar disciplinas do PPC
    const buscarDisciplinas = async (ppcCodigo) => {
        if (!ppcCodigo) return;
        
        setIsLoadingDisciplinas(true);
        
        try {
            console.log(`Buscando disciplinas para o PPC ${ppcCodigo}`);
            const token = getAuthToken();
            const res = await axios.get(`http://localhost:8000/solicitacoes/disciplinas/?ppc_id=${encodeURIComponent(ppcCodigo)}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (res.data && res.data.length > 0) {
                console.log("Disciplinas encontradas:", res.data);
                setDisciplinas(res.data);
            } else {
                console.log("Nenhuma disciplina encontrada para este PPC");
                setDisciplinas([]);
            }
        } catch (error) {
            console.error("Erro ao buscar disciplinas:", error.response?.data || error.message);
            setDisciplinas([]);
        } finally {
            setIsLoadingDisciplinas(false);
        }
    };

    // Carregar motivos de abono
    useEffect(() => {
        const buscarMotivos = async () => {
            try {
                const token = getAuthToken();
                const res = await axios.get("http://localhost:8000/solicitacoes/motivo_abono/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMotivos(res.data);
                setIsLoadingMotivos(false);
            } catch (err) {
                console.error("Erro ao buscar motivos:", err);
                setMensagemPopup("Erro ao buscar motivos de abono.");
                setTipoPopup("erro");
                setPopupIsOpen(true);
                setIsLoadingMotivos(false);
            }
        };
        
        buscarMotivos();
    }, []);

    // Validar formulário
    const validateForm = () => {
        const newErrors = {};
        if (!formData.motivo_solicitacao_id) newErrors.motivo_solicitacao_id = "Motivo é obrigatório.";
        if (!formData.data_inicio_afastamento) newErrors.data_inicio_afastamento = "Data inicial é obrigatória.";
        if (!formData.data_fim_afastamento) newErrors.data_fim_afastamento = "Data final é obrigatória.";

        if (formData.data_inicio_afastamento && formData.data_fim_afastamento && 
            formData.data_inicio_afastamento > formData.data_fim_afastamento) {
            newErrors.data_fim_afastamento = "Data final não pode ser anterior à data inicial.";
        }
        
        if (!formData.matricula) newErrors.matricula = "Matrícula é obrigatória."; 
        if (!formData.curso) newErrors.curso = "Curso é obrigatório.";
        
        if (formData.perdeu_atividades && 
            (!formData.disciplinas_selecionadas || formData.disciplinas_selecionadas.length === 0)) {
            newErrors.disciplinas_selecionadas = "Selecione as disciplinas em que perdeu atividades.";
        }

        return newErrors;
    };

    // Manipular mudanças nos campos do formulário
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === "checkbox") {
            if (name === "disciplinas_selecionadas") {
                setFormData(prev => ({
                    ...prev,
                    disciplinas_selecionadas: checked
                        ? [...prev.disciplinas_selecionadas, value] 
                        : prev.disciplinas_selecionadas.filter(id => id !== value)
                }));
            } else {
                setFormData(prev => ({ ...prev, [name]: checked }));
                if (name === "perdeu_atividades") {
                    setMostrarSelecaoDisciplinas(checked);
                    if (!checked) {
                        setFormData(prev => ({ ...prev, disciplinas_selecionadas: [] }));
                    }
                }
            }
        } else if (type === "file") {
            if (files.length > 5) {
                setErrors(prev => ({ ...prev, anexos: "Você pode anexar no máximo 5 arquivos." }));
                e.target.value = null; 
                setFormData(prev => ({ ...prev, anexos: null }));
            } else {
                setFormData(prev => ({ ...prev, anexos: files }));
                if (errors.anexos) setErrors(prev => ({ ...prev, anexos: null }));
            }
        } else if (type === "select-multiple") {
            const selectedValues = Array.from(e.target.options)
                .filter(option => option.selected)
                .map(option => option.value);
            setFormData(prev => ({ ...prev, [name]: selectedValues }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Enviar formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setMensagemPopup("Por favor, corrija os erros indicados no formulário.");
            setTipoPopup("erro");
            setPopupIsOpen(true);
            return;
        }

        if (!aluno) {
            setMensagemPopup("Por favor, aguarde o carregamento dos dados do aluno.");
            setTipoPopup("erro");
            setPopupIsOpen(true);
            return;
        }
        
        setIsSubmitting(true);
        setErrors({});

        const dataToSubmit = new FormData();

        // Adicionar campos obrigatórios
        dataToSubmit.append("aluno_email", userData.email);
        dataToSubmit.append("aluno_nome", aluno.nome || userData.name);
        dataToSubmit.append("curso_codigo", formData.curso);
        dataToSubmit.append("matricula", formData.matricula);
        dataToSubmit.append("motivo_solicitacao_id", formData.motivo_solicitacao_id);
        dataToSubmit.append("data_inicio_afastamento", formData.data_inicio_afastamento);
        dataToSubmit.append("data_fim_afastamento", formData.data_fim_afastamento);
        dataToSubmit.append("acesso_moodle", formData.acesso_moodle);
        dataToSubmit.append("perdeu_atividades", formData.perdeu_atividades);
        dataToSubmit.append("data_solicitacao", new Date().toISOString().split('T')[0]);
        dataToSubmit.append("nome_formulario", "ABONOFALTAS");

        // Adicionar disciplinas selecionadas
        if (formData.disciplinas_selecionadas && formData.disciplinas_selecionadas.length > 0) {
            dataToSubmit.append("disciplinas_selecionadas", JSON.stringify(formData.disciplinas_selecionadas));
        }

        // Adicionar anexos se existirem
        if (formData.anexos) {
            for (let i = 0; i < formData.anexos.length; i++) {
                dataToSubmit.append("anexos", formData.anexos[i]);
            }
        }

        console.log("Dados que serão enviados:", Object.fromEntries(dataToSubmit.entries()));

        try {
            const token = getAuthToken();
            const response = await axios.post(
                "http://localhost:8000/solicitacoes/formulario_abono_falta/", 
                dataToSubmit, 
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    },
                }
            );

            console.log("Resposta da API:", response.data);
            setMensagemPopup("Solicitação de Abono de Faltas enviada com sucesso!");
            setTipoPopup("sucesso");
            setPopupIsOpen(true);
            setTimeout(() => navigate("/aluno/minhas-solicitacoes"), 2000);
        } catch (error) {
            console.error("Erro ao enviar solicitação:", error.response?.data || error.message);
            setMensagemPopup(error.response?.data?.message || "Erro ao enviar solicitação");
            setTipoPopup("erro");
            setPopupIsOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filtrar disciplinas com base na busca
    const disciplinasFiltradas = disciplinas.filter(disciplina =>
        disciplina.nome.toLowerCase().includes(filtroDisciplina.toLowerCase()) ||
        disciplina.codigo.toLowerCase().includes(filtroDisciplina.toLowerCase())
    );

    // Renderização condicional durante carregamento
    if (carregandoUsuario) {
        return (
            <>
                <BuscaUsuario dadosUsuario={handleUsuario} />
                <main className="container">
                    <p>Carregando usuário...</p>
                </main>
            </>
        );
    }

    // Renderização quando aluno não é encontrado
    if (userData && alunoNaoEncontrado) {
        return (
            <div className="page-container">
                <main className="container">
                    <h2>Aluno não encontrado no sistema.</h2>
                    <p>Verifique se o e-mail está corretamente vinculado a um aluno.</p>
                </main>
                {popupIsOpen && (
                    <PopupFeedback
                        mensagem={mensagemPopup}
                        tipo={tipoPopup}
                        onClose={() => setPopupIsOpen(false)}
                    />
                )}
            </div>
        );
    }

    // Renderização do formulário completo
    if (userData && aluno) {
        return (
                <div className="page-container">
                    <BuscaUsuario dadosUsuario={handleUsuario} />
                    <main className="container">
                        <h2>Solicitação de Abono de Faltas</h2>
                        <br></br>
                        <h6 className="descricao-formulario">
                            Os procedimentos e regramentos das Justificativas/ Abono de faltas e de Avaliação substitutiva são regulamentos 
                            pelos artigos 137 a 140 da Organização Didática do IFRS. <br></br>
                            <hr></hr>
                            <p>(disponível em: <a className="link-documento" href="https://ifrs.edu.br/wp-content/uploads/2024/01/ANEXO_RES_1-2024_OD_VERSAO_FINAL_JAN.2024.pdf">https://ifrs.edu.br/wp-content/uploads/2024/01/ANEXO_RES_1-2024_OD_VERSAO_FINAL_JAN.2024.pdf</a>)</p>
                        </h6>
                        
                        <form className="formulario formulario-largura" onSubmit={handleSubmit}>

                        <div className="dados-aluno-container">
                            <div className="form-group">
                                <label>Nome:</label>
                                <input type="text" value={aluno?.nome || userData?.name || ""} readOnly />
                            </div>
                            <div className="form-group">
                                <label>E-mail:</label>
                                <input type="email" value={userData?.email || ""} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Matrícula:</label>
                                <input type="text" value={formData.matricula} readOnly />
                            </div>
                            
                            <div className="form-group">
                                <label>Curso:</label>
                                <input type="text" value={curso?.nome || "Carregando..."} readOnly />
                            </div>
                        </div>

                            <div className="form-group">
                                <label htmlFor="motivo_solicitacao_id">Motivo da Solicitação:</label>
                                <select
                                    id="motivo_solicitacao_id"
                                    name="motivo_solicitacao_id"
                                    value={formData.motivo_solicitacao_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Selecione o motivo</option>
                                    {motivos.map(motivo => (
                                        <option key={motivo.id} value={motivo.id}>
                                            {motivo.descricao}
                                        </option>
                                    ))}
                                </select>
                                {errors.motivo_solicitacao_id && <div className="erro">{errors.motivo_solicitacao_id}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="data_inicio_afastamento">Data Inicial do Afastamento:</label>
                                <input
                                    type="date"
                                    id="data_inicio_afastamento"
                                    name="data_inicio_afastamento"
                                    value={formData.data_inicio_afastamento}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.data_inicio_afastamento && <div className="erro">{errors.data_inicio_afastamento}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="data_fim_afastamento">Data Final do Afastamento:</label>
                                <input
                                    type="date"
                                    id="data_fim_afastamento"
                                    name="data_fim_afastamento"
                                    value={formData.data_fim_afastamento}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.data_fim_afastamento && <div className="erro">{errors.data_fim_afastamento}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="acesso_moodle"
                                        checked={formData.acesso_moodle}
                                        onChange={handleChange}
                                    />
                                    <span> Tive acesso ao Moodle durante o período de afastamento</span>
                                </label>
                            </div>
                            
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="perdeu_atividades"
                                        checked={formData.perdeu_atividades}
                                        onChange={handleChange}
                                    />
                                    <span> Perdi atividades avaliativas durante o período de afastamento</span>
                                </label>
                            </div>
                            
                            {mostrarSelecaoDisciplinas && (
                                <div className="form-group">
                                    <label>Disciplinas em que perdeu atividades:</label>
                                    <div className="barra-pesquisa">
                                        <i className="bi bi-search icone-pesquisa"></i>
                                        <input
                                            type="text"
                                            placeholder="Buscar disciplinas..."
                                            value={filtroDisciplina}
                                            onChange={(e) => setFiltroDisciplina(e.target.value)}
                                            className="input-pesquisa"
                                            disabled={isLoadingDisciplinas || disciplinas.length === 0}
                                            style={{ paddingLeft: '30px', height: '38px' }} 
                                        />
                                    </div>
                                    
                                    {isLoadingDisciplinas ? (
                                        <p>Carregando disciplinas...</p>
                                    ) : (
                                        <>
                                            <div className="disciplinas-checkbox-container">
                                                {disciplinasFiltradas.length > 0 ? (
                                                    disciplinasFiltradas.map((disciplina) => (
                                                        <div key={disciplina.codigo} className="disciplina-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                id={`disciplina-${disciplina.codigo}`}
                                                                name="disciplinas_selecionadas"
                                                                value={disciplina.codigo}
                                                                checked={formData.disciplinas_selecionadas.includes(disciplina.codigo)}
                                                                onChange={handleChange}
                                                            />
                                                            <label htmlFor={`disciplina-${disciplina.codigo}`}>
                                                                {disciplina.nome} ({disciplina.codigo})
                                                            </label>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="aviso">Nenhuma disciplina encontrada.</div>
                                                )}
                                            </div>
                                            {errors.disciplinas_selecionadas && (
                                                <div className="erro">{errors.disciplinas_selecionadas}</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label htmlFor="anexos">Anexos:</label>
                                <input
                                    type="file"
                                    id="anexos"
                                    name="anexos"
                                    onChange={handleChange}
                                    multiple
                                    required
                                />
                                <small>Anexe documentos comprobatórios (atestados, declarações, etc.). Máximo 5 arquivos.</small>
                                {errors.anexos && <div className="erro">{errors.anexos}</div>}
                            </div>
                            
                            <button 
                                type="submit" 
                                className="submit-button" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Enviando..." : "Enviar"}
                            </button>
                        </form>
                    </main>
                    {popupIsOpen && (
                        <PopupFeedback
                            mensagem={mensagemPopup}
                            tipo={tipoPopup}
                            onClose={() => setPopupIsOpen(false)}
                        />
                    )}
                </div>
        );
    }

    return null;
}
