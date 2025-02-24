import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const location = useLocation();
  const { isSignedIn } = useUser();

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

        {/* Desktop Nav (hidden on small screens) */}
        <div className="hidden md:flex justify-center flex-grow space-x-8 ml-8">
          <NavLink to="/" label="Home" currentPath={location.pathname} />
          <NavLink to="/Dashboard" label="Dashboard" currentPath={location.pathname} />
          <NavLink to="/about" label="About" currentPath={location.pathname} />
          <NavLink to="/contact" label="Contact" currentPath={location.pathname} />
          <NavLink to="/SurveyAnalysisPage" label="SurveyAnalysisPage" currentPath={location.pathname} />

        </div>

        {/* Right side actions */}
        <div className="hidden md:flex gap-4 items-center ml-auto">
          {isSignedIn ? (
            <>
              <Link to="/Dashboard">
                <button className="bg-transparent text-white border-2 border-white py-2 px-6 rounded-full hover:bg-white hover:text-indigo-600 transition-all duration-300 ease-in-out transform hover:scale-105">
                  Dashboard
                </button>
              </Link>
              <UserButton className="hover:bg-white hover:text-indigo-600 rounded-full transition-all duration-300 ease-in-out" />
            </>
          ) : (
            <Link to="/auth/sign-in">
              <button className="bg-indigo-600 text-white py-3 px-8 rounded-full hover:bg-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105">
                Sign In
              </button>
            </Link>
          )}
        </div>

        {/* Hamburger Icon (shown on small screens) */}
        <div className="md:hidden ml-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded text-white focus:outline-none focus:ring-2 focus:ring-white"
          >
            {isOpen ? (
              // Close Icon
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger Icon
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu (slide-down) */}
      <div
        className={`md:hidden bg-indigo-700 transition-max-height duration-300 ease-in-out 
          ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        <div className="flex flex-col py-4 space-y-3 text-center">
          <NavLink
            to="/"
            label="Home"
            currentPath={location.pathname}
            onClick={() => setIsOpen(false)}
          />
          <NavLink
            to="/Dashboard"
            label="Dashboard"
            currentPath={location.pathname}
            onClick={() => setIsOpen(false)}
          />
          <NavLink
            to="/about"
            label="About"
            currentPath={location.pathname}
            onClick={() => setIsOpen(false)}
          />
          <NavLink
            to="/contact"
            label="Contact"
            currentPath={location.pathname}
            onClick={() => setIsOpen(false)}
          />

          {/* Show these buttons in the mobile menu as well */}
          <div className="flex flex-col items-center gap-3 mt-4">
            {isSignedIn ? (
              <>
                <Link to="/Dashboard" onClick={() => setIsOpen(false)}>
                  <button className="bg-transparent text-white border-2 border-white py-2 px-6 rounded-full hover:bg-white hover:text-indigo-600 transition-all duration-300 ease-in-out transform hover:scale-105">
                    Dashboard
                  </button>
                </Link>
                <UserButton className="hover:bg-white hover:text-indigo-600 rounded-full transition-all duration-300 ease-in-out" />
              </>
            ) : (
              <Link to="/auth/sign-in" onClick={() => setIsOpen(false)}>
                <button className="bg-indigo-600 text-white py-3 px-8 rounded-full hover:bg-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105">
                  Sign In
                </button>
              </Link>
            )}
          </div>
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
    className={`block md:inline-block text-white hover:text-gray-200 transition-all duration-300 ease-in-out px-3 
      ${currentPath === to ? 'border-b-2 border-white' : ''}
    `}
  >
    {label}
  </Link>
);

export default Navbar;
