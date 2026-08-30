import { useAuth } from "../context/AuthContext";

export default function Settings() {

    const {
        user,
        logout,
    } = useAuth();

    return (
        <main className="page">

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                    Settings
                </h1>

                <p className="mt-2 text-slate-400">
                    Configuración de tu cuenta.
                </p>
            </div>


            {/* PERFIL */}

            <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="mb-6 text-xl font-bold text-white">
                    Perfil
                </h2>


                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>
                        <label className="mb-2 block text-sm text-slate-400">
                            Usuario
                        </label>

                        <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white">
                            {user?.username || "—"}
                        </div>
                    </div>


                    <div>
                        <label className="mb-2 block text-sm text-slate-400">
                            Email
                        </label>

                        <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white">
                            {user?.email || "—"}
                        </div>
                    </div>


                    <div>
                        <label className="mb-2 block text-sm text-slate-400">
                            Rol
                        </label>

                        <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white">
                            {user?.role || "user"}
                        </div>
                    </div>


                    <div>
                        <label className="mb-2 block text-sm text-slate-400">
                            Estado
                        </label>

                        <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">

                            <span
                                className={
                                    user?.is_active
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                }
                            >
                                {user?.is_active
                                    ? "● Activa"
                                    : "● Inactiva"}
                            </span>

                        </div>

                    </div>

                </div>

            </section>


            {/* SEGURIDAD */}

            <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="mb-2 text-xl font-bold text-white">
                    Seguridad
                </h2>

                <p className="mb-5 text-sm text-slate-400">
                    Gestiona la sesión actual de tu cuenta.
                </p>


                <button
                    type="button"
                    onClick={logout}
                    className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-500"
                >
                    Cerrar sesión
                </button>

            </section>


            {/* INFORMACIÓN */}

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="mb-4 text-xl font-bold text-white">
                    SmartAnalyticsPlatform
                </h2>

                <div className="space-y-2 text-sm text-slate-400">

                    <p>
                        Plataforma de análisis financiero.
                    </p>

                    <p>
                        Backend: <span className="text-emerald-400">Online</span>
                    </p>

                    <p>
                        API: FastAPI
                    </p>

                    <p>
                        Frontend: React + Vite
                    </p>

                </div>

            </section>

        </main>
    );
}