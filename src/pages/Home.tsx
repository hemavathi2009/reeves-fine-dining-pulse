
import React from 'react';
import Hero from '../components/Hero';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Award, Clock, Utensils } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Award,
      title: "Michelin Excellence",
      description: "Recognized for culinary innovation and exceptional service since 2018",
      color: "from-amber-500 to-yellow-600"
    },
    {
      icon: Utensils,
      title: "Artisan Cuisine",
      description: "Each dish is meticulously crafted using the finest seasonal ingredients",
      color: "from-amber-600 to-orange-600"
    },
    {
      icon: Clock,
      title: "Timeless Tradition",
      description: "Two decades of refining the art of fine dining and hospitality",
      color: "from-yellow-500 to-amber-500"
    }
  ];

  const testimonials = [
    {
      text: "An absolutely transcendent dining experience. Every course was a masterpiece.",
      author: "Sarah Mitchell",
      rating: 5
    },
    {
      text: "The attention to detail and service quality is unmatched. Truly world-class.",
      author: "Michael Chen",
      rating: 5
    },
    {
      text: "Chef Reeves has created something magical here. A must-visit destination.",
      author: "Isabella Rodriguez",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-charcoal">
      <Hero />
      
      {/* About Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div className="space-y-8">
              <motion.h2 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl font-serif font-bold text-amber-400"
              >
                Our Legacy
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-cream text-xl leading-relaxed"
              >
                For over two decades, Reeves Dining has been a beacon of culinary excellence, 
                crafting unforgettable experiences through innovative cuisine and impeccable service.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-cream text-lg leading-relaxed"
              >
                Our award-winning chefs source the finest ingredients to create dishes that 
                celebrate both tradition and creativity, ensuring every meal is a masterpiece that 
                engages all your senses.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link 
                  to="/about"
                  className="inline-block bg-amber-600 hover:bg-amber-700 text-black px-8 py-4 font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  Discover Our Story
                </Link>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative group"
            >
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Restaurant interior"
                  className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating accent elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-400/10 backdrop-blur-sm border border-amber-400/30 -z-10"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-amber-400/5 backdrop-blur-sm border border-amber-400/20 -z-10"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-black/30 relative">
        <div className="container mx-auto max-w-7xl">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-serif font-bold text-center text-amber-400 mb-20"
          >
            Experience Excellence
          </motion.h2>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group relative"
              >
                <div className="text-center p-10 bg-charcoal/70 backdrop-blur-sm border border-amber-600/20 hover:border-amber-600/50 transition-all duration-500 hover:transform hover:scale-105">
                  <div className={`inline-flex items-center justify-center w-20 h-20 mb-8 bg-gradient-to-br ${feature.color} rounded-full`}>
                    <feature.icon className="text-white" size={40} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-amber-400 mb-6">{feature.title}</h3>
                  <p className="text-cream text-lg leading-relaxed">{feature.description}</p>
                </div>
                
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-6"
            >
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Signature dish"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
              />
              <img
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Wine selection"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500 mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Dessert"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500 -mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Appetizer"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-8"
            >
              <h2 className="text-5xl font-serif font-bold text-amber-400">
                Culinary Artistry
              </h2>
              <p className="text-xl text-cream leading-relaxed">
                Our seasonal menu showcases the finest ingredients, transformed through 
                innovative techniques and classical French training into dishes that tell a story.
              </p>
              <p className="text-lg text-cream leading-relaxed">
                From our signature truffle risotto to our renowned chocolate soufflé, 
                every dish is crafted to create an unforgettable sensory experience.
              </p>
              <Link 
                to="/menu"
                className="inline-block border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-8 py-4 font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                Explore Our Menu
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-black/30">
        <div className="container mx-auto max-w-6xl">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-serif font-bold text-center text-amber-400 mb-20"
          >
            What Our Guests Say
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center p-8 bg-charcoal/50 backdrop-blur-sm border border-amber-600/20 hover:border-amber-600/40 transition-all duration-300"
              >
                <div className="flex justify-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-amber-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-cream text-lg italic mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <p className="text-amber-400 font-semibold">
                  — {testimonial.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-serif font-bold text-amber-400 mb-8">
              Ready for an Unforgettable Experience?
            </h2>
            <p className="text-xl text-cream mb-12 leading-relaxed">
              Join us for an evening of culinary excellence in an atmosphere of refined elegance. 
              Reserve your table today and embark on a gastronomic journey like no other.
            </p>
            <div className="space-x-6">
              <Link 
                to="/reservations"
                className="inline-block bg-amber-600 hover:bg-amber-700 text-black px-10 py-4 font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                Book Your Table
              </Link>
              <Link 
                to="/contact"
                className="inline-block border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-10 py-4 font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
