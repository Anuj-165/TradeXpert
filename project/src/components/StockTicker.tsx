import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TickerData {
  symbol: string;
  price: number;
  change: number;
}

const StockTicker: React.FC = () => {
  const [stocks] = useState<TickerData[]>([
    { symbol: 'AAPL', price: 175.32, change: 2.45 },
    { symbol: 'GOOGL', price: 2743.12, change: -15.23 },
    { symbol: 'MSFT', price: 334.89, change: 4.67 },
    { symbol: 'TSLA', price: 891.45, change: 12.34 },
    { symbol: 'AMZN', price: 3247.89, change: -8.91 },
    { symbol: 'META', price: 318.75, change: 6.23 },
    { symbol: 'NVDA', price: 456.78, change: 15.67 },
    { symbol: 'NFLX', price: 398.21, change: -3.45 },
  ]);

  return (
    <div className="bg-gray-900 dark:bg-black text-white py-2 overflow-hidden">
      <motion.div
        animate={{ x: ['100%', '-100%'] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
        className="flex space-x-8 whitespace-nowrap"
      >
        {stocks.concat(stocks).map((stock, index) => (
          <div key={`${stock.symbol}-${index}`} className="flex items-center space-x-2">
            <span className="font-medium">{stock.symbol}</span>
            <span className="text-gray-300">${stock.price.toFixed(2)}</span>
            <span className={`text-sm ${
              stock.change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default StockTicker;