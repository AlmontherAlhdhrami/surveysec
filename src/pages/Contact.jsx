import { useState } from "react";
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPhone, FaUniversity, FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Title Section */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-3 rounded-full mb-6">
            <FaUniversity className="inline-block text-3xl mr-3 text-cyan-300" />
            <h1 className="inline-block text-4xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Project Support Hub
            </h1>
          </div>
          <p className="text-xl opacity-90 font-light max-w-2xl mx-auto leading-relaxed">
            Connecting innovation with expertise through the Computer Science Department at Sultan Qaboos University
          </p>
        </motion.div>

        {/* Contact Cards */}
        <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Technical Support Card */}
          <motion.div 
            variants={itemVariants}
            className="group bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 hover:border-cyan-300/50 transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <FaWhatsapp className="text-xl text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
                Technical Support
              </h2>
            </div>
            <div className="space-y-5">
              <div className="flex items-center hover:bg-white/5 p-3 rounded-xl transition">
                <FaWhatsapp className="text-cyan-300 mr-3 text-xl" />
                <a href="https://wa.me/96871745009" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition">
                  +968 7174 5009
                </a>
              </div>
              <div className="flex items-center hover:bg-white/5 p-3 rounded-xl transition">
                <FaEnvelope className="text-pink-300 mr-3 text-xl" />
                <a href="mailto:support@surveyapp.squ" className="hover:text-pink-300 transition">
                  support@surveyapp.squ
                </a>
              </div>
              <div className="flex items-center hover:bg-white/5 p-3 rounded-xl transition">
                <FaMapMarkerAlt className="text-yellow-300 mr-3 text-xl" />
                <span>H5RC+FV Seeb, Oman</span>
              </div>
            </div>
          </motion.div>

          {/* Office Hours Card */}
          <motion.div 
            variants={itemVariants}
            className="group bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 hover:border-purple-300/50 transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <FaUniversity className="text-xl text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-white bg-clip-text text-transparent">
                Office Hours
              </h2>
            </div>
            <div className="space-y-5">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                <span className="opacity-90">Sunday – Thursday</span>
                <span className="font-semibold text-cyan-300">8 AM – 2 PM</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                <span className="opacity-90">Response Time</span>
                <span className="font-semibold text-purple-300">24–48 Hours</span>
              </div>
              <div className="mt-4 p-4 bg-white/10 rounded-xl text-sm border border-white/20">
                ⚠️ During university holidays, response times may be longer
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Contact Form */}
        <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20">
          <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
            Direct Message Portal
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/20 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30 outline-none transition"
                  placeholder=" "
                  required
                />
                <label className="absolute left-4 top-2 text-sm text-white/60 pointer-events-none transition-all">
                  Full Name
                </label>
              </div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/20 focus:border-purple-300 focus:ring-2 focus:ring-purple-300/30 outline-none transition"
                  placeholder=" "
                  required
                />
                <label className="absolute left-4 top-2 text-sm text-white/60 pointer-events-none transition-all">
                  Email Address
                </label>
              </div>
            </div>

            <div className="relative">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full p-4 rounded-xl bg-white/5 border border-white/20 focus:border-pink-300 focus:ring-2 focus:ring-pink-300/30 outline-none transition"
                placeholder=" "
                required
              ></textarea>
              <label className="absolute left-4 top-2 text-sm text-white/60 pointer-events-none transition-all">
                Your Message
              </label>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-sm opacity-80 text-center md:text-left">
                ✨ We guarantee response within 2 working days
              </p>
              <button
                type="submit"
                className="group relative overflow-hidden bg-gradient-to-r from-cyan-400 to-purple-500 px-8 py-4 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <span className="relative z-10 flex items-center">
                  <FaPaperPlane className="mr-2 transform group-hover:translate-x-1 transition-transform" />
                  Send Message
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Map Section */}
        <motion.div variants={itemVariants} className="mt-16 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
          <iframe
            title="SQU Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3597.6925502210446!2d58.15791031543652!3d23.67365039727526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQwJzI1LjEiTiA1OMKwMDknMzIuMiJF!5e0!3m2!1sen!2som!4v1629997413008!5m2!1sen!2som"
            width="100%"
            height="400"
            className="rounded-2xl"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Contact;