import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // Detects current page for active styling

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-3xl font-extrabold">
          🚀 Survey App
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✖" : "☰"}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <NavLink to="/" label="🏠 Home" currentPath={location.pathname} />
          <NavLink to="/services" label="📊 Services" currentPath={location.pathname} />
          <NavLink to="/about" label="📘 About" currentPath={location.pathname} />
          <NavLink to="/contact" label="📞 Contact" currentPath={location.pathname} />
          <Link to="/login" className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-200">
            🔐 Login
          </Link>
        </div>
      </div>

      {/* Mobile Menu (Dropdown Animation) */}
      <div
        className={`md:hidden bg-indigo-700 transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col py-4 space-y-3 text-center">
          <NavLink to="/" label="🏠 Home" currentPath={location.pathname} onClick={() => setIsOpen(false)} />
          <NavLink to="/services" label="📊 Services" currentPath={location.pathname} onClick={() => setIsOpen(false)} />
          <NavLink to="/about" label="📘 About" currentPath={location.pathname} onClick={() => setIsOpen(false)} />
          <NavLink to="/contact" label="📞 Contact" currentPath={location.pathname} onClick={() => setIsOpen(false)} />
         
        </div>
      </div>
    </nav>
  );
};

/**
 * ✅ Reusable NavLink Component with Active Highlighting
 */
const NavLink = ({ to, label, currentPath, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`hover:text-gray-300 ${
      currentPath === to ? "border-b-2 border-white" : ""
    }`}
  >
    {label}
  </Link>
);

export default Navbar;
