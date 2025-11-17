import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Stethoscope size={32} className="text-blue-500" />
          <span className="text-2xl font-bold">MedXpert</span>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li><Link to="/" className="hover:text-blue-400">Home</Link></li>
            <li><Link to="/about" className="hover:text-blue-400">About</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400">Contact</Link></li>
            <li><Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Login</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;