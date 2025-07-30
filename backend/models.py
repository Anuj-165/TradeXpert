from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    # Virtual balance for paper trading
    virtual_balance = Column(Float, default=100000.0)

    # One-to-many relationship with Portfolio
    portfolio = relationship("Portfolio", back_populates="owner", cascade="all, delete-orphan")


class Portfolio(Base):
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False)
    name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    avg_buy_price = Column(Float, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="portfolio")
