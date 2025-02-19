import { UserButton } from "@clerk/clerk-react";
import React from 'react'; // <-- This import is necessary for JSX to work

import { Link } from "react-router-dom";


const Home = () => {
  return (
    <div>
      <main>
        <section>
          <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h1 className="text-5xl md:text-6xl font-extrabold">Create Surveys Effortlessly ✨</h1>
            <p className="mt-4 text-lg md:text-xl text-gray-200">
              Secure, user-friendly, and feature-packed survey creation platform.
            </p>
            <Link to="/Dashboard">
              <button className="mt-6 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition transform hover:scale-105">
                Get Started 🚀
              </button>
            </Link>
          </div>
        </section>
      </main>
      
    </div>
  );
};

export default Home;
