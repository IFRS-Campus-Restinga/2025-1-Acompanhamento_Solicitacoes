import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Footer from "../../../components/base/footer"; 
import HeaderCRE from "../../../components/base/headers/header_cre";
import "../../../components/formulario.css"; 

// Mapeamento dos tipos de formulário para seus endpoints de detalhes específicos
// IMPORTANTE: Verifique se os nomes das chaves (ex: ABONOFALTAS) e os paths
// correspondem EXATAMENTE aos seus FORMULARIO_CHOICES no models.py e aos paths no urls.py
const FORM_DETAIL_ENDPOINTS = {
    ABONOFALTAS: "/formulario_abono_falta/",
    TRANCAMENTODISCIPLINA: "/formulario_trancamento_disciplina/",
    TRANCAMENTOMATRICULA: "/formularios-trancamento/", // Verifique este path no seu urls.py
    DISPENSAEDFISICA: "/dispensa_ed_fisica/",
    DESISTENCIAVAGA: "/form_desistencia_vaga/",
    EXERCICIOSDOMICILIARES: "/form_exercicio_domiciliar/",
    ENTREGACERTIFICADOS: "/form_ativ_compl/", // Assumindo que "Entrega de Certificados" usa o mesmo que Ativ Compl.
    // Adicione outros mapeamentos conforme necessário
};

// Função auxiliar para formatar nomes de campos (opcional, para melhor leitura)
const formatFieldName = (fieldName) => {
    // Transforma "data_inicio_afastamento" em "Data Início Afastamento"
    return fieldName
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

// Função auxiliar para renderizar valores (trata booleanos, datas, listas, etc.)
const renderFieldValue = (key, value) => {
    if (typeof value === "boolean") {
        return value ? "Sim" : "Não";
    }
    if (value === null || value === undefined) {
        return "N/A";
    }
    // Tenta formatar como data se parecer uma string de data
    if (typeof value === "string" && /\d{4}-\d{2}-\d{2}/.test(value)) {
        try {
            const date = new Date(value + "T00:00:00Z"); // Assume UTC se não houver timezone
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString("pt-BR", { timeZone: "UTC" }); // Exibe como DD/MM/YYYY
            }
        } catch (e) { /* Ignora erro de data inválida */ }
    }
    // Se for um array (ex: disciplinas_info), formata
    if (Array.isArray(value)) {
        if (value.length === 0) return "Nenhum";
        // Tenta formatar se for um array de objetos com nome/codigo
        if (value[0] && typeof value[0] === "object" && value[0].nome) {
            return (
                <ul>
                    {value.map((item, index) => (
                        <li key={index}>{item.nome} {item.codigo ? `(${item.codigo})` : ""}</li>
                    ))}
                </ul>
            );
        }
        // Senão, apenas junta os itens
        return value.join(", ");
    }
    // Se for um objeto (não esperado aqui, mas por segurança)
    if (typeof value === "object") {
        return JSON.stringify(value);
    }
    // Retorna o valor como string
    return String(value);
};

const DetalheSolicitacao = () => {
    const { id } = useParams(); // Pega o ID da URL
    const [solicitacaoBase, setSolicitacaoBase] = useState(null);
    const [detalhesFormulario, setDetalhesFormulario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetalhes = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Buscar dados da Solicitação Base
                console.log(`Buscando solicitação base: /todas-solicitacoes/${id}/`);
                const baseResponse = await axios.get(`http://localhost:8000/solicitacoes/todas-solicitacoes/${id}/`);
                const baseData = baseResponse.data;
                setSolicitacaoBase(baseData);
                console.log("Dados base recebidos:", baseData);

                // 2. Determinar o endpoint específico e buscar detalhes do formulário
                const tipoFormulario = baseData.nome_formulario; // Ex: "ABONOFALTAS"
                const specificEndpointPath = FORM_DETAIL_ENDPOINTS[tipoFormulario];

                if (specificEndpointPath) {
                    const specificUrl = `http://localhost:8000/solicitacoes${specificEndpointPath}${id}/`;
                    console.log(`Buscando detalhes específicos: ${specificUrl}`);
                    try {
                        const detailResponse = await axios.get(specificUrl);
                        setDetalhesFormulario(detailResponse.data);
                        console.log("Detalhes específicos recebidos:", detailResponse.data);
                    } catch (specificError) {
                        console.error(`Erro ao buscar detalhes específicos (${tipoFormulario})`, specificError);
                        // Não define erro fatal, pode haver casos sem detalhes específicos ou endpoint errado
                        setError(`Não foi possível carregar os detalhes específicos do formulário ${tipoFormulario}. Verifique a configuração do endpoint.`);
                        setDetalhesFormulario({}); // Define como vazio para não quebrar a renderização
                    }
                } else {
                    console.warn(`Endpoint de detalhes não mapeado para o tipo: ${tipoFormulario}`);
                    setDetalhesFormulario({}); // Define como vazio se não houver mapeamento
                }

            } catch (err) {
                console.error("Erro ao buscar detalhes da solicitação", err);
                setError("Erro ao carregar os dados da solicitação. Verifique o ID ou tente novamente.");
                // Limpa os dados em caso de erro na busca base
                setSolicitacaoBase(null);
                setDetalhesFormulario(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetalhes();
        }
    }, [id]);

    // --- Renderização --- 

    if (loading) {
        return <div>Carregando detalhes da solicitação...</div>;
    }

    // Mostra erro fatal se a busca base falhou
    if (error && !solicitacaoBase) {
        return <div style={{ color: "red", padding: "20px" }}>{error}</div>;
    }
    
    // Se a busca base funcionou mas a específica não, mostra a base e um aviso
    if (!detalhesFormulario && solicitacaoBase) {
         return (
            <div>
                <HeaderCRE /> {/* Ou HeaderAluno */}
                <main className="container detalhe-container">
                    <h1>Detalhes da Solicitação #{id}</h1>
                    {error && <p style={{ color: "orange", border: "1px solid orange", padding: "10px" }}>{error}</p>}
                    {/* Renderiza apenas a parte geral */}
                    <RenderSolicitacaoBase data={solicitacaoBase} />
                </main>
                <Footer />
            </div>
        );
    }
    
    // Se chegou aqui, temos dados base e (potencialmente) detalhes específicos
    return (
        <div>
            <HeaderCRE /> {/* Ou HeaderAluno */}
            <main className="container detalhe-container">
                <h1>Detalhes da Solicitação #{id}</h1>
                
                {/* Mostra aviso se a busca específica falhou mas a base não */}
                {error && <p style={{ color: "orange", border: "1px solid orange", padding: "10px" }}>{error}</p>}

                {/* Seção de Informações Gerais (da Solicitação base) */}
                {solicitacaoBase && <RenderSolicitacaoBase data={solicitacaoBase} />}

                {/* Seção de Detalhes Específicos do Formulário */}
                {detalhesFormulario && Object.keys(detalhesFormulario).length > 0 && (
                    <RenderDetalhesFormulario data={detalhesFormulario} tipo={solicitacaoBase?.nome_formulario} />
                )}

                {/* Botão Voltar (opcional) */}
                <div style={{ marginTop: "30px" }}>
                    <Link to={-1} className="btn btn-secondary">Voltar</Link> {/* Volta para a página anterior */}
                </div>

            </main>
            <Footer />
        </div>
    );
};

