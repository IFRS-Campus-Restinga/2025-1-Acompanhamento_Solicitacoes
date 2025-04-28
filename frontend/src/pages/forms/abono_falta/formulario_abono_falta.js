import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import PopupFeedback from "../../../components/pop_ups/popup_feedback";

export default function FormularioAbonoFaltas() {
    const [popularMotivosAbono, setPopularMotivosAbono] = useState([]);
    const [dados, setDados] = useState({
        acesso_moodle: false,
        perdeu_atividades: false,
        motivo_solicitacao_id: "",
        data_inicio_afastamento: "",
        data_fim_afastamento: "",
        anexos: [] // Para arquivos anexados
    });
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [tipoPopup, setTipoPopup] = useState("success");
    const [mensagemPopup, setMensagemPopup] = useState("");

    // Requisição para buscar os motivos de abono
    useEffect(() => {
        axios
            .get("http://localhost:8000/solicitacoes/motivo_abono/")
            .then((response) => setPopularMotivosAbono(response.data))
            .catch((err) => {
                console.error("Erro ao buscar motivos:", err);
                setTipoPopup("error");
                setMensagemPopup("Erro ao carregar motivos.");
                setPopupIsOpen(true);
            });
    }, []);

    // Função para envio do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        // Adiciona dados ao FormData
        Object.entries(dados).forEach(([key, value]) => {
            if (key === "anexos" && value instanceof FileList) {
                for (let i = 0; i < value.length; i++) {
                    formData.append("anexos", value[i]);
                }
            } else {
                formData.append(key, value);
            }
        });

        await axios
            .post(
                "http://localhost:8000/solicitacoes/formulario_abono_falta/",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            )
            .then(() => {
                setTipoPopup("success");
                setMensagemPopup("Formulário enviado com sucesso!");
                setPopupIsOpen(true);
                setTimeout(() => (window.location.href = "/solicitacoes"), 2000);
            })
            .catch((err) => {
                console.error("Erro ao enviar formulário:", err);
                setTipoPopup("error");
                setMensagemPopup("Erro ao enviar o formulário.");
                setPopupIsOpen(true);
            });
    };

    // Atualiza o estado para campos de texto, seleção e booleanos
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDados((prevDados) => ({
            ...prevDados,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // Atualiza o estado para os arquivos anexados
    const handleFileChange = (e) => {
        setDados((prevDados) => ({
            ...prevDados,
            anexos: e.target.files // Lista de arquivos
        }));
    };

    return (
        <div>
            <Header />
            <div className="container">
                <h2>Formulário de Abono de Faltas</h2>
                <main className="form-container">
                    <form className="form-box" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="motivo_solicitacao_id">Motivo da Solicitação:</label>
                            <select
                                id="motivo_solicitacao_id"
                                name="motivo_solicitacao_id"
                                className="input-select"
                                onChange={handleFormChange}
                                value={dados.motivo_solicitacao_id}
                            >
                                <option value="">Selecione um motivo</option>
                                {popularMotivosAbono.map((motivo) => (
                                    <option key={motivo.id} value={motivo.id}>
                                        {motivo.descricao}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="data_inicio_afastamento">Data de Início:</label>
                            <input
                                type="date"
                                id="data_inicio_afastamento"
                                name="data_inicio_afastamento"
                                className="input-text"
                                onChange={handleFormChange}
                                value={dados.data_inicio_afastamento}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="data_fim_afastamento">Data de Fim:</label>
                            <input
                                type="date"
                                id="data_fim_afastamento"
                                name="data_fim_afastamento"
                                className="input-text"
                                onChange={handleFormChange}
                                value={dados.data_fim_afastamento}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="acesso_moodle">Acesso ao Moodle:</label>
                            <input
                                type="checkbox"
                                id="acesso_moodle"
                                name="acesso_moodle"
                                className="input-checkbox"
                                onChange={handleFormChange}
                                checked={dados.acesso_moodle}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="perdeu_atividades">Perdeu Atividades:</label>
                            <input
                                type="checkbox"
                                id="perdeu_atividades"
                                name="perdeu_atividades"
                                className="input-checkbox"
                                onChange={handleFormChange}
                                checked={dados.perdeu_atividades}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="anexos">Anexar Documentos:</label>
                            <input
                                type="file"
                                id="anexos"
                                name="anexos"
                                className="input-file"
                                multiple
                                onChange={handleFileChange}
                            />
                        </div>
                        <button type="submit" className="submit-button">Enviar</button>
                    </form>
                </main>
            </div>
            <PopupFeedback
                show={popupIsOpen}
                mensagem={mensagemPopup}
                tipo={tipoPopup}
                onClose={() => setPopupIsOpen(false)}
            />
            <Footer />
        </div>
    );
}
