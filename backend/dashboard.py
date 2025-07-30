from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
import yfinance as yf
import pandas as pd

from database import get_db
from models import User, Portfolio

router = APIRouter()

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "name": current_user.name,
        "email": current_user.email,
        "virtual_balance": current_user.virtual_balance
    }


@router.get("/portfolio")
def get_portfolio(current_user: User = Depends(get_current_user)):
    portfolio_data = []
    total_value = 0

    for stock in current_user.portfolio:
        ticker = yf.Ticker(stock.symbol)
        try:
            current_price = ticker.fast_info.last_price
        except Exception:
            current_price = stock.avg_buy_price  # fallback

        stock_value = current_price * stock.quantity
        total_value += stock_value

        portfolio_data.append({
            "symbol": stock.symbol,
            "name": stock.name,
            "quantity": stock.quantity,
            "avgBuyPrice": stock.avg_buy_price,      # camelCase for frontend
            "currentPrice": current_price,           # camelCase for frontend
            "totalValue": stock_value
        })

    return {
        "portfolio": portfolio_data,
        "virtual_balance": current_user.virtual_balance,
        "total_portfolio_value": total_value
    }


@router.post("/buy")
def buy_stock(symbol: str, quantity: float, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    ticker = yf.Ticker(symbol)
    try:
        current_price = ticker.fast_info.last_price
    except Exception:
        current_price = 0  # fallback

    if not current_price:
        raise HTTPException(status_code=404, detail="Stock price unavailable")

    stock_name = ticker.info.get("shortName", symbol)
    total_cost = current_price * quantity

    if current_user.virtual_balance < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient virtual balance")

    current_user.virtual_balance -= total_cost

    portfolio_entry = next((s for s in current_user.portfolio if s.symbol == symbol), None)

    if portfolio_entry:
        new_total_quantity = portfolio_entry.quantity + quantity
        portfolio_entry.avg_buy_price = ((portfolio_entry.avg_buy_price * portfolio_entry.quantity) + total_cost) / new_total_quantity
        portfolio_entry.quantity = new_total_quantity
    else:
        new_stock = Portfolio(
            symbol=symbol,
            name=stock_name,
            quantity=quantity,
            avg_buy_price=current_price,
            owner=current_user
        )
        db.add(new_stock)

    db.commit()
    return {"message": f"Bought {quantity} shares of {symbol} at {current_price} each"}


@router.post("/sell")
def sell_stock(symbol: str, quantity: float, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    portfolio_entry = next((s for s in current_user.portfolio if s.symbol == symbol), None)

    if not portfolio_entry or portfolio_entry.quantity < quantity:
        raise HTTPException(status_code=400, detail="Not enough shares to sell")

    ticker = yf.Ticker(symbol)
    try:
        current_price = ticker.fast_info.last_price
    except Exception:
        current_price = portfolio_entry.avg_buy_price  # fallback

    if not current_price:
        raise HTTPException(status_code=404, detail="Stock price unavailable")

    sale_amount = current_price * quantity
    current_user.virtual_balance += sale_amount

    portfolio_entry.quantity -= quantity
    if portfolio_entry.quantity == 0:
        db.delete(portfolio_entry)

    db.commit()
    return {"message": f"Sold {quantity} shares of {symbol} at {current_price} each"}
