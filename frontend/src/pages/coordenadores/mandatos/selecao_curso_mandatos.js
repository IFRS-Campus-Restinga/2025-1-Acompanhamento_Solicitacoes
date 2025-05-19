import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../components/base/footer';
import Header from '../../../components/base/headers/header';
import BotaoVoltar from "../../../components/UI/botoes/botao_voltar";
import api from '../../../services/api';

export default function SelecaoCursoMandato() {
    const [cursos, setCursos] = useState([]);
    const [cursoSelecionado, setCursoSelecionado] = useState('');
    const [erroCarregarCursos, setErroCarregarCursos] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function carregarCursos() {
            try {
                const response = await api.get('/cursos/'); // Endpoint para listar todos os cursos
                setCursos(response.data);
            } catch (error) {
                console.error('Erro ao carregar cursos:', error);
                setErroCarregarCursos('Erro ao carregar a lista de cursos.');
            }
        }

        carregarCursos();
    }, []);

    const handleCursoChange = (event) => {
        setCursoSelecionado(event.target.value);
    };

    const handleSubmit = () => {
        if (cursoSelecionado) {
            navigate(`/mandatos/curso/${cursoSelecionado}`); // Navega para a tela de lista com o codigo do curso
        } else {
            alert('Por favor, selecione um curso.');
        }
    };

    return (
        <div>
            <Header />
            <main className="container">
                <h2>Selecione o Curso</h2>

                {erroCarregarCursos && <p className="erro-mensagem">{erroCarregarCursos}</p>}

                {cursos.length > 0 ? (
                    <div className="selecao-curso-wrapper">
                        <label htmlFor="curso">Curso:</label>
                        <select id="curso" value={cursoSelecionado} onChange={handleCursoChange}>
                            <option value="">-- Selecione um curso --</option>
                            {cursos.map(curso => (
                                <option key={curso.codigo} value={curso.codigo}>
                                    {curso.nome} ({curso.codigo})
                                </option>
                            ))}
                        </select>
                        <button onClick={handleSubmit} className="submit-button"> Visualizar Mandatos</button>
                    </div>
                ) : (
                    <p>Carregando lista de cursos...</p>
                )}
                <BotaoVoltar onClick={() => navigate("/")} />
            </main>
            <Footer />
        </div>
    );
}