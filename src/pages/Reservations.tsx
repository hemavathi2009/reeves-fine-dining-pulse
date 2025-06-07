
import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Phone, Mail, User, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface ReservationForm {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
}

const Reservations = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReservationForm>();

  const onSubmit = async (data: ReservationForm) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting reservation:', data);
      
      await addDoc(collection(db, 'reservations'), {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        date: data.date,
        time: data.time,
        guests: Number(data.guests),
        specialRequests: data.specialRequests?.trim() || '',
        status: 'pending',
        createdAt: Timestamp.now()
      });
      
      console.log('Reservation submitted successfully');
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting reservation:', error);
      alert('There was an error submitting your reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-charcoal pt-20">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-serif font-bold text-amber-400 mb-6">
            Reservations
          </h1>
          <p className="text-xl text-cream max-w-3xl mx-auto leading-relaxed">
            Reserve your table for an unforgettable culinary journey. 
            Our team will ensure every detail of your dining experience is perfect.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Restaurant interior"
                className="w-full h-96 object-cover border border-amber-600/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-black/30 border border-amber-600/20 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Clock className="text-amber-400" size={24} />
                  <h3 className="font-semibold text-amber-400 text-lg">Opening Hours</h3>
                </div>
                <div className="space-y-2 text-cream">
                  <p><span className="font-medium">Tue - Thu:</span> 5:00 PM - 10:00 PM</p>
                  <p><span className="font-medium">Fri - Sat:</span> 5:00 PM - 11:00 PM</p>
                  <p><span className="font-medium">Sunday:</span> 4:00 PM - 9:00 PM</p>
                  <p><span className="font-medium text-amber-400">Monday:</span> Closed</p>
                </div>
              </div>
              
              <div className="bg-black/30 border border-amber-600/20 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Phone className="text-amber-400" size={24} />
                  <h3 className="font-semibold text-amber-400 text-lg">Contact Us</h3>
                </div>
                <div className="space-y-2 text-cream">
                  <p>+1 (555) 123-4567</p>
                  <p>reservations@reevesdining.com</p>
                  <p className="text-sm text-cream/70">We'll confirm your reservation within 2 hours</p>
                </div>
              </div>
            </div>
          </motion.div>

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
                  Reservation Received
                </h3>
                <p className="text-cream mb-8 text-lg">
                  Thank you for your reservation. We'll contact you within 2 hours to confirm the details.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-8 py-3 font-semibold transition-colors"
                >
                  Make Another Reservation
                </button>
              </motion.div>
            ) : (
              <>
                <h2 className="text-3xl font-serif font-bold text-amber-400 mb-8 text-center">
                  Book Your Table
                </h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-amber-400 font-semibold mb-2">
                        <User size={18} className="inline mr-2" />
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
                        <Mail size={18} className="inline mr-2" />
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

                  <div>
                    <label className="block text-amber-400 font-semibold mb-2">
                      <Phone size={18} className="inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      {...register('phone', { 
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[\+]?[1-9][\d]{0,15}$/,
                          message: 'Please enter a valid phone number'
                        }
                      })}
                      type="tel"
                      className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-amber-400 font-semibold mb-2">
                        <Calendar size={18} className="inline mr-2" />
                        Date *
                      </label>
                      <input
                        {...register('date', { required: 'Date is required' })}
                        type="date"
                        min={today}
                        className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors"
                      />
                      {errors.date && (
                        <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-amber-400 font-semibold mb-2">
                        <Clock size={18} className="inline mr-2" />
                        Time *
                      </label>
                      <select
                        {...register('time', { required: 'Time is required' })}
                        className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors"
                      >
                        <option value="">Select time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      {errors.time && (
                        <p className="text-red-400 text-sm mt-1">{errors.time.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-amber-400 font-semibold mb-2">
                        <Users size={18} className="inline mr-2" />
                        Guests *
                      </label>
                      <select
                        {...register('guests', { 
                          required: 'Number of guests is required',
                          min: { value: 1, message: 'At least 1 guest required' }
                        })}
                        className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors"
                      >
                        <option value="">Guests</option>
                        {[1,2,3,4,5,6,7,8].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                      {errors.guests && (
                        <p className="text-red-400 text-sm mt-1">{errors.guests.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-amber-400 font-semibold mb-2">
                      Special Requests
                    </label>
                    <textarea
                      {...register('specialRequests')}
                      rows={4}
                      className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-3 focus:border-amber-400 focus:outline-none transition-colors resize-none"
                      placeholder="Allergies, dietary restrictions, special occasions, seating preferences..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-black px-8 py-4 font-bold text-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Reserve Table</span>
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

export default Reservations;
