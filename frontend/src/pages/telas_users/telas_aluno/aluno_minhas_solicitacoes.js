import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderAluno from "../../../components/base/aluno/header_aluno";
import Footer from "../../../components/base/footer";
import "../../../components/formulario.css";
import "../../../components/layout-cruds.css";
import "../../../components/tabela-cruds.css";


const MinhasSolicitacoesAluno = () => {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSolicitacoes = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get("http://localhost:8000/solicitacoes/todas-solicitacoes/");
                console.log("Dados recebidos:", response.data);
                setSolicitacoes(response.data || []);
            } catch (error) {
                console.error("Erro ao buscar solicitações", error);
                setError("Erro ao carregar solicitações. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchSolicitacoes();
    }, []);

     const formatarData = (dataString) => {
        if (!dataString) return '--/--/----';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    return (
        <div>
            <HeaderAluno />
            <main className="container">
                <h2>Lista de Solicitações</h2>

                {loading ? (
                    <p>Carregando solicitações...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : solicitacoes.length > 0 ? (
                    <table className="tabela-cruds">
                        <thead>
                            <tr>
                                <th>Documento solicitado</th>
                                <th>Status</th>
                                <th>Responsável</th>
                                <th>Data da Solicitação:</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitacoes.map((solicitacao, index) => (
                                <tr key={solicitacao.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                                    
                                    <td>{solicitacao.tipo}</td>
                                    <td>
                                        <span className={`status-badge ${solicitacao.status.toLowerCase().replace(' ', '-')}`}>
                                            {solicitacao.status}
                                        </span>
                                    </td>
                                    <td>{solicitacao.posse_solicitacao}</td>
                                    <td>{formatarData(solicitacao.data_solicitacao)}</td>
                                    <td>
                                        <Link 
                                            to={`/aluno/detalhes-solicitacao/${solicitacao.id}`} 
                                            className="btn-detalhes"
                                            title="Ver detalhes">
                                            <i className="bi bi-eye-fill"></i>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-requests">
                        <p>Nenhuma solicitação encontrada.</p>
                        <Link to="/nova-solicitacao" className="btn-primary">
                            Criar nova solicitação
                        </Link>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MinhasSolicitacoesAluno;
