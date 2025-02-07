import { Link } from "react-router-dom";

const Services = () => {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto mt-20 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-4xl font-extrabold text-indigo-600">🚀 Our Services</h2>
      <p className="text-gray-600 mt-4 text-lg">Secure, fast, and easy survey management.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
          <h3 className="text-2xl font-semibold">📋 Create Surveys</h3>
          <p className="text-gray-500 mt-2">Easily design and distribute surveys.</p>
        </div>
        <div className="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
          <h3 className="text-2xl font-semibold">📊 Analyze Results</h3>
          <p className="text-gray-500 mt-2">Gain insights with data visualization.</p>
        </div>
        <div className="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
          <h3 className="text-2xl font-semibold">🔒 Secure Data</h3>
          <p className="text-gray-500 mt-2">Encrypted data for privacy.</p>
        </div>
      </div>

      <Link to="/create-survey">
        <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition transform hover:scale-105">
          Start Now 🚀
        </button>
      </Link>
    </div>
  );
};

export default Services;
