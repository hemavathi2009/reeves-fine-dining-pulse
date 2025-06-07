
import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    try {
      setIsSubmitting(true);
      await addDoc(collection(db, 'contacts'), {
        ...data,
        createdAt: new Date(),
        status: 'unread'
      });
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      content: "123 Culinary Boulevard\nDowntown District\nNew York, NY 10001"
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+1 (555) 123-4567"
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@reevesdining.com\nreservations@reevesdining.com"
    },
    {
      icon: Clock,
      title: "Hours",
      content: "Tuesday - Sunday: 5:00 PM - 11:00 PM\nClosed Mondays"
    }
  ];

  return (
    <div className="min-h-screen bg-charcoal pt-20">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-serif font-bold text-amber-400 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-cream max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you. Whether you have questions about our menu, 
            want to plan a special event, or simply wish to share your experience.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Restaurant exterior"
                className="w-full h-64 object-cover border border-amber-600/20"
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-black/30 backdrop-blur-sm border border-amber-600/20 p-6 hover:border-amber-600/40 transition-all duration-300"
                >
                  <info.icon className="text-amber-400 mb-4" size={32} />
                  <h3 className="text-xl font-bold text-amber-400 mb-3">
                    {info.title}
                  </h3>
                  <p className="text-cream whitespace-pre-line">
                    {info.content}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Map placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-black/30 backdrop-blur-sm border border-amber-600/20 p-6"
            >
              <h3 className="text-xl font-bold text-amber-400 mb-4">Location</h3>
              <div className="bg-charcoal/50 h-48 flex items-center justify-center text-cream">
                <p>Interactive Map Coming Soon</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/30 backdrop-blur-sm border border-amber-600/20 p-8"
          >
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="text-amber-400 text-6xl mb-6">✓</div>
                <h3 className="text-2xl font-bold text-amber-400 mb-4">
                  Message Sent
                </h3>
                <p className="text-cream mb-6">
                  Thank you for contacting us. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 font-semibold transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-serif font-bold text-amber-400 mb-8">
                  Get In Touch
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-amber-400 font-semibold mb-2">
                        Name *
                      </label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors"
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-amber-400 font-semibold mb-2">
                        Email *
                      </label>
                      <input
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        type="email"
                        className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors"
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-amber-400 font-semibold mb-2">
                        Phone
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-amber-400 font-semibold mb-2">
                        Subject *
                      </label>
                      <select
                        {...register('subject', { required: 'Subject is required' })}
                        className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors"
                      >
                        <option value="">Select subject</option>
                        <option value="reservation">Reservation Inquiry</option>
                        <option value="private-event">Private Event</option>
                        <option value="feedback">Feedback</option>
                        <option value="general">General Inquiry</option>
                        <option value="press">Press & Media</option>
                      </select>
                      {errors.subject && (
                        <p className="text-red-400 text-sm mt-1">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-amber-400 font-semibold mb-2">
                      Message *
                    </label>
                    <textarea
                      {...register('message', { required: 'Message is required' })}
                      rows={6}
                      className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                    {errors.message && (
                      <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-black px-8 py-4 font-bold text-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2"
                  >
                    <Send size={20} />
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
