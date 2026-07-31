import useMarket from "../hooks/useMarket";
import { getNews } from "../services/newsService";

export default function NewsPanel({ symbol }) {

    const {

        data,

        loading,

    } = useMarket(getNews, symbol, 60000);

    if (loading || !data)

        return <div className="card">Loading News...</div>;

    return (

        <div className="card">

            <h2>Latest News</h2>

            {data.map((news, index) => (

                <div
                    key={index}
                    style={{
                        marginBottom: 15,
                        borderBottom: "1px solid #333",
                        paddingBottom: 10,
                    }}
                >

                    <a
                        href={news.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            color: "#60A5FA",
                            textDecoration: "none",
                            fontWeight: "bold",
                        }}
                    >
                        {news.title}
                    </a>

                    <p
                        style={{
                            color: "#AAA",
                            fontSize: 12,
                        }}
                    >
                        {news.publisher}
                    </p>

                </div>

            ))}

        </div>

    );

}