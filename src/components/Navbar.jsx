import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { 
  HomeIcon,
  ChartBarIcon,
  InformationCircleIcon,
  PhoneIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isSignedIn } = useUser();

  // Nav items configuration
  const navItems = [
    { to: "/", label: "Home", icon: <HomeIcon className="h-5 w-5" /> },
    { to: "/Dashboard", label: "Dashboard", icon: <ChartBarIcon className="h-5 w-5" /> },
    { to: "/about", label: "About", icon: <InformationCircleIcon className="h-5 w-5" /> },
    { to: "/contact", label: "Contact", icon: <PhoneIcon className="h-5 w-5" /> },
    { to: "/SurveyAnalysisPage", label: "Analytics", icon: <DocumentTextIcon className="h-5 w-5" /> },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <svg
                className="h-8 w-8"
                viewBox="0 0 32 32"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16 2.667C8.636 2.667 2.667 8.636 2.667 16S8.636 29.333 16 29.333 29.333 23.364 29.333 16 23.364 2.667 16 2.667zm0 24A10.68 10.68 0 015.333 16 10.68 10.68 0 0116 5.333 10.68 10.68 0 0126.667 16 10.68 10.68 0 0116 26.667z" />
                <path d="M21.333 12H16v-4h-2.667v4H10.667v2.667h4V20h2.667v-5.333h4V12z" />
              </svg>
              <span className="text-xl font-semibold tracking-tight">سياج</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 ml-10">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                currentPath={location.pathname}
              />
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {isSignedIn ? (
              <>
                <Link
                  to="/Dashboard"
                  className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <div className="ml-4 relative">
                  <UserButton 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "h-8 w-8",
                        userButtonPopoverCard: "shadow-lg"
                      }
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/auth/sign-in"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden -mr-2 flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition duration-150 ease-in-out"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
          {navItems.map((item) => (
            <MobileNavLink
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              currentPath={location.pathname}
              onClick={() => setIsOpen(false)}
            />
          ))}
          <div className="px-4 pt-4 border-t border-gray-200">
            {isSignedIn ? (
              <div className="flex items-center justify-between">
                <Link
                  to="/Dashboard"
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center space-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  <ChartBarIcon className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <UserButton />
              </div>
            ) : (
              <Link
                to="/auth/sign-in"
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Desktop NavLink Component
const NavLink = ({ to, label, icon, currentPath }) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
      currentPath === to 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

// Mobile NavLink Component
const MobileNavLink = ({ to, label, icon, currentPath, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 text-base ${
      currentPath === to
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Navbar;