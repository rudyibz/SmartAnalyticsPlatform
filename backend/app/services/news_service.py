import yfinance as yf


def get_news(symbol: str):

    ticker = yf.Ticker(symbol)

    news = ticker.news

    result = []

    for item in news[:10]:

        result.append({

            "title": item.get("title"),

            "publisher": item.get("publisher"),

            "link": item.get("link"),

            "published": item.get("providerPublishTime"),

        })

    return result