import React from 'react'; // Necessary for JSX to work
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  return (
    
    <div> <Navbar />
      <main>
     
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h1 className="text-5xl md:text-6xl font-extrabold">Create Surveys Effortlessly ✨</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200">
            Your secure and user-friendly survey creation platform.
          </p>
          <Link to="/Dashboard">
            <button className="mt-6 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition transform hover:scale-105">
              Get Started 🚀
            </button>
          </Link>
        </section>

        {/* Featured Activities Section */}
        <section className="py-20 bg-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Exciting Activities 🚀</h2>
            <p className="mb-8 text-gray-700">Join us in our engaging activities designed to enhance your experience!</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">

              {/* Activity Card 1 */}
              <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-semibold">Creative Workshops</h3>
                <p className="mt-2 text-gray-700">Participate in interactive workshops that inspire innovation and creativity.</p>
                <Link to="/workshops" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Discover More
                </Link>
              </div>

              {/* Activity Card 2 */}
              <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-semibold">Survey Challenges</h3>
                <p className="mt-2 text-gray-700">Join fun challenges and test your survey skills for prizes!</p>
                <Link to="/challenges" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Join Now
                </Link>
              </div>

              {/* Activity Card 3 */}
              <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-semibold">Networking Events</h3>
                <p className="mt-2 text-gray-700">Connect with like-minded individuals and expand your network.</p>
                <Link to="/networking" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Learn More
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* User Testimonials Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">What Our Users Say 💬</h2>
            <p className="text-gray-700 mb-8 italic">"This platform made my survey creation process a joy! The activities keep me engaged and learning!"</p>
            <p className="text-gray-700 mb-8 italic">"The workshops were fantastic! I learned so much in a short time!"</p>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to Join the Fun? 🎉</h2>
            <p className="text-gray-700 mb-4">Sign up today and be part of our vibrant community!</p>
            <Link to="/auth/sign-in">
              <button className="mt-6 px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition transform hover:scale-105">
                Sign Up Now! 🚀
              </button>
            </Link>
          </div>
        </section>
        
      </main>
      <Footer />
    </div>
  );
};

export default Home;