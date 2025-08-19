import { useState } from "react";
import { FaSearch, FaCog, FaExchangeAlt, FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-[#010d14]/95 backdrop-blur supports-[backdrop-filter]:bg-[#010d14]/80 w-full border-b border-gray-800 p-4 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
          <img
            src="images/sei11.png"
            alt="Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
          <span className="text-white font-bold text-lg sm:text-xl">
            Sei<span className="text-gray-400">Guard AI</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-6 text-sm text-gray-300 -mr-10">
          <Link to="/" className="text-white hover:underline">AI Chat</Link>
          <Link to="/explorer" className="text-white hover:underline">Explorer</Link>
          <Link to="/wallet" className="text-white hover:underline">Wallet Analysis</Link>
          <Link to="/suspicious" className="text-white hover:underline">Threat Detection</Link>
          <Link to="/contracts" className="text-white hover:underline">Contracts</Link>
          <Link to="/about" className="text-white hover:underline">About</Link>
        </nav>

        {/* Right Side Icons (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center space-x-3 text-white">
          <FaSearch className="hover:text-gray-300 cursor-pointer" />
          <button className="bg-[#0c1a24] hover:bg-[#162e3f] px-3 py-1 rounded-full flex items-center space-x-2 text-sm">
            <FaExchangeAlt />
            <span>Mainnet</span>
          </button>
          <div className="bg-gradient-to-r from-pink-600 to-orange-400 p-2 rounded-full">
            <FaCog className="text-white" />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white text-2xl ml-4"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="lg:hidden mt-4 bg-[#010d14] border-t border-gray-700">
          <nav className="flex flex-col items-center space-y-4 py-4 text-gray-300">
            <Link to="/" className="text-white hover:underline" onClick={() => setMenuOpen(false)}>AI Chat</Link>
            <Link to="/explorer" className="text-white hover:underline" onClick={() => setMenuOpen(false)}>Explorer</Link>
            <Link to="/wallet" className="text-white hover:underline" onClick={() => setMenuOpen(false)}>Wallet Analysis</Link>
            <Link to="/suspicious" className="text-white hover:underline" onClick={() => setMenuOpen(false)}>Threat Detection</Link>
            <Link to="/contracts" className="text-white hover:underline" onClick={() => setMenuOpen(false)}>Contracts</Link>
            <Link to="/about" className="text-white hover:underline" onClick={() => setMenuOpen(false)}>About</Link>

            {/* Mobile Icons */}
            <div className="flex space-x-4 pt-2 text-white">
              <FaSearch className="hover:text-gray-300 cursor-pointer" />
              <FaExchangeAlt className="hover:text-gray-300 cursor-pointer" />
              <FaCog className="hover:text-gray-300 cursor-pointer" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
