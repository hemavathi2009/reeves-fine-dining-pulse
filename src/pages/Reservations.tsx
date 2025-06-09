import React, { useState, useEffect, useRef } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Calendar, Clock, Users, Phone, Mail, User, CheckCircle, MapPin, MoonStar, 
  ChevronRight, ChevronLeft, Calendar as CalendarIcon, X, Volume, Volume2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ReservationForm {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  seatingPreference: string;
  occasion?: string;
}

const Reservations = () => {
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ReservationForm>();
  
  // Multistep form state
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(25);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);
  const [selectedSeating, setSelectedSeating] = useState<string | null>(null);
  const [animateError, setAnimateError] = useState(false);
  const [reservationDetails, setReservationDetails] = useState<Partial<ReservationForm> | null>(null);
  const [reservationId, setReservationId] = useState<string>('');
  const [ambientSound, setAmbientSound] = useState(false);
  
  // Animation controls
  const controls = useAnimation();
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Effect for progress bar animation
  useEffect(() => {
    setProgress(currentStep * 25);
  }, [currentStep]);
  
  // Toggle ambient sound
  const toggleAmbientSound = () => {
    if (audioRef.current) {
      if (ambientSound) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAmbientSound(!ambientSound);
    }
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setValue('date', format(date, 'yyyy-MM-dd'));
  };
  
  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setValue('time', time);
  };
  
  // Handle seating preference selection
  const handleSeatingSelect = (seating: string) => {
    setSelectedSeating(seating);
    setValue('seatingPreference', seating);
  };
  
  // Generate available time slots based on selected date
  const generateTimeSlots = () => {
    const baseSlots = [
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
      '20:00', '20:30', '21:00', '21:30', '22:00'
    ];
    
    // If today is selected, filter out past times
    if (selectedDate && isSameDay(selectedDate, new Date())) {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      
      return baseSlots.filter(time => {
        const [hour, minute] = time.split(':').map(Number);
        return hour > currentHour || (hour === currentHour && minute > currentMinute);
      });
    }
    
    return baseSlots;
  };
  
  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };
  
  // Format date for display
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Handle next step validation
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedDate || !watch('time') || !watch('guests')) {
        setAnimateError(true);
        setTimeout(() => setAnimateError(false), 500);
        return;
      }
    } else if (currentStep === 2) {
      if (!selectedSeating) {
        setAnimateError(true);
        setTimeout(() => setAnimateError(false), 500);
        return;
      }
    }
    
    controls.start({
      opacity: [1, 0, 1],
      x: [0, 20, 0],
      transition: { duration: 0.5 }
    });
    
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }, 200);
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    controls.start({
      opacity: [1, 0, 1],
      x: [0, -20, 0],
      transition: { duration: 0.5 }
    });
    
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }, 200);
  };
  
  // Generate a calendar grid for the month
  const generateCalendar = () => {
    const today = new Date();
    const calendarStart = new Date();
    const calendarEnd = new Date();
    calendarEnd.setDate(today.getDate() + 60); // Allow booking 60 days in advance
    
    const dates: Date[] = [];
    const current = new Date(calendarStart);
    
    while (current <= calendarEnd) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };
  
  // Available dates for booking
  const availableDates = generateCalendar();
  const timeSlots = generateTimeSlots();
  
  // Seating options
  const seatingOptions = [
    { id: 'window', label: 'Window View', icon: <MapPin size={18} /> },
    { id: 'private', label: 'Private Room', icon: <Users size={18} /> },
    { id: 'bar', label: 'Chef\'s Bar', icon: <User size={18} /> },
    { id: 'outdoor', label: 'Outdoor Patio', icon: <MoonStar size={18} /> },
  ];
  
  // Occasion options
  const occasionOptions = [
    "Birthday", "Anniversary", "Date Night", "Business Dinner", "Special Celebration", "None"
  ];
  
  // Form submission handler
  const onSubmit = async (data: ReservationForm) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting reservation:', data);
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'reservations'), {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        date: data.date,
        time: data.time,
        guests: Number(data.guests),
        specialRequests: data.specialRequests?.trim() || '',
        seatingPreference: data.seatingPreference,
        occasion: data.occasion || 'None',
        status: 'pending',
        createdAt: Timestamp.now()
      });
      
      // Store reservation details for confirmation page
      setReservationDetails({
        name: data.name,
        date: data.date,
        time: data.time,
        guests: data.guests,
        seatingPreference: data.seatingPreference
      });
      
      setReservationId(docRef.id);
      console.log('Reservation submitted successfully', docRef.id);
      
      // Show success state
      setIsSubmitted(true);
      reset();
      
      // Trigger confetti celebration
      if (confettiCanvasRef.current) {
        const myConfetti = confetti.create(confettiCanvasRef.current, {
          resize: true,
          useWorker: true
        });
        
        myConfetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6, x: 0.5 },
          colors: ['#f59e0b', '#d97706', '#fcd34d', '#fbbf24']
        });
      }
      
    } catch (error) {
      console.error('Error submitting reservation:', error);
      alert('There was an error submitting your reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar date helper
  const isDateSelected = (date: Date) => {
    return selectedDate && isSameDay(date, selectedDate);
  };
  
  // Particle animation component
  const Particles = () => {
    return (
      <div className="particles-container absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full bg-amber-400/20 absolute"
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
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-charcoal pt-20 overflow-x-hidden">
      {/* Background ambient audio */}
      <audio ref={audioRef} src="/ambient-restaurant.mp3" loop />
      
      {/* Canvas for confetti effect */}
      <canvas 
        ref={confettiCanvasRef} 
        className="fixed inset-0 pointer-events-none z-50"
      />
      
      {/* Sound toggle button */}
      <button 
        onClick={toggleAmbientSound}
        className="fixed bottom-6 left-6 z-40 bg-black/60 backdrop-blur-sm p-3 rounded-full border border-amber-600/40 hover:border-amber-400 transition-all duration-300"
        aria-label={ambientSound ? "Mute background music" : "Play background music"}
      >
        {ambientSound ? (
          <Volume2 size={18} className="text-amber-400" />
        ) : (
          <Volume size={18} className="text-amber-400/70" />
        )}
      </button>
      
      <div className="container mx-auto px-6 py-12 relative">
        <Particles />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative z-10"
        >
          <h1 className="text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 mb-6">
            Reserve Your Table
          </h1>
          <p className="text-xl text-cream max-w-3xl mx-auto leading-relaxed">
            Secure your place for an unforgettable culinary journey.
            Let us prepare the perfect setting for your dining experience.
          </p>
        </motion.div>

        {/* Progress bar for multistep form */}
        {!isSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <div className="flex justify-between mb-2">
              {['Booking Details', 'Seating', 'Contact Info', 'Review'].map((step, index) => (
                <span key={index} className={`text-sm ${currentStep >= index + 1 ? 'text-amber-400' : 'text-cream/50'}`}>
                  {step}
                </span>
              ))}
            </div>
            <Progress value={progress} className="h-2 bg-amber-900/30" indicatorClassName="bg-gradient-to-r from-amber-400 to-amber-600" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/40 backdrop-blur-lg border border-amber-600/20 p-8 sm:p-12 rounded-2xl shadow-xl relative overflow-hidden"
            >
              {/* Success animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent z-0"></div>
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-40 h-40 rounded-full bg-amber-600/5"
                    initial={{ 
                      x: Math.random() * 100 - 50 + '%', 
                      y: Math.random() * 100 - 50 + '%', 
                      scale: 0 
                    }}
                    animate={{ 
                      scale: [0, 1.5, 1],
                      opacity: [0, 0.4, 0],
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              
              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="text-black" size={48} />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl font-serif font-bold text-amber-400 mb-4"
                >
                  Reservation Confirmed
                </motion.h2>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-6"
                >
                  <p className="text-cream text-xl mb-8">
                    Thank you for your reservation. We're looking forward to serving you.
                  </p>
                  
                  {reservationDetails && (
                    <div className="bg-black/30 backdrop-blur-sm border border-amber-600/30 p-6 rounded-xl max-w-md mx-auto">
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div>
                          <p className="text-amber-400/80 text-sm mb-1">Reservation ID</p>
                          <p className="text-cream font-medium">{reservationId.substring(0, 8)}</p>
                        </div>
                        <div>
                          <p className="text-amber-400/80 text-sm mb-1">Guest Name</p>
                          <p className="text-cream font-medium">{reservationDetails.name}</p>
                        </div>
                        <div>
                          <p className="text-amber-400/80 text-sm mb-1">Date</p>
                          <p className="text-cream font-medium">
                            {selectedDate && formatDisplayDate(selectedDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-amber-400/80 text-sm mb-1">Time</p>
                          <p className="text-cream font-medium">{reservationDetails.time}</p>
                        </div>
                        <div>
                          <p className="text-amber-400/80 text-sm mb-1">Party Size</p>
                          <p className="text-cream font-medium">{reservationDetails.guests} guests</p>
                        </div>
                        <div>
                          <p className="text-amber-400/80 text-sm mb-1">Seating</p>
                          <p className="text-cream font-medium">
                            {seatingOptions.find(option => option.id === reservationDetails.seatingPreference)?.label}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-6">
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      className="bg-amber-600 hover:bg-amber-700 text-black px-8 py-3 font-semibold rounded-full transition-colors"
                    >
                      Make Another Reservation
                    </Button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              animate={controls}
              className="bg-black/40 backdrop-blur-lg border border-amber-600/20 p-8 rounded-2xl shadow-xl relative overflow-hidden"
            >
              {/* Subtle gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 to-transparent z-0"></div>
              
              <div className="relative z-10">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <AnimatePresence mode="wait">
                    {/* Step 1: Date, Time, Guests */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className={cn("space-y-8", animateError && "animate-shake")}
                      >
                        <div>
                          <h2 className="text-2xl font-serif font-bold text-amber-400 mb-6 flex items-center gap-2">
                            <Calendar className="text-amber-400" size={24} />
                            Select Your Date
                          </h2>
                          
                          <div className="overflow-x-auto pb-4">
                            <div className="flex gap-2 min-w-max">
                              {availableDates.map((date, index) => {
                                const isToday = isSameDay(date, new Date());
                                const isSelected = isDateSelected(date);
                                
                                return (
                                  <motion.button
                                    key={index}
                                    type="button"
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDateSelect(date)}
                                    className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                                      isSelected
                                        ? 'bg-amber-600 text-black'
                                        : 'bg-black/30 border border-amber-600/20 hover:border-amber-400/40 text-cream'
                                    }`}
                                  >
                                    <span className="text-xs font-medium mb-1">
                                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                    <span className={`text-2xl font-bold ${isToday && !isSelected ? 'text-amber-400' : ''}`}>
                                      {date.getDate()}
                                    </span>
                                    <span className="text-xs opacity-80">
                                      {date.toLocaleDateString('en-US', { month: 'short' })}
                                    </span>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                          
                          <input
                            type="hidden"
                            {...register('date', { required: 'Date is required' })}
                          />
                          {errors.date && (
                            <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <h2 className="text-2xl font-serif font-bold text-amber-400 mb-6 flex items-center gap-2">
                            <Clock className="text-amber-400" size={24} />
                            Select Time
                          </h2>
                          
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {timeSlots.map(time => (
                              <motion.button
                                key={time}
                                type="button"
                                whileHover={{ y: -3, backgroundColor: 'rgba(217, 119, 6, 0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTimeSelect(time)}
                                onMouseEnter={() => setHoveredTime(time)}
                                onMouseLeave={() => setHoveredTime(null)}
                                className={`p-3 rounded-lg transition-all relative overflow-hidden ${
                                  watch('time') === time
                                    ? 'bg-amber-600 text-black font-medium'
                                    : 'bg-black/30 border border-amber-600/20 hover:border-amber-400/40 text-cream'
                                }`}
                              >
                                {/* Ambient hover glow effect */}
                                {hoveredTime === time && (
                                  <motion.div
                                    layoutId="timeHover"
                                    className="absolute inset-0 bg-amber-600/10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  />
                                )}
                                <span className="relative z-10">
                                  {time}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                          
                          <input
                            type="hidden"
                            {...register('time', { required: 'Time is required' })}
                          />
                          {errors.time && (
                            <p className="text-red-400 text-sm mt-1">{errors.time.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <h2 className="text-2xl font-serif font-bold text-amber-400 mb-6 flex items-center gap-2">
                            <Users className="text-amber-400" size={24} />
                            Party Size
                          </h2>
                          
                          <div className="flex gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                              <motion.button
                                key={num}
                                type="button"
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setValue('guests', num)}
                                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
                                  Number(watch('guests')) === num
                                    ? 'bg-amber-600 text-black font-bold'
                                    : 'bg-black/30 border border-amber-600/20 hover:border-amber-400/40 text-cream'
                                }`}
                              >
                                {num}
                              </motion.button>
                            ))}
                          </div>
                          
                          <input
                            type="hidden"
                            {...register('guests', { 
                              required: 'Number of guests is required',
                              min: { value: 1, message: 'At least 1 guest required' }
                            })}
                          />
                          {errors.guests && (
                            <p className="text-red-400 text-sm mt-1">{errors.guests.message}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Step 2: Seating Preferences and Occasion */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className={cn("space-y-8", animateError && "animate-shake")}
                      >
                        <div>
                          <h2 className="text-2xl font-serif font-bold text-amber-400 mb-6">
                            Seating Preference
                          </h2>
                          
                          <div className="grid md:grid-cols-4 gap-4">
                            {seatingOptions.map((option) => (
                              <motion.div
                                key={option.id}
                                whileHover={{ y: -5, backgroundColor: 'rgba(217, 119, 6, 0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSeatingSelect(option.id)}
                                className={`cursor-pointer p-5 rounded-xl flex flex-col items-center justify-center text-center transition-all relative
                                  ${selectedSeating === option.id 
                                    ? 'bg-gradient-to-br from-amber-700/50 to-amber-900/50 border-2 border-amber-500'
                                    : 'bg-black/20 border border-amber-600/20'
                                  }
                                `}
                              >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3
                                  ${selectedSeating === option.id
                                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black'
                                    : 'bg-black/30 text-amber-400'
                                  }
                                `}>
                                  {option.icon}
                                </div>
                                <span className="font-medium text-lg text-cream">{option.label}</span>
                                
                                {/* Selection indicator */}
                                {selectedSeating === option.id && (
                                  <motion.div
                                    layoutId="seating-selection"
                                    className="absolute inset-0 rounded-xl border-2 border-amber-400"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  />
                                )}
                              </motion.div>
                            ))}
                          </div>
                          
                          <input
                            type="hidden"
                            {...register('seatingPreference', { required: 'Please select seating' })}
                          />
                        </div>
                        
                        <div>
                          <h2 className="text-2xl font-serif font-bold text-amber-400 mb-6">
                            Special Occasion
                          </h2>
                          
                          <select
                            {...register('occasion')}
                            className="w-full bg-black/30 border border-amber-600/30 text-cream px-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors"
                          >
                            <option value="">Select an occasion (optional)</option>
                            {occasionOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <h2 className="text-2xl font-serif font-bold text-amber-400 mb-6">
                            Special Requests
                          </h2>
                          
                          <textarea
                            {...register('specialRequests')}
                            rows={4}
                            className="w-full bg-black/30 border border-amber-600/30 text-cream px-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors resize-none"
                            placeholder="Allergies, dietary restrictions, special occasions, seating preferences..."
                          />
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Step 3: Contact Information */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <h2 className="text-2xl font-serif font-bold text-amber-400 mb-6">
                          Your Contact Information
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <User size={18} className="text-amber-400/70" />
                            </div>
                            <input
                              {...register('name', { 
                                required: 'Name is required',
                                minLength: { value: 2, message: 'Name must be at least 2 characters' }
                              })}
                              className="w-full bg-black/30 border border-amber-600/30 text-cream pl-10 pr-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors"
                              placeholder="Your full name"
                            />
                            {errors.name && (
                              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                            )}
                          </div>

                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Mail size={18} className="text-amber-400/70" />
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
                              className="w-full bg-black/30 border border-amber-600/30 text-cream pl-10 pr-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors"
                              placeholder="your@email.com"
                            />
                            {errors.email && (
                              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone size={18} className="text-amber-400/70" />
                          </div>
                          <input
                            {...register('phone', { 
                              required: 'Phone number is required',
                              pattern: {
                                value: /^[\+]?[1-9][\d]{0,15}$/,
                                message: 'Please enter a valid phone number'
                              }
                            })}
                            type="tel"
                            className="w-full bg-black/30 border border-amber-600/30 text-cream pl-10 pr-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors"
                            placeholder="+1 (555) 123-4567"
                          />
                          {errors.phone && (
                            <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
                          )}
                        </div>
                        
                        <div className="bg-amber-600/10 border border-amber-600/30 p-4 rounded-lg">
                          <p className="text-cream/80 text-sm">
                            We'll send a confirmation to your email once your reservation is approved.
                            You may receive a call to confirm details for special arrangements.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Step 4: Review */}
                    {currentStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <h2 className="text-2xl font-serif font-bold text-amber-400 mb-6">
                          Review Your Reservation
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-black/30 border border-amber-600/20 p-6 rounded-lg">
                            <h3 className="font-semibold text-amber-400 text-lg mb-4 flex items-center gap-2">
                              <CalendarIcon size={18} />
                              Booking Details
                            </h3>
                            
                            <div className="space-y-3">
                              <div>
                                <span className="text-cream/70 text-sm">Date</span>
                                <p className="text-cream">{selectedDate && formatDisplayDate(selectedDate)}</p>
                              </div>
                              <div>
                                <span className="text-cream/70 text-sm">Time</span>
                                <p className="text-cream">{watch('time')}</p>
                              </div>
                              <div>
                                <span className="text-cream/70 text-sm">Party Size</span>
                                <p className="text-cream">{watch('guests')} guests</p>
                              </div>
                              <div>
                                <span className="text-cream/70 text-sm">Seating Preference</span>
                                <p className="text-cream">
                                  {seatingOptions.find(option => option.id === watch('seatingPreference'))?.label}
                                </p>
                              </div>
                              {watch('occasion') && watch('occasion') !== 'None' && (
                                <div>
                                  <span className="text-cream/70 text-sm">Occasion</span>
                                  <p className="text-cream">{watch('occasion')}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-black/30 border border-amber-600/20 p-6 rounded-lg">
                            <h3 className="font-semibold text-amber-400 text-lg mb-4 flex items-center gap-2">
                              <User size={18} />
                              Contact Information
                            </h3>
                            
                            <div className="space-y-3">
                              <div>
                                <span className="text-cream/70 text-sm">Name</span>
                                <p className="text-cream">{watch('name')}</p>
                              </div>
                              <div>
                                <span className="text-cream/70 text-sm">Email</span>
                                <p className="text-cream">{watch('email')}</p>
                              </div>
                              <div>
                                <span className="text-cream/70 text-sm">Phone</span>
                                <p className="text-cream">{watch('phone')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {watch('specialRequests') && (
                          <div className="bg-black/30 border border-amber-600/20 p-6 rounded-lg">
                            <h3 className="font-semibold text-amber-400 text-lg mb-2">Special Requests</h3>
                            <p className="text-cream whitespace-pre-wrap">{watch('specialRequests')}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="mt-10 flex justify-between">
                    {currentStep > 1 && (
                      <motion.button
                        type="button"
                        onClick={handlePrevStep}
                        whileHover={{ x: -3 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <ChevronLeft size={20} />
                        <span>Previous</span>
                      </motion.button>
                    )}
                    
                    <div className="ml-auto">
                      {currentStep < 4 ? (
                        <motion.button
                          type="button"
                          onClick={handleNextStep}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                          <span>Next</span>
                          <ChevronRight size={20} />
                        </motion.button>
                      ) : (
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <span>Confirm Reservation</span>
                              <CheckCircle size={18} />
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Reservations;
