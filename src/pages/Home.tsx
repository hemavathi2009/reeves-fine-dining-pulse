import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Star, Award, Clock, Utensils, ArrowRight,
  Coffee, Wine, Calendar, Bookmark, ChefHat, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeroSection from '@/components/HeroSection';

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.25], [0, 100]);
  const [activeFeature, setActiveFeature] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<number, boolean>>({});

  // Auto-rotate featured items
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  
  // Simulate page loading
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 800);
  }, []);

  // Image error handling function
  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => ({...prev, [index]: true}));
    console.error(`Failed to load image for feature ${index}`);
  };

  // Optimize the feature cards by using CSS backgrounds instead of image loading
  const features = [
    {
      icon: ChefHat,
      title: "Michelin Excellence",
      description: "Recognized for culinary innovation and exceptional service since 2018",
      color: "from-amber-500 to-yellow-600",
      bgColor: "bg-amber-950/80", // Fallback color instead of image
    },
    {
      icon: Coffee,
      title: "Artisan Cuisine",
      description: "Each dish is meticulously crafted using the finest seasonal ingredients",
      color: "from-amber-600 to-orange-600",
      bgColor: "bg-amber-900/80", // Fallback color instead of image
    },
    {
      icon: Wine,
      title: "Curated Experience",
      description: "Personalized dining journey with wine pairings from our master sommelier",
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-amber-800/80", // Fallback color instead of image
    }
  ];

  const testimonials = [
    {
      text: "An absolutely transcendent dining experience. Every course was a masterpiece of flavor and presentation.",
      author: "Sarah Mitchell",
      position: "Food Critic, Gourmet Magazine",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      text: "The attention to detail and service quality is unmatched. The chef's tasting menu with wine pairings was revelatory.",
      author: "Michael Chen",
      position: "Executive Chef, Azure Restaurant",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    },
    {
      text: "Chef Reeves has created something magical here. A sensory journey that balances innovation with deep respect for tradition.",
      author: "Isabella Rodriguez",
      position: "Culinary Institute Director",
      rating: 5,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    }
  ];

  // Page loading animation
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-charcoal flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-6xl font-serif font-bold text-amber-400 mb-4"
          >
            Reeves
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 180 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-0.5 bg-amber-400 mx-auto"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section with updated image */}
      <HeroSection 
        title="Reeves"
        subtitle="A culinary journey that transcends dining into an art form"
        primaryButtonText="Reserve a Table"
        primaryButtonLink="/reservations"
        secondaryButtonText="Explore Menu"
        secondaryButtonLink="/menu"
        scrollIndicator={true}
      />
      
      {/* Signature Experiences Section with background image */}
      <section className="py-24 relative overflow-hidden z-10 bg-gradient-to-b from-black to-charcoal">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-amber-400 mb-6">
              Signature Experiences
            </h2>
            <div className="w-24 h-0.5 bg-amber-400/50 mx-auto mb-6"></div>
            <p className="text-xl text-cream/80 max-w-3xl mx-auto">
              Discover what makes Reeves a destination for discerning diners worldwide
            </p>
          </motion.div>
          
          {/* Feature Cards - Improved styling with subtle animations */}
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.3 } }}
                className="relative overflow-hidden rounded-xl transition-all duration-500 group"
              >
                {/* Card with gradient overlay */}
                <div className={`absolute inset-0 ${feature.bgColor} opacity-80 group-hover:opacity-90 transition-opacity duration-500`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                
                {/* Content */}
                <div className="relative z-10 p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br ${feature.color} transition-transform duration-500 group-hover:scale-110`}>
                    <feature.icon className="text-black" size={30} />
                  </div>
                  
                  <h3 className="text-2xl font-serif font-bold text-amber-400 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-cream leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  <motion.div 
                    className="flex items-center gap-2 text-amber-400 text-sm font-medium"
                    whileHover={{ x: 5 }}
                  >
                    <span>Learn More</span>
                    <ArrowRight size={16} />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* About/Legacy Section */}
      <section className="py-24 bg-black/30 relative overflow-hidden z-10">
        <div className="absolute inset-0 -z-10 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <radialGradient id="amber-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="20" cy="20" r="25" fill="url(#amber-gradient)" />
            <circle cx="80" cy="80" r="35" fill="url(#amber-gradient)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative z-10 overflow-hidden rounded-xl border-2 border-amber-600/30">
                <motion.img 
                  src="https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Restaurant interior"
                  className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-1000 brightness-110"
                  whileHover={{ scale: 1.05 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              
              <div className="absolute -top-8 -left-8 w-64 h-64 border border-amber-600/20 rounded-full -z-10"></div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 border border-amber-600/20 rounded-full -z-10"></div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <Badge className="bg-amber-600/20 text-amber-400 border-amber-400/30 px-4 py-1.5 text-sm rounded-full mb-2">
                Our Legacy
              </Badge>
              
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-amber-400">
                Crafting Memories Since 2018
              </h2>
              
              <div className="w-20 h-0.5 bg-amber-600/50"></div>
              
              <p className="text-cream text-lg leading-relaxed">
                For over five years, Reeves has been a beacon of culinary excellence, 
                crafting unforgettable experiences through innovative cuisine and impeccable service.
              </p>
              
              <p className="text-cream/80 leading-relaxed">
                Our award-winning chefs source the finest ingredients to create dishes that 
                celebrate both tradition and creativity, ensuring every meal is a masterpiece that 
                engages all your senses.
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div>
                  <div className="text-4xl font-serif font-bold text-amber-400 mb-2">
                    5+
                  </div>
                  <div className="text-cream font-medium">
                    Years of Excellence
                  </div>
                </div>
                
                <div>
                  <div className="text-4xl font-serif font-bold text-amber-400 mb-2">
                    12
                  </div>
                  <div className="text-cream font-medium">
                    International Awards
                  </div>
                </div>
                
                <div>
                  <div className="text-4xl font-serif font-bold text-amber-400 mb-2">
                    8
                  </div>
                  <div className="text-cream font-medium">
                    Master Chefs
                  </div>
                </div>
                
                <div>
                  <div className="text-4xl font-serif font-bold text-amber-400 mb-2">
                    200+
                  </div>
                  <div className="text-cream font-medium">
                    Unique Dishes
                  </div>
                </div>
              </div>
              
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-black font-bold px-8 py-6 text-lg mt-8"
                asChild
              >
                <Link to="/about">
                  Our Story <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-24 bg-black/30 relative overflow-hidden z-10">
        <div className="absolute inset-0 -z-10 opacity-30">
          <svg className="w-full h-full opacity-50">
            <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="rgba(217, 119, 6, 0.5)" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="bg-amber-600/20 text-amber-400 border-amber-400/30 px-4 py-1.5 text-sm rounded-full mb-2">
              Guest Experiences
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-amber-400 mb-6">
              What Our Guests Say
            </h2>
            
            <div className="w-24 h-0.5 bg-amber-400/50 mx-auto mb-6"></div>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-black/50 backdrop-blur-sm border border-amber-600/20 hover:border-amber-500/30 transition-all duration-300 rounded-xl p-8 relative"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author}
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="flex justify-center mb-6 pt-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-amber-400 fill-current" size={18} />
                  ))}
                </div>
                
                <p className="text-cream text-center italic mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="text-center">
                  <p className="text-amber-400 font-semibold">
                    {testimonial.author}
                  </p>
                  <p className="text-cream/60 text-sm">
                    {testimonial.position}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden z-10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          <img
            src="https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Restaurant atmosphere"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge className="bg-amber-600/20 text-amber-400 border-amber-400/30 px-4 py-1.5 text-sm rounded-full mb-6">
              Reserve Your Experience
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-amber-400 mb-8">
              A Table Awaits
            </h2>
            
            <p className="text-xl text-cream mb-12 leading-relaxed">
              Join us for an evening of culinary excellence in an atmosphere of refined elegance. 
              Reserve your table today and embark on a gastronomic journey like no other.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-black font-bold px-8 py-6 text-lg group"
                asChild
              >
                <Link to="/reservations" className="flex items-center">
                  <Calendar className="mr-2 group-hover:mr-3 transition-all" size={20} />
                  Book Your Table
                </Link>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-bold px-8 py-6 text-lg group"
                asChild
              >
                <Link to="/contact" className="flex items-center">
                  <Users className="mr-2 group-hover:mr-3 transition-all" size={20} />
                  Private Events
                </Link>
              </Button>
            </div>
            
            <div className="flex justify-center items-center gap-6">
              <div className="text-cream">
                <div className="font-medium">Opening Hours:</div>
                <div className="text-cream/70 text-sm">Tue-Sun 5PM - 11PM</div>
              </div>
              
              <div className="h-8 w-px bg-amber-600/30"></div>
              
              <div className="text-cream">
                <div className="font-medium">Phone:</div>
                <div className="text-cream/70 text-sm">+1 (555) 123-4567</div>
              </div>
              
              <div className="h-8 w-px bg-amber-600/30"></div>
              
              <div className="text-cream">
                <div className="font-medium">Location:</div>
                <div className="text-cream/70 text-sm">123 Gourmet St, New York</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
