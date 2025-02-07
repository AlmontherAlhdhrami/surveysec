import { useState } from "react";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your message has been sent!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto mt-20 bg-white shadow-lg rounded-lg text-center">
      {/* ترحيبية الصفحة */}
      <h2 className="text-4xl font-extrabold text-indigo-600">📞 Get in Touch</h2>
      <p className="text-gray-600 mt-2 text-lg">We're here to help! Contact us through the form or via WhatsApp and Email.</p>

      {/* أزرار التواصل */}
      <div className="flex flex-col md:flex-row justify-center mt-6 space-y-4 md:space-y-0 md:space-x-4">
        <a 
          href="https://wa.me/96871745009" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center px-6 py-3 text-lg font-semibold bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition transform hover:scale-105 w-full md:w-auto"
        >
          <FaWhatsapp className="mr-2 text-xl" /> Contact via WhatsApp
        </a>

        <a 
          href="mailto:asfz.2000@gmail.com" 
          className="flex items-center justify-center px-6 py-3 text-lg font-semibold bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition transform hover:scale-105 w-full md:w-auto"
        >
          <FaEnvelope className="mr-2 text-xl" /> Contact via Email
        </a>
      </div>

      {/* نموذج التواصل */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input 
          type="text" 
          name="name" 
          placeholder="Your Name" 
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-200"
          required
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Your Email" 
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-200"
          required
        />
        <textarea 
          name="message" 
          placeholder="Your Message" 
          value={formData.message}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-200"
          required
        ></textarea>
        <button 
          type="submit" 
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition transform hover:scale-105"
        >
          Send Message ✉️
        </button>
      </form>
    </div>
  );
};

export default Contact;
