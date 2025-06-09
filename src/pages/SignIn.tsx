import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Mail, Lock, Eye, EyeOff, User, ChevronRight, Loader2, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SignIn = () => {
  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Animation controls
  const [activeIndex, setActiveIndex] = useState(0);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const audioFeedbackRef = useRef<HTMLAudioElement>(null);
  
  // Navigation
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-focus the first input field
    if (resetPassword) {
      emailInputRef.current?.focus();
    } else if (isSignUp) {
      nameInputRef.current?.focus();
    } else {
      emailInputRef.current?.focus();
    }

    // Optional: Play background video with reduced opacity
    if (backgroundVideoRef.current) {
      backgroundVideoRef.current.play().catch(err => console.log('Video autoplay prevented:', err));
    }
  }, [isSignUp, resetPassword]);

  // Play subtle audio feedback for interactions
  const playFeedback = (type: 'success' | 'error' | 'click' = 'click') => {
    if (audioFeedbackRef.current) {
      audioFeedbackRef.current.currentTime = 0;
      audioFeedbackRef.current.volume = type === 'error' ? 0.2 : 0.1;
      audioFeedbackRef.current.play().catch(err => console.log('Audio feedback prevented:', err));
    }
  };

  // Validate form input
  const validateForm = () => {
    if (isSignUp && !name.trim()) {
      setError('Please enter your name');
      playFeedback('error');
      return false;
    }
    
    if (!email.trim()) {
      setError('Please enter your email');
      playFeedback('error');
      return false;
    }

    if (!resetPassword && !password.trim()) {
      setError('Please enter your password');
      playFeedback('error');
      return false;
    }

    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters');
      playFeedback('error');
      return false;
    }

    return true;
  };

  // Handle email/password sign in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    playFeedback('click');
    setIsLoading(true);
    setError('');
    
    try {
      if (resetPassword) {
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
        playFeedback('success');
      } else if (isSignUp) {
        // Create new account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name,
          email,
          createdAt: serverTimestamp(),
          profileImage: null
        });
        
        playFeedback('success');
        // Navigate to dashboard
        navigate('/user-dashboard');
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
        playFeedback('success');
        navigate('/user-dashboard');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      playFeedback('error');
      
      // Display user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to authenticate. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    playFeedback('click');
    setIsLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if the user already exists in Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user profile
        await setDoc(userRef, {
          name: userCredential.user.displayName,
          email: userCredential.user.email,
          profileImage: userCredential.user.photoURL,
          createdAt: serverTimestamp()
        });
      }
      
      playFeedback('success');
      // Navigate to dashboard
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Google sign in error:', error);
      playFeedback('error');
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form mode toggle
  const toggleFormMode = () => {
    playFeedback();
    setIsSignUp(!isSignUp);
    setError('');
  };

  // Handle reset password mode
  const toggleResetPassword = () => {
    playFeedback();
    setResetPassword(!resetPassword);
    setResetSent(false);
    setError('');
  };

  // Form section variants for animations
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Hidden audio for feedback */}
      <audio ref={audioFeedbackRef} src="/sounds/soft-click.mp3" />
      
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        {/* Premium video background */}
        <video 
          ref={backgroundVideoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 object-cover w-full h-full opacity-30"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-serving-wine-in-a-glass-27790-large.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-charcoal/90 to-black z-0"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 50 }).map((_, index) => (
            <motion.div
              key={index}
              className="absolute w-1 h-1 md:w-2 md:h-2 rounded-full bg-amber-400/20"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%', 
                scale: Math.random() * 0.5 + 0.5,
                opacity: Math.random() * 0.5 
              }}
              animate={{ 
                y: [null, Math.random() * -30 - 10], 
                opacity: [null, 0] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: Math.random() * 10 + 10,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Animated SVG wave */}
      <div className="absolute bottom-0 left-0 right-0 z-0 opacity-30">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <motion.path
            fill="#d97706"
            fillOpacity="0.5"
            d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,176C672,181,768,139,864,128C960,117,1056,139,1152,165.3C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            animate={{ 
              d: [
                "M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,176C672,181,768,139,864,128C960,117,1056,139,1152,165.3C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,165.3C672,160,768,128,864,122.7C960,117,1056,139,1152,176C1248,213,1344,267,1392,293.3L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ],
              transition: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 8,
                ease: "easeInOut"
              }
            }}
          />
        </svg>
      </div>

      {/* Form area */}
      <div className="relative z-10 max-w-md w-full">
        {/* Logo/branding with animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block">
            <h2 className="text-4xl md:text-5xl font-serif text-amber-400">Reeves</h2>
            <div className="w-32 h-1 mt-2 rounded-full bg-gradient-to-r from-amber-600 to-amber-400 mx-auto" />
            <p className="mt-2 text-cream/80 text-sm">Fine Dining Experience</p>
          </Link>
        </motion.div>

        {/* Glassmorphism card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-md bg-black/40 border border-amber-600/30 p-8 rounded-2xl shadow-2xl overflow-hidden"
          whileHover={{ boxShadow: "0 0 25px 2px rgba(217, 119, 6, 0.2)" }}
        >
          {/* Glowing border effect */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-amber-600/10 via-amber-400/20 to-amber-600/10 blur-xl"></div>
          </div>

          <AnimatePresence mode="wait">
            {resetPassword ? (
              <motion.div
                key="resetPassword"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative"
              >
                <button 
                  onClick={toggleResetPassword} 
                  className="absolute -top-2 -left-2 text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>

                <h3 className="text-2xl font-serif font-bold text-center text-amber-400 mb-6">Reset Password</h3>
                
                {resetSent ? (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10 }}
                      className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Mail size={32} className="text-amber-400" />
                    </motion.div>
                    
                    <p className="text-cream mb-6">
                      If an account exists with this email, we've sent password reset instructions.
                    </p>
                    
                    <Button 
                      onClick={toggleResetPassword}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black border-none"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSignIn}>
                    <div className="mb-6 relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-amber-400/70">
                        <Mail size={18} />
                      </div>
                      <input
                        ref={emailInputRef}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="floating-input w-full bg-black/60 border border-amber-600/30 text-cream pl-10 pr-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mb-6"
                      >
                        {error}
                      </motion.div>
                    )}
                    
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black border-none h-12 font-medium"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <span>Send Reset Link</span>
                          <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={isSignUp ? "signup" : "signin"}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h3 className="text-2xl font-serif font-bold text-center text-amber-400 mb-6">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h3>
                
                <form onSubmit={handleEmailSignIn}>
                  {/* Name input - only for signup */}
                  {isSignUp && (
                    <div className="mb-5 relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-amber-400/70 transition-all group-focus-within:text-amber-400">
                        <User size={18} />
                      </div>
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="floating-input form-input-hover w-full bg-black/60 border border-amber-600/30 text-cream pl-10 pr-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-all"
                      />
                    </div>
                  )}
                  
                  {/* Email input */}
                  <div className="mb-5 relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-amber-400/70 transition-all group-focus-within:text-amber-400">
                      <Mail size={18} />
                    </div>
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="floating-input form-input-hover w-full bg-black/60 border border-amber-600/30 text-cream pl-10 pr-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-all"
                      required
                    />
                  </div>
                  
                  {/* Password input */}
                  <div className="mb-2 relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-amber-400/70 transition-all group-focus-within:text-amber-400">
                      <Lock size={18} />
                    </div>
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="floating-input form-input-hover w-full bg-black/60 border border-amber-600/30 text-cream pl-10 pr-10 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        playFeedback();
                        setShowPassword(!showPassword);
                      }}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-amber-400/70 hover:text-amber-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Forgot password link */}
                  {!isSignUp && (
                    <div className="mb-6 text-right">
                      <button
                        type="button"
                        onClick={toggleResetPassword}
                        className="text-amber-400 hover:text-amber-300 text-sm transition-colors focus:outline-none"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                  
                  {/* Error message */}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-900/20 border border-red-400/30 rounded px-3 py-2 text-red-400 text-sm mb-6 flex items-center"
                    >
                      <X size={14} className="mr-2 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  
                  {/* Submit button with magnetic hover effect */}
                  <motion.div 
                    className="mb-6 group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black border-none h-12 font-medium group-hover:shadow-lg group-hover:shadow-amber-600/20 transition-all"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          {isSignUp ? 'Creating Account...' : 'Signing In...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                          <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                  
                  {/* Google Sign In */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-amber-600/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-black/40 text-cream/70">Or continue with</span>
                    </div>
                  </div>
                  
                  <motion.button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-black/60 border border-amber-600/30 text-cream py-3 px-4 rounded-lg hover:bg-amber-600/10 hover:border-amber-500/50 transition-colors"
                    whileHover={{ y: -2, boxShadow: "0 5px 15px -3px rgba(217, 119, 6, 0.2)" }}
                    whileTap={{ y: 0 }}
                  >
                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                    </svg>
                    <span>{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
                  </motion.button>
                </form>
                
                {/* Toggle between signin/signup */}
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={toggleFormMode}
                    className="text-amber-400 hover:text-amber-300 text-sm transition-colors focus:outline-none"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
