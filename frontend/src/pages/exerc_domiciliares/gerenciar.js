import HeaderAluno from "../../components/base/headers/header_aluno"
import Footer from "../../components/base/footer"
import { use, useEffect, useState } from "react"
import axios from "axios";
import PopupFeedback from "../../components/pop_ups/popup_feedback";
import { jwtDecode } from 'jwt-decode';

export default function GerenciarExercDomicilares() {

    const [form, setForm] = useState([]);
    const [userData, setUserData] = useState(null);
    const [msgErro, setMsgErro] = useState("");
    const [feedbackIsOpen, setFeedbackIsOpen] = useState(false);
    const [tipoErro, setTipoErro] = useState("");
    const [alunos, setAlunos] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/solicitacoes/form_exercicio_domiciliar/")
            .then((data) => setForm(data))
            .catch((err) => {
                setMsgErro(err);
                setTipoErro("erro");
                setFeedbackIsOpen(true)
            })
    }, [])

    useEffect(() => {
        const storedUser = localStorage.getItem("googleUser");
        if (storedUser) {
            try {
                setUserData(JSON.parse(storedUser));
            } catch (error) {
                console.error("Erro ao parsear dados do usuário do localStorage:", error);
                localStorage.removeItem("googleUser");
                localStorage.removeItem("appToken");
            }
        }

        const handleStorageChange = (event) => {
            if (event.key === "googleUser") {
                if (event.newValue) {
                    try {
                        setUserData(JSON.parse(event.newValue));
                    } catch (error) {
                        setUserData(null);
                    }
                } else {
                    setUserData(null);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);


    return (
        <div className="page-container">
            <HeaderAluno />
            <h2>Dados da solicitação</h2>
            <main className="container">
                {userData ? (
                    <>
                        <label>Nome do aluno: {userData.name}</label>

                        <label>Email: {userData.email}</label>
                    </>
                ) : (
                    <>
                    <label>Usuário não autenticado.</label>
                    </>
            )}

                {feedbackIsOpen &&
                    <PopupFeedback mensagem={msgErro.response?.detail}
                        tipo={tipoErro}
                        onClose={setFeedbackIsOpen(false)} />}
            </main>
            <Footer />
        </div>
    )

}