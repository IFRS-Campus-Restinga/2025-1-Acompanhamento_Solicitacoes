import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../../components/base/footer';
import HeaderCRE from "../../../components/base/headers/header_cre";
import PopupConfirmacao from '../../../components/pop_ups/popup_confirmacao';
import PopupFeedback from '../../../components/pop_ups/popup_feedback';
import BotaoCadastrar from '../../../components/UI/botoes/botao_cadastrar';
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";
import api from '../../../services/api';

// Função auxiliar para formatar a data corretamente
const formatarDataParaExibicaoLocal = (dataString) => {
    if (!dataString) return '';
    const dataFormatada = dataString.replace(/-/g, '/');
    return new Date(dataFormatada).toLocaleDateString();
};

export default function HistoricoMandatos() {
    const [historicoCursosComMandatos, setHistoricoCursosComMandatos] = useState([]);
    const [mostrarPopupExcluir, setMostrarPopupExcluir] = useState(false);
    const [mandatoSelecionadoParaExcluir, setMandatoSelecionadoParaExcluir] = useState(null);
    const [mostrarFeedback, setMostrarFeedback] = useState(false);
    const [mensagemFeedback, setMensagemFeedback] = useState('');
    const [tipoFeedback, setTipoFeedback] = useState('sucesso');
    const navigate = useNavigate();

    useEffect(() => {
        async function carregarHistoricoMandatos() {
            try {
                const response = await api.get('/mandatos/historico/'); // Endpoint para buscar o histórico agrupado por curso
                setHistoricoCursosComMandatos(response.data);
            } catch (error) {
                console.error('Erro ao carregar histórico de mandatos:', error);
                setMensagemFeedback(`Erro ao carregar histórico de mandatos: ${error.message}`);
                setTipoFeedback('erro');
                setMostrarFeedback(true);
            }
        }

        carregarHistoricoMandatos();
    }, []);

    async function excluirMandato() {
        if (!mandatoSelecionadoParaExcluir) return;
        try {
            await api.delete(`/mandatos/${mandatoSelecionadoParaExcluir}/`);
            // Atualizar o estado removendo o mandato excluído
            setHistoricoCursosComMandatos(prevHistorico =>
                prevHistorico.map(curso => ({
                    ...curso,
                    historico_mandatos: curso.historico_mandatos.filter(
                        (mandato) => mandato.id !== mandatoSelecionadoParaExcluir
                    ),
                })).filter(curso => curso.historico_mandatos.length > 0)
            );
            setMensagemFeedback('Mandato excluído com sucesso.');
            setTipoFeedback('sucesso');
        } catch (error) {
            console.error('Erro ao excluir mandato:', error);
            setMensagemFeedback(`Erro ao excluir mandato: ${error.message}`);
            setTipoFeedback('erro');
        } finally {
            setMostrarPopupExcluir(false);
            setMostrarFeedback(true);
            setMandatoSelecionadoParaExcluir(null);
        }
    }

    return (
        <div>
            <HeaderCRE />
            <main className="container">
                <h2>Lista de Mandatos por Curso</h2>

                <div className="botoes-wrapper">
                    <BotaoCadastrar to="/mandatos/cadastrar" title="Criar Novo Mandato" />
                </div>

                {historicoCursosComMandatos.length === 0 ? (
                    <p>Nenhum histórico de mandatos encontrado.</p>
                ) : (
                    historicoCursosComMandatos.map((curso) => (
                        <div key={curso.codigo} className="curso-mandatos-group">
                            <h3>{curso.nome} ({curso.codigo})</h3>
                            <table className="tabela-historico-mandatos">
                                <thead>
                                    <tr>
                                        <th>Coordenador (SIAPE)</th>
                                        <th>Início do Mandato</th>
                                        <th>Fim do Mandato</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {curso.historico_mandatos.map((mandato) => (
                                        <tr key={mandato.id}>
                                            <td>{mandato.coordenador.usuario.nome} ({mandato.coordenador.siape})</td>
                                            <td>{formatarDataParaExibicaoLocal(mandato.inicio_mandato)}</td>
                                            <td>{mandato.fim_mandato ? formatarDataParaExibicaoLocal(mandato.fim_mandato) : 'Atual'}</td>
                                            <td>
                                                <div className="botoes-acoes">
                                                    <Link to={`/mandatos/editar/${mandato.id}`} title="Editar Mandato">
                                                        <i className="bi bi-pencil-square icone-editar"></i>
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setMandatoSelecionadoParaExcluir(mandato.id);
                                                            setMostrarPopupExcluir(true);
                                                        }}
                                                        title="Excluir Mandato"
                                                        className="icone-botao"
                                                    >
                                                        <i className="bi bi-trash3-fill icone-excluir"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))
                )}

                <PopupConfirmacao
                    show={mostrarPopupExcluir}
                    onConfirm={excluirMandato}
                    onCancel={() => setMostrarPopupExcluir(false)}
                    mensagem="Tem certeza que deseja excluir este mandato?"
                />

                <PopupFeedback
                    show={mostrarFeedback}
                    mensagem={mensagemFeedback}
                    tipo={tipoFeedback}
                    onClose={() => setMostrarFeedback(false)}
                />
                <BotaoVoltar onClick={() => navigate("/configuracoes")} />
            </main>
            <Footer />
        </div>
    );
}