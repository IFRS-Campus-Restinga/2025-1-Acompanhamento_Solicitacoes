import { useEffect, useState } from "react";

export default function useAuthToken() {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("appToken");
        if (savedToken) setToken(savedToken);
    }, []);

    return token;
}
