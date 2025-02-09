import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Services from "./pages/Services";
import CreateSurvey from "./pages/CreateSurvey";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login"; // ✅ Added Login Page
import UserDashboard from "./pages/UserDashboard"; // ✅ User Dashboard
import MySurveys from "./pages/MySurveys"; // ✅ My Surveys Page

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} /> {/* ✅ Login Page */}
            <Route path="/services" element={<Services />} />
            <Route path="/create-survey" element={<CreateSurvey />} />
            <Route path="/my-surveys" element={<MySurveys />} /> {/* ✅ My Surveys */}
            <Route path="/user-dashboard" element={<UserDashboard />} /> {/* ✅ User Dashboard */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
