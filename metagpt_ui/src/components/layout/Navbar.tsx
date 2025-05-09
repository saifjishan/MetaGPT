import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 glass">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">
          {/* Left: Hamburger button */}
          <div className="flex">
            <button
              className="text-gray-300 hover:text-white lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center ml-4">
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-2xl font-bold gradient-text">MetaGPT</span>
                <span className="ml-2 text-sm text-gray-400">Multi-Agent Framework</span>
              </motion.div>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            {/* API Key Selector */}
            <div className="relative">
              <button
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 transition duration-150 ease-in-out rounded-md hover:text-white glow-blue"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
              >
                <span>API Provider</span>
                <svg className="w-4 h-4 ml-1 fill-current" viewBox="0 0 20 20">
                  <path d="M10 14l-5-5h10l-5 5z" />
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 w-48 mt-2 origin-top-right glass rounded-md shadow-lg"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="py-1">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-lighter hover:text-white">
                      <span className="w-3 h-3 mr-2 bg-green-500 rounded-full"></span>
                      OpenAI
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-lighter hover:text-white">
                      <span className="w-3 h-3 mr-2 bg-blue-500 rounded-full"></span>
                      Gemini
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-lighter hover:text-white">
                      <span className="w-3 h-3 mr-2 bg-red-500 rounded-full"></span>
                      xAI (Grok)
                    </button>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-lighter hover:text-white">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Configure API Keys
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button className="p-2 text-gray-300 transition duration-150 ease-in-out rounded-md hover:text-white glow-red">
              <span className="sr-only">Toggle dark mode</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            </button>

            {/* Help button */}
            <button className="p-2 text-gray-300 transition duration-150 ease-in-out rounded-md hover:text-white">
              <span className="sr-only">Help</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;