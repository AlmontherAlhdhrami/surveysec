import React from 'react'; // <-- This import is necessary for JSX to work
const Footer = () => {
    return (
      <footer className="bg-gray-800 text-white text-center py-4 mt-10">
        <p>© {new Date().getFullYear()} Survey App. All Rights Reserved.</p>
      </footer>
    );
  };
  
  export default Footer;
  