import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BuscaUsuario from "../../../components/busca_usuario";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";
//import VerificadorDisponibilidade from "../../../pages/disponibilidade/VerificadorDisponibilidade";

// Serviços de autenticação
import { getAuthToken } from "../../../services/authUtils";

export default function FormularioDispensaEdFisica() {
    // Estados para controle de usuário e aluno
    const [userData, setUserData] = useState(null);
    const [carregandoUsuario, setCarregandoUsuario] = useState(true);
    const [aluno, setAluno] = useState(null);
    const [alunoNaoEncontrado, setAlunoNaoEncontrado] = useState(false);
    
    // Estados para curso e PPC
    const [curso, setCurso] = useState(null);
    const [ppc, setPpc] = useState(null);
    
    // Estados para motivos de dispensa
    const [motivosDispensa, setMotivosDispensa] = useState([]);
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

                        // Buscar dados do curso e PPC após obter aluno
                        if (alunoReal?.curso_codigo) {
                            buscarDadosCurso(alunoReal.curso_codigo);
                        }
                        
                        if (alunoReal?.ppc_codigo) {
                            buscarDadosPpc(alunoReal.ppc_codigo);
                        }
                        
                        // Preencher o ano/semestre de ingresso se disponível
                        if (alunoReal?.ano_ingresso) {
                            setFormData(prev => ({
                                ...prev,
                                ano_semestre_ingresso: alunoReal.ano_ingresso
                            }));
                        }
                        
                        // Preencher a turma se disponível
                        if (alunoReal?.turma) {
                            setFormData(prev => ({
                                ...prev,
                                turma: alunoReal.turma
                            }));
                        }
                    } else {
                        console.error("Usuário encontrado, mas sem dados de Aluno (grupo_detalhes).");
                        setAlunoNaoEncontrado(true);
                        setMsgErro("Dados de aluno não encontrados para este usuário.");
                        setTipoPopup("erro");
                        setPopupIsOpen(true);
                    }
                } else {
                    setAlunoNaoEncontrado(true);
                    setMsgErro("Aluno não encontrado no sistema.");
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
            setMsgErro("Erro ao buscar dados do curso.");
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
        } catch (error) {
            console.error("Erro ao buscar dados do PPC:", error);
            setMsgErro("Erro ao buscar dados do PPC.");
            setTipoPopup("erro");
            setPopupIsOpen(true);
        }
    };

    // Carregar motivos de dispensa
    useEffect(() => {
        const buscarMotivosDispensa = async () => {
            try {
                const token = getAuthToken();
                const res = await axios.get("http://localhost:8000/solicitacoes/motivo_dispensa/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMotivosDispensa(res.data);
                setIsLoadingMotivos(false);
            } catch (err) {
                console.error("Erro ao buscar motivos de dispensa:", err);
                setMsgErro("Erro ao buscar motivos de dispensa.");
                setTipoPopup("erro");
                setPopupIsOpen(true);
                setIsLoadingMotivos(false);
            }
        };
        
        buscarMotivosDispensa();
    }, []);

    // Manipular mudanças nos campos do formulário
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        
        if (type === "file") {
            setFormData(prev => ({
                ...prev,
                anexos: files
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Enviar formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!aluno) {
            setMsgErro("Por favor, aguarde o carregamento dos dados do aluno.");
            setTipoPopup("erro");
            setPopupIsOpen(true);
            return;
        }
        
        if (!formData.motivo_solicitacao) {
            setMsgErro("O motivo da solicitação é obrigatório.");
            setTipoPopup("erro");
            setPopupIsOpen(true);
            return;
        }
        
        try {
            const dataToSubmit = new FormData();
            
            // Adicionar ID do aluno
            dataToSubmit.append("aluno", aluno.id);
            
            // Adicionar campos do formulário
            dataToSubmit.append("turma", formData.turma);
            dataToSubmit.append("ano_semestre_ingresso", formData.ano_semestre_ingresso);
            dataToSubmit.append("motivo_solicitacao", formData.motivo_solicitacao);
            
            if (formData.observacoes) {
                dataToSubmit.append("observacoes", formData.observacoes);
            }
            
            // Adicionar anexos se existirem
            if (formData.anexos) {
                for (let i = 0; i < formData.anexos.length; i++) {
                    dataToSubmit.append("anexos", formData.anexos[i]);
                }
            }
            
            // Debug para ver o que está indo no FormData
            for (let pair of dataToSubmit.entries()) {
                console.log(pair[0], pair[1]);
            }
            
            const token = getAuthToken();
            await axios.post(
                "http://localhost:8000/solicitacoes/dispensa_ed_fisica/",
                dataToSubmit,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    },
                }
            );
            
            setMsgErro("Solicitação enviada com sucesso!");
            setTipoPopup("sucesso");
            setPopupIsOpen(true);
            
            // Redirecionar após 2 segundos
            setTimeout(() => navigate("/todas-solicitacoes"), 2000);
        } catch (error) {
            console.error("Erro no envio:", error.response?.data || error.message);
            setMsgErro(error.response?.data || error.message);
            setTipoPopup("erro");
            setPopupIsOpen(true);
        }
    };

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
                        mensagem={msgErro}
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
                    <h2>Formulário de Desistência de Vaga</h2>
                    <br></br>
                    <h6 className="descricao-formulario">
                        Ao preencher este formulário,<strong> desisto</strong> formalmente da minha vaga no IFRS Campus Restinga, <br></br>
                        conforme informações abaixo prestadas.
                    </h6>

                    <form className="formulario formulario-largo" onSubmit={handleSubmit}>

                    <div className="dados-aluno-container">
                        <div className="form-group">
                            <label>E-mail:</label>
                            <input type="email" value={userData?.email || ""} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Nome Completo:</label>
                            <input type="text" value={aluno?.nome || userData?.name || ""} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Matrícula:</label>
                            <input type="text" value={aluno?.matricula || ""} readOnly />
                        </div>
                        
                        <div className="form-group">
                            <label>Curso:</label>
                            <input type="text" value={curso?.nome || "Carregando..."} readOnly />
                        </div>
                    </div>
                    
                        
                        <div className="form-group">
                            <label htmlFor="ano_semestre_ingresso">Ano/Semestre de Ingresso:</label>
                            <input
                                type="text"
                                id="ano_semestre_ingresso"
                                name="ano_semestre_ingresso"
                                value={formData.ano_semestre_ingresso}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="motivo_solicitacao">Motivo da Solicitação:</label>
                            <select
                                id="motivo_solicitacao"
                                name="motivo_solicitacao"
                                value={formData.motivo_solicitacao}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecione o motivo</option>
                                {motivosDispensa.map(motivo => (
                                    <option key={motivo.id} value={motivo.id}>
                                        {motivo.descricao}
                                    </option>
                                ))}
                            </select>
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
                            <small>Selecione os documentos comprobatórios para a dispensa.</small>
                        </div>

                        {/* Campo para ver se o aluno recebe auxilio 
                        <div className="form-group">
                            <label htmlFor="consegue_realizar_atividades">Recebe auxílio estudantil?</label>
                            <select
                                id="consegue_realizar_atividades"
                                {...register("consegue_realizar_atividades", { required: "Este campo é obrigatório." })}
                            >
                                <option value="">Selecione</option>
                                <option value={true}>Sim</option>
                                <option value={false}>Não</option>
                            </select>
                            {errors.consegue_realizar_atividades && <span className="error-text">{errors.consegue_realizar_atividades.message}</span>}
                        </div>
                        */}
                        
                        <button type="submit" className="submit-button">Enviar</button>
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
