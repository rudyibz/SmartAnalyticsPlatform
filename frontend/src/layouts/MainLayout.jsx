import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";

export default function MainLayout({ children }) {

    return (

        <div className="app">

            <Sidebar />

            <div className="main">

                <TopBar />

                <div className="content">

                    {children}

                </div>

            </div>

        </div>

    );

}