import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import Chart from '../components/Chart';
import API, { buyStock, sellStock, searchStocks } from '../services/api';
import { toast } from 'react-hot-toast';

interface Stock {
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice?: number;
  currentPrice?: number;
}

interface User {
  name: string;
  portfolio: Stock[];
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [virtualBalance, setVirtualBalance] = useState<number>(0);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [searchResults, setSearchResults] = useState<{ symbol: string; name: string; exchange: string }[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);


  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [profileRes, portfolioRes] = await Promise.all([
        API.get<{ name: string; virtual_balance: number }>('/dashboard/profile'),
        API.get<{ portfolio: Stock[] }>('/dashboard/portfolio'),
      ]);

      setUser({
        name: profileRes.data.name,
        portfolio: portfolioRes.data.portfolio,
      });
      setVirtualBalance(profileRes.data.virtual_balance ?? 0);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleBuy = async () => {
    if (!symbol || quantity <= 0) {
      toast.error('Enter valid symbol and quantity');
      return;
    }
    try {
      await buyStock(symbol, quantity);
      toast.success(`Bought ${quantity} shares of ${symbol}`);
      await fetchUserData();
      setSymbol('');
      setQuantity(0);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to buy stock');
    }
  };

  const handleSell = async () => {
    if (!symbol || quantity <= 0) {
      toast.error('Enter valid symbol and quantity');
      return;
    }
    try {
      await sellStock(symbol, quantity);
      toast.success(`Sold ${quantity} shares of ${symbol}`);
      await fetchUserData();
      setSymbol('');
      setQuantity(0);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to sell stock');
    }
  };

  // Handle symbol change with debounced search
  const handleSymbolChange = (value: string) => {
    setSymbol(value.toUpperCase());
    if (typingTimeout) clearTimeout(typingTimeout);

    if (value.length > 1) {
      const timeout = setTimeout(async () => {
        try {
          const results = await searchStocks(value);
          setSearchResults(results);
        } catch (error) {
          console.error('Stock search failed:', error);
          setSearchResults([]);
        }
      }, 300);
      setTypingTimeout(timeout);
    } else {
      setSearchResults([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Please log in to view your dashboard.</p>
      </div>
    );
  }

  const portfolioValue = user.portfolio.reduce(
    (total, stock) => total + ((stock.currentPrice ?? 0) * stock.quantity),
    0
  );
  const portfolioCost = user.portfolio.reduce(
    (total, stock) => total + ((stock.avgBuyPrice ?? 0) * stock.quantity),
    0
  );
  const totalGainLoss = portfolioValue - portfolioCost;
  const gainLossPercent = portfolioCost ? (totalGainLoss / portfolioCost) * 100 : 0;

  const performanceData = [
    { time: 'Jan', price: portfolioCost * 0.9 },
    { time: 'Feb', price: portfolioCost * 0.95 },
    { time: 'Mar', price: portfolioCost * 1.02 },
    { time: 'Apr', price: portfolioCost * 1.08 },
    { time: 'May', price: portfolioCost * 1.05 },
    { time: 'Jun', price: portfolioValue },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's an overview of your portfolio and trading activity.
          </p>
        </motion.div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Portfolio Value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          {/* Total Gain/Loss */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                </p>
              </div>
              <div className={`p-3 rounded-full ${totalGainLoss >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                {totalGainLoss >= 0 ? <TrendingUp className="h-6 w-6 text-green-600" /> : <TrendingDown className="h-6 w-6 text-red-600" />}
              </div>
            </div>
          </motion.div>

          {/* Total Stocks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Stocks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.portfolio.length}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          {/* Best Performer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Best Performer</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.portfolio.length > 0
                    ? user.portfolio.reduce((best, stock) =>
                        ((stock.currentPrice ?? 0) - (stock.avgBuyPrice ?? 0)) / (stock.avgBuyPrice ?? 1) >
                        ((best.currentPrice ?? 0) - (best.avgBuyPrice ?? 0)) / (best.avgBuyPrice ?? 1)
                          ? stock
                          : best
                      ).symbol
                    : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chart and Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
            <Chart data={performanceData} title="Portfolio Performance (6 Months)" color={totalGainLoss >= 0 ? '#10b981' : '#ef4444'} height={350} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <ProfileCard />
          </motion.div>
        </div>

        {/* Portfolio Holdings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your Holdings</h2>
          {user.portfolio.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Stock</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Quantity</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Avg. Buy Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Current Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Total Value</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {user.portfolio.map((stock, index) => {
                    const avgPrice = stock.avgBuyPrice ?? 0;
                    const currentPrice = stock.currentPrice ?? 0;
                    const totalValue = currentPrice * stock.quantity;
                    const totalCost = avgPrice * stock.quantity;
                    const gainLoss = totalValue - totalCost;
                    const gainLossPercent = totalCost ? (gainLoss / totalCost) * 100 : 0;

                    return (
                      <motion.tr
                        key={stock.symbol}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-gray-900 dark:text-white">{stock.quantity}</td>
                        <td className="py-4 px-4 text-right text-gray-900 dark:text-white">${avgPrice.toFixed(2)}</td>
                        <td className="py-4 px-4 text-right text-gray-900 dark:text-white">${currentPrice.toFixed(2)}</td>
                        <td className="py-4 px-4 text-right text-gray-900 dark:text-white">${totalValue.toFixed(2)}</td>
                        <td className={`py-4 px-4 text-right font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
                          <br />
                          <span className="text-sm">
                            ({gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <PieChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">No stocks in your portfolio yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start trading to see your holdings here</p>
            </div>
          )}
        </motion.div>

        {/* Paper Trading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Paper Trade</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">Virtual Balance: ${Number(virtualBalance ?? 0).toFixed(2)}</p>
          <div className="flex flex-col md:flex-row gap-4 relative">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Stock Symbol (e.g., AAPL)"
                value={symbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
              {searchResults.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((stock, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setSymbol(stock.symbol);
                        setSearchResults([]);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {stock.symbol} – {stock.name} ({stock.exchange})
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-32 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            <button onClick={handleBuy} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Buy</button>
            <button onClick={handleSell} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sell</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
