import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../../components/base/footer';
import HeaderCRE from "../../../components/base/headers/header_cre";
import PopupConfirmacao from '../../../components/pop_ups/popup_confirmacao';
import PopupFeedback from '../../../components/pop_ups/popup_feedback';
import BotaoCadastrar from '../../../components/UI/botoes/botao_cadastrar';
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";
import api from '../../../services/api';

// BARRA PESQUISA
import BarraPesquisa from "../../../components/UI/barra_pesquisa";

// PAGINAÇÃO
import Paginacao from "../../../components/UI/paginacao"; 

// Função auxiliar para formatar a data corretamente para exibição (DD/MM/YYYY)
const formatarDataParaExibicaoLocal = (dataString) => {
    if (!dataString) return '';
    const dataFormatada = dataString.replace(/-/g, '/');
    return new Date(dataFormatada).toLocaleDateString();
};

export default function HistoricoMandatos() {
    const [todosMandatos, setTodosMandatos] = useState([]);
    const [mandatosFiltrados, setMandatosFiltrados] = useState([]);
    const [termoBusca, setTermoBusca] = useState('');

    const [mostrarPopupExcluir, setMostrarPopupExcluir] = useState(false);
    const [mandatoSelecionadoParaExcluir, setMandatoSelecionadoParaExcluir] = useState(null);
    const [mostrarFeedback, setMostrarFeedback] = useState(false);
    const [mensagemFeedback, setMensagemFeedback] = useState('');
    const [tipoFeedback, setTipoFeedback] = useState('sucesso');
    const navigate = useNavigate();


    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10; 

    // Carrega os dados iniciais do histórico
    useEffect(() => {
        async function carregarHistoricoMandatos() {
            try {
                const response = await api.get('/mandatos/historico/');
                const historicoAgrupado = response.data;

                const mandatosFlat = historicoAgrupado.reduce((acc, curso) => {
                    const mandatosDoCurso = curso.historico_mandatos.map(mandato => ({
                        ...mandato,
                        nome_curso: curso.nome,
                        codigo_curso: curso.codigo
                    }));
                    return acc.concat(mandatosDoCurso);
                }, []);

                setTodosMandatos(mandatosFlat);

            } catch (error) {
                console.error('Erro ao carregar histórico de mandatos:', error);
                setMensagemFeedback(`Erro ao carregar histórico de mandatos: ${error.message}`);
                setTipoFeedback('erro');
                setMostrarFeedback(true);
            }
        }

        carregarHistoricoMandatos();
    }, []);

    // Filtra os mandatos sempre que o termo de busca ou a lista completa mudar
    useEffect(() => {
        const termoLower = termoBusca.toLowerCase().trim();

        let filtrados;
        if (!termoLower) {
            filtrados = todosMandatos;
        } else {
            filtrados = todosMandatos.filter(mandato => {
                // Garante que todos os campos sejam strings antes de toLowerCase
                const nomeCurso = String(mandato.nome_curso || '').toLowerCase();
                const codigoCurso = String(mandato.codigo_curso || '').toLowerCase();
                const nomeCoordenador = String(mandato.coordenador?.usuario?.nome || '').toLowerCase();
                const siapeCoordenador = String(mandato.coordenador?.siape || '').toLowerCase(); 
                const inicioMandatoFormatado = String(formatarDataParaExibicaoLocal(mandato.inicio_mandato) || '').toLowerCase();
                const fimMandatoFormatado = String(mandato.fim_mandato ? formatarDataParaExibicaoLocal(mandato.fim_mandato) : 'atual').toLowerCase();

                return (
                    nomeCurso.includes(termoLower) ||
                    codigoCurso.includes(termoLower) ||
                    nomeCoordenador.includes(termoLower) ||
                    siapeCoordenador.includes(termoLower) ||
                    inicioMandatoFormatado.includes(termoLower) ||
                    fimMandatoFormatado.includes(termoLower)
                );
            });
        }
        setMandatosFiltrados(filtrados);
        // Resetar para a primeira página sempre que o filtro mudar
        if (paginaAtual !== 1) {
             setPaginaAtual(1);
        }

    }, [termoBusca, todosMandatos]); 

    
    async function excluirMandato() {
        if (!mandatoSelecionadoParaExcluir) return;
        try {
            await api.delete(`/mandatos/${mandatoSelecionadoParaExcluir}/`);
            // Remove o mandato da lista completa (o useEffect acima cuidará de atualizar a filtrada)
            setTodosMandatos(prev => prev.filter(m => m.id !== mandatoSelecionadoParaExcluir));

            setMensagemFeedback('Mandato excluído com sucesso.');
            setTipoFeedback('sucesso');
        } catch (error) {
            console.error('Erro ao excluir mandato:', error);
            const errorMsg = error.response?.data?.detail || error.message;
            setMensagemFeedback(`Erro ao excluir mandato: ${errorMsg}`);
            setTipoFeedback('erro');
        } finally {
            setMostrarPopupExcluir(false);
            setMostrarFeedback(true);
            setMandatoSelecionadoParaExcluir(null);
        }
    }

    // Atualizar o estado do termo de busca conforme o usuário digita
    const handleBuscaChange = (event) => {
        setTermoBusca(event.target.value);
        // UseEffect reseta a página
    };

    // Calcula os mandatos para a página atual
    const indiceInicio = (paginaAtual - 1) * itensPorPagina;
    const indiceFim = paginaAtual * itensPorPagina;
    const mandatosPaginados = mandatosFiltrados.slice(indiceInicio, indiceFim);

    return (
        <div>
            <HeaderCRE />
            <main className="container">
                <h2>Lista de Mandatos</h2>
                <div className="botoes-wrapper">
                    <BotaoCadastrar to="/mandatos/cadastrar" title="Criar Novo Mandato" />
                </div>

                <BarraPesquisa
                    value={termoBusca}
                    onChange={handleBuscaChange}
                    placeholder="Buscar..."
                />

                {mandatosFiltrados.length === 0 ? (
                    <p className="text-center muted" style={{ marginTop: '20px' }}>
                        {termoBusca ? 'Nenhum mandato encontrado para sua busca.' : 'Nenhum mandato cadastrado.'}
                    </p>
                ) : (
                    <>
                            <table className="tabela-cruds">
                                <thead>
                                    <tr>
                                        <th>Curso</th>
                                        <th>Coordenador (SIAPE)</th>
                                        <th>Início Mandato</th>
                                        <th>Fim Mandato</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    
                                    {mandatosPaginados.map((mandato) => (
                                        <tr key={mandato.id}>
                                            <td>{mandato.nome_curso} ({mandato.codigo_curso})</td>
                                            <td>{mandato.coordenador?.usuario?.nome} ({mandato.coordenador?.siape})</td>
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
                        

                        <Paginacao
                            dados={mandatosFiltrados}
                            paginaAtual={paginaAtual}
                            setPaginaAtual={setPaginaAtual}
                            itensPorPagina={itensPorPagina}
                            onDadosPaginados={() => {}}
                        />
                    </>
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

