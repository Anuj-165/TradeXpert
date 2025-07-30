import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, DollarSign, Volume2 } from 'lucide-react';
import Chart from '../components/Chart';
import StockCard from '../components/StockCard';
import { searchStocks } from '../services/api'; // autocomplete API
import API from '../services/api'; // axios instance

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
}

const Analytics: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [popularStocks, setPopularStocks] = useState<StockData[]>([]);
  const [predictionData, setPredictionData] = useState<
    { metric: string; value: string; change: string }[]
  >([]);
  const [suggestions, setSuggestions] = useState<StockData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchPopularStocks = async () => {
      setIsLoading(true);
      try {
        const response = await API.get<StockData[]>('/analytics/stocks/popular');
        setPopularStocks(response.data);
      } catch (error) {
        console.error('Failed to load popular stocks', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPopularStocks();
  }, []);

  const fetchStockInfo = async (symbol: string) => {
    setIsLoading(true);
    setShowSuggestions(false);
    try {
      const [detailsRes, chartRes, predictionsRes] = await Promise.all([
        API.get<StockData>(`/analytics/stocks/${symbol}`),
        API.get<any[]>(`/analytics/stocks/${symbol}/chart`),
        API.get<any[]>(`/analytics/stocks/${symbol}/predictions`),
      ]);
      setSelectedStock(detailsRes.data);
      setChartData(chartRes.data || []);
      setPredictionData(predictionsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch stock info:', error);
      setSelectedStock(null);
      setChartData([]);
      setPredictionData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const data  = await searchStocks(value.trim());
      setSuggestions(data as StockData[]);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Autocomplete failed:', err);
    }
  };

  const handleSelectSuggestion = (stock: StockData) => {
    setSearchQuery(stock.symbol);
    fetchStockInfo(stock.symbol);
    setShowSuggestions(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await fetchStockInfo(searchQuery.trim().toUpperCase());
  };

  const onSelectStock = async (stock: StockData) => {
    setSearchQuery(stock.symbol);
    await fetchStockInfo(stock.symbol);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Stock Analytics & Predictions
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Search for any stock to get real-time data, charts, and AI-powered predictions.
          </p>
        </motion.div>

        {/* Search Bar with Autocomplete */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 relative"
        >
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search stocks by name or symbol..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((stock) => (
                    <li
                      key={stock.symbol}
                      onClick={() => handleSelectSuggestion(stock)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                    >
                      {stock.symbol} - {stock.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Searching...
                </div>
              ) : (
                'Search'
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Popular Stocks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Popular Stocks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularStocks.map((stock, index) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => onSelectStock(stock)}
                className="cursor-pointer"
              >
                <StockCard {...stock} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Selected Stock Analysis */}
        {selectedStock && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Stock Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedStock.symbol} - {selectedStock.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">Real-time stock analysis</p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${selectedStock.price.toFixed(2)}
                    </p>
                    <p className={`text-sm font-medium ${selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedStock.change >= 0 ? '+' : ''}${selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Volume2 className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Volume</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedStock.volume}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Market Cap</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedStock.marketCap}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">52W High</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${(selectedStock.price * 1.25).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">52W Low</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${(selectedStock.price * 0.75).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <Chart
              data={chartData}
              title={`${selectedStock.symbol} Price Chart (30 Days)`}
              color={selectedStock.change >= 0 ? '#10b981' : '#ef4444'}
              height={400}
            />

            {/* Predictions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">AI Predictions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {predictionData.map((prediction, index) => (
                  <motion.div
                    key={prediction.metric}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700"
                  >
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{prediction.metric}</h4>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{prediction.value}</p>
                    <p
                      className={`text-sm font-medium ${
                        prediction.change.includes('+')
                          ? 'text-green-600'
                          : prediction.change.includes('-')
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {prediction.change}
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Disclaimer:</strong> These predictions are generated by AI models and should not be considered as financial advice. Always do your own research before making investment decisions.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
