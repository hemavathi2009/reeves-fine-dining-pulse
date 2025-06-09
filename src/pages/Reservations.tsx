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
import SeatingGallery from '@/components/reservation/SeatingGallery';

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
    { 
      id: 'window', 
      label: 'Window View', 
      icon: <MapPin size={18} />,
      description: 'Enjoy panoramic views of the city while dining',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80'
    },
    { 
      id: 'private', 
      label: 'Private Room', 
      icon: <Users size={18} />,
      description: 'Intimate space for gatherings and special moments',
      image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80'
    },
    { 
      id: 'bar', 
      label: 'Chef\'s Bar', 
      icon: <User size={18} />,
      description: 'Watch our chefs create culinary masterpieces',
      image: 'https://images.unsplash.com/photo-1581349485608-9469926a8e5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80'
    },
    { 
      id: 'outdoor', 
      label: 'Outdoor Patio', 
      icon: <MoonStar size={18} />,
      description: 'Al fresco dining under the stars',
      image: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80'
    },
  ];
  
  // Occasion options
  const occasionOptions = [
    "Birthday", "Anniversary", "Date Night", "Business Dinner", "Special Celebration", "None"
  ];
  
  // Add the gallery images array for the seating gallery component
  const seatingGalleryImages = [
    {
      id: 'window',
      src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80',
      label: 'Window View',
      description: 'Enjoy breathtaking views of the city skyline while you dine in our premium window seating, perfect for romantic evenings or special occasions.'
    },
    {
      id: 'private',
      src: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80',
      label: 'Private Room',
      description: 'Our elegant private dining rooms offer an intimate atmosphere for groups of 6-12 guests, complete with dedicated wait staff and customized menus.'
    },
    {
      id: 'bar',
      src: 'https://images.unsplash.com/photo-1581349485608-9469926a8e5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80',
      label: 'Chef\'s Bar',
      description: 'Experience culinary artistry up close at our Chef\'s Bar. Watch our master chefs prepare your dishes and engage in conversation about the cuisine.'
    },
    {
      id: 'outdoor',
      src: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80',
      label: 'Outdoor Patio',
      description: 'Dine under the stars in our lush outdoor patio, featuring ambient lighting, gentle heaters for cooler evenings, and a sophisticated garden atmosphere.'
    }
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
          resize: true
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
  
  // Check if date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Get current month days
  const getCurrentMonthDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Date[] = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
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

  // Reset reservation form to initial state
  const resetReservation = () => {
    setIsSubmitted(false);
    setCurrentStep(1);
    setProgress(25);
    setSelectedDate(null);
    setHoveredTime(null);
    setSelectedSeating(null);
    setAnimateError(false);
    setReservationDetails(null);
    reset(); // Reset the form data using react-hook-form's reset function
  };

  // Calendar states
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Navigate months
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Get days for current month view
  const daysInMonth = getCurrentMonthDays(currentYear, currentMonth);
  
  // Get day names for header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get month name
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  // Add an ambiance images component with professionally styled images
  const AmbianceImages = () => {
    return (
      <div className="hidden md:block absolute inset-0 -z-10 opacity-15">
        <div className="absolute top-0 right-0 w-1/3 h-1/2">
          <img 
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80" 
            alt="Ambiance" 
            className="w-full h-full object-cover rounded-bl-3xl"
          />
        </div>
        <div className="absolute top-1/3 left-0 w-1/4 h-1/2">
          <img 
            src="https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80" 
            alt="Ambiance" 
            className="w-full h-full object-cover rounded-tr-3xl"
          />
        </div>
        <div className="absolute bottom-0 right-1/4 w-1/4 h-1/3">
          <img 
            src="https://images.unsplash.com/photo-1578474846511-04ba529f0b88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80" 
            alt="Ambiance" 
            className="w-full h-full object-cover rounded-tl-3xl"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-charcoal pt-20 overflow-x-hidden">
      <AmbianceImages />
      
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
      
      {/* Hero Section with Professional Restaurant Image */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80"
            alt="Fine dining table setting"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-charcoal/70 to-charcoal"></div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center px-6 max-w-4xl"
          >
            <h1 className="text-6xl md:text-7xl font-serif font-bold text-amber-400 mb-6">
              Reserve Your Table
            </h1>
            <div className="w-32 h-0.5 bg-amber-400/70 mx-auto mb-6"></div>
            <p className="text-xl text-cream/90 max-w-3xl mx-auto leading-relaxed">
              Secure your place for an unforgettable culinary journey.
              Let us prepare the perfect setting for your dining experience.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 relative">
        <Particles />
        
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
            <Progress 
              value={progress} 
              className="h-2 bg-amber-900/30" 
            />
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
                
                {/* Add an elegant background image for the confirmation page */}
                <div className="absolute inset-0 -z-10 opacity-20">
                  <img
                    src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Fine dining celebration"
                    className="w-full h-full object-cover"
                  />
                </div>
                
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
                      onClick={resetReservation}
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
                          
                          <div className="bg-gradient-to-br from-black/70 to-black/40 border border-amber-600/30 rounded-xl p-6 shadow-inner">
                            <div className="flex justify-between items-center mb-6">
                              <button 
                                type="button" 
                                onClick={prevMonth}
                                className="p-2 rounded-full hover:bg-amber-600/20 text-amber-400 transition-colors duration-200"
                              >
                                <ChevronLeft size={24} />
                              </button>
                              <h3 className="text-2xl font-serif font-medium text-amber-300">
                                {monthName} {currentYear}
                              </h3>
                              <button 
                                type="button" 
                                onClick={nextMonth}
                                className="p-2 rounded-full hover:bg-amber-600/20 text-amber-400 transition-colors duration-200"
                              >
                                <ChevronRight size={24} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {dayNames.map(day => (
                                <div 
                                  key={day} 
                                  className="text-amber-400/90 text-center text-sm font-medium py-2"
                                >
                                  {day}
                                </div>
                              ))}
                            </div>
                            
                            <div className="grid grid-cols-7 gap-2">
                              {/* Empty spaces for days before start of month */}
                              {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-12"></div>
                              ))}
                              
                              {daysInMonth.map(date => {
                                const isDisabled = isPastDate(date);
                                const isToday = isSameDay(date, new Date());
                                const isSelected = isDateSelected(date);
                                
                                return (
                                  <motion.button
                                    key={date.getTime()}
                                    type="button"
                                    disabled={isDisabled}
                                    whileHover={!isDisabled ? { scale: 1.1, y: -3 } : {}}
                                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                    onClick={() => !isDisabled && handleDateSelect(date)}
                                    className={`h-12 w-12 mx-auto rounded-full flex items-center justify-center transition-all duration-200 relative ${
                                      isSelected
                                        ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-black font-bold shadow-lg shadow-amber-700/30'
                                        : isDisabled
                                        ? 'bg-black/20 text-gray-600 cursor-not-allowed opacity-40'
                                        : isToday
                                        ? 'border border-amber-400 text-amber-300 hover:bg-amber-600/30'
                                        : 'hover:bg-amber-600/20 text-cream hover:text-amber-200'
                                    }`}
                                  >
                                    {date.getDate()}
                                    {isToday && !isSelected && (
                                      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full"></span>
                                    )}
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
                          <h2 className="text-2xl font-serif font-bold text-amber-400 mb-4 flex items-center gap-2">
                            <span className="bg-amber-400 text-black w-8 h-8 rounded-full flex items-center justify-center font-mono">2</span>
                            Choose Your Perfect Setting
                          </h2>
                          
                          {/* Add the SeatingGallery component */}
                          <SeatingGallery 
                            images={seatingGalleryImages}
                            onSelect={handleSeatingSelect}
                            selectedId={selectedSeating}
                          />
                          
                          {/* Keep the existing seating options grid as alternative selection UI */}
                          <h3 className="text-xl font-serif font-medium text-amber-400 mt-8 mb-4">All Seating Options</h3>
                          
                          <div className="grid md:grid-cols-4 gap-4">
                            {seatingOptions.map((option) => (
                              <motion.div
                                key={option.id}
                                whileHover={{ y: -5, backgroundColor: 'rgba(217, 119, 6, 0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSeatingSelect(option.id)}
                                className={`cursor-pointer rounded-xl flex flex-col md:flex-row md:h-36 transition-all relative overflow-hidden
                                  ${selectedSeating === option.id 
                                    ? 'bg-gradient-to-br from-amber-700/50 to-amber-900/50 border-2 border-amber-500 shadow-lg shadow-amber-700/20'
                                    : 'bg-black/20 border border-amber-600/20'
                                  }
                                `}
                              >
                                {/* Image container */}
                                <div className="relative w-full md:w-1/2 h-32 md:h-full overflow-hidden">
                                  <img 
                                    src={option.image} 
                                    alt={option.label} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
                                  <div className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center
                                    ${selectedSeating === option.id
                                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black'
                                      : 'bg-black/60 text-amber-400'
                                    }
                                  `}>
                                    {option.icon}
                                  </div>
                                </div>
                                
                                {/* Content */}
                                <div className="p-5 flex flex-col justify-center flex-1">
                                  <h3 className="text-xl font-semibold text-amber-400 mb-1">
                                    {option.label}
                                  </h3>
                                  <p className="text-cream/80 text-sm">
                                    {option.description}
                                  </p>
                                </div>
                                
                                {/* Selection indicator */}
                                {selectedSeating === option.id && (
                                  <motion.div
                                    layoutId="seating-selection"
                                    className="absolute inset-0 rounded-xl border-2 border-amber-400 z-10"
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
                          {errors.seatingPreference && (
                            <p className="text-red-400 text-sm mt-1 animate-pulse">{errors.seatingPreference.message}</p>
                          )}
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
