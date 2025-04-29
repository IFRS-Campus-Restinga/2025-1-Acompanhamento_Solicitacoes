import axios from "axios";
import { useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import Popup from "../../../components/popup";
import { useNavigate } from "react-router-dom";

export default function FormularioTrancamentoMatricula() {
    const [dados, setDados] = useState({
        aluno: "",
        curso: "",
        motivo_solicitacao: "",
    });

    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [mensagemErro, setMensagemErro] = useState("");
    const navigate = useNavigate();

    const popupActions = [
        {
            label: "Fechar",
            className: "btn btn-cancel",
            onClick: () => {
                setPopupIsOpen(false);
                navigate("/solicitacoes");
            },
        },
    ];

    const handleFormChange = (campo, valor) => {
        setDados((prevDados) => ({
            ...prevDados,
            [campo]: valor,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        await axios.post("http://localhost:8000/formularios-trancamento/", dados)
            .then(() => {
                navigate("/solicitacoes");
            })
            .catch((err) => {
                setMensagemErro(err.response?.data?.motivo_solicitacao || "Erro ao enviar o formulário.");
                setPopupIsOpen(true);
            });
    };

    return (
        <div>
            <Header />
            <main className="container form-container">
                <form className="form-box" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome do Aluno:</label>
                        <input
                            type="text"
                            className="input-text"
                            value={dados.aluno}
                            onChange={(e) => handleFormChange("aluno", e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Curso:</label>
                        <input
                            type="text"
                            className="input-text"
                            value={dados.curso}
                            onChange={(e) => handleFormChange("curso", e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Motivo do Trancamento:</label>
                        <textarea
                            className="input-text"
                            value={dados.motivo_solicitacao}
                            onChange={(e) => handleFormChange("motivo_solicitacao", e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">Enviar Solicitação</button>
                </form>
            </main>

            {popupIsOpen && (
                <Popup
                    message={mensagemErro}
                    isError={true}
                    actions={popupActions}
                />
            )}
            <Footer />
        </div>
    );
}
