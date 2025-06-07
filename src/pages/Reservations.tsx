
import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Phone, Mail, User } from 'lucide-react';
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
      await addDoc(collection(db, 'reservations'), {
        ...data,
        createdAt: new Date(),
        status: 'pending'
      });
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
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
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Restaurant interior"
                className="w-full h-96 object-cover border border-amber-600/20"
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
            
            <div className="mt-8 space-y-6">
              <div className="flex items-center space-x-4 text-cream">
                <Clock className="text-amber-400" size={24} />
                <div>
                  <h3 className="font-semibold text-amber-400">Opening Hours</h3>
                  <p>Tuesday - Sunday: 5:00 PM - 11:00 PM</p>
                  <p className="text-cream/70">Closed Mondays</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-cream">
                <Phone className="text-amber-400" size={24} />
                <div>
                  <h3 className="font-semibold text-amber-400">Contact</h3>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-cream">
                <Mail className="text-amber-400" size={24} />
                <div>
                  <h3 className="font-semibold text-amber-400">Email</h3>
                  <p>reservations@reevesdining.com</p>
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
              <div className="text-center py-12">
                <div className="text-amber-400 text-6xl mb-6">✓</div>
                <h3 className="text-2xl font-bold text-amber-400 mb-4">
                  Reservation Confirmed
                </h3>
                <p className="text-cream mb-6">
                  Thank you for your reservation. We'll contact you shortly to confirm the details.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 font-semibold transition-colors"
                >
                  Make Another Reservation
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-serif font-bold text-amber-400 mb-8">
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
                        {...register('name', { required: 'Name is required' })}
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

                  <div>
                    <label className="block text-amber-400 font-semibold mb-2">
                      <Phone size={18} className="inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      {...register('phone', { required: 'Phone number is required' })}
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
                        min={new Date().toISOString().split('T')[0]}
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
                        {...register('guests', { required: 'Number of guests is required' })}
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
                      placeholder="Allergies, dietary restrictions, special occasions..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-black px-8 py-4 font-bold text-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                  >
                    {isSubmitting ? 'Submitting...' : 'Reserve Table'}
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
