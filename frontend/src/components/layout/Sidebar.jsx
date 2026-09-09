import {
    LayoutDashboard,
    ScanSearch,
    Briefcase,
    ChartNoAxesCombined,
    ChartSpline,
    Star,
    Newspaper,
    Bell,
    Bot,
    Settings,
    ShieldCheck,
} from "lucide-react";

import {
    NavLink,
} from "react-router-dom";

export default function Sidebar() {

    const linkClass = ({ isActive }) =>
    `sidebar-item ${isActive ? "active" : ""}`;

    return (

        <aside className="sidebar">

            <div className="mb-6">

                <h2 className="text-xl font-bold text-white">
                    Smart Analytics
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                    Trading Intelligence
                </p>

            </div>


            <nav className="sidebar-nav">

                <NavLink
                    to="/"
                    className={linkClass}                >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </NavLink>
		
		                <NavLink
                    to="/scanner"
                    className={linkClass}
                >
                    <ScanSearch size={18} />
                    <span>Scanner</span>
                </NavLink>


                <NavLink
    to="/trading-setups"
    className={linkClass}
>
    <ChartNoAxesCombined size={18} />
    <span>Trading Setups</span>
</NavLink>


<NavLink
    to="/trading-performance"
    className={linkClass}
>
    <ChartSpline size={18} />
    <span>Performance</span>
</NavLink>


<NavLink
    to="/portfolio"
    className={linkClass}
>
    <Briefcase size={18} />
    <span>Portfolio</span>
</NavLink>


                <NavLink
                    to="/watchlist"
                    className={linkClass}
                >
                    <Star size={18} />
                    <span>Watchlist</span>
                </NavLink>


                <NavLink
                    to="/news"
                    className={linkClass}
                >
                    <Newspaper size={18} />
                    <span>News</span>
                </NavLink>


                <NavLink
                    to="/alerts"
                    className={linkClass}
                >
                    <Bell size={18} />
                    <span>Alerts</span>
                </NavLink>


                <NavLink
                    to="/ai"
                    className={linkClass}
                >
                    <Bot size={18} />
                    <span>AI Lab</span>
                </NavLink>


                <NavLink
                    to="/settings"
                    className={linkClass}
                >
                    <Settings size={18} />
                    <span>Settings</span>
                </NavLink>


                <NavLink
                    to="/admin"
                    className={linkClass}
                >
                    <ShieldCheck size={18} />
                    <span>Admin</span>
                </NavLink>

            </nav>

        </aside>
    );
}