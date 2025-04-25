import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import Options from "../../../components/options";
import Popup from "../../../components/popup"
import { useNavigate } from "react-router-dom";

export default function Formulario() {
    const [popularMotivosDispensa, setPopularMotivosDispensa] = useState([]);
    const [dados, setDados] = useState({});
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [msgErro, setMsgErro] = useState([]);

    const popupActions = [
        {
          label: "Fechar",
          className: "btn btn-cancel",
          onClick: () => {
            setPopupIsOpen(false);
            navigate('/solicitacoes');
          }
        }
      ];

    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/motivo_dispensa/")
            .then((response) => setPopularMotivosDispensa(response.data))
            .catch((err) => console.error("Erro ao buscar motivos:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
            await axios.post(
                "http://localhost:8000/solicitacoes/dispensa_ed_fisica/",
                dados
            )
            .then(() => {
                navigate("/solicitacoes");
            })
            .catch((err) => {
                setMsgErro(err);
                setPopupIsOpen(true);
            })
    };

    const handleFormChange = (dadosAtualizados) => {
        setDados(dadosAtualizados);
    };

    return (
        <div>
            <Header />
            <main className="container form-container">
                <form className="form-box" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <Options
                            url="http://localhost:8000/solicitacoes/dispensa_ed_fisica/"
                            popularCampo={popularMotivosDispensa}
                            onChange={handleFormChange}
                            ignoreFields={["id"]}
                        />
                    </div>
                    <button type="submit" className="submit-button">Enviar</button>
                </form>
            </main>
            {popupIsOpen && (
                <Popup 
                message={msgErro.response?.data?.motivo_solicitacao}
                isError={true}
                actions={popupActions}
            />
            )}
            <Footer />
        </div>
    );
}
