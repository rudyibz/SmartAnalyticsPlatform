import yfinance as yf
from datetime import datetime, timezone


def get_news(symbol: str):

    symbol = symbol.upper().strip()

    ticker = yf.Ticker(symbol)

    try:
        news = ticker.news or []
    except Exception:
        return []

    result = []

    for item in news[:10]:

        # yfinance puede devolver los datos dentro de "content"
        content = item.get("content", item)

        title = content.get("title")

        publisher = content.get(
            "provider",
            {}
        )

        if isinstance(publisher, dict):
            publisher = (
                publisher.get("displayName")
                or publisher.get("name")
            )

        link = content.get("canonicalUrl")

        if isinstance(link, dict):
            link = link.get("url")

        if not link:
            link = content.get("clickThroughUrl")

            if isinstance(link, dict):
                link = link.get("url")

        published = content.get(
            "pubDate"
        )

        if published:
            try:
                dt = datetime.fromisoformat(
                    published.replace("Z", "+00:00")
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