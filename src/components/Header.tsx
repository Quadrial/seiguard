
import { FaSearch, FaCog, FaExchangeAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // fixed from 'react-router' to 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-[#010d14] w-full border-b border-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
  <img src="images/sei11.png" alt="Logo" className="w-12 h-12 object-contain" />
  <span className="text-white font-bold text-xl">
    Sei<span className="text-gray-400">Guard</span>
  </span>
</div>


        {/* Navigation */}
        <nav className="hidden md:flex space-x-6 text-sm text-gray-300 -mr-10">
          <Link to="/" className="text-white hover:underline">Home</Link>
          <Link to="/explorer" className="text-white hover:underline">Explorer</Link>
          <Link to="/wallet" className="text-white hover:underline">Wallet Analysis</Link>
          <Link to="/suspicious" className="text-white hover:underline">Threat Detection</Link>
          <Link to="/contracts" className="text-white hover:underline">Contracts</Link>
          <Link to="/chatbot" className="text-white hover:underline">AI Chatbot</Link>
        </nav>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4 text-white">
          <FaSearch className="hover:text-gray-300 cursor-pointer" />
          <button className="bg-[#0c1a24] hover:bg-[#162e3f] px-4 py-1 rounded-full flex items-center space-x-2">
            <FaExchangeAlt />
            <span>Mainnet</span>
          </button>
          <div className="bg-gradient-to-r from-pink-600 to-orange-400 p-2 rounded-full">
            <FaCog className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
