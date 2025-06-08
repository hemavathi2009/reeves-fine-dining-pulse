import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
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
      console.log('Submitting contact form:', data);
      
      await addDoc(collection(db, 'contacts'), {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || '',
        subject: data.subject,
        message: data.message.trim(),
        status: 'unread',
        createdAt: Timestamp.now()
      });
      
      console.log('Contact form submitted successfully');
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjects = [
    { value: 'reservation', label: 'Reservation Inquiry' },
    { value: 'private-event', label: 'Private Event' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'press', label: 'Press Inquiry' },
    { value: 'other', label: 'Other' }
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
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
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
            <div>
              <h2 className="text-3xl font-serif font-bold text-amber-400 mb-8">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                <div className="bg-black/30 border border-amber-600/20 p-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="text-amber-400 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-amber-400 text-lg mb-2">Address</h3>
                      <p className="text-cream">
                        123 Gourmet Street<br />
                        Fine Dining District<br />
                        New York, NY 10001
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 border border-amber-600/20 p-6">
                  <div className="flex items-start space-x-4">
                    <Phone className="text-amber-400 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-amber-400 text-lg mb-2">Phone</h3>
                      <p className="text-cream">+1 (555) 123-4567</p>
                      <p className="text-cream/70 text-sm">Available during business hours</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 border border-amber-600/20 p-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="text-amber-400 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-amber-400 text-lg mb-2">Email</h3>
                      <p className="text-cream">hello@reeves.com</p>
                      <p className="text-cream/70 text-sm">We'll respond within 24 hours</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 border border-amber-600/20 p-6">
                  <div className="flex items-start space-x-4">
                    <Clock className="text-amber-400 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-amber-400 text-lg mb-2">Hours</h3>
                      <div className="text-cream space-y-1">
                        <p>Tuesday - Thursday: 5:00 PM - 10:00 PM</p>
                        <p>Friday - Saturday: 5:00 PM - 11:00 PM</p>
                        <p>Sunday: 4:00 PM - 9:00 PM</p>
                        <p className="text-amber-400">Monday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/30 backdrop-blur-sm border border-amber-600/20 p-8"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="text-amber-400 mx-auto mb-6" size={64} />
                <h3 className="text-3xl font-bold text-amber-400 mb-4">
                  Message Sent
                </h3>
                <p className="text-cream mb-8 text-lg">
                  Thank you for your message. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-8 py-3 font-semibold transition-colors"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <>
                <h2 className="text-3xl font-serif font-bold text-amber-400 mb-8 text-center">
                  Send us a Message
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-amber-400 font-semibold mb-2">
                        Full Name *
                      </label>
                      <input
                        {...register('name', { 
                          required: 'Name is required',
                          minLength: { value: 2, message: 'Name must be at least 2 characters' }
                        })}
                        className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors"
                        placeholder="Your full name"
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
                            value: /^\S+@\S+\.\S+$/,
                            message: 'Please enter a valid email address'
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
                        Phone (Optional)
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
                        {...register('subject', { required: 'Please select a subject' })}
                        className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors"
                      >
                        <option value="">Select a subject</option>
                        {subjects.map(subject => (
                          <option key={subject.value} value={subject.value}>
                            {subject.label}
                          </option>
                        ))}
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
                      {...register('message', { 
                        required: 'Message is required',
                        minLength: { value: 10, message: 'Message must be at least 10 characters' }
                      })}
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
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>Send Message</span>
                      </>
                    )}
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
