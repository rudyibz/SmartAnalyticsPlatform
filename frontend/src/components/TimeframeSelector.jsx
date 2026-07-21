export default function TimeframeSelector({ period, setPeriod }) {

    const periods = [
        "5d",
        "1mo",
        "3mo",
        "6mo",
        "1y",
    ];

    return (

        <div className="timeframes">

            {periods.map((p) => (

                <button
                    key={p}
                    className={period === p ? "active" : ""}
                    onClick={() => setPeriod(p)}
                >
                    {p}
                </button>

            ))}

        </div>

    );

}