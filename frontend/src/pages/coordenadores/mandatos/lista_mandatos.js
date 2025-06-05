import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../../components/base/footer';
import HeaderCRE from "../../../components/base/headers/header_cre";
import PopupConfirmacao from '../../../components/pop_ups/popup_confirmacao';
import PopupFeedback from '../../../components/pop_ups/popup_feedback';
import BotaoCadastrar from '../../../components/UI/botoes/botao_cadastrar';
import BotaoEditar from "../../../components/UI/botoes/botao_editar";
import BotaoExcluir from "../../../components/UI/botoes/botao_excluir";
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";
import api from '../../../services/api';

// BARRA PESQUISA
import BarraPesquisa from "../../../components/UI/barra_pesquisa";

// PAGINAÇÃO
import Paginacao from "../../../components/UI/paginacao";

// Função auxiliar para formatar a data (YYYY-MM-DD para DD/MM/YYYY)
const formatarDataParaExibicao = (dataString) => {
    if (!dataString) return '';
    // Verifica se a string já está no formato DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataString)) {
        return dataString;
    }
    // Assume formato YYYY-MM-DD
    const partes = dataString.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    // Retorna a string original se não conseguir formatar
    return dataString;
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

    // Carrega os dados iniciais da API de mandatos
    useEffect(() => {
        async function carregarMandatosOrdenados() {
            try {
                const response = await api.get('/mandatos/historico/'); 
                
                
                setTodosMandatos(response.data || []);

            } catch (error) {
                console.error('Erro ao carregar mandatos ordenados:', error);
                const errorMsg = error.response?.data?.detail || error.message;
                setMensagemFeedback(`Erro ao carregar mandatos: ${errorMsg}`);
                setTipoFeedback('erro');
                setMostrarFeedback(true);
            }
        }

        carregarMandatosOrdenados();
    }, []);

    // Filtra os mandatos sempre que o termo de busca ou a lista completa mudar
    useEffect(() => {
        const termoLower = termoBusca.toLowerCase().trim();

        let filtrados;
        if (!termoLower) {
            filtrados = todosMandatos;
        } else {
            filtrados = todosMandatos.filter(mandato => {
                const nomeCurso = String(mandato.curso?.nome || '').toLowerCase();
                const codigoCurso = String(mandato.curso?.codigo || '').toLowerCase();
                const nomeCoordenador = String(mandato.coordenador?.nome || '').toLowerCase(); 
                const siapeCoordenador = String(mandato.coordenador?.siape || '').toLowerCase();
                const inicioMandatoFormatado = String(formatarDataParaExibicao(mandato.inicio_mandato) || '').toLowerCase();
                const fimMandatoFormatado = String(mandato.fim_mandato ? formatarDataParaExibicao(mandato.fim_mandato) : 'atual').toLowerCase();

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
        if (paginaAtual !== 1 && filtrados.length > 0) { 
             setPaginaAtual(1);
        }

    }, [termoBusca, todosMandatos]); 

    
    async function excluirMandato() {
        if (!mandatoSelecionadoParaExcluir) return;
        try {
            await api.delete(`/mandatos/${mandatoSelecionadoParaExcluir}/`);
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

    const handleBuscaChange = (event) => {
        setTermoBusca(event.target.value);
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
                                        <td>{mandato.curso?.nome} ({mandato.curso?.codigo})</td>
                                        <td>{mandato.coordenador?.nome} ({mandato.coordenador?.siape})</td>
                                        <td>{formatarDataParaExibicao(mandato.inicio_mandato)}</td>
                                        <td>{mandato.fim_mandato ? formatarDataParaExibicao(mandato.fim_mandato) : 'Atual'}</td>
                                        <td>
                                            <div className="botoes-acoes">
                                                <BotaoEditar to={`/mandatos/editar/${mandato.id}`} />
                                                <BotaoExcluir onClick={() => {
                                                    setMandatoSelecionadoParaExcluir(mandato.id);
                                                    setMostrarPopupExcluir(true);
                                                    }} />
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

