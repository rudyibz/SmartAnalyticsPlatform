export default function DashboardHeader({ symbol }) {
    return (
        <div
            className="dashboard-header"
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
            }}
        >
            <div>
                <h1>Smart Analytics Platform</h1>

                <p>
                    Real-time AI Trading Dashboard
                </p>
            </div>

            <div
                className="dashboard-symbol"
                style={{
                    textAlign: "right",
                }}
            >
                <span
                    style={{
                        color: "#94a3b8",
                        fontSize: "12px",
                    }}
                >
                    Current Asset
                </span>

                <h2
                    style={{
                        margin: "4px 0 0",
                        color: "#ffffff",
                    }}
                >
                    {symbol || "--"}
                </h2>
            </div>
        </div>
    );
}
