import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';

// Navbar Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // For mobile menu toggle
  const location = useLocation(); // To get current path for active class
  const { isSignedIn } = useUser(); // Check if the user is signed in

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white shadow-xl fixed w-full top-0 z-50 rounded-b-lg transition-all duration-300 ease-in-out">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-white tracking-tight hover:text-gray-200 transition duration-300 ease-in-out"
        >
          🚀 Survey App
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex justify-center flex-grow space-x-8">
          <NavLink to="/" label="🏠 Home" currentPath={location.pathname} />
          <NavLink to="/services" label="📊 Services" currentPath={location.pathname} />
          <NavLink to="/about" label="📘 About" currentPath={location.pathname} />
          <NavLink to="/contact" label="📞 Contact" currentPath={location.pathname} />
        </div>

        {/* Additional Navigation Actions (Right aligned) */}
        <div className="ml-auto flex gap-4 items-center">
          {/* If signed-in, show UserButton and Dashboard */}
          {isSignedIn && (
            <div className="flex gap-4 items-center">
              <Link to="/services">
                <button className="bg-transparent text-white border-2 border-white py-2 px-6 rounded-full hover:bg-white hover:text-indigo-600 transition-all duration-300 ease-in-out transform hover:scale-105">
                  Dashboard
                </button>
              </Link>
              {/* Show UserButton if signed in */}
              <UserButton className="hover:bg-white hover:text-indigo-600 rounded-full transition-all duration-300 ease-in-out" />
            </div>
          )}

          {/* If not signed in, show Sign In button */}
          {!isSignedIn && (
            <Link to="/auth/sign-in">
              <button className="bg-indigo-600 text-white py-3 px-8 rounded-full hover:bg-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu (Dropdown Animation) */}
      <div
        className={`md:hidden bg-indigo-700 transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
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

// Reusable NavLink Component with Active Highlighting
const NavLink = ({ to, label, currentPath, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`text-white hover:text-gray-200 transition-all duration-300 ease-in-out ${
      currentPath === to ? 'border-b-2 border-white' : ''
    }`}
  >
    {label}
  </Link>
);

export default Navbar;
