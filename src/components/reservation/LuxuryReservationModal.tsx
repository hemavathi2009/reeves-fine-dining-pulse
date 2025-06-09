import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { Calendar, Clock, Users, Phone, Mail, User, CheckCircle, ChevronRight, ChevronLeft, X, Volume2, Volume } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import ParticleEffect from './ParticleEffect';

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

interface LuxuryReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LuxuryReservationModal: React.FC<LuxuryReservationModalProps> = ({ isOpen, onClose }) => {
  // Animation references
  const modalRef = useRef<HTMLDivElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<ReservationForm>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(25);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);
  const [selectedSeating, setSelectedSeating] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reservationId, setReservationId] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ReservationForm, string>>>({});
  const [animateError, setAnimateError] = useState(false);
  const [ambientSound, setAmbientSound] = useState(false);
  
  // Control entrance animation completion
  const [entranceComplete, setEntranceComplete] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Play opening sound
      const openSound = new Audio('/sounds/soft-chime.mp3');
      openSound.volume = 0.3;
      openSound.play().catch(err => console.log('Audio play failed:', err));
      
      // Reset form state when opening
      setCurrentStep(1);
      setIsSubmitted(false);
      setFormData({});
      
      // Delayed entrance complete
      setTimeout(() => {
        setEntranceComplete(true);
      }, 1000);
    } else {
      document.body.style.overflow = '';
      setEntranceComplete(false);
      
      // Stop ambient sound when closing
      if (audioRef.current) {
        audioRef.current.pause();
        setAmbientSound(false);
      }
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Update progress bar
  useEffect(() => {
    setProgress(currentStep * 25);
  }, [currentStep]);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Handle click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen && entranceComplete) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, entranceComplete, onClose]);

  // Toggle ambient sound
  const toggleAmbientSound = () => {
    if (audioRef.current) {
      if (ambientSound) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }
      setAmbientSound(!ambientSound);
    }
  };
  
  // Available dates and time slots
  const generateAvailableDates = () => {
    const today = new Date();
    const dates: Date[] = [];
    
    // Generate dates for the next 60 days
    for (let i = 0; i < 60; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
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
  
  // Date and time helpers
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };
  
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Seating options
  const seatingOptions = [
    { id: 'window', label: 'Window View', icon: <span className="material-icons">view_carousel</span> },
    { id: 'private', label: 'Private Room', icon: <span className="material-icons">door_sliding</span> },
    { id: 'bar', label: 'Chef\'s Bar', icon: <span className="material-icons">restaurant</span> },
    { id: 'outdoor', label: 'Outdoor Patio', icon: <span className="material-icons">deck</span> },
  ];
  
  // Occasion options
  const occasionOptions = [
    "Birthday", "Anniversary", "Date Night", "Business Dinner", "Special Celebration", "None"
  ];
  
  // Form handlers
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      date: format(date, 'yyyy-MM-dd')
    });
    
    // Play selection sound
    const selectSound = new Audio('/sounds/select-soft.mp3');
    selectSound.volume = 0.2;
    selectSound.play().catch(err => console.log('Audio play failed:', err));
  };
  
  const handleTimeSelect = (time: string) => {
    setFormData({
      ...formData,
      time
    });
    
    // Play selection sound
    const selectSound = new Audio('/sounds/select-soft.mp3');
    selectSound.volume = 0.2;
    selectSound.play().catch(err => console.log('Audio play failed:', err));
  };
  
  const handleSeatingSelect = (seating: string) => {
    setSelectedSeating(seating);
    setFormData({
      ...formData,
      seatingPreference: seating
    });
    
    // Play selection sound
    const selectSound = new Audio('/sounds/select-soft.mp3');
    selectSound.volume = 0.2;
    selectSound.play().catch(err => console.log('Audio play failed:', err));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when user types
    if (validationErrors[name as keyof ReservationForm]) {
      setValidationErrors({
        ...validationErrors,
        [name]: undefined
      });
    }
  };
  
  const handleGuestSelect = (guests: number) => {
    setFormData({
      ...formData,
      guests
    });
    
    // Play selection sound
    const selectSound = new Audio('/sounds/select-soft.mp3');
    selectSound.volume = 0.2;
    selectSound.play().catch(err => console.log('Audio play failed:', err));
  };
  
  // Step navigation with validation
  const validateStep = (step: number): boolean => {
    const errors: Partial<Record<keyof ReservationForm, string>> = {};
    
    if (step === 1) {
      if (!formData.date) errors.date = 'Please select a date';
      if (!formData.time) errors.time = 'Please select a time';
      if (!formData.guests) errors.guests = 'Please select number of guests';
    } else if (step === 2) {
      if (!formData.seatingPreference) errors.seatingPreference = 'Please select seating preference';
    } else if (step === 3) {
      if (!formData.name) errors.name = 'Name is required';
      if (!formData.email) errors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Please enter a valid email';
      if (!formData.phone) errors.phone = 'Phone number is required';
      else if (!/^[\+]?[1-9][\d]{9,15}$/.test(formData.phone.replace(/\s+/g, ''))) 
        errors.phone = 'Please enter a valid phone number';
    }
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setAnimateError(true);
      setTimeout(() => setAnimateError(false), 500);
      
      // Play error sound
      const errorSound = new Audio('/sounds/error-soft.mp3');
      errorSound.volume = 0.2;
      errorSound.play().catch(err => console.log('Audio play failed:', err));
      
      return false;
    }
    
    return true;
  };
  
  const handleNextStep = () => {
    if (!validateStep(currentStep)) return;
    
    // Play navigation sound
    const navSound = new Audio('/sounds/next-step.mp3');
    navSound.volume = 0.2;
    navSound.play().catch(err => console.log('Audio play failed:', err));
    
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };
  
  const handlePrevStep = () => {
    // Play navigation sound
    const navSound = new Audio('/sounds/prev-step.mp3');
    navSound.volume = 0.2;
    navSound.play().catch(err => console.log('Audio play failed:', err));
    
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Form submission
  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    
    try {
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'reservations'), {
        name: formData.name?.trim(),
        email: formData.email?.trim(),
        phone: formData.phone?.trim(),
        date: formData.date,
        time: formData.time,
        guests: Number(formData.guests),
        specialRequests: formData.specialRequests?.trim() || '',
        seatingPreference: formData.seatingPreference,
        occasion: formData.occasion || 'None',
        status: 'pending',
        createdAt: Timestamp.now()
      });
      
      setReservationId(docRef.id);
      
      // Success effect
      const successSound = new Audio('/sounds/success.mp3');
      successSound.volume = 0.3;
      successSound.play().catch(err => console.log('Audio play failed:', err));
      
      // Trigger confetti celebration
      if (confettiCanvasRef.current) {
        const myConfetti = confetti.create(confettiCanvasRef.current, {
          resize: true
        });
        
        myConfetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6, x: 0.5 },
          colors: ['#f59e0b', '#d97706', '#fcd34d', '#fbbf24']
        });
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting reservation:', error);
      // Show error message
      alert('There was an error submitting your reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Available dates and time slots
  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg bg-black/60"
        >
          {/* Background canvas effect */}
          <canvas 
            ref={confettiCanvasRef} 
            className="fixed inset-0 pointer-events-none z-10"
          />
          
          {/* Background ambient audio */}
          <audio 
            ref={audioRef}
            src="/sounds/ambient-restaurant.mp3" 
            loop 
          />
          
          {/* Sound toggle button */}
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={toggleAmbientSound}
            className="fixed bottom-6 left-6 z-40 bg-black/60 backdrop-blur-sm p-3 rounded-full border border-amber-600/40 hover:border-amber-400 transition-all duration-300"
            aria-label={ambientSound ? "Mute background music" : "Play background music"}
          >
            {ambientSound ? (
              <Volume2 size={18} className="text-amber-400" />
            ) : (
              <Volume size={18} className="text-amber-400/70" />
            )}
          </motion.button>
          
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, top: "2rem" }}
            animate={{ opacity: 1, top: "1.5rem" }}
            transition={{ delay: 0.4 }}
            onClick={onClose}
            className="fixed right-6 top-6 z-40 bg-black/60 backdrop-blur-sm p-3 rounded-full border border-amber-600/40 hover:border-amber-400 transition-all duration-300"
            aria-label="Close reservation modal"
          >
            <X size={18} className="text-amber-400" />
          </motion.button>
          
          {/* Ambient particle effects */}
          <ParticleEffect />
          
          {/* Main modal container */}
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300,
              mass: 0.8
            }}
            className="relative z-20 w-full max-w-4xl bg-gradient-to-br from-charcoal/90 to-black/95 backdrop-blur-xl border border-amber-600/30 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Modal header */}
            <div className="relative p-8 text-center border-b border-amber-600/20">
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600"
              >
                Reserve Your Table
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-cream/80 mt-2 max-w-2xl mx-auto"
              >
                Secure your place for an unforgettable culinary journey
              </motion.p>
            </div>
            
            {/* Progress indicator */}
            {!isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="px-8 pt-6"
              >
                <div className="flex justify-between mb-2 text-xs">
                  <span className={currentStep >= 1 ? 'text-amber-400' : 'text-cream/50'}>
                    Booking Details
                  </span>
                  <span className={currentStep >= 2 ? 'text-amber-400' : 'text-cream/50'}>
                    Preferences
                  </span>
                  <span className={currentStep >= 3 ? 'text-amber-400' : 'text-cream/50'}>
                    Your Information
                  </span>
                  <span className={currentStep >= 4 ? 'text-amber-400' : 'text-cream/50'}>
                    Confirmation
                  </span>
                </div>
                <Progress value={progress} className="h-1.5 bg-amber-900/30" />
              </motion.div>
            )}
            
            {/* Form content */}
            <div className="p-8">
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
                    {/* Date selection */}
                    <div>
                      <h3 className="text-xl font-serif font-bold text-amber-400 mb-4 flex items-center gap-2">
                        <Calendar className="text-amber-400" size={20} />
                        Select Your Date
                      </h3>
                      
                      <div className="overflow-x-auto pb-4 hide-scrollbar">
                        <div className="flex gap-2 min-w-max">
                          {availableDates.map((date, index) => {
                            const isToday = isSameDay(date, new Date());
                            const isSelected = selectedDate && isSameDay(date, selectedDate);
                            
                            return (
                              <motion.button
                                key={index}
                                type="button"
                                whileHover={{ y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDateSelect(date)}
                                className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-black shadow-lg shadow-amber-700/30'
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
                      
                      {validationErrors.date && (
                        <p className="text-red-400 text-sm mt-1 animate-pulse">{validationErrors.date}</p>
                      )}
                    </div>
                    
                    {/* Time selection */}
                    <div>
                      <h3 className="text-xl font-serif font-bold text-amber-400 mb-4 flex items-center gap-2">
                        <Clock className="text-amber-400" size={20} />
                        Select Time
                      </h3>
                      
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
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
                              formData.time === time
                                ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-black font-medium shadow-lg shadow-amber-700/30'
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
                      
                      {validationErrors.time && (
                        <p className="text-red-400 text-sm mt-1 animate-pulse">{validationErrors.time}</p>
                      )}
                    </div>
                    
                    {/* Party size */}
                    <div>
                      <h3 className="text-xl font-serif font-bold text-amber-400 mb-4 flex items-center gap-2">
                        <Users className="text-amber-400" size={20} />
                        Party Size
                      </h3>
                      
                      <div className="flex gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <motion.button
                            key={num}
                            type="button"
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleGuestSelect(num)}
                            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
                              formData.guests === num
                                ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-black font-bold shadow-lg shadow-amber-700/30'
                                : 'bg-black/30 border border-amber-600/20 hover:border-amber-400/40 text-cream'
                            }`}
                          >
                            {num}
                          </motion.button>
                        ))}
                      </div>
                      
                      {validationErrors.guests && (
                        <p className="text-red-400 text-sm mt-1 animate-pulse">{validationErrors.guests}</p>
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
                    {/* Seating selection */}
                    <div>
                      <h3 className="text-xl font-serif font-bold text-amber-400 mb-6">
                        Seating Preference
                      </h3>
                      
                      <div className="grid md:grid-cols-4 gap-4">
                        {seatingOptions.map((option) => (
                          <motion.div
                            key={option.id}
                            whileHover={{ y: -5, backgroundColor: 'rgba(217, 119, 6, 0.15)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSeatingSelect(option.id)}
                            className={`cursor-pointer p-5 rounded-xl flex flex-col items-center justify-center text-center transition-all relative
                              ${selectedSeating === option.id 
                                ? 'bg-gradient-to-br from-amber-700/50 to-amber-900/50 border-2 border-amber-500 shadow-lg shadow-amber-700/20'
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
                      
                      {validationErrors.seatingPreference && (
                        <p className="text-red-400 text-sm mt-1 animate-pulse">{validationErrors.seatingPreference}</p>
                      )}
                    </div>
                    
                    {/* Occasion selection */}
                    <div>
                      <h3 className="text-xl font-serif font-bold text-amber-400 mb-4">
                        Special Occasion
                      </h3>
                      
                      <select
                        name="occasion"
                        value={formData.occasion || ''}
                        onChange={handleInputChange}
                        className="w-full bg-black/30 border border-amber-600/30 text-cream px-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors"
                      >
                        <option value="">Select an occasion (optional)</option>
                        {occasionOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Special requests */}
                    <div>
                      <h3 className="text-xl font-serif font-bold text-amber-400 mb-4">
                        Special Requests
                      </h3>
                      
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests || ''}
                        onChange={handleInputChange}
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
                    <h3 className="text-xl font-serif font-bold text-amber-400 mb-6">
                      Your Contact Information
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User size={18} className="text-amber-400/70" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          className={`w-full bg-black/30 border ${validationErrors.name ? 'border-red-400' : 'border-amber-600/30'} text-cream pl-10 pr-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors`}
                          placeholder="Your full name"
                        />
                        {validationErrors.name && (
                          <p className="text-red-400 text-sm mt-1 animate-pulse">{validationErrors.name}</p>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail size={18} className="text-amber-400/70" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          className={`w-full bg-black/30 border ${validationErrors.email ? 'border-red-400' : 'border-amber-600/30'} text-cream pl-10 pr-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors`}
                          placeholder="your@email.com"
                        />
                        {validationErrors.email && (
                          <p className="text-red-400 text-sm mt-1 animate-pulse">{validationErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Phone size={18} className="text-amber-400/70" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className={`w-full bg-black/30 border ${validationErrors.phone ? 'border-red-400' : 'border-amber-600/30'} text-cream pl-10 pr-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {validationErrors.phone && (
                        <p className="text-red-400 text-sm mt-1 animate-pulse">{validationErrors.phone}</p>
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
                    <h3 className="text-xl font-serif font-bold text-amber-400 mb-6">
                      Review Your Reservation
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-black/30 border border-amber-600/20 p-6 rounded-lg">
                        <h4 className="font-semibold text-amber-400 text-lg mb-4 flex items-center gap-2">
                          <Calendar size={18} />
                          Booking Details
                        </h4>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-cream/70 text-sm">Date</span>
                            <p className="text-cream">{selectedDate && formatDisplayDate(selectedDate)}</p>
                          </div>
                          <div>
                            <span className="text-cream/70 text-sm">Time</span>
                            <p className="text-cream">{formData.time}</p>
                          </div>
                          <div>
                            <span className="text-cream/70 text-sm">Party Size</span>
                            <p className="text-cream">{formData.guests} guests</p>
                          </div>
                          <div>
                            <span className="text-cream/70 text-sm">Seating Preference</span>
                            <p className="text-cream">
                              {seatingOptions.find(option => option.id === formData.seatingPreference)?.label}
                            </p>
                          </div>
                          {formData.occasion && formData.occasion !== 'None' && (
                            <div>
                              <span className="text-cream/70 text-sm">Occasion</span>
                              <p className="text-cream">{formData.occasion}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-black/30 border border-amber-600/20 p-6 rounded-lg">
                        <h4 className="font-semibold text-amber-400 text-lg mb-4 flex items-center gap-2">
                          <User size={18} />
                          Contact Information
                        </h4>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-cream/70 text-sm">Name</span>
                            <p className="text-cream">{formData.name}</p>
                          </div>
                          <div>
                            <span className="text-cream/70 text-sm">Email</span>
                            <p className="text-cream">{formData.email}</p>
                          </div>
                          <div>
                            <span className="text-cream/70 text-sm">Phone</span>
                            <p className="text-cream">{formData.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {formData.specialRequests && (
                      <div className="bg-black/30 border border-amber-600/20 p-6 rounded-lg">
                        <h4 className="font-semibold text-amber-400 text-lg mb-2">Special Requests</h4>
                        <p className="text-cream whitespace-pre-wrap">{formData.specialRequests}</p>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {/* Success/Confirmation View */}
                {isSubmitted && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative overflow-hidden"
                  >
                    {/* Success animation background */}
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
                        className="text-3xl font-serif font-bold text-amber-400 mb-4"
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
                        
                        <div className="bg-black/30 backdrop-blur-sm border border-amber-600/30 p-6 rounded-xl max-w-md mx-auto">
                          <div className="grid grid-cols-2 gap-4 text-left">
                            <div>
                              <p className="text-amber-400/80 text-sm mb-1">Reservation ID</p>
                              <p className="text-cream font-medium">{reservationId.substring(0, 8)}</p>
                            </div>
                            <div>
                              <p className="text-amber-400/80 text-sm mb-1">Guest Name</p>
                              <p className="text-cream font-medium">{formData.name}</p>
                            </div>
                            <div>
                              <p className="text-amber-400/80 text-sm mb-1">Date</p>
                              <p className="text-cream font-medium">
                                {selectedDate && formatDisplayDate(selectedDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-amber-400/80 text-sm mb-1">Time</p>
                              <p className="text-cream font-medium">{formData.time}</p>
                            </div>
                            <div>
                              <p className="text-amber-400/80 text-sm mb-1">Party Size</p>
                              <p className="text-cream font-medium">{formData.guests} guests</p>
                            </div>
                            <div>
                              <p className="text-amber-400/80 text-sm mb-1">Seating</p>
                              <p className="text-cream font-medium">
                                {seatingOptions.find(option => option.id === formData.seatingPreference)?.label}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-6">
                          <Button
                            onClick={onClose}
                            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black px-8 py-3 font-semibold rounded-full transition-colors"
                          >
                            Done
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Navigation buttons */}
              {!isSubmitted && (
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
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        <span>Next</span>
                        <ChevronRight size={20} />
                      </motion.button>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
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
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LuxuryReservationModal;
