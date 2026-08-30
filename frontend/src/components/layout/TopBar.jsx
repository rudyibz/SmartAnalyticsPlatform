import { Search, Bell, Wifi, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function TopBar() {

    const navigate = useNavigate();

    const { logout } = useAuth();


    function handleLogout() {

        logout();

        navigate("/login", {
            replace: true,
        });

    }


    return (

        <header className="topbar">

            <div className="topbar-left">

                <h1>
                    Smart Analytics Platform
                </h1>

            </div>


            <div className="topbar-center">

                <div className="search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search asset..."
                    />

                </div>

            </div>


            <div className="topbar-right">

                <div className="status">

                    <Wifi
                        size={18}
                        color="#22C55E"
                    />

                    <span>
                        Backend Online
                    </span>

                </div>


                <Bell
                    size={20}
                    className="notification"
                />


                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                    title="Cerrar sesión"
                >

                    <LogOut size={18} />

                    <span>
                        Cerrar sesión
                    </span>

                </button>

            </div>

        </header>

    );

}
