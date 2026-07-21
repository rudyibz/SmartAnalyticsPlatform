import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
    return (
        <div className="app">

            <Sidebar />

            <div className="main">

                <Header />

                <main className="content">
                    {children}
                </main>

                <Footer />

            </div>

        </div>
    );
}