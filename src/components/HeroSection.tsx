import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  videoSrc?: string;
  backgroundImageSrc?: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  scrollIndicator?: boolean;
}

const HeroSection = ({
  title,
  subtitle,
  videoSrc,
  backgroundImageSrc,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  scrollIndicator = true
}: HeroSectionProps) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle video load errors
  const handleVideoError = () => {
    console.error("Video failed to load");
    setVideoError(true);
  };

  // Handle video loaded successfully
  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  // Handle image load errors
  const handleImageError = () => {
    console.error("Background image failed to load");
    setImageError(true);
  };

  // Handle image loaded successfully
  const handleImageLoaded = () => {
    setImageLoaded(true);
  };

  // Fallback background image
  const fallbackImage = "/images/fallback-hero-bg.jpg";

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-black/50 z-5"></div>
        
        {/* Brighter premium restaurant image */}
        <img 
          src="https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&sat=1.2" 
          alt={title}
          className="object-cover h-full w-full brightness-110 contrast-105"
          loading="eager"
        />
        
        {/* If video is available and loads successfully, it will play on top of the image */}
        {videoSrc && !videoError && (
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="object-cover h-full w-full"
            onError={handleVideoError}
            onLoadedData={handleVideoLoaded}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
      </div>
      
      {/* Hero Content */}
      <motion.div 
        className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-serif font-bold text-amber-400 mb-6">
            {title}
          </h1>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "180px" }}
            transition={{ delay: 0.6, duration: 1 }}
            className="h-0.5 bg-amber-400 mx-auto mb-8"
          />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-2xl text-cream/90 font-light max-w-2xl mx-auto mb-12"
          >
            {subtitle}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <Button 
              size="lg" 
              className="bg-amber-600 hover:bg-amber-700 text-black font-bold px-8 py-6 text-lg"
              asChild
            >
              <Link to={primaryButtonLink}>
                {primaryButtonText}
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-bold px-8 py-6 text-lg"
              asChild
            >
              <Link to={secondaryButtonLink}>
                {secondaryButtonText}
              </Link>
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        {scrollIndicator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-amber-400"
            >
              <ChevronDown size={36} />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default HeroSection;
