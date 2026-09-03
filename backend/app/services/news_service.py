import yfinance as yf
from datetime import datetime, timezone


def normalize_news_symbol(symbol: str) -> str:

    normalized = str(symbol).strip().upper()

    symbol_map = {
        "GOLD": "GC=F",
        "XAU-USD": "GC=F",
    }

    return symbol_map.get(
        normalized,
        normalized
    )


def get_news(symbol: str):

    original_symbol = str(symbol).strip().upper()

    market_symbol = normalize_news_symbol(
        original_symbol
    )

    ticker = yf.Ticker(market_symbol)

    try:

        news = ticker.news or []

    except Exception:

        return []

    result = []

    for item in news[:10]:

        content = item.get(
            "content",
            item
        )

        title = content.get(
            "title"
        )

        publisher = content.get(
            "provider",
            {}
        )

        if isinstance(
            publisher,
            dict
        ):

            publisher = (
                publisher.get(
                    "displayName"
                )
                or publisher.get(
                    "name"
                )
            )

        link = content.get(
            "canonicalUrl"
        )

        if isinstance(
            link,
            dict
        ):

            link = link.get(
                "url"
            )

        if not link:

            link = content.get(
                "clickThroughUrl"
            )

            if isinstance(
                link,
                dict
            ):

                link = link.get(
                    "url"
                )

        published = content.get(
            "pubDate"
        )

        if published:

            try:

                dt = datetime.fromisoformat(
                    published.replace(
                        "Z",
                        "+00:00"
                    )
                )

                published = dt.astimezone(
                    timezone.utc
                ).isoformat()

            except Exception:

                pass

        result.append(
            {
                "title": title,
                "publisher": publisher,
                "link": link,
                "published": published,
            }
        )

    return result