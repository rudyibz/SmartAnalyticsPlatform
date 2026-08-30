import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import "./styles/ai.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/cards.css";
import "./styles/sidebar.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/watchlist.css";
import "./styles/scanner.css";
import "./styles/portfolio.css";
import "./styles/dashboard.css";
import "./styles/news.css";

import { AuthProvider } from "./context/AuthContext";

import App from "./App";


createRoot(
    document.getElementById("root")
).render(

    <StrictMode>

        <AuthProvider>

            <App />

        </AuthProvider>

    </StrictMode>

);
