import {
    FaChartLine,
    FaBitcoin,
    FaCog,
} from "react-icons/fa";

export default function Sidebar() {
    return (
        <aside className="sidebar">

            <h2>SAP</h2>

            <nav>

                <a href="#">
                    <FaChartLine />
                    Dashboard
                </a>

                <a href="#">
                    <FaBitcoin />
                    Markets
                </a>

                <a href="#">
                    <FaCog />
                    Settings
                </a>

            </nav>

        </aside>
    );
}