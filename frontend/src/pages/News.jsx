import {
    useEffect,
    useState,
} from "react";

import {
    getNews,
} from "../services/api";

import {
    useMarketContext,
} from "../context/MarketContext";


export default function News() {

    const {
        symbol,
    } = useMarketContext();


    const currentSymbol =
        symbol || "AAPL";


    const [news, setNews] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================================================
    // CARGAR NOTICIAS
    // =========================================================

    async function loadNews() {

        setLoading(true);
        setError("");

        try {

            const data =
                await getNews(
                    currentSymbol
                );


            setNews(

                Array.isArray(data)

                    ? data

                    : data?.news || []

            );

        } catch (err) {

            console.error(
                "Error cargando noticias:",
                err
            );

            setError(

                err.message ||

                "No se pudieron cargar las noticias."

            );

        } finally {

            setLoading(false);

        }
    }


    // =========================================================
    // CAMBIO DE SYMBOL
    // =========================================================

    useEffect(() => {

        loadNews();

    }, [currentSymbol]);


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <main className="news-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="news-header">

                <div>

                    <h1>
                        Noticias de {currentSymbol}
                    </h1>

                    <p>
                        Últimas noticias relacionadas
                        con el mercado.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={loadNews}
                    disabled={loading}
                >

                    {loading
                        ? "Actualizando..."
                        : "Actualizar"}

                </button>

            </header>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="news-error">

                    {error}

                </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

                <div className="news-loading">

                    <p>
                        Cargando noticias de{" "}
                        <strong>
                            {currentSymbol}
                        </strong>
                        ...
                    </p>

                </div>

            )}


            {/* =================================================
                SIN NOTICIAS
            ================================================= */}

            {!loading &&
                !error &&
                news.length === 0 && (

                    <div className="news-empty">

                        <h2>
                            No hay noticias disponibles
                        </h2>

                        <p>
                            No se encontraron noticias
                            para {currentSymbol}.
                        </p>

                    </div>

                )}


            {/* =================================================
                LISTADO
            ================================================= */}

            {!loading &&
                news.length > 0 && (

                    <div className="news-list">

                        {news.map(
                            (item, index) => {

                                const title =
                                    item.title ??
                                    item.headline ??
                                    "Sin título";


                                const publisher =
                                    item.publisher ??
                                    item.provider ??
                                    "Fuente desconocida";


                                const link =
                                    item.link ??
                                    item.url ??
                                    item.canonicalUrl;


                                const published =
                                    item.published ??
                                    item.pubDate;


                                return (

                                    <article
                                        className="news-card"
                                        key={
                                            item.id ??
                                            link ??
                                            `${title}-${index}`
                                        }
                                    >


                                        <div
                                            className="news-card-content"
                                        >


                                            {/* =================================
                                                FUENTE
                                            ================================= */}

                                            <div
                                                className="news-meta"
                                            >

                                                <span>
                                                    {publisher}
                                                </span>


                                                {published && (

                                                    <time>
                                                        {new Date(
                                                            published
                                                        ).toLocaleString(
                                                            "es-ES",
                                                            {
                                                                dateStyle:
                                                                    "medium",
                                                                timeStyle:
                                                                    "short",
                                                            }
                                                        )}
                                                    </time>

                                                )}

                                            </div>


                                            {/* =================================
                                                TITULAR
                                            ================================= */}

                                            <h2>

                                                {title}

                                            </h2>


                                            {/* =================================
                                                SUMMARY
                                            ================================= */}

                                            {item.summary && (

                                                <p>

                                                    {
                                                        item.summary
                                                    }

                                                </p>

                                            )}


                                            {/* =================================
                                                LINK
                                            ================================= */}

                                            {link && (

                                                <a
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >

                                                    Leer noticia
                                                    {" →"}

                                                </a>

                                            )}

                                        </div>

                                    </article>

                                );

                            }
                        )}

                    </div>

                )}

        </main>

    );

}