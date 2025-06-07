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
    <footer className="bg-black border-t border-amber-600/20">
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Link to="/" className="text-3xl font-serif font-bold text-amber-400">
              Reeves Dining
            </Link>
            <p className="text-cream/80 leading-relaxed">
              An exquisite culinary journey where tradition meets innovation. 
              Experience fine dining redefined through our passion for perfection.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-cream hover:text-amber-400 transition-colors duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-cream hover:text-amber-400 transition-colors duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-cream hover:text-amber-400 transition-colors duration-300">
                <Twitter size={20} />
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
            <h3 className="text-xl font-semibold text-amber-400">Quick Links</h3>
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
                  className="text-cream hover:text-amber-400 transition-colors duration-300 hover:translate-x-1 transform"
                  onClick={scrollToTop}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-amber-400">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="text-amber-400 mt-1 flex-shrink-0" size={18} />
                <div className="text-cream">
                  <p>123 Gourmet Street</p>
                  <p>Fine Dining District</p>
                  <p>New York, NY 10001</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="text-amber-400 flex-shrink-0" size={18} />
                <p className="text-cream">+1 (555) 123-4567</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="text-amber-400 flex-shrink-0" size={18} />
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
            <h3 className="text-xl font-semibold text-amber-400">Opening Hours</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="text-amber-400 flex-shrink-0" size={18} />
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

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-amber-600/20 mt-12 pt-8 text-center"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-cream/70">
              © {currentYear} Reeves Dining. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a
                href="#"
                className="text-cream/70 hover:text-amber-400 transition-colors"
                onClick={e => { e.preventDefault(); scrollToTop(); }}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-cream/70 hover:text-amber-400 transition-colors"
                onClick={e => { e.preventDefault(); scrollToTop(); }}
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-cream/70 hover:text-amber-400 transition-colors"
                onClick={e => { e.preventDefault(); scrollToTop(); }}
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
