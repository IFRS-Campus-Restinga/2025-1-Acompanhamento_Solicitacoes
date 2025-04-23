import axios from "axios";
import { useEffect, useState } from "react";
import Header from "../../../components/base/header";
import Footer from "../../../components/base/footer";

export default function Formulario() {
    const [options, setOptions] = useState({});
    const [popularMotivosDispensa, setPopularMotivosDispensa] = useState([]);
    const [anexos, setAnexos] = useState([]);
    const [dados, setDados] = useState([]);

    useEffect(() => {
        axios.options('http://localhost:8000/solicitacoes/dispensa_ed_fisica/')
            .then((response) => setOptions(response.data))
            .catch((err) => console.error(err));

        axios.get('http://localhost:8000/solicitacoes/motivo_dispensa/')
            .then((response) => setPopularMotivosDispensa(response.data))
            .catch((err) => console.error(err));
    }, []); // adiciona o array de dependências vazio para evitar loop infinito

    const handleSubmit = () => {
        {Object.entries(options.actions.POST).map(([key]) => {
            setDados([
                ...dados,
                document.getElementById(`${key}`).value
            ]) 
        })}
        alert(dados)
    
            axios.post("http://localhost:8000/solicitacoes/dispensa_ed_fisica/", dados)
          .then(() => {

          })
          .catch((err) => {
            alert(err)
          });
      };

    return (
        <div>
            <Header />
            <main className="container form-container">
                <form className="form-box" onSubmit={handleSubmit}>
                    <div className="form-group">
                        {options.actions && options.actions.POST &&
                            Object.entries(options.actions.POST).map(([key, value]) => {
                                if (value.type === "string") {
                                    return (
                                        <div key={key}>
                                            <label htmlFor={key}>{value.label}</label>
                                            <input
                                                id={key}
                                                name={key}
                                                type="text"
                                                required={value.required}
                                                minLength={value.min_length ?? undefined}
                                                maxLength={value.max_length ?? undefined}
                                                //onChange={(e) => setDados(
                                                //    [
                                                //        ...dados,
                                                //        e.target.value
                                                //    ]
                                                //)}
                                            />
                                        </div>
                                    );
                                } else if (value.type === "field") {
                                    return (
                                        <div key={key}>
                                            <label htmlFor={key}>{value.label}</label>
                                            <select name={key} 
                                            id={key} 
                                            required={value.required}
                                            >
                                                {popularMotivosDispensa.map((motivo) => (
                                                    <option key={motivo.id} value={motivo.id}>
                                                        {motivo.descricao}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                } else {
                                    return null;
                                }
                            })
                        }
                        
                    </div>
                    <button type="submit" className="submit-button">Enviar</button>
                </form>
            </main>
            <Footer />
        </div>
    );
}
