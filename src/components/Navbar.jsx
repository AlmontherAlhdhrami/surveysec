import React, { useState, useEffect } from 'react';
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

// Translation configuration
const translations = {
  en: {
    logo: "سياج",
    home: "Home",
    dashboard: "Dashboard",
    analytics: "Analytics",
    about: "About",
    contact: "Contact",
    signIn: "Sign In",
    menu: "Menu",
    statisticalSignificance: "Statistical Significance",
    qualityScore: "Quality Score",
    responses: "Responses",
    mean: "Mean"
  },
  ar: {
    
    logo: "سياج",
    home: "الرئيسية",
    dashboard: "لوحة التحكم",
    analytics: "التحليلات",
    about: "حول",
    contact: "اتصل بنا",
    signIn: "تسجيل الدخول",
    menu: "القائمة",
    statisticalSignificance: "الدلالة الإحصائية",
    qualityScore: "جودة البيانات",
    responses: "الاستجابات",
    mean: "المتوسط"
  }
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    const savedLang = localStorage.getItem('preferredLang');
    return savedLang || 'ar';
  });
  const location = useLocation();
  const { isSignedIn } = useUser();

  // Set document direction and language
  useEffect(() => {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Nav items configuration
  const navItems = [
    { to: "/", label: translations[currentLang].home, icon: <HomeIcon className="h-5 w-5 text-gray-800" /> },
    { to: "/Dashboard", label: translations[currentLang].dashboard, icon: <ChartBarIcon className="h-5 w-5 text-gray-800" /> },
    { to: "/SurveyAnalysisPage", label: translations[currentLang].analytics, icon: <DocumentTextIcon className="h-5 w-5 text-gray-800" /> },
    { to: "/about", label: translations[currentLang].about, icon: <InformationCircleIcon className="h-5 w-5 text-gray-800" /> },
    { to: "/contact", label: translations[currentLang].contact, icon: <PhoneIcon className="h-5 w-5 text-gray-800" /> },
  ];

  const toggleLanguage = () => {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    setCurrentLang(newLang);
    localStorage.setItem('preferredLang', newLang);
  };

  return (
    <nav className="bg-white/30 backdrop-blur-md fixed w-full top-0 z-50 shadow-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between h-16 items-center ${currentLang === 'ar' ? 'flex-row-reverse' : ''}`}>
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-900 hover:text-gray-800 transition-colors"
            >
              <svg
                className="h-8 w-8 text-gray-900"
                viewBox="0 0 32 32"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16 2.667C8.636 2.667 2.667 8.636 2.667 16S8.636 29.333 16 29.333 29.333 23.364 29.333 16 23.364 2.667 16 2.667zm0 24A10.68 10.68 0 015.333 16 10.68 10.68 0 0116 5.333 10.68 10.68 0 0126.667 16 10.68 10.68 0 0116 26.667z" />
                <path d="M21.333 12H16v-4h-2.667v4H10.667v2.667h4V20h2.667v-5.333h4V12z" />
              </svg>
              <span className="text-xl font-semibold tracking-tight">
                {translations[currentLang].logo}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center space-x-8 ${currentLang === 'ar' ? 'mr-10' : 'ml-10'}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                currentPath={location.pathname}
                lang={currentLang}
              />
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4 ms-auto">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-lg bg-white/40 text-gray-900 hover:bg-white/50 transition-colors"
            >
              {currentLang === 'ar' ? 'EN' : 'ع'}
            </button>
            
            {isSignedIn ? (
              <>
                <Link
                  to="/Dashboard"
                  className="flex items-center space-x-2 bg-white/40 text-gray-900 px-4 py-2 rounded-lg hover:bg-white/50 transition-colors backdrop-blur-sm"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  <span>{translations[currentLang].dashboard}</span>
                </Link>
                <div className="ml-4 relative">
                  <UserButton 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "h-8 w-8 ring-2 ring-white/30",
                        userButtonPopoverCard: "shadow-lg bg-white/95 backdrop-blur-md"
                      }
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/auth/sign-in"
                  className="px-5 py-2 rounded-lg bg-white/40 text-gray-900 hover:bg-white/50 transition-colors flex items-center space-x-2 backdrop-blur-sm"
                >
                  <span>{translations[currentLang].signIn}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden -mr-2 flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-900 hover:bg-white/30 focus:outline-none transition duration-150 ease-in-out"
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
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white/95 backdrop-blur-lg border-b border-white/20`}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <MobileNavLink
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              currentPath={location.pathname}
              onClick={() => setIsOpen(false)}
              lang={currentLang}
            />
          ))}
          <div className="px-4 pt-4 border-t border-white/20">
            <button
              onClick={toggleLanguage}
              className="w-full text-left px-4 py-2 text-gray-800 hover:bg-white/30 rounded-lg"
            >
              {currentLang === 'ar' ? 'English' : 'العربية'}
            </button>
            {isSignedIn ? (
              <div className="flex items-center justify-between mt-2">
                <Link
                  to="/Dashboard"
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-white/30 rounded-lg flex items-center space-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  <ChartBarIcon className="h-5 w-5 text-gray-800" />
                  <span>{translations[currentLang].dashboard}</span>
                </Link>
                <UserButton />
              </div>
            ) : (
              <Link
                to="/auth/sign-in"
                className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-white/30 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                {translations[currentLang].signIn}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Desktop NavLink Component
const NavLink = ({ to, label, icon, currentPath, lang }) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
      currentPath === to 
        ? 'bg-white/40 text-gray-900' 
        : 'text-gray-800 hover:bg-white/30 hover:text-gray-900'
    } backdrop-blur-sm ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

// Mobile NavLink Component
const MobileNavLink = ({ to, label, icon, currentPath, onClick, lang }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 text-base ${
      currentPath === to
        ? 'bg-white/30 text-gray-900'
        : 'text-gray-800 hover:bg-white/30'
    } ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Navbar;