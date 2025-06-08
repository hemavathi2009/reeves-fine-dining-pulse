import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Award, Clock, Users, Heart, ChevronRight, ChevronLeft, 
  Volume2, VolumeX, Calendar, ArrowRight
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// Timeline interface
interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
}

// TeamMember interface
interface TeamMember {
  id: string;
  name: string;
  position: string;
  image: string;
  bio: string;
  featured?: boolean;
}

// Value interface
interface Value {
  id: string;
  icon: string; // Allow any string
  title: string;
  description: string;
}

// Icon mapping
const IconMap = {
  Award,
  Clock,
  Users,
  Heart,
  // Add more icons as needed
};

const About = () => {
  // State for data from Firestore
  const [achievements, setAchievements] = useState<Value[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [values, setValues] = useState<Value[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for interactive elements
  const [activeTimelineIndex, setActiveTimelineIndex] = useState(0);
  const [showBio, setShowBio] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'values' | 'vision'>('values');
  
  // Refs for elements
  const audioRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  // Fallback data if Firestore is empty or fails
  const fallbackAchievements = [
    {
      id: "1",
      icon: "Award",
      title: "Michelin Starred",
      description: "Recognized for culinary excellence since 2018"
    },
    {
      id: "2",
      icon: "Clock",
      title: "20+ Years",
      description: "Two decades of refined dining experiences"
    },
    {
      id: "3",
      icon: "Users",
      title: "Master Chefs",
      description: "Award-winning culinary team"
    },
    {
      id: "4",
      icon: "Heart",
      title: "Passion Driven",
      description: "Committed to perfection in every detail"
    }
  ];

  const fallbackTeam = [
    {
      id: "1",
      name: "Chef Marcus Reeves",
      position: "Executive Chef & Owner",
      image: "https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg?auto=compress&cs=tinysrgb&w=600",
      bio: "With over 25 years of culinary expertise, Chef Reeves brings innovative techniques to classic fine dining.",
      featured: true
    },
    {
      id: "2",
      name: "Isabella Rodriguez",
      position: "Head Sommelier",
      image: "https://images.pexels.com/photos/7845249/pexels-photo-7845249.jpeg?auto=compress&cs=tinysrgb&w=600",
      bio: "Master sommelier with an exceptional ability to pair wines with our seasonal menu offerings."
    },
    {
      id: "3",
      name: "James Chen",
      position: "Pastry Chef",
      image: "https://images.pexels.com/photos/8477076/pexels-photo-8477076.jpeg?auto=compress&cs=tinysrgb&w=600",
      bio: "Award-winning pastry chef known for creating edible works of art that perfectly conclude our dining experience."
    },
    {
      id: "4",
      name: "Elena Kostova",
      position: "Restaurant Manager",
      image: "https://images.pexels.com/photos/5329244/pexels-photo-5329244.jpeg?auto=compress&cs=tinysrgb&w=600",
      bio: "With meticulous attention to detail and warm hospitality, Elena creates memorable dining experiences for every guest."
    }
  ];

  const fallbackTimeline = [
    {
      id: "1",
      year: "2001",
      title: "The Beginning",
      description: "Chef Marcus Reeves opens the doors to what would become one of the most celebrated dining establishments.",
      image: "https://images.pexels.com/photos/2290753/pexels-photo-2290753.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: "2",
      year: "2007",
      title: "First Accolade",
      description: "Reeves receives its first major culinary award, establishing its place in the fine dining scene.",
      image: "https://images.pexels.com/photos/3658382/pexels-photo-3658382.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: "3",
      year: "2012",
      title: "Expansion",
      description: "The restaurant expands, adding our renowned wine cellar and private dining rooms.",
      image: "https://images.pexels.com/photos/3201763/pexels-photo-3201763.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: "4",
      year: "2018",
      title: "Michelin Star",
      description: "Reeves is awarded its first Michelin star, a testament to our relentless pursuit of excellence.",
      image: "https://images.pexels.com/photos/6544899/pexels-photo-6544899.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: "5",
      year: "Today",
      title: "Continued Innovation",
      description: "We continue to innovate while honoring our legacy, creating exceptional dining experiences for our guests.",
      image: "https://images.pexels.com/photos/4253320/pexels-photo-4253320.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  const fallbackValues = [
    {
      id: "1",
      icon: "Heart",
      title: "Passion",
      description: "Pouring heart and soul into every dish we create."
    },
    {
      id: "2",
      icon: "Award",
      title: "Excellence",
      description: "Maintaining the highest standards in cuisine and service."
    },
    {
      id: "3",
      icon: "Users",
      title: "Community",
      description: "Building relationships with our guests and local producers."
    },
    {
      id: "4",
      icon: "Clock",
      title: "Tradition",
      description: "Honoring culinary heritage while embracing innovation."
    }
  ];

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch achievements
        const achievementsSnapshot = await getDocs(collection(db, 'achievements'));
        const achievementsData = achievementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Value[];
        
        // Fetch team members
        const teamSnapshot = await getDocs(collection(db, 'team'));
        const teamData = teamSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamMember[];
        
        // Fetch timeline
        const timelineSnapshot = await getDocs(collection(db, 'timeline'));
        const timelineData = timelineSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TimelineEvent[];
        
        // Fetch values
        const valuesSnapshot = await getDocs(collection(db, 'values'));
        const valuesData = valuesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Value[];
        
        // Set data or fallbacks if empty
        setAchievements(achievementsData.length ? achievementsData : fallbackAchievements);
        setTeam(teamData.length ? teamData : fallbackTeam);
        setTimeline(timelineData.length ? timelineData : fallbackTimeline);
        setValues(valuesData.length ? valuesData : fallbackValues);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Use fallback data on error
        setAchievements(fallbackAchievements);
        setTeam(fallbackTeam);
        setTimeline(fallbackTimeline);
        setValues(fallbackValues);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Toggle audio
  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  // Navigate timeline
  const navigateTimeline = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setActiveTimelineIndex(prev => 
        prev < timeline.length - 1 ? prev + 1 : prev
      );
    } else {
      setActiveTimelineIndex(prev => 
        prev > 0 ? prev - 1 : prev
      );
    }
    
    // Scroll timeline into view if needed
    if (timelineRef.current) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      };
      timelineRef.current.children[activeTimelineIndex].scrollIntoView(scrollOptions);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Optional ambient audio */}
      <audio 
        ref={audioRef} 
        src="/audio/ambient-restaurant.mp3" 
        loop 
      />
      
      <button 
        onClick={toggleAudio}
        className="fixed bottom-6 right-6 z-50 bg-black/60 backdrop-blur-sm p-3 rounded-full border border-amber-600/40 hover:border-amber-400 transition-all duration-300"
        aria-label={audioPlaying ? "Mute background music" : "Play background music"}
      >
        {audioPlaying ? (
          <Volume2 size={18} className="text-amber-400" />
        ) : (
          <VolumeX size={18} className="text-amber-400/70" />
        )}
      </button>
      
      {/* Sticky call-to-action */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 opacity-0 md:opacity-100">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-black font-bold px-6 py-2 rounded-full shadow-xl group"
            asChild
          >
            <Link to="/reservations" className="flex items-center gap-2">
              <Calendar size={16} className="group-hover:mr-1 transition-all" />
              Reserve a Table
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
      
      {/* Hero Section with Parallax */}
      <section ref={parallaxRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div 
          style={{ y }}
          className="absolute inset-0 z-0 bg-fixed"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] z-10"></div>
          <img
            src="https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1920&dpr=1"
            alt="Restaurant interior"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        </motion.div>
        
        {/* Hero Content with Fade Effect */}
        <motion.div
          style={{ opacity }}
          className="relative z-10 text-center max-w-4xl px-6 mt-32"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-10"
          >
            <h1 className="font-serif font-bold mb-6 text-center">
              <span className="block text-sm uppercase tracking-widest text-amber-400/80 mb-4">Est. 2001</span>
              <span className="block text-7xl md:text-8xl text-amber-400 leading-tight">Our Story</span>
            </h1>
            
            <div className="w-24 h-0.5 bg-amber-600/70 mx-auto my-8"></div>
            
            <p className="text-2xl font-serif text-cream/90 leading-relaxed max-w-3xl mx-auto italic">
              "A legacy of culinary excellence, where tradition meets innovation 
              in every carefully crafted dish."
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-full text-center"
          >
            <p className="text-cream/80 font-serif text-lg mb-8">Scroll to discover our journey</p>
            <div className="w-0.5 h-16 bg-gradient-to-b from-amber-500 to-transparent mx-auto"></div>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Founder's Story Section with Video Background */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-10"></div>
          {/* Optional: Background video */}
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="object-cover h-full w-full opacity-30"
          >
            <source src="https://res.cloudinary.com/demo/video/upload/v1611657751/restaurant-ambience_ftqxtu.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-5 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-3 relative"
            >
              <h2 className="text-6xl font-serif font-bold text-amber-400 mb-10 leading-tight">
                The Vision <br/>
                <span className="text-cream/80 text-5xl">Behind Reeves</span>
              </h2>
              
              <div className="border-l-2 border-amber-500/40 pl-8 py-2 mb-8">
                <p className="text-cream text-xl leading-relaxed mb-6 font-serif">
                  Founded in 2001, Reeves Dining began as a dream to create more than just a restaurant—
                  we envisioned a sanctuary where culinary artistry would flourish and guests would 
                  experience dining as a transformative journey.
                </p>
                <p className="text-cream/80 text-lg leading-relaxed mb-6">
                  Chef Marcus Reeves, with his classical French training and innovative spirit, 
                  established a philosophy that honors seasonal ingredients while pushing the 
                  boundaries of flavor and presentation.
                </p>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="font-serif italic text-xl text-amber-400/90 mb-8"
              >
                "I believe that every plate tells a story—a narrative of tradition, innovation, and passion."
              </motion.div>
              
              <p className="text-cream/80 text-lg leading-relaxed">
                Today, we continue that legacy with the same passion and commitment to excellence 
                that has earned us recognition as one of the premier dining destinations.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2 relative"
            >
              <div className="relative z-10 overflow-hidden">
                {/* Featured chef image */}
                {team.find(member => member.featured)?.image ? (
                  <img
                    src={team.find(member => member.featured)?.image}
                    alt="Chef Marcus Reeves"
                    className="w-full object-cover object-center rounded-lg shadow-2xl"
                    style={{ aspectRatio: "4/5" }}
                  />
                ) : (
                  <img
                    src="https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt="Chef Marcus Reeves"
                    className="w-full object-cover object-center rounded-lg shadow-2xl"
                    style={{ aspectRatio: "4/5" }}
                  />
                )}
                
                {/* Decorative elements */}
                <div className="absolute -bottom-8 -left-8 w-48 h-48 border border-amber-600/30 rounded-full -z-10"></div>
                <div className="absolute -top-8 -right-8 w-32 h-32 border border-amber-600/30 rounded-full -z-10"></div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -bottom-10 right-12 bg-black/80 backdrop-blur-sm p-6 rounded-lg border border-amber-600/30 max-w-[280px] shadow-xl"
              >
                <h3 className="text-xl font-serif font-bold text-amber-400 mb-2">
                  Chef Marcus Reeves
                </h3>
                <p className="text-amber-300/80 text-sm mb-3">Executive Chef & Founder</p>
                <div className="w-12 h-0.5 bg-amber-600/50 mb-3"></div>
                <p className="text-cream/80 text-sm">
                  With over 25 years of culinary expertise, Chef Reeves brings innovative
                  techniques to classic fine dining traditions.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Timeline Section - Horizontal Scrollable */}
      <section className="py-28 relative overflow-hidden bg-gradient-to-b from-charcoal/80 to-black">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-serif font-bold text-amber-400 mb-6">
              Our Journey
            </h2>
            <div className="w-24 h-0.5 bg-amber-600/50 mx-auto mb-6"></div>
            <p className="text-xl text-cream/80 max-w-3xl mx-auto font-serif">
              A chronicle of passion, innovation and culinary excellence
            </p>
          </motion.div>
          
          {/* Timeline Navigation */}
          <div className="flex justify-center items-center gap-8 mb-12">
            <button
              onClick={() => navigateTimeline('prev')}
              disabled={activeTimelineIndex === 0}
              className="p-3 rounded-full bg-black/40 backdrop-blur-sm border border-amber-600/30 
                        hover:border-amber-400 transition-all duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={24} className="text-amber-400" />
            </button>
            
            <div className="text-2xl font-serif font-bold text-amber-400">
              {timeline[activeTimelineIndex]?.year || '2001'}
            </div>
            
            <button
              onClick={() => navigateTimeline('next')}
              disabled={activeTimelineIndex === timeline.length - 1}
              className="p-3 rounded-full bg-black/40 backdrop-blur-sm border border-amber-600/30 
                        hover:border-amber-400 transition-all duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={24} className="text-amber-400" />
            </button>
          </div>
          
          {/* Timeline Display */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTimelineIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                <div className="order-2 md:order-1">
                  <h3 className="text-3xl font-serif font-bold text-amber-400 mb-4">
                    {timeline[activeTimelineIndex]?.title || 'The Beginning'}
                  </h3>
                  <p className="text-cream leading-relaxed mb-6">
                    {timeline[activeTimelineIndex]?.description || 
                      'Chef Marcus Reeves opens the doors to what would become one of the most celebrated dining establishments.'}
                  </p>
                  
                  {/* Timeline indicators */}
                  <div className="flex items-center gap-2 mt-8">
                    {timeline.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTimelineIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === activeTimelineIndex
                            ? 'bg-amber-400 scale-125'
                            : 'bg-amber-600/30 hover:bg-amber-600/60'
                        }`}
                        aria-label={`View timeline event ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="order-1 md:order-2">
                  <div className="relative overflow-hidden rounded-lg border-2 border-amber-600/30">
                    <img
                      src={timeline[activeTimelineIndex]?.image || 
                        'https://images.pexels.com/photos/2290753/pexels-photo-2290753.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={timeline[activeTimelineIndex]?.title || 'Timeline event'}
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* Year overlay */}
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm py-2 px-4 rounded">
                      <span className="text-amber-400 font-bold">
                        {timeline[activeTimelineIndex]?.year || '2001'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Hidden timeline for reference */}
            <div ref={timelineRef} className="hidden">
              {timeline.map((_, index) => (
                <div key={index}></div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Mission & Values Toggle Section */}
      <section className="py-28 px-6 bg-black/60 backdrop-blur-sm relative">
        <div className="absolute inset-0 -z-10 opacity-10">
          <div className="absolute inset-0 bg-black"></div>
          <img
            src="https://images.pexels.com/photos/5877807/pexels-photo-5877807.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Food texture"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-serif font-bold text-amber-400 mb-6">
              Our Philosophy
            </h2>
            <div className="w-24 h-0.5 bg-amber-600/50 mx-auto mb-6"></div>
            
            {/* Toggle between Values and Vision */}
            <div className="inline-flex bg-black/40 backdrop-blur-sm rounded-full p-1 border border-amber-600/20 mb-12">
              <button
                onClick={() => setViewMode('values')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  viewMode === 'values'
                    ? 'bg-amber-600 text-black'
                    : 'text-cream hover:text-amber-400'
                }`}
              >
                Our Values
              </button>
              <button
                onClick={() => setViewMode('vision')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  viewMode === 'vision'
                    ? 'bg-amber-600 text-black'
                    : 'text-cream hover:text-amber-400'
                }`}
              >
                Our Vision
              </button>
            </div>
          </motion.div>
          
          <AnimatePresence mode="wait">
            {viewMode === 'values' ? (
              <motion.div
                key="values"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {values.map((value, index) => {
                    const Icon = IconMap[value.icon as keyof typeof IconMap] || Award;
                    
                    return (
                      <motion.div
                        key={value.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        whileHover={{ y: -10, transition: { duration: 0.3 } }}
                        className="relative group"
                      >
                        <div className="bg-black/60 backdrop-blur-sm border border-amber-600/20 group-hover:border-amber-500/40 
                                      transition-all duration-300 rounded-lg p-8 text-center h-full">
                          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full
                                        bg-gradient-to-br from-amber-500 to-amber-700">
                            <Icon className="text-black" size={30} />
                          </div>
                          
                          <h3 className="text-2xl font-serif font-bold text-amber-400 mb-4">
                            {value.title}
                          </h3>
                          
                          <p className="text-cream/80 leading-relaxed">
                            {value.description}
                          </p>
                          
                          {/* Decorative element */}
                          <div className="absolute -z-10 -bottom-4 -right-4 w-24 h-24 border border-amber-600/10 
                                        rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="vision"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto text-center"
              >
                <div className="bg-black/40 backdrop-blur-md border border-amber-600/20 rounded-lg p-12">
                  <p className="text-2xl font-serif text-cream leading-relaxed mb-8">
                    "We believe that dining is an art form that engages all the senses. 
                    Every dish we create is a canvas, every flavor a brushstroke in a larger 
                    masterpiece designed to create lasting memories."
                  </p>
                  
                  <div className="w-20 h-0.5 bg-amber-600/50 mx-auto mb-6"></div>
                  
                  <p className="text-xl text-amber-400 font-semibold font-serif">
                    — Chef Marcus Reeves
                  </p>
                  
                  <div className="mt-12">
                    <p className="text-cream/80 leading-relaxed mb-6">
                      Our vision extends beyond exceptional cuisine. We strive to create an environment 
                      where time slows down, allowing our guests to connect with the food, with each other, 
                      and with the moment.
                    </p>
                    <p className="text-cream/80 leading-relaxed">
                      At Reeves, we're not just serving meals; we're crafting experiences that will be remembered 
                      long after the last bite.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      
      {/* Team Section with Hover Animations */}
      <section className="py-28 px-6 bg-gradient-to-b from-black/60 to-charcoal/80">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-serif font-bold text-amber-400 mb-6">
              Meet Our Team
            </h2>
            <div className="w-24 h-0.5 bg-amber-600/50 mx-auto mb-6"></div>
            <p className="text-xl text-cream/80 max-w-3xl mx-auto">
              The passionate individuals who bring our culinary vision to life
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative group"
                onMouseEnter={() => setShowBio(member.id)}
                onMouseLeave={() => setShowBio(null)}
              >
                <div className="aspect-[3/4] overflow-hidden rounded-lg relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 
                              group-hover:scale-110"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent 
                                opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                  
                  {/* Name and position */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-300
                                group-hover:-translate-y-4">
                    <h3 className="text-xl font-serif font-bold text-amber-400 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-amber-300/80 text-sm">
                      {member.position}
                    </p>
                    
                    {/* Bio that appears on hover */}
                    <div 
                      className={`max-h-0 overflow-hidden transition-all duration-300 ${
                        showBio === member.id ? 'max-h-32 mt-4' : 'max-h-0 mt-0'
                      }`}
                    >
                      <p className="text-cream/80 text-sm">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Immersive Quote Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] z-10"></div>
          <img
            src="https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Fine dining"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <div className="text-amber-400/40 text-8xl font-serif mb-6">"</div>
            
            <p className="text-3xl md:text-4xl font-serif text-cream leading-relaxed mb-10">
              To us, each dish is more than food—it's a story, an experience, a moment 
              in time captured through flavor, texture, and presentation.
            </p>
            
            <div className="w-20 h-0.5 bg-amber-600/50 mx-auto mb-6"></div>
            
            <p className="text-xl text-amber-400 font-semibold font-serif mb-6">
              Our Culinary Philosophy
            </p>
            
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent mt-16"
            />
          </motion.div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-32 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-serif font-bold text-amber-400 mb-8">
              Experience Reeves
            </h2>
            
            <p className="text-xl text-cream leading-relaxed mb-12 max-w-3xl mx-auto">
              Join us for an unforgettable culinary journey. Reserve your table today 
              and become part of our continuing story.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-black font-bold px-8 py-6 text-lg group"
                asChild
              >
                <Link to="/reservations" className="flex items-center">
                  <Calendar className="mr-2 group-hover:mr-3 transition-all" size={20} />
                  Reserve a Table
                </Link>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-bold px-8 py-6 text-lg"
                asChild
              >
                <Link to="/menu">
                  View Our Menu
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
