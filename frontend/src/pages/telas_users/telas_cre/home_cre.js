import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../../components/base/footer";
import HeaderCRE from "../../../components/base/headers/header_cre";
import "../../../components/formulario.css";
import "../../../components/layout-cruds.css";
import "../../../components/tabela-cruds.css";

const HomeCRE = () => {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSolicitacoes = async () => {
            setLoading(true);
            setError(null);
            try {
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

    return (
        <div>
            <HeaderCRE />
            <main className="container">
                <h2>Painel do CRE</h2>

                {loading ? (
                    <p>Carregando solicitações...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : solicitacoes.length > 0 ? (
                    <table className="tabela-cruds">
                        <thead>
                            <tr>
                                <th>Tipo de Formulário</th>
                                <th>Aluno</th>
                                <th>Data de Criação</th>
                                <th>Status</th>
                                <th>Responsável</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitacoes.map((solicitacao, index) => (
                                <tr key={solicitacao.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                                    <td>{solicitacao.tipo}</td>
                                    <td>{solicitacao.nome_aluno}</td>
                                    <td>{solicitacao.data_solicitacao}</td>
                                    <td>{solicitacao.status}</td>
                                    <td>{solicitacao.posse_solicitacao}</td>
                                    <td>
                                        <div className="botao-olho">
                                            <Link to={`/detalhe-solicitacao/${solicitacao.id}`} title="Ver detalhes">
                                                <i className="bi bi-eye-fill icone-olho"></i>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Nenhuma solicitação encontrada.</p>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default HomeCRE;
