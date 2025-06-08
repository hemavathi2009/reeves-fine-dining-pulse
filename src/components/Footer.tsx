import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent"></div>
      
      {/* Background with gradient */}
      <div className="bg-gradient-to-b from-black/95 to-black">
        <div className="container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Link to="/" className="text-3xl font-serif font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                Reeves
              </Link>
              <p className="text-cream/80 leading-relaxed">
                An exquisite culinary journey where tradition meets innovation. 
                Experience fine dining redefined through our passion for perfection.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full text-cream bg-gradient-to-br from-black/80 to-charcoal/80 border border-amber-600/30 hover:border-amber-400 hover:text-amber-400 transition-colors duration-300">
                  <Instagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full text-cream bg-gradient-to-br from-black/80 to-charcoal/80 border border-amber-600/30 hover:border-amber-400 hover:text-amber-400 transition-colors duration-300">
                  <Facebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full text-cream bg-gradient-to-br from-black/80 to-charcoal/80 border border-amber-600/30 hover:border-amber-400 hover:text-amber-400 transition-colors duration-300">
                  <Twitter size={18} />
                </a>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Quick Links</h3>
              <nav className="flex flex-col space-y-3">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Menu', path: '/menu' },
                  { name: 'Gallery', path: '/gallery' },
                  { name: 'Reservations', path: '/reservations' },
                  { name: 'About Us', path: '/about' },
                  { name: 'Contact', path: '/contact' }
                ].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-cream hover:text-amber-400 transition-all duration-300 hover:translate-x-1 transform relative group"
                    onClick={scrollToTop}
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-amber-400 to-amber-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                ))}
              </nav>
            </motion.div>

            {/* Contact Info with gradient icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-amber-600/20 to-amber-600/5 flex-shrink-0">
                    <MapPin className="text-amber-400" size={16} />
                  </div>
                  <div className="text-cream">
                    <p>123 Gourmet Street</p>
                    <p>Fine Dining District</p>
                    <p>New York, NY 10001</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-amber-600/20 to-amber-600/5 flex-shrink-0">
                    <Phone className="text-amber-400" size={16} />
                  </div>
                  <p className="text-cream">+1 (555) 123-4567</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-amber-600/20 to-amber-600/5 flex-shrink-0">
                    <Mail className="text-amber-400" size={16} />
                  </div>
                  <p className="text-cream">hello@reevesdining.com</p>
                </div>
              </div>
            </motion.div>

            {/* Opening Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Opening Hours</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-amber-600/20 to-amber-600/5 flex-shrink-0">
                    <Clock className="text-amber-400" size={16} />
                  </div>
                  <div className="text-cream">
                    <p className="font-medium">Tuesday - Thursday</p>
                    <p className="text-cream/80">5:00 PM - 10:00 PM</p>
                  </div>
                </div>
                
                <div className="text-cream ml-9">
                  <p className="font-medium">Friday - Saturday</p>
                  <p className="text-cream/80">5:00 PM - 11:00 PM</p>
                </div>
                
                <div className="text-cream ml-9">
                  <p className="font-medium">Sunday</p>
                  <p className="text-cream/80">4:00 PM - 9:00 PM</p>
                </div>
                
                <div className="text-cream ml-9">
                  <p className="font-medium text-amber-400">Monday</p>
                  <p className="text-cream/80">Closed</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar with gradient separator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 text-center relative"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/30 to-transparent"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-cream/70">
                © {currentYear} Reeves Dining. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a
                  href="#"
                  className="text-cream/70 hover:text-amber-400 transition-all relative group"
                  onClick={e => { e.preventDefault(); scrollToTop(); }}
                >
                  Privacy Policy
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-400/50 group-hover:w-full transition-all duration-300"></span>
                </a>
                <a
                  href="#"
                  className="text-cream/70 hover:text-amber-400 transition-all relative group"
                  onClick={e => { e.preventDefault(); scrollToTop(); }}
                >
                  Terms of Service
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-400/50 group-hover:w-full transition-all duration-300"></span>
                </a>
                <a
                  href="#"
                  className="text-cream/70 hover:text-amber-400 transition-all relative group"
                  onClick={e => { e.preventDefault(); scrollToTop(); }}
                >
                  Cookie Policy
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-400/50 group-hover:w-full transition-all duration-300"></span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
