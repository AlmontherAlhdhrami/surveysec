import { useState } from "react";
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPhone, FaUniversity } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your message has been sent! We'll respond within 2 working days.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <FaUniversity className="text-4xl text-butterscotch mr-3 transition-colors duration-300" />
            <h1 className="text-4xl font-bold text-royal-purple transition-colors duration-300">
              Project Support Center
            </h1>
          </div>
          <p className="text-xl text-purple-700 max-w-2xl mx-auto transition-colors duration-300">
            Computer Science Department - Sultan Qaboos University
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
       

          {/* Technical Support */}
          <div className="bg-royal-purple text-purple-500 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-bold mb-4 transition-colors duration-300">Technical Support</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <FaWhatsapp className="text-butterscotch mr-3 text-xl transition-colors duration-300" />
                <a 
                  href="https://wa.me/96871745009" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-butterscotch transition-colors duration-300"
                >
                  +968 7174 5009
                </a>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-butterscotch mr-3 text-xl transition-colors duration-300" />
                <a href="mailto:support@surveyapp.squ" className="hover:text-butterscotch transition-colors duration-300">
                  support@surveyapp.squ
                </a>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-butterscotch mr-3 text-xl transition-colors duration-300" />
                <span>H5RC+FV Seeb, Oman</span>
              </div>
            </div>
          </div>

          {/* Office Hours */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-royal-purple mb-4 transition-colors duration-300">Office Hours</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-purple-600">Sunday-Thursday</span>
                <span className="font-medium text-royal-purple transition-colors duration-300">8 AM - 2 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">Response Time</span>
                <span className="font-medium text-royal-purple transition-colors duration-300">24-48 Hours</span>
              </div>
              <div className="mt-4 p-3 bg-butterscotch/10 rounded-lg transition-colors duration-300">
                <p className="text-sm text-purple-600">
                  During university holidays, response times may be longer
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 transition-colors duration-300">
          <h2 className="text-3xl font-bold text-royal-purple text-center mb-8 transition-colors duration-300">
            Send Us a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-700 mb-2 transition-colors duration-300">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-royal-purple transition-colors duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-purple-700 mb-2 transition-colors duration-300">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-royal-purple transition-colors duration-300"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-purple-700 mb-2 transition-colors duration-300">Message</label>
              <textarea 
                name="message" 
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-royal-purple transition-colors duration-300"
                required
              ></textarea>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-purple-500 transition-colors duration-300">
                By submitting, you agree to our privacy policy
              </p>
              <button 
                type="submit" 
                className="bg-royal-purple text-white px-8 py-3 rounded-lg hover:bg-butterscotch transition-colors duration-300 flex items-center"
              >
                <FaEnvelope className="mr-2" />
                Send Message
              </button>
            </div>
          </form>
        </div>

        {/* Map Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
          <iframe
            title="Seeb Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3597.6925502210446!2d58.15791031543652!3d23.67365039727526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQwJzI1LjEiTiA1OMKwMDknMzIuMiJF!5e0!3m2!1sen!2som!4v1629997413008!5m2!1sen!2som"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

// Add to tailwind.config.js
const tailwindConfigAddition = {
  theme: {
    extend: {
      colors: {
        'royal-purple': '#7851A9',  // Rich buttery purple
        'butterscotch': '#F5B041',   // Warm accent color
      }
    }
  }
};

export default Contact;