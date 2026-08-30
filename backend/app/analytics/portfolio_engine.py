from app.services.market_service import get_price


class PortfolioEngine:

    def __init__(self, portfolio):
        self.portfolio = portfolio

    def calculate(self):

        total_invested = 0.0
        total_value = 0.0

        positions = []

        for position in self.portfolio:

            symbol = position.symbol.upper()

            try:
                price_data = get_price(symbol)

                current_price = float(
                    price_data["price"]
                )

            except Exception:
                current_price = float(
                    position.buy_price
                )

            quantity = float(position.quantity)
            buy_price = float(position.buy_price)

            invested = buy_price * quantity

            market_value = (
                current_price * quantity
            )

            pnl = market_value - invested

            pnl_percent = (
                (pnl / invested) * 100
                if invested
                else 0.0
            )

            positions.append(
                {
                    "id": position.id,
                    "user_id": position.user_id,
                    "symbol": symbol,
                    "quantity": quantity,
                    "buy_price": round(
                        buy_price,
                        2,
                    ),
                    "created_at": position.created_at,

                    "current_price": round(
                        current_price,
                        2,
                    ),

                    "market_value": round(
                        market_value,
                        2,
                    ),

                    "invested": round(
                        invested,
                        2,
                    ),

                    "pnl": round(
                        pnl,
                        2,
                    ),

                    "pnl_percent": round(
                        pnl_percent,
                        2,
                    ),
                }
            )

            total_invested += invested
            total_value += market_value

        total_pnl = (
            total_value -
            total_invested
        )

        total_pnl_percent = (
            (total_pnl / total_invested) * 100
            if total_invested
            else 0.0
        )

        return {
            "positions": positions,

            "summary": {
                "invested": round(
                    total_invested,
                    2,
                ),

                "market_value": round(
                    total_value,
                    2,
                ),

                "pnl": round(
                    total_pnl,
                    2,
                ),

                "pnl_percent": round(
                    total_pnl_percent,
                    2,
                ),
            },
        }