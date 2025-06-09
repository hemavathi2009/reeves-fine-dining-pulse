import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Phone, Mail, Clock, Calendar, Send, CheckCircle, 
  User, Calendar as CalendarIcon, ExternalLink
} from 'lucide-react';
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

interface OpeningHour {
  day: string;
  hours: string;
  isToday: boolean;
}

const Contact = () => {
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  
  // Animation state
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Form validation with React Hook Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>();
  
  // Refs for animations
  const formRef = useRef<HTMLFormElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  
  // Fetch opening hours from Firebase
  useEffect(() => {
    const fetchOpeningHours = async () => {
      try {
        const openingHoursSnapshot = await getDocs(collection(db, 'openingHours'));
        if (!openingHoursSnapshot.empty) {
          const hours = openingHoursSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              day: data.day,
              hours: data.hours,
              isToday: isToday(data.day)
            };
          });
          setOpeningHours(hours);
        } else {
          // Use fallback hours
          setOpeningHours(fallbackHours);
        }
      } catch (error) {
        console.error('Error fetching opening hours:', error);
        setOpeningHours(fallbackHours);
      }
    };
    
    fetchOpeningHours();
  }, []);
  
  // Generate fallback hours
  const fallbackHours: OpeningHour[] = [
    { day: 'Monday', hours: 'Closed', isToday: isToday('Monday') },
    { day: 'Tuesday', hours: '5:00 PM - 10:00 PM', isToday: isToday('Tuesday') },
    { day: 'Wednesday', hours: '5:00 PM - 10:00 PM', isToday: isToday('Wednesday') },
    { day: 'Thursday', hours: '5:00 PM - 10:00 PM', isToday: isToday('Thursday') },
    { day: 'Friday', hours: '5:00 PM - 11:00 PM', isToday: isToday('Friday') },
    { day: 'Saturday', hours: '5:00 PM - 11:00 PM', isToday: isToday('Saturday') },
    { day: 'Sunday', hours: '5:00 PM - 9:00 PM', isToday: isToday('Sunday') },
  ];
  
  // Check if day is today
  function isToday(day: string): boolean {
    const today = new Date().getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[today] === day;
  }
  
  // Parallax effect for particles
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!particlesRef.current) return;
      
      const particles = particlesRef.current.querySelectorAll('.particle');
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      particles.forEach((particle, index) => {
        const depth = 0.05 * (index % 5 + 1);
        const translateX = mouseX * depth * 100;
        const translateY = mouseY * depth * 100;
        
        (particle as HTMLElement).style.transform = `translate(${translateX}px, ${translateY}px)`;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Form submission handler
  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      
      // Add to Firestore
      await addDoc(collection(db, 'contacts'), {
        ...data,
        createdAt: Timestamp.now(),
        status: 'unread' // For admin tracking
      });
      
      // Show success state
      setIsSubmitted(true);
      reset();
      
      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 8000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };
  
  const successVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 10
      }
    }
  };

  // Particle generator
  const generateParticles = () => {
    return Array.from({ length: 20 }).map((_, index) => (
      <motion.div
        key={index}
        className={`particle absolute w-${index % 3 + 1} h-${index % 3 + 1} rounded-full bg-amber-400/10`}
        initial={{ 
          x: Math.random() * 100 + '%',
          y: Math.random() * 100 + '%',
          opacity: Math.random() * 0.5
        }}
        animate={{ 
          y: [null, Math.random() * -20 - 10],
          opacity: [null, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: Math.random() * 10 + 10,
          delay: Math.random() * 5
        }}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-charcoal pt-20 pb-20 relative overflow-hidden">
      {/* Hero Section with Professional Restaurant Image */}
      <div className="relative h-[40vh] mb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80"
            alt="Elegant restaurant interior"
            className="w-full h-full object-cover brightness-125 contrast-105"
          />
          {/* Reduced darkness of overlay */}
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-charcoal/40 to-charcoal"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center px-6 max-w-4xl relative z-10"
          >
            <h1 className="text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 mb-6">
              Contact Us
            </h1>
            <div className="w-32 h-0.5 bg-amber-400/70 mx-auto mb-6"></div>
            <p className="text-xl text-cream max-w-3xl mx-auto leading-relaxed">
              We're here to assist you with any inquiries or special requests.
              Reach out to us and experience our dedicated service.
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Background particles effect */}
      <div ref={particlesRef} className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {generateParticles()}
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Info & Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-10"
          >
            {/* Contact Information */}
            <motion.div 
              className="bg-black/40 backdrop-blur-lg border border-amber-600/20 p-8 rounded-xl shadow-xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-3xl font-serif font-bold text-amber-400 mb-6">
                Get In Touch
              </h2>
              
              {/* Contact details */}
              <div className="space-y-6">
                <motion.div 
                  className="flex items-start space-x-4" 
                  variants={itemVariants}
                  onMouseEnter={() => setActiveSection('address')}
                  onMouseLeave={() => setActiveSection(null)}
                >
                  <div className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                    activeSection === 'address' 
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 scale-110' 
                      : 'bg-gradient-to-br from-amber-500 to-amber-700'
                  }`}>
                    <MapPin className="text-black" size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-amber-300 font-medium">Address</p>
                    <p className="text-cream">123 Gourmet Street</p>
                    <p className="text-cream">Fine Dining District</p>
                    <p className="text-cream">New York, NY 10001</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start space-x-4" 
                  variants={itemVariants}
                  onMouseEnter={() => setActiveSection('phone')}
                  onMouseLeave={() => setActiveSection(null)}
                >
                  <div className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                    activeSection === 'phone' 
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 scale-110' 
                      : 'bg-gradient-to-br from-amber-500 to-amber-700'
                  }`}>
                    <Phone className="text-black" size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-amber-300 font-medium">Telephone</p>
                    <p className="text-cream">+1 (555) 123-4567</p>
                    <p className="text-cream/70 text-sm">For reservations and inquiries</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start space-x-4" 
                  variants={itemVariants}
                  onMouseEnter={() => setActiveSection('email')}
                  onMouseLeave={() => setActiveSection(null)}
                >
                  <div className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                    activeSection === 'email' 
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 scale-110' 
                      : 'bg-gradient-to-br from-amber-500 to-amber-700'
                  }`}>
                    <Mail className="text-black" size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-amber-300 font-medium">Email</p>
                    <p className="text-cream">info@reevesdining.com</p>
                    <p className="text-cream/70 text-sm">We'll respond within 24 hours</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start space-x-4" 
                  variants={itemVariants}
                  onMouseEnter={() => setActiveSection('hours')}
                  onMouseLeave={() => setActiveSection(null)}
                >
                  <div className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                    activeSection === 'hours' 
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 scale-110' 
                      : 'bg-gradient-to-br from-amber-500 to-amber-700'
                  }`}>
                    <Clock className="text-black" size={20} />
                  </div>
                  <div>
                    <p className="text-amber-300 font-medium mb-2">Opening Hours</p>
                    <div className="space-y-2">
                      {openingHours.map((hour, index) => (
                        <div 
                          key={index} 
                          className={`flex justify-between ${hour.isToday ? 'text-amber-400 font-medium' : 'text-cream'}`}
                        >
                          <span>{hour.day}</span>
                          <span>{hour.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Google Map */}
            <motion.div
              ref={mapRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="rounded-xl overflow-hidden border border-amber-600/30 h-80 shadow-xl relative group"
              whileHover={{ boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.25)' }}
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.25279998326!2d-74.11976364143697!3d40.70583158621368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1644613146392!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }}
                allowFullScreen
                loading="lazy"
                title="Restaurant Location"
                className="transition-all duration-500 group-hover:filter-none"
              ></iframe>
              
              {/* Get Directions Button */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <a
                  href="https://goo.gl/maps/YourRestaurantLocation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black/70 backdrop-blur-sm text-amber-400 px-4 py-2 rounded flex items-center gap-2 hover:bg-amber-600 hover:text-black transition-colors duration-300 text-sm"
                >
                  <span>Get Directions</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right Column - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="bg-black/40 backdrop-blur-lg border border-amber-600/20 p-8 rounded-xl shadow-xl relative z-10">
              <h2 className="text-3xl font-serif font-bold text-amber-400 mb-6">
                Send Us A Message
              </h2>
              
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial="hidden"
                    animate="visible"
                    variants={successVariants}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="relative">
                      <motion.div 
                        className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mb-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                      >
                        <CheckCircle className="text-black" size={40} />
                      </motion.div>
                      
                      {/* Ripple effect */}
                      {[1, 2, 3].map(index => (
                        <motion.div
                          key={index}
                          className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-2 border-amber-500"
                          initial={{ scale: 0, opacity: 1 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: index * 0.4,
                          }}
                        />
                      ))}
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-2xl font-serif font-bold text-amber-400 mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-cream max-w-sm">
                        Thank you for reaching out. We've received your message and will respond shortly.
                      </p>
                      
                      <motion.button
                        onClick={() => setIsSubmitted(false)}
                        className="mt-8 text-amber-400 border border-amber-400/30 px-6 py-2 rounded-md hover:bg-amber-400 hover:text-black transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Send Another Message
                      </motion.button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.form
                    ref={formRef}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Name Field */}
                    <motion.div className="relative" variants={itemVariants}>
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400/70">
                        <User size={18} />
                      </div>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        type="text"
                        id="name"
                        className="w-full bg-black/30 border border-amber-600/30 text-cream pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:border-amber-400 transition-all peer placeholder:text-transparent"
                        placeholder="Your Name"
                      />
                      <label 
                        htmlFor="name"
                        className="absolute left-12 top-3 text-amber-400/70 transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-amber-400 peer-focus:left-0
                        peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-cream/50
                        peer-focus:left-0"
                      >
                        Your Name
                      </label>
                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </motion.div>
                    
                    {/* Email Field */}
                    <motion.div className="relative" variants={itemVariants}>
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400/70">
                        <Mail size={18} />
                      </div>
                      <input
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: 'Please enter a valid email address'
                          }
                        })}
                        type="email"
                        id="email"
                        className="w-full bg-black/30 border border-amber-600/30 text-cream pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:border-amber-400 transition-all peer placeholder:text-transparent"
                        placeholder="Your Email"
                      />
                      <label 
                        htmlFor="email"
                        className="absolute left-12 top-3 text-amber-400/70 transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-amber-400 peer-focus:left-0
                        peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-cream/50
                        peer-focus:left-0"
                      >
                        Your Email
                      </label>
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </motion.div>
                    
                    {/* Phone Field (Optional) */}
                    <motion.div className="relative" variants={itemVariants}>
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400/70">
                        <Phone size={18} />
                      </div>
                      <input
                        {...register('phone')}
                        type="tel"
                        id="phone"
                        className="w-full bg-black/30 border border-amber-600/30 text-cream pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:border-amber-400 transition-all peer placeholder:text-transparent"
                        placeholder="Your Phone (Optional)"
                      />
                      <label 
                        htmlFor="phone"
                        className="absolute left-12 top-3 text-amber-400/70 transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-amber-400 peer-focus:left-0
                        peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-cream/50
                        peer-focus:left-0"
                      >
                        Your Phone (Optional)
                      </label>
                    </motion.div>
                    
                    {/* Subject Dropdown */}
                    <motion.div className="relative" variants={itemVariants}>
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400/70">
                        <CalendarIcon size={18} />
                      </div>
                      <select
                        {...register('subject', { required: 'Please select a subject' })}
                        id="subject"
                        className="w-full bg-black/30 border border-amber-600/30 text-cream pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:border-amber-400 transition-all appearance-none"
                        defaultValue=""
                      >
                        <option value="" disabled>Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Reservation">Reservation</option>
                        <option value="Private Dining">Private Dining</option>
                        <option value="Feedback">Feedback</option>
                      </select>
                      {errors.subject && (
                        <p className="text-red-400 text-sm mt-1">{errors.subject.message}</p>
                      )}
                    </motion.div>
                    
                    {/* Message Field */}
                    <motion.div className="relative" variants={itemVariants}>
                      <textarea
                        {...register('message', { 
                          required: 'Message is required',
                          minLength: { value: 10, message: 'Message should be at least 10 characters' }
                        })}
                        id="message"
                        rows={5}
                        className="w-full bg-black/30 border border-amber-600/30 text-cream px-4 py-3 rounded-lg focus:outline-none focus:border-amber-400 transition-all peer placeholder:text-transparent resize-none"
                        placeholder="Your Message"
                      ></textarea>
                      <label 
                        htmlFor="message"
                        className="absolute left-4 top-3 text-amber-400/70 transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-focus:text-amber-400
                        peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-cream/50
                        peer-focus:left-0"
                      >
                        Your Message
                      </label>
                      {errors.message && (
                        <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
                      )}
                    </motion.div>
                    
                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold py-4 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex justify-center items-center"
                      variants={itemVariants}
                      whileHover={{
                        boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)',
                        scale: 1.02
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <motion.div 
                          className="flex items-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                          <span>Sending...</span>
                        </motion.div>
                      ) : (
                        <motion.div 
                          className="flex items-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span>Send Message</span>
                          <Send className="ml-2" size={18} />
                        </motion.div>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 border border-amber-600/20 rounded-full -z-10 opacity-60"></div>
            <div className="absolute -top-5 -left-5 w-20 h-20 border border-amber-600/20 rounded-full -z-10 opacity-60"></div>
          </motion.div>
        </div>
        
        {/* FAQ Section (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 text-center"
        >
          <h2 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-cream/80 max-w-2xl mx-auto mb-12">
            Find answers to common questions about dining with us. If you need additional information, please don't hesitate to reach out.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {FAQs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-black/30 border border-amber-600/20 p-6 rounded-xl text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -5,
                  boxShadow: '0 10px 30px -15px rgba(245, 158, 11, 0.3)'
                }}
              >
                <h3 className="text-xl font-serif font-semibold text-amber-400 mb-3">{faq.question}</h3>
                <p className="text-cream/80">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            <Badge variant="outline" className="border-amber-600/40 text-amber-400 px-4 py-2 text-sm">
              Still have questions? Contact us directly.
            </Badge>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// FAQ data
const FAQs = [
  {
    question: "Do you require reservations?",
    answer: "While we welcome walk-ins, reservations are strongly recommended, especially for weekend dining. You can book through our website or by phone."
  },
  {
    question: "What is your dress code?",
    answer: "We maintain a smart casual dress code. We request no athletic wear, shorts, or flip-flops. Jackets are suggested for gentlemen in our main dining room."
  },
  {
    question: "Do you accommodate dietary restrictions?",
    answer: "Absolutely. Please inform us of any dietary requirements when making your reservation, and our chefs will prepare suitable alternatives."
  },
  {
    question: "Is private dining available?",
    answer: "Yes, we offer elegant private dining spaces for special occasions and corporate events. Contact us for details and availability."
  },
];

export default Contact;
