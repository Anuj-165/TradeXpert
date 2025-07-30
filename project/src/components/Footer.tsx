import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900 dark:bg-black text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">StockPredict</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Advanced stock prediction platform powered by AI and real-time market data. 
              Make informed investment decisions with our comprehensive analytics.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Predictions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 StockPredict. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;