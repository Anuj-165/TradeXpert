from fastapi import APIRouter, HTTPException
import yfinance as yf
import random
from datetime import datetime, timedelta
import pandas as pd

router = APIRouter()

# Popular stocks list (you can add more)
POPULAR_STOCKS = ["AAPL", "GOOGL", "MSFT", "TSLA"]

@router.get("/stocks/popular")
def get_popular_stocks():
    stocks_data = []
    for symbol in POPULAR_STOCKS:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        stocks_data.append({
            "symbol": symbol,
            "name": info.get("shortName", symbol),
            "price": round(info.get("regularMarketPrice", 0), 2),
            "change": round(info.get("regularMarketChange", 0), 2),
            "changePercent": round(info.get("regularMarketChangePercent", 0), 2),
            "volume": str(info.get("volume", "N/A")),
            "marketCap": str(info.get("marketCap", "N/A"))
        })
    return stocks_data

@router.get("/stocks/{symbol}")
def get_stock(symbol: str):
    ticker = yf.Ticker(symbol)
    info = ticker.info
    if not info or "regularMarketPrice" not in info:
        raise HTTPException(status_code=404, detail="Stock not found")
    return {
        "symbol": symbol.upper(),
        "name": info.get("shortName", symbol),
        "price": round(info["regularMarketPrice"], 2),
        "change": round(info.get("regularMarketChange", 0), 2),
        "changePercent": round(info.get("regularMarketChangePercent", 0), 2),
        "volume": str(info.get("volume", "N/A")),
        "marketCap": str(info.get("marketCap", "N/A"))
    }

@router.get("/stocks/{symbol}/chart")
def get_chart(symbol: str):
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period="1mo")
    if hist.empty:
        raise HTTPException(status_code=404, detail="No chart data found")
    data = []
    for date, row in hist.iterrows():
        data.append({
            "time": date.strftime("%Y-%m-%d"),
            "price": round(row["Close"], 2),
            "volume": int(row["Volume"])
        })
    return data

@router.get("/stocks/{symbol}/predictions")


def get_predictions(symbol: str):
    ticker = yf.Ticker(symbol)

    # Get historical data (last 60 days)
    hist = ticker.history(period="2mo")
    if hist.empty:
        return [{"metric": "Error", "value": "No data available", "change": "N/A"}]

    # Calculate average daily return and volatility
    hist['Returns'] = hist['Close'].pct_change()
    avg_return = hist['Returns'].mean()
    volatility = hist['Returns'].std()

    last_price = hist['Close'].iloc[-1]

    # Predict future prices using simple trend projection
    next_day = last_price * (1 + avg_return)
    next_week = last_price * ((1 + avg_return) ** 5)
    next_month = last_price * ((1 + avg_return) ** 20)

    # Confidence score inversely related to volatility
    confidence = max(50, 100 - (volatility * 1000))

    return [
        {"metric": "Next Day Prediction", "value": f"${next_day:.2f}", "change": f"{avg_return*100:.2f}%"},
        {"metric": "Next Week Prediction", "value": f"${next_week:.2f}", "change": f"{((next_week/last_price)-1)*100:.2f}%"},
        {"metric": "Next Month Prediction", "value": f"${next_month:.2f}", "change": f"{((next_month/last_price)-1)*100:.2f}%"},
        {"metric": "Confidence Score", "value": f"{confidence:.1f}%", "change": "Based on volatility"}
    ]

@router.get("/search")
def search_stocks(query: str):
    import yfinance as yf
    from yahooquery import search

    try:
        results = search(query)
        quotes = results.get("quotes", [])

        if not quotes:
            return []

        matches = []
        for r in quotes[:10]:
            matches.append({
                "symbol": r.get("symbol"),
                "name": r.get("shortname") or r.get("longname") or r.get("symbol"),
                "exchange": r.get("exchangeDisplay") or r.get("exchange") or "N/A",
                "type": r.get("quoteType") or "N/A",
                "sector": r.get("sectorDisp") or "N/A",
                "industry": r.get("industryDisp") or "N/A"
            })

        return matches

    except Exception as e:
        print(f"Error fetching stock data: {e}")
        return []
