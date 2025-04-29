import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import Options from "../../../components/options";
import Popup from "../../../components/pop_ups/popup_feedback"
import { useNavigate } from "react-router-dom";

export default function Formulario() {
    const [popularMotivosDispensa, setPopularMotivosDispensa] = useState([]);
    const [dados, setDados] = useState({});
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [msgErro, setMsgErro] = useState([]);

    const urls = useMemo(() => [
        "http://localhost:8000/solicitacoes/dispensa_ed_fisica/",
        "http://localhost:8000/solicitacoes/anexos/"
    ], []);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/motivo_dispensa/")
            .then((response) => setPopularMotivosDispensa(response.data))
            .catch((err) => console.error("Erro ao buscar motivos:", err));
    }, []);

    const handleFormChange = (dadosAtualizados) => {
        setDados(dadosAtualizados);
    };

    const postDispensaEdFisica = async (e) => {
        e.preventDefault();
    
        try {
            // Primeiro envia a solicitação de dispensa
            const responseDispensa = await axios.post(
                "http://localhost:8000/solicitacoes/dispensa_ed_fisica/",
                {
                    descricao: dados.descricao,
                    motivo_solicitacao: dados.motivo_solicitacao
                }
            );
    
            const formDispensaId = responseDispensa.data.id;
    
            // Agora envia os anexos, um a um
            if (dados.anexo instanceof FileList) {
                const promises = Array.from(dados.anexo).map((file) => {
                    const formData = new FormData();
                    formData.append("form_dispensa_ed_fisica", formDispensaId);
                    formData.append("anexo", file);
    
                    return axios.post(
                        "http://localhost:8000/solicitacoes/anexos/",
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        }
                    );
                });
    
                await Promise.all(promises); // Aguarda todos enviarem
            } else if (dados.anexo instanceof File) {
                const formData = new FormData();
                formData.append("form_dispensa_ed_fisica", formDispensaId);
                formData.append("anexo", dados.anexo);
    
                await axios.post(
                    "http://localhost:8000/solicitacoes/anexos/",
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            }
    
            navigate("/solicitacoes");
    
        } catch (err) {
            console.error(err);
            setMsgErro(err);
            setPopupIsOpen(true);
        }
    };
    
    

    return (
        <div>
            <Header />
            <main className="container form-container">
            <h2>Formulário de Dispensa de Educação Física</h2>
                <form className="form-box" onSubmit={postDispensaEdFisica}>
                    <div className="form-group">
                        <Options
                            url={urls}
                            popularCampo={popularMotivosDispensa}
                            onChange={handleFormChange}
                            ignoreFields={["id", "form_dispensa_ed_fisica", "form_exercicos_domiciliares", "form_abono_falta"]}
                        />
                    </div>
                    <button type="submit" className="submit-button">Enviar</button>
                </form>
            </main>
            {popupIsOpen && (
                <Popup 
                show={popupIsOpen}
                mensagem={msgErro}
                tipo="error"
                onClose={() => setPopupIsOpen(false)}
            />
            )}
            <Footer />
        </div>
    );
}
