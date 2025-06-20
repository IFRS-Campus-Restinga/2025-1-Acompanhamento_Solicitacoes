import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

export default function ListaMandatosPorCurso() {
    const { cursoCodigo } = useParams();
    const [mandatosDoCurso, setMandatosDoCurso] = useState([]);
    const [cursoNome, setCursoNome] = useState('');
    const [mostrarPopupExcluir, setMostrarPopupExcluir] = useState(false);
    const [mandatoSelecionadoParaExcluir, setMandatoSelecionadoParaExcluir] = useState(null);
    const [mostrarFeedback, setMostrarFeedback] = useState(false);
    const [mensagemFeedback, setMensagemFeedback] = useState('');
    const [tipoFeedback, setTipoFeedback] = useState('sucesso');
    const navigate = useNavigate();

    useEffect(() => {
        async function carregarMandatosDoCurso() {
            try {
                const response = await api.get(`/mandatos/historico/${cursoCodigo}`);
                if (response.data) {
                    setMandatosDoCurso(response.data.historico_mandatos);
                    setCursoNome(response.data.nome);
                } else {
                    setCursoNome('Erro ao carregar informações do curso.');
                }
            } catch (error) {
                console.error('Erro ao carregar mandatos do curso:', error);
                setMensagemFeedback(`Erro ao carregar mandatos: ${error.message}`);
                setTipoFeedback('erro');
                setMostrarFeedback(true);
            }
        }

        carregarMandatosDoCurso();
    }, [cursoCodigo]);

    async function excluirMandato() {
        if (!mandatoSelecionadoParaExcluir) return;
        try {
            await api.delete(`/mandatos/${mandatoSelecionadoParaExcluir}/`);
            setMandatosDoCurso(prevMandatos =>
                prevMandatos.filter(mandato => mandato.id !== mandatoSelecionadoParaExcluir)
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
                <h2>Mandatos do Curso: {cursoNome}</h2>

                <div className="botoes-wrapper">
                    <BotaoCadastrar to={`/mandatos/cadastrar/`} title="Criar Novo Mandato" />
                </div>

                {mandatosDoCurso && mandatosDoCurso.length === 0 ? (
                    <p>Nenhum mandato encontrado para este curso.</p>
                ) : (
                    <table className="tabela-cruds">
                        <thead>
                            <tr>
                                <th>Coordenador (SIAPE)</th>
                                <th>Início do Mandato</th>
                                <th>Fim do Mandato</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mandatosDoCurso && mandatosDoCurso.map((mandato, index) => (
                                <tr key={mandato.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
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
                <BotaoVoltar onClick={() => navigate("/mandatos-selecionarcurso")} />
            </main>
            <Footer />
        </div>
    );
}

