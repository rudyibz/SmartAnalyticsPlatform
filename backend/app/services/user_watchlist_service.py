from sqlalchemy.orm import Session

from app.crud.user_watchlist_crud import (
    create_symbol,
    delete_symbol,
    get_watchlist,
)

from app.analysis.engine import AnalysisEngine


analysis_engine = AnalysisEngine()


def add_symbol_service(
    db: Session,
    user_id: int,
    symbol: str,
):

    return create_symbol(
        db,
        user_id,
        symbol.strip().upper(),
    )


def list_watchlist_service(
    db: Session,
    user_id: int,
):

    assets = get_watchlist(
        db,
        user_id,
    )

    result = []

    for asset in assets:

        symbol = (
            asset.symbol
            .strip()
            .upper()
        )

        item = {
            "id": asset.id,
            "symbol": symbol,
            "price": None,
            "signal": "--",
            "score": 0,
            "recommendation": "--",
            "risk": "--",
        }

        try:

            analysis = analysis_engine.analyze(
                symbol
            )

            item["price"] = round(
                float(analysis["price"]),
                2,
            )

            item["score"] = analysis[
                "score"
            ]

            item["signal"] = analysis[
                "signal"
            ]

            item["recommendation"] = (
                analysis["recommendation"]
            )

            item["risk"] = analysis[
                "risk"
            ]

        except Exception as exc:

            print(
                f"[WATCHLIST] Error loading "
                f"{symbol}: {exc}"
            )

        result.append(item)

    return result


def delete_symbol_service(
    db: Session,
    user_id: int,
    symbol: str,
):

    return delete_symbol(
        db,
        user_id,
        symbol.strip().upper(),
    )