import {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";


// ============================================================
// LOGIN PAGE
// ============================================================

export default function Login() {

    const navigate = useNavigate();

    const {
        login,
    } = useAuth();


    const [
        email,
        setEmail,
    ] = useState("");


    const [
        password,
        setPassword,
    ] = useState("");


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    // ========================================================
    // SUBMIT
    // ========================================================

    async function handleSubmit(event) {

        event.preventDefault();

        setError("");

        setLoading(true);

        try {

            await login(
                email.trim(),
                password
            );

            navigate(
                "/",
                {
                    replace: true,
                }
            );

        } catch (error) {

            setError(
                error.message ||
                "Email o contraseña incorrectos."
            );

        } finally {

            setLoading(false);
        }
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">

            <div className="w-full max-w-md">

                <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-8">

                    <div className="text-center mb-8">

                        <h1 className="text-2xl font-bold text-white">
                            SmartAnalyticsPlatform
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Inicia sesión en tu plataforma de análisis.
                        </p>

                    </div>


                    {error && (

                        <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">

                            {error}

                        </div>

                    )}


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div>

                            <label
                                htmlFor="email"
                                className="block mb-2 text-sm font-medium text-slate-300"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="rodolfo@test.com"
                                autoComplete="email"
                                required
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                            />

                        </div>


                        <div>

                            <label
                                htmlFor="password"
                                className="block mb-2 text-sm font-medium text-slate-300"
                            >
                                Contraseña
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                            />

                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {loading
                                ? "Iniciando sesión..."
                                : "Iniciar sesión"
                            }

                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}