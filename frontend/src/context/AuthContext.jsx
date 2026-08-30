// ============================================================
// SmartAnalyticsPlatform
// frontend/src/context/AuthContext.jsx
// CONTEXTO GLOBAL DE AUTENTICACIÓN
// ============================================================

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    login as apiLogin,
    logout as apiLogout,
    getCurrentUser,
} from "../api/api";


// ============================================================
// CONTEXT
// ============================================================

const AuthContext = createContext(null);


// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);


    // ========================================================
    // CHECK SESSION
    // ========================================================

    useEffect(() => {

        async function checkSession() {

            const token =
                localStorage.getItem(
                    "access_token"
                );

            if (!token) {

                setLoading(false);

                return;
            }

            try {

                const currentUser =
                    await getCurrentUser();

                setUser(currentUser);

            } catch (error) {

                console.error(
                    "Session validation error:",
                    error
                );

                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem(
                    "token_type"
                );

                localStorage.removeItem(
                    "user"
                );

                setUser(null);

            } finally {

                setLoading(false);
            }
        }

        checkSession();

    }, []);


    // ========================================================
    // LOGIN
    // ========================================================

    async function login(email, password) {

        setError(null);

        setLoading(true);

        try {

            // ------------------------------------------------
            // AUTENTICACIÓN CONTRA BACKEND
            // ------------------------------------------------

            const data =
                await apiLogin(
                    email,
                    password
                );


            // ------------------------------------------------
            // VALIDAR TOKEN
            // ------------------------------------------------

            if (!data) {

                throw new Error(
                    "El servidor no devolvió una respuesta válida."
                );
            }


            if (!data.access_token) {

                throw new Error(
                    "El servidor no devolvió un access_token."
                );
            }


            // ------------------------------------------------
            // GUARDAR TOKEN
            // ------------------------------------------------

            localStorage.setItem(
                "access_token",
                data.access_token
            );


            localStorage.setItem(
                "token_type",
                data.token_type || "bearer"
            );


            // ------------------------------------------------
            // OBTENER USUARIO AUTENTICADO
            // ------------------------------------------------

            const currentUser =
                await getCurrentUser();


            // ------------------------------------------------
            // GUARDAR USUARIO
            // ------------------------------------------------

            setUser(currentUser);


            localStorage.setItem(
                "user",
                JSON.stringify(currentUser)
            );


            return currentUser;

        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            // --------------------------------------------
            // LIMPIAR SESIÓN SI FALLA
            // --------------------------------------------

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "token_type"
            );

            localStorage.removeItem(
                "user"
            );


            setUser(null);


            const message =
                error?.message ||
                "No se pudo iniciar sesión.";


            setError(message);


            throw new Error(message);

        } finally {

            setLoading(false);
        }
    }


    // ========================================================
    // LOGOUT
    // ========================================================

    function logout() {

        setUser(null);

        setError(null);

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "token_type"
        );

        localStorage.removeItem(
            "user"
        );

        apiLogout();
    }


    // ========================================================
    // CONTEXT VALUE
    // ========================================================

    const value = {

        user,

        loading,

        error,

        isAuthenticated:
            Boolean(user),

        login,

        logout,

    };


    // ========================================================
    // PROVIDER
    // ========================================================

    return (

        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>

    );
}


// ============================================================
// HOOK
// ============================================================

export function useAuth() {

    const context =
        useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth debe utilizarse dentro de AuthProvider."
        );
    }


    return context;
}