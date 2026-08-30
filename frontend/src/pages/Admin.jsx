import { useEffect, useState } from "react";

import api from "../api/api";

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadUsers() {
        try {
            setLoading(true);
            setError("");

            const data =
                await api.getUsers();

            setUsers(
                Array.isArray(data)
                    ? data
                    : data?.users || []
            );
        } catch (err) {
            console.error(
                "Admin users error:",
                err
            );

            setError(
                err.message ||
                    "No se pudieron cargar los usuarios."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>
                        Administración
                    </h1>

                    <p>
                        Gestión de usuarios de
                        SmartAnalyticsPlatform.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadUsers}
                    disabled={loading}
                >
                    {loading
                        ? "Cargando..."
                        : "Actualizar"}
                </button>
            </div>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            <div className="admin-card">
                <h2>Usuarios</h2>

                {loading ? (
                    <p>
                        Cargando usuarios...
                    </p>
                ) : users.length === 0 ? (
                    <p>
                        No hay usuarios
                        disponibles.
                    </p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>
                                        Email
                                    </th>
                                    <th>
                                        Nombre
                                    </th>
                                    <th>
                                        Estado
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map(
                                    (item) => (
                                        <tr
                                            key={
                                                item.id
                                            }
                                        >
                                            <td>
                                                {
                                                    item.id
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.email
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.name ||
                                                    item.username ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {item.is_active ===
                                                false
                                                    ? "Inactivo"
                                                    : "Activo"}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}