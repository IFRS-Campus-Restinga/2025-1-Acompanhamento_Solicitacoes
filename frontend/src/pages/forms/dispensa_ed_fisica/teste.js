import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";
import Options from "../../../components/options";

export default function Formulario() {
    const [popularMotivosDispensa, setPopularMotivosDispensa] = useState([]);
    const [dados, setDados] = useState({});

    useEffect(() => {
        axios.get('http://localhost:8000/solicitacoes/motivo_dispensa/')
            .then((response) => setPopularMotivosDispensa(response.data))
            .catch((err) => console.error(err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); // <-- previne recarregamento da página
        console.log("Dados enviados:", dados);
        axios.post('http://localhost:8000/solicitacoes/dispensa_ed_fisica/', dados)
            .then(() => alert("Dados enviados"))
            .catch((err) => {
                console.error(err);
                alert("Erro ao enviar os dados");
            });
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
                            url='http://localhost:8000/solicitacoes/dispensa_ed_fisica/'
                            popularCampo={popularMotivosDispensa}
                            onChange={handleFormChange}  // <-- corrigido aqui
                            ignoreFields={["id"]}
                        />
                    </div>
                    <button type="submit" className="submit-button">Enviar</button>
                </form>
            </main>
            <Footer />
        </div>
    );
}
