import { useState, useEffect } from "react";

export default function BuscaUsuario({ dadosUsuario }) {
    const [userData, setUserData] = useState(undefined);

    // Busca inicial e escuta mudanças no localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("googleUser");
        if (storedUser) {
            try {
                setUserData(JSON.parse(storedUser));
            } catch (error) {
                console.error("Erro ao parsear googleUser:", error);
                localStorage.removeItem("googleUser");
                localStorage.removeItem("appToken");
                setUserData(null);
            }
        } else {
            setUserData(null);
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

    // Notifica o componente pai após a leitura
    useEffect(() => {
        if (userData !== undefined) {
            dadosUsuario(userData);
        }
    }, [userData, dadosUsuario]);

    return null;
}
