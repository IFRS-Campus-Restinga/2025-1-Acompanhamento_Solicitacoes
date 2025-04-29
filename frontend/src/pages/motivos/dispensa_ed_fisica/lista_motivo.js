import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from "../../../components/base/footer";
import Header from "../../../components/base/header";
import PopupConfirmacao from '../../../components/pop_ups/popup_confirmacao';
import BarraPesquisa from '../../../components/UI/barra_pesquisa';
import PopupFeedback from '../../../components/pop_ups/popup_feedback';

// PAGINAÇÃO
import Paginacao from "../../../components/UI/paginacao";

//BOTÕES
import BotaoCadastrar from "../../../components/UI/botoes/botao_cadastrar";
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";

export default function ListarMotivoDispensa() {

    const [motivos, setMotivo] = useState([]);
    const [popupMsg, setPopupMsg] = useState(null);
    const [popupType, setPopupType] = useState(null);
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [motivoSelecionado, setMotivoSelecionado] = useState(null);
    const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [filtro, setFiltro] = useState("");

    const itensPorPagina = 5;

    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/motivo_dispensa/"
        ).then((response) =>
            setMotivo(response.data)
        ).catch((error) =>
            console.log(error)
        )
    }, []);

    // Resetar página quando filtro muda
    useEffect(() => {
        setPaginaAtual(1);
    }, [filtro]);

    // Filtrar motivos com useMemo
    const motivosFiltrados = useMemo(() =>
        motivos.filter((motivo) =>
            motivo.descricao.toLowerCase().includes(filtro.toLowerCase())
        ), [motivos, filtro]);

    // Dados da página atual com useMemo
    const dadosPaginados = useMemo(() =>
        motivosFiltrados.slice(
            (paginaAtual - 1) * itensPorPagina,
            paginaAtual * itensPorPagina
        ), [motivosFiltrados, paginaAtual, itensPorPagina]);

    const confirmarExclusao = () => {
        axios.delete(`http://localhost:8000/solicitacoes/motivo_dispensa/${motivoSelecionado}/`)
            .then(() => {
                setPopupMsg("Motivo excluído com sucesso.");
                setPopupType("sucesso");
                setMotivo(motivos.filter((m) => m.id !== motivoSelecionado));
            })
            .catch((err) => {
                setPopupMsg(`Erro ${err.response?.status || ""}: ${err.response?.data?.detail || "Erro ao excluir motivo."}`);
                setPopupType("erro");
            })
            .finally(() => {
                setPopupIsOpen(false);
                setFeedbackIsOpen(true);
                setMotivoSelecionado(null);
            });
    };

    return (
        <div>
            <Header />
            <main className='container'>
                <h2>Motivos de dispensa de educação física</h2>

                {/* Botão de cadastrar */}
                <BotaoCadastrar to="/motivo_dispensa/cadastrar" title="Criar Novo Motivo" />

                <BarraPesquisa
                    value={filtro}
                    onChange={(e) => {
                        setFiltro(e.target.value);
                        setPaginaAtual(1);
                    }}
                />

                {motivosFiltrados.length === 0 ? (
                    <p className="mt-4">Nenhum motivo encontrado.</p>
                ) : (
                    <table className='tabela-cruds'>
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dadosPaginados.map((motivo, index) => (
                                <tr key={motivo.id} className={index % 2 === 0 ? "linha-par" : "linha-impar"}>
                                    <td>{motivo.descricao}</td>
                                    <td>
                                        <div className="botoes-acoes">
                                            <Link to={`/motivo_dispensa/${motivo.id}`}>
                                                <i className="bi bi-pencil-square icone-editar" title='Editar'></i>
                                            </Link>
                                            <button className='icone-botao' title='Excluir' onClick={() => {
                                                setMotivoSelecionado(motivo.id);
                                                setPopupIsOpen(true);
                                            }}>
                                                <i className="bi bi-trash3-fill icone-excluir"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}


                        </tbody>
                    </table>
                )}


                {motivosFiltrados.length > itensPorPagina && (
                    <Paginacao
                        dados={motivosFiltrados}
                        paginaAtual={paginaAtual}
                        setPaginaAtual={setPaginaAtual}
                        itensPorPagina={itensPorPagina}
                        onDadosPaginados={() => {}}
                    />
                )}

                <PopupConfirmacao
                    show={popupIsOpen}
                    onConfirm={confirmarExclusao}
                    onCancel={() => setPopupIsOpen(false)}
                />

                <PopupFeedback
                    show={feedbackIsOpen}
                    mensagem={popupMsg}
                    tipo={popupType}
                    onClose={() => setFeedbackIsOpen(false)}
                />

                <BotaoVoltar onClick={() => navigate("/")} />

            </main>
            <Footer />
        </div>
    );
}