// Componente auxiliar para renderizar a parte da Solicitação Base
const RenderSolicitacaoBase = ({ data }) => {
    if (!data) return null;
    return (
        <section className="detalhe-section">
            <h2>Informações Gerais</h2>
            <div className="detalhe-grid">
                <div className="detalhe-item">
                    <span className="detalhe-label">Tipo de Formulário:</span>
                    <span className="detalhe-value">{data.nome_formulario || "N/A"}</span>
                </div>
                <div className="detalhe-item">
                    <span className="detalhe-label">Aluno:</span>
                    <span className="detalhe-value">{data.nome_aluno || "N/A"}</span>
                </div>
                 <div className="detalhe-item">
                    <span className="detalhe-label">Data da Solicitação:</span>
                    <span className="detalhe-value">{renderFieldValue("data_solicitacao", data.data_solicitacao)}</span>
                </div>
                 <div className="detalhe-item">
                    <span className="detalhe-label">Status:</span>
                    <span className="detalhe-value">{data.status || "N/A"}</span>
                </div>
                 <div className="detalhe-item">
                    <span className="detalhe-label">Responsável Atual:</span>
                    <span className="detalhe-value">{data.posse_solicitacao || "N/A"}</span>
                </div>
                 <div className="detalhe-item">
                    <span className="detalhe-label">Data de Emissão (se aplicável):</span>
                    <span className="detalhe-value">{renderFieldValue("data_emissao", data.data_emissao)}</span>
                </div>
                {/* Adicione outros campos da Solicitação base que desejar aqui */}
            </div>
        </section>
    );
};

// Componente auxiliar para renderizar os Detalhes Específicos do Formulário
const RenderDetalhesFormulario = ({ data, tipo }) => {
    if (!data || Object.keys(data).length === 0) {
        return (
             <section className="detalhe-section">
                <h2>Detalhes do Formulário ({tipo || ""})</h2>
                <p>Não foram encontrados detalhes específicos para este tipo de formulário ou o endpoint não está configurado corretamente.</p>
             </section>
        );
    }

    // Lista de campos que NÃO devem ser exibidos dinamicamente 
    // (porque já são exibidos na seção base ou são IDs/internos)
    const camposExcluidos = ["id", "solicitacao", "aluno", "nome_formulario", "data_solicitacao", "status", "posse_solicitacao", "data_emissao", "aluno_email", "curso_codigo", "motivo_solicitacao_id", "disciplinas"];

    return (
        <section className="detalhe-section">
            <h2>Detalhes do Formulário ({tipo || ""})</h2>
            <div className="detalhe-grid">
                {Object.entries(data)
                    .filter(([key]) => !camposExcluidos.includes(key)) // Filtra campos excluídos
                    .map(([key, value]) => (
                        <div key={key} className="detalhe-item">
                            <span className="detalhe-label">{formatFieldName(key)}:</span>
                            {/* Tratamento especial para anexos (se houver um campo chamado 'anexos' ou 'arquivos') */}
                            {(key === "anexos" || key === "arquivos") && Array.isArray(value) && value.length > 0 ? (
                                <ul className="detalhe-value">
                                    {value.map((anexo, index) => (
                                        <li key={index}>
                                            {/* Tenta criar um link se for uma URL ou caminho reconhecível */}
                                            {typeof anexo === "string" && (anexo.startsWith("http") || anexo.includes("/")) ? (
                                                <a href={anexo} target="_blank" rel="noopener noreferrer">{anexo.split("/").pop() || anexo}</a>
                                            ) : (
                                                <span>{JSON.stringify(anexo)}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                /* Renderização padrão para outros campos */
                                <span className="detalhe-value">{renderFieldValue(key, value)}</span>
                            )}
                        </div>
                    ))}
            </div>
        </section>
    );
};

export default DetalheSolicitacao;

