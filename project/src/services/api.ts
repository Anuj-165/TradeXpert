import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000', // FastAPI backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}
// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ---- Analytics Endpoints ----

// Search for stocks (autocomplete) with fallback
export const searchStocks = async (query: string): Promise<StockSearchResult[]> => {
  try {
    const response = await API.get<StockSearchResult[]>('/analytics/search', {
      params: { query },
    });
    return response.data;
  } catch (error) {
    console.error('Stock search failed:', error);
    return [{ symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' }]; // fallback
  }
};

// Get details for a single stock
export const getStockDetails = async (symbol: string) => {
  try {
    const response = await API.get(`/analytics/stocks/${symbol}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch stock details for ${symbol}:`, error);
    throw error;
  }
};

// Get chart data for a stock
export const getStockChart = async (symbol: string) => {
  try {
    const response = await API.get(`/analytics/stocks/${symbol}/chart`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch chart data for ${symbol}:`, error);
    throw error;
  }
};

// Get predictions for a stock
export const getStockPredictions = async (symbol: string) => {
  try {
    const response = await API.get(`/analytics/stocks/${symbol}/predictions`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch predictions for ${symbol}:`, error);
    throw error;
  }
};

// Get popular stocks for quick picks
export const getPopularStocks = async () => {
  try {
    const response = await API.get(`/analytics/stocks/popular`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch popular stocks:', error);
    return [];
  }
};

// ---- Dashboard Endpoints ----

// Get user profile
// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await API.get(`/dashboard/profile`); // no params
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user profile:`, error);
    throw error;
  }
};

// Get user portfolio with real-time prices
export const getUserPortfolio = async () => {
  try {
    const response = await API.get(`/dashboard/portfolio`); // no params
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user portfolio:`, error);
    return [];
  }
};
export const sellStock = async (symbol: string, quantity: number) => {
  try {
    const response = await API.post(`/dashboard/sell`, null, {
      params: { symbol, quantity },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to sell stock ${symbol}:`, error);
    throw error;
  }
};
export const buyStock = async (symbol: string, quantity: number) => {
  try {
    const response = await API.post(`/dashboard/buy`, null, {
      params: { symbol, quantity },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to buy stock ${symbol}:`, error);
    throw error;
  }
};


export default API;
