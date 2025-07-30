import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: string;
  marketCap?: string;
}

const StockCard: React.FC<StockCardProps> = ({
  symbol,
  name,
  price,
  change,
  changePercent,
  volume,
  marketCap
}) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{symbol}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{name}</p>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPositive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{changePercent.toFixed(2)}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${price.toFixed(2)}
          </span>
          <span className={`text-sm font-medium ${
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? '+' : ''}${change.toFixed(2)}
          </span>
        </div>

        {(volume || marketCap) && (
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {volume && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{volume}</p>
              </div>
            )}
            {marketCap && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{marketCap}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StockCard;