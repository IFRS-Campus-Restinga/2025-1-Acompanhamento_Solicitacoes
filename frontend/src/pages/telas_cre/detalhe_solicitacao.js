import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/base/header";
import Footer from "../../components/base/footer";

export default function DetalheSolicitacao() {
    const { id } = useParams(); // Obtém o ID da solicitação na URL
    const navigate = useNavigate();
    const [formulario, setFormulario] = useState(null);
    const [solicitacao, setSolicitacao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Busca os dados do formulário
        axios.get(`http://localhost:8000/solicitacoes/detalhes-formulario/${id}/`)
            .then(response => {
                setFormulario(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError("Erro ao carregar detalhes.");
                setLoading(false);
            });

        // Busca os dados da solicitação
        axios.get(`http://localhost:8000/solicitacoes/todas-solicitacoes/${id}/`)
            .then(response => {
                setSolicitacao(response.data);
            })
            .catch(err => console.error("Erro ao carregar solicitação:", err));
    }, [id]);

    // Função para atualizar o status e redirecionar para Home
    const atualizarStatus = async (novoStatus) => {
        try {
            await axios.patch(`http://localhost:8000/solicitacoes/atualizar-status/${id}/`, { status: novoStatus });
            console.log(`Status atualizado para: ${novoStatus}`);
            setSolicitacao((prev) => ({ ...prev, status: novoStatus }));
    
            setTimeout(() => {
                navigate("/cre/home"); // Redireciona para Home após atualização
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

                {solicitacao && (
                    <>
                        <h3>{solicitacao.tipo}</h3>
                        <p><strong>Aluno:</strong> {solicitacao.nome_aluno}</p>
                        <p><strong>Data da Solicitação:</strong> {solicitacao.data_solicitacao}</p>
                        <p><strong>Status:</strong> <span className="status">{solicitacao.status}</span></p>
                    </>
                )}

                {/* Renderização automática dos campos do formulário */}
                {formulario && Object.keys(formulario).length > 0 ? (
                    <>
                        <h3>Dados do Formulário</h3>
                        <div className="formulario-container">
                            {Object.entries(formulario).map(([campo, valor]) => (
                                <div key={campo} className="campo-container">
                                    <p className="campo-nome"><strong>{campo.replace("_", " ")}:</strong></p>
                                    <p className="campo-valor">{typeof valor === "object" ? JSON.stringify(valor) : valor}</p>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p style={{ color: "red" }}>Erro ao carregar dados do formulário.</p>
                )}

                {/* Botões de Aprovação/Rejeição */}
                <div className="botoes-container">
                    <button onClick={() => atualizarStatus("Aprovado")} className="btn-aprovar">Aprovar Solicitação</button>
                    <button onClick={() => atualizarStatus("Reprovado")} className="btn-rejeitar">Reprovar Solicitação</button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
