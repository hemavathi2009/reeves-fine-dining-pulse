import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Mail, Lock, Eye, EyeOff, User, ChevronRight, Loader2, X } from 'lucide-react';
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
  }, [isSignUp, resetPassword]);

  // Validate form input
  const validateForm = () => {
    if (isSignUp && !name.trim()) {
      setError('Please enter your name');
      return false;
    }
    
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }

    if (!resetPassword && !password.trim()) {
      setError('Please enter your password');
      return false;
    }

    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  // Handle email/password sign in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    
    try {
      if (resetPassword) {
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
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
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
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
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form mode toggle
  const toggleFormMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  // Handle reset password mode
  const toggleResetPassword = () => {
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

  // Animated background particles
  const Particles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
    );
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient particles */}
      <Particles />
      
      {/* Decorative ambient gradients */}
      <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-amber-600/10 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-amber-600/10 rounded-full blur-3xl opacity-40" />
      
      <div className="container mx-auto flex items-center justify-center">
        <div className="w-full max-w-md relative z-10">
          {/* Logo section */}
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="text-center">
              <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 font-bold">
                Reeves Fine Dining
              </h1>
              <p className="text-cream/80 mt-2">
                {resetPassword ? 'Reset your password' : isSignUp ? 'Create your account' : 'Welcome back'}
              </p>
            </div>
          </motion.div>
          
          {/* Auth form card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-black/40 backdrop-blur-lg border border-amber-600/20 rounded-2xl p-8 shadow-xl overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {resetSent ? (
                <motion.div
                  key="resetSuccess"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-600/20 border border-amber-600/30 flex items-center justify-center mx-auto mb-6">
                    <Mail className="text-amber-400" size={28} />
                  </div>
                  
                  <h3 className="text-xl font-medium text-amber-400 mb-3">
                    Check Your Email
                  </h3>
                  
                  <p className="text-cream/80 mb-6">
                    We've sent a password reset link to:<br />
                    <span className="text-amber-300 font-medium">{email}</span>
                  </p>
                  
                  <Button
                    onClick={toggleResetPassword}
                    className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-5 rounded-lg font-semibold transition-colors w-full"
                  >
                    Return to Sign In
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key={`form-${isSignUp ? 'signup' : 'signin'}-${resetPassword ? 'reset' : 'normal'}`}
                  onSubmit={handleEmailSignIn}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Form title */}
                  <h2 className="text-2xl font-serif font-bold text-amber-400 mb-6">
                    {resetPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
                  </h2>
                  
                  {/* Name input (sign up only) */}
                  {isSignUp && (
                    <div className="space-y-1">
                      <label htmlFor="name" className="block text-sm font-medium text-cream">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User size={18} className="text-amber-400/70" />
                        </div>
                        <input
                          id="name"
                          ref={nameInputRef}
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full bg-black/30 border ${activeIndex === 0 ? 'border-amber-400' : 'border-amber-600/30'} 
                            text-cream pl-10 pr-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors
                          `}
                          placeholder="Your full name"
                          onFocus={() => setActiveIndex(0)}
                          onBlur={() => setActiveIndex(-1)}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Email input */}
                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-cream">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail size={18} className="text-amber-400/70" />
                      </div>
                      <input
                        id="email"
                        ref={emailInputRef}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full bg-black/30 border ${activeIndex === 1 ? 'border-amber-400' : 'border-amber-600/30'} 
                          text-cream pl-10 pr-4 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors
                        `}
                        placeholder="your@email.com"
                        onFocus={() => setActiveIndex(1)}
                        onBlur={() => setActiveIndex(-1)}
                      />
                    </div>
                  </div>
                  
                  {/* Password input (except for reset password mode) */}
                  {!resetPassword && (
                    <div className="space-y-1">
                      <label htmlFor="password" className="block text-sm font-medium text-cream">
                        Password {isSignUp && <span className="text-amber-400/60 text-xs font-normal">• min 6 characters</span>}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Lock size={18} className="text-amber-400/70" />
                        </div>
                        <input
                          id="password"
                          ref={passwordInputRef}
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full bg-black/30 border ${activeIndex === 2 ? 'border-amber-400' : 'border-amber-600/30'} 
                            text-cream pl-10 pr-12 py-3 rounded-lg focus:border-amber-400 focus:outline-none transition-colors
                          `}
                          placeholder="••••••••"
                          onFocus={() => setActiveIndex(2)}
                          onBlur={() => setActiveIndex(-1)}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center px-4 text-cream/60 hover:text-amber-400 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-900/30 border border-red-500/30 text-red-200 rounded-lg px-4 py-2 text-sm flex items-center gap-2"
                      >
                        <X size={16} />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Auth buttons */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={18} />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>{resetPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}</span>
                          <ChevronRight size={18} className="ml-2" />
                        </>
                      )}
                    </button>
                    
                    {!resetPassword && (
                      <>
                        <div className="flex items-center my-6">
                          <div className="flex-1 h-px bg-amber-600/20"></div>
                          <span className="px-3 text-cream/60 text-sm">or</span>
                          <div className="flex-1 h-px bg-amber-600/20"></div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isLoading}
                          className="w-full bg-black/30 border border-amber-600/30 hover:border-amber-400 text-cream px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center group"
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              className="text-blue-500"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              className="text-green-500"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              className="text-yellow-500"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              className="text-red-500"
                            />
                          </svg>
                          Continue with Google
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Toggle auth modes */}
                  <div className="text-center text-sm pt-3">
                    {resetPassword ? (
                      <button 
                        type="button" 
                        onClick={toggleResetPassword} 
                        className="text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Back to sign in
                      </button>
                    ) : (
                      <>
                        {!isSignUp && (
                          <button
                            type="button"
                            onClick={toggleResetPassword}
                            className="text-cream/70 hover:text-amber-400 transition-colors mb-2 block w-full"
                          >
                            Forgot your password?
                          </button>
                        )}
                        <span className="text-cream/70">
                          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                          {' '}
                          <button
                            type="button"
                            onClick={toggleFormMode}
                            className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
                          >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                          </button>
                        </span>
                      </>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
