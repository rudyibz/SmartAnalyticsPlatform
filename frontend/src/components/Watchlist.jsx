import { useEffect, useState } from "react";

import { getWatchlist } from "../services/marketService";

export default function Watchlist({ onSelect }) {

    const [assets, setAssets] = useState([]);

    useEffect(() => {

        getWatchlist()
            .then(setAssets)
            .catch(console.error);

    }, []);

    return (

        <div className="watchlist">

            <h2>Watchlist</h2>

            {assets.map(asset => (

                <button

                    key={asset.symbol}

                    onClick={() => onSelect(asset.symbol)}

                >

                    <strong>

                        {asset.symbol}

                    </strong>

                    <br />

                    ${asset.price}

                    <br />

                    {asset.recommendation}

                </button>

            ))}

        </div>

    );

}