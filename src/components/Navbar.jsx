import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white shadow-lg fixed w-full top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-extrabold">🚀 Survey App</Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-gray-300">🏠 Home</Link>
          <Link to="/services" className="hover:text-gray-300">📊 Services</Link>
          <Link to="/about" className="hover:text-gray-300">📘 About</Link>
          <Link to="/contact" className="hover:text-gray-300">📞 Contact</Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col bg-indigo-700 py-4 space-y-3 text-center">
          <Link to="/" className="hover:text-gray-300">🏠 Home</Link>
          <Link to="/services" className="hover:text-gray-300">📊 Services</Link>
          <Link to="/about" className="hover:text-gray-300">📘 About</Link>
          <Link to="/contact" className="hover:text-gray-300">📞 Contact</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
