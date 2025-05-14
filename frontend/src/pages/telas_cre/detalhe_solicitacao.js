import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/base/header";
import Footer from "../../components/base/footer";

export default function DetalheSolicitacao() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formulario, setFormulario] = useState(null);
    const [solicitacao, setSolicitacao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const camposOcultar = ["id", "descricao"]; // Oculta esses campos

    useEffect(() => {
        axios.get(`http://localhost:8000/solicitacoes/detalhes-formulario/${id}/`)
            .then(response => {
                setFormulario(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError("Erro ao carregar detalhes.");
                setLoading(false);
            });

        axios.get(`http://localhost:8000/solicitacoes/todas-solicitacoes/${id}/`)
            .then(response => {
                setSolicitacao(response.data);
            })
            .catch(err => console.error("Erro ao carregar solicitação:", err));
    }, [id]);

    const atualizarStatus = async (novoStatus) => {
        try {
            await axios.patch(`http://localhost:8000/solicitacoes/atualizar-status/${id}/`, { status: novoStatus });
            console.log(`Status atualizado para: ${novoStatus}`);
            setSolicitacao((prev) => ({ ...prev, status: novoStatus }));

            setTimeout(() => {
                navigate("/cre_home");
            }, 500);
        } catch (err) {
            console.error("Erro ao atualizar status:", err);
        }
    };

    if (loading) return <p>Carregando detalhes...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <Header />
            <main className="container">
                <h2>Detalhes da Solicitação</h2>

                <div className="dados-container">
                    {/* Div para os dados da solicitação */}
                    <div className="bloco-info">
                        {solicitacao && (
                            <div className="dados-solicitacao">
                                <div className="campo-container">
                                    <p className="campo-nome"><strong>Tipo:</strong></p>
                                    <p className="campo-valor">{solicitacao.tipo}</p>
                                </div>
                                <div className="campo-container">
                                    <p className="campo-nome"><strong>Aluno:</strong></p>
                                    <p className="campo-valor">{solicitacao.nome_aluno}</p>
                                </div>
                                <div className="campo-container">
                                    <p className="campo-nome"><strong>Data da Solicitação:</strong></p>
                                    <p className="campo-valor">{solicitacao.data_solicitacao}</p>
                                </div>
                                <div className="campo-container">
                                    <p className="campo-nome"><strong>Status:</strong></p>
                                    <p className={`campo-valor status status-${solicitacao.status.toLowerCase().replace(" ", "-")}`}>
                                        {solicitacao.status}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Div para os dados do formulário */}
                    <div className="bloco-info">
                        {formulario && Object.keys(formulario).length > 0 ? (
                            <div className="formulario-container">
                                {Object.entries(formulario)
                                    .filter(([campo]) => !camposOcultar.includes(campo)) // Remove ID e Descrição
                                    .map(([campo, valor]) => (
                                        <div key={campo} className="campo-container">
                                            <p className="campo-nome"><strong>{campo.replace("_", " ")}:</strong></p>
                                            <p className="campo-valor">
                                                {Array.isArray(valor) && valor.every(item => typeof item === "object") 
                                                    ? valor.map(item => (
                                                    <span key={item.codigo}>{item.codigo} - {item.nome} <br /></span> 
                                                ))
                                                    : typeof valor === "boolean" 
                                                    ? (valor ? "SIM" : "NÃO") 
                                                    : typeof valor === "object" && valor !== null 
                                                    ? Object.values(valor).join(" - ") 
                                                    : valor || "N/A"}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p style={{ color: "red" }}>Erro ao carregar dados do formulário.</p>
                        )}
                    </div>
                </div>

                <div className="botoes-container">
                    <button onClick={() => atualizarStatus("Aprovado")} className="button-aprovar" >Aprovar Solicitação</button>
                    <button onClick={() => atualizarStatus("Reprovado")} className="button-rejeitar">Reprovar Solicitação</button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
