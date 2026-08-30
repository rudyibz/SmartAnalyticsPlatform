import { useEffect, useState } from "react";
import { getScanner } from "../../services/api";

export default function ScannerTable({ onSelect }) {

    const [assets, setAssets] = useState([]);

    useEffect(() => {

        getScanner()
            .then(setAssets)
            .catch(console.error);

    }, []);

    return (

        <table className="scanner-table">

            <thead>

                <tr>

                    <th>Symbol</th>
                    <th>Price</th>
                    <th>Change</th>
                    <th>Signal</th>
                    <th>Score</th>

                </tr>

            </thead>

            <tbody>

                {assets.map((asset) => (

                    <tr
                        key={asset.symbol}
                        onClick={() => onSelect(asset.symbol)}
                    >

                        <td>{asset.symbol}</td>
                        <td>${asset.price}</td>
                        <td>{asset.change}%</td>

                        <td className={asset.signal.toLowerCase()}>
                            {asset.signal}
                        </td>

                        <td className="score">
                            {asset.score}
                        </td>

                    </tr>

                ))}

            </tbody>

        </table>

    );

}