import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Components
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";
import Stepper from "../../../components/UI/stepper";

// Bootstrap Icons CSS (caso ainda não esteja incluso globalmente)
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAuthToken } from "../../../services/authUtils";

export default function DetalhesSolicitacao() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [solicitacao, setSolicitacao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = getAuthToken();

    useEffect(() => {
        if (token) {
            fetchSolicitacao();
        }
    }, [id, token])

    const fetchSolicitacao = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/solicitacoes/detalhes-formulario/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.data) throw new Error("Dados da solicitação não encontrados.");
            setSolicitacao(response.data);
        } catch (err) {
            setError(err.message || "Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };


    const formatarData = (dataString) => {
        if (!dataString) return '--/--/---- --:--';
        try {
            const [data, hora] = dataString.split('T');
            const [ano, mes, dia] = data.split('-');
            const [horas, minutos] = hora?.split('.')[0]?.split(':') || [];
            return `${dia}/${mes}/${ano} ${horas || '--'}:${minutos || '--'}`;
        } catch {
            return '--/--/---- --:--';
        }
    };

    const formatarTipoCurso = (valor) => {
        switch (valor) {
            case 'medio_integrado': return 'Ensino Médio Integrado';
            case 'subsequente': return 'Curso Subsequente';
            case 'eja': return 'Curso EJA';
            case 'superior': return 'Curso Superior';
            default: return 'Não informado';
        }
    };

    const formatarMotivoDesistencia = (valor) => {
        switch (valor) {
            case 'transferencia': return 'Transferência para outra escola';
            case 'desistencia': return 'Desistência da vaga';
            default: return 'Não informado';
        }
    };

    const formatarMotivo = (valor) => {
    const motivos = {
        saude: "Problemas de saúde",
        maternidade: "Licença maternidade",
        familiar: "Acompanhamento de familiar",
        aborto_ou_falecimento: "Aborto ou falecimento do bebê",
        adocao: "Adoção de criança",
        conjuge: "Licença cônjuge/companheiro",
        outro: "Outro",
    };
    return motivos[valor] || "Não informado";
};

const formatarDocumentoApresentado = (valor) => {
    const documentos = {
        atestado: "Atestado médico",
        certidao_nascimento: "Certidão de nascimento",
        termo_guarda: "Termo judicial de guarda",
        certidao_obito: "Certidão de óbito",
        justificativa_propria: "Justificativa própria",
        outro: "Outro",
    };
    return documentos[valor] || "Não informado";
};

const calcularDiasAfastamento = (inicio, fim) => {
    if (!inicio || !fim) return "Indefinido";
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    const diffTime = dataFim - dataInicio;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
};

const formatarPeriodo = (valor) => {
    const periodos = {
        PRIMEIRO_SEMESTRE: "1º Semestre",
        SEGUNDO_SEMESTRE: "2º Semestre",
        TERCEIRO_SEMESTRE: "3º Semestre",
        QUARTO_SEMESTRE: "4º Semestre",
        QUINTO_SEMESTRE: "5º Semestre",
        SEXTO_SEMESTRE: "6º Semestre",
        SETIMO_SEMESTRE: "7º Semestre",
        OITAVO_SEMESTRE: "8º Semestre",
    };
    return periodos[valor] || valor || "Não informado";
};



    const renderizarCamposPorTipo = () => {
        switch (solicitacao.nome_formulario) {
            case 'TRANCAMENTODISCIPLINA':
                return (
                    <div className="card mb-4">
                        <h5>Informações da solicitação</h5>
                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-clock-history me-2"></i>Motivo da Solicitação:</h6>
                            <p>{solicitacao.motivo}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <h6>Disciplinas:</h6>
                            <ul>
                                {solicitacao.disciplinas?.map((disc, index) => (
                                    <li key={index}>{disc.nome}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );

            case 'EXERCICIODOMICILIAR':
                return (
                    <div className="card mb-4">
                        <h5>Período de afastamento</h5>
                        <div className="col-md-6 mb-3">
                            <h6>Data de início:</h6>
                            <p>{formatarData(solicitacao.data_inicio_afastamento)}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <h6>Data de término:</h6>
                            <p>{formatarData(solicitacao.data_fim_afastamento)}</p>
                        </div>
                    </div>
                );

            case 'ABONOFALTAS':
                return (
                    <div className="card mb-4">
                        <h5>Informações do Abono de Faltas</h5>

                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-exclamation-circle me-2"></i>Motivo da Solicitação:</h6>
                            <p>{solicitacao.motivo_solicitacao?.nome || 'Não informado'}</p>
                        </div>

                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-calendar-event me-2"></i>Início do Afastamento:</h6>
                            <p>{formatarData(solicitacao.data_inicio_afastamento)}</p>
                        </div>

                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-calendar-event me-2"></i>Fim do Afastamento:</h6>
                            <p>{formatarData(solicitacao.data_fim_afastamento)}</p>
                        </div>

                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-laptop me-2"></i>Teve acesso ao Moodle durante o afastamento?</h6>
                            <p>{solicitacao.acesso_moodle ? 'Sim' : 'Não'}</p>
                        </div>

                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-journal-x me-2"></i>Perdeu atividades no período?</h6>
                            <p>{solicitacao.perdeu_atividades ? 'Sim' : 'Não'}</p>
                        </div>
                    </div>
                );
            case 'DESISTENCIAVAGA':
                return (
                    <div className="card mb-4">
                        <h5>Informações da Desistência de Vaga</h5>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <h6>CPF:</h6>
                                <p>{solicitacao.cpf}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6>Email:</h6>
                                <p>{solicitacao.email}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6>Curso:</h6>
                                <p>{solicitacao.curso?.nome}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6>Tipo de Curso:</h6>
                                <p>{formatarTipoCurso(solicitacao.tipo_curso)}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6>Motivo da Desistência:</h6>
                                <p>{formatarMotivoDesistencia(solicitacao.motivo_desistencia)}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6>Ano/Semestre de Ingresso:</h6>
                                <p>{solicitacao.ano_semestre_ingresso}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6>Menor de Idade?</h6>
                                <p>{solicitacao.menor_idade ? "Sim" : "Não"}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6>Recebe Auxílio Estudantil?</h6>
                                <p>{solicitacao.recebe_auxilio_estudantil ? "Sim" : "Não"}</p>
                            </div>

                            <div className="col-md-12 mb-3">
                                <h6>Motivo detalhado:</h6>
                                <p>{solicitacao.motivo_solicitacao}</p>
                            </div>

                            {solicitacao.declaracao_biblioteca && (
                                <div className="col-md-12 mb-3">
                                    <h6>Declaração da Biblioteca:</h6>
                                    <a href={solicitacao.declaracao_biblioteca} target="_blank" rel="noopener noreferrer">Visualizar documento</a>
                                </div>
                            )}

                            {solicitacao.atestado_vaga_nova_escola && (
                                <div className="col-md-12 mb-3">
                                    <h6>Atestado de vaga em nova escola:</h6>
                                    <a href={solicitacao.atestado_vaga_nova_escola} target="_blank" rel="noopener noreferrer">Visualizar documento</a>
                                </div>
                            )}

                            {solicitacao.doc_identificacao_responsavel && (
                                <div className="col-md-12 mb-3">
                                    <h6>Documento do Responsável Legal:</h6>
                                    <a href={solicitacao.doc_identificacao_responsavel} target="_blank" rel="noopener noreferrer">Visualizar documento</a>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'DISPENSAEDUCACAOFISICA':
                return (
                    <div className="card mb-4">
                        <h5>Informações da Solicitação de Dispensa de Educação Física</h5>

                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-exclamation-circle me-2"></i>Motivo da Solicitação:</h6>
                            <p>{solicitacao.motivo_solicitacao?.nome || 'Não informado'}</p>
                        </div>

                        <div className="col-md-12 mb-3">
                            <h6><i className="bi bi-paperclip me-2"></i>Anexos:</h6>
                            {solicitacao.anexos && solicitacao.anexos.length > 0 ? (
                                <ul>
                                    {solicitacao.anexos.map((arquivo, index) => (
                                        <li key={index}>
                                            <a href={arquivo} target="_blank" rel="noopener noreferrer">
                                                Visualizar Anexo {index + 1}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Nenhum anexo enviado.</p>
                            )}
                        </div>
                    </div>
                );

            case 'ENTREGAATIVCOMPL':
                return (
                    <div className="card mb-4">
                        <h5>Informações da Entrega de Atividades Complementares</h5>

                        <div className="col-md-12 mb-3">
                            <h6><i className="bi bi-journal-text me-2"></i>Disciplinas relacionadas:</h6>
                            {solicitacao.disciplinas?.length > 0 ? (
                                <ul>
                                    {solicitacao.disciplinas.map((disciplina, index) => (
                                        <li key={index}>{disciplina.nome}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Nenhuma disciplina informada.</p>
                            )}
                        </div>

                        <div className="col-md-12 mb-3">
                            <h6><i className="bi bi-check2-circle me-2"></i>Atividades Complementares:</h6>
                            {solicitacao.atividades_complementares?.length > 0 ? (
                                <ul>
                                    {solicitacao.atividades_complementares.map((atividade, index) => (
                                        <li key={index}>
                                            {atividade.nome} – {atividade.carga_horaria}h
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Nenhuma atividade informada.</p>
                            )}
                        </div>

                        <div className="col-md-12 mb-3">
                            <h6><i className="bi bi-paperclip me-2"></i>Anexos:</h6>
                            {solicitacao.anexos?.length > 0 ? (
                                <ul>
                                    {solicitacao.anexos.map((arquivo, index) => (
                                        <li key={index}>
                                            <a href={arquivo} target="_blank" rel="noopener noreferrer">
                                                Visualizar Anexo {index + 1}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Nenhum anexo enviado.</p>
                            )}
                        </div>
                    </div>
                );

case 'EXERCICIOSDOMICILIARES':
    return (
        <div className="card mb-4">
            <h5>Informações do Exercício Domiciliar</h5>

            <div className="col-md-6 mb-3">
                <h6>Curso:</h6>
                <p>{solicitacao.curso?.nome}</p>
            </div>

            <div className="col-md-6 mb-3">
                <h6>Período:</h6>
                <p>{formatarPeriodo(solicitacao.periodo)}</p>
            </div>

            <div className="col-md-12 mb-3">
                <h6>Disciplinas:</h6>
                {solicitacao.disciplinas?.length > 0 ? (
                    <ul>
                        {solicitacao.disciplinas.map((d, i) => (
                            <li key={i}>{d.nome}</li>
                        ))}
                    </ul>
                ) : (
                    <p>Nenhuma disciplina informada.</p>
                )}
            </div>

            <div className="col-md-6 mb-3">
                <h6>Motivo da Solicitação:</h6>
                <p>{formatarMotivo(solicitacao.motivo_solicitacao)}</p>
            </div>

            {solicitacao.motivo_solicitacao === "outro" && (
                <div className="col-md-6 mb-3">
                    <h6>Outro Motivo:</h6>
                    <p>{solicitacao.outro_motivo}</p>
                </div>
            )}

            <div className="col-md-6 mb-3">
                <h6>Data de Início do Afastamento:</h6>
                <p>{formatarData(solicitacao.data_inicio_afastamento)}</p>
            </div>

            <div className="col-md-6 mb-3">
                <h6>Data de Fim do Afastamento:</h6>
                <p>{formatarData(solicitacao.data_fim_afastamento)}</p>
            </div>

            <div className="col-md-6 mb-3">
                <h6>Período de Afastamento (dias):</h6>
                <p>{calcularDiasAfastamento(solicitacao.data_inicio_afastamento, solicitacao.data_fim_afastamento)}</p>
            </div>

            <div className="col-md-6 mb-3">
                <h6>Documento Apresentado:</h6>
                <p>{formatarDocumentoApresentado(solicitacao.documento_apresentado)}</p>
            </div>

            {solicitacao.documento_apresentado === "outro" && (
                <div className="col-md-6 mb-3">
                    <h6>Outro Documento:</h6>
                    <p>{solicitacao.outro_documento}</p>
                </div>
            )}

            {solicitacao.arquivos && (
                <div className="col-md-12 mb-3">
                    <h6>Anexo:</h6>
                    <a href={solicitacao.arquivos} target="_blank" rel="noopener noreferrer">
                        Visualizar Documento
                    </a>
                </div>
            )}

            <div className="col-md-6 mb-3">
                <h6>Consegue realizar atividades remotas?</h6>
                <p>{solicitacao.consegue_realizar_atividades ? "Sim" : "Não"}</p>
            </div>
        </div>
    );

case 'TRANCAMENTODISCIPLINA':
    return (
        <div className="card mb-4">
            <h5>Informações do Trancamento de Disciplina</h5>

            <div className="col-md-12 mb-3">
                <h6><i className="bi bi-book me-2"></i>Disciplinas a trancar:</h6>
                {solicitacao.disciplinas?.length > 0 ? (
                    <ul>
                        {solicitacao.disciplinas.map((disciplina, index) => (
                            <li key={index}>{disciplina.nome}</li>
                        ))}
                    </ul>
                ) : (
                    <p>Nenhuma disciplina informada.</p>
                )}
            </div>

            <div className="col-md-6 mb-3">
                <h6><i className="bi bi-person-check me-2"></i>Aluno ingressante?</h6>
                <p>{solicitacao.ingressante ? "Sim" : "Não"}</p>
            </div>

            <div className="col-md-12 mb-3">
                <h6><i className="bi bi-justify-left me-2"></i>Motivo da Solicitação:</h6>
                <p>{solicitacao.motivo_solicitacao}</p>
            </div>
        </div>
    );

            default:
                return null;
        }
    };


    if (loading) {
        return (
            <div className="page-container">
                <main className="container text-center my-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-3">Carregando detalhes da solicitação...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <main className="container text-center my-5">
                    <div className="alert alert-danger">{error}</div>
                    <button onClick={() => navigate('/aluno/minhas-solicitacoes')} className="btn btn-secondary mt-3">
                        Voltar
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="page-container">
            <main className="container my-4">
                <div className="mb-4">
                    <h2 className="text-center">Detalhes da Solicitação #{solicitacao.id}</h2>
                </div>

                <div className="card mb-4">
                    <h5>Informações do aluno</h5>
                    <div className="card-body row">
                        <div className="col-md-6 mb3">
                            <h6><i className="bi bi-person"></i>Solicitante</h6>
                            <p>{solicitacao.nome_aluno}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-person me-2"></i>Responsável:</h6>
                            <p>{solicitacao.posse_solicitacao || 'Não atribuído'}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-file-earmark-text me-2"></i>Documento Solicitado:</h6>
                            <p>{solicitacao.nome_formulario_display || 'Não informado'}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-clipboard2"></i>Ano/Semestre</h6>
                            <p>{solicitacao.periodo || 'Não informado'}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-calendar-check me-2"></i>Data da Solicitação:</h6>
                            <p>{formatarData(solicitacao.data_solicitacao)}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <h6><i className="bi bi-clock-history me-2"></i>Última Atualização:</h6>
                            <p>{formatarData(solicitacao.data_atualizacao)}</p>
                        </div>
                    </div>
                </div>
                {renderizarCamposPorTipo()}


                <div className="card mb-4">
                    <div className="card-body">
                        <h5><i className="bi bi-chat-left-text me-2"></i>Justificativa</h5>
                        <p>{solicitacao.justificativa || 'Nenhuma justificativa fornecida.'}</p>
                    </div>
                </div>

                {solicitacao.observacoes && (
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5><i className="bi bi-info-circle me-2"></i>Observações</h5>
                            <p>{solicitacao.observacoes}</p>
                        </div>
                    </div>
                )}

                <BotaoVoltar onClick={() => navigate("/coordenador/coordenador-home")} />
            </main>
        </div>
    );
}