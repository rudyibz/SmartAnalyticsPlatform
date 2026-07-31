export default function TopBar({ symbol, setSymbol }) {

    return (

        <div className="card">

            <h1>Smart Analytics Platform</h1>

            <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Ticker..."
                style={{
                    marginTop: 15,
                    padding: 10,
                    width: 200,
                    fontSize: 18,
                    textTransform: "uppercase",
                }}
            />

        </div>

    );

}