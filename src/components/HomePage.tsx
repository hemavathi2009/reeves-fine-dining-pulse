import React from "react";
import { motion } from "framer-motion";
import SignatureExperiences from "./SignatureExperiences";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal">
      {/* Other homepage sections */}
      
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
          
          {/* Signature Experiences Component */}
          <SignatureExperiences />
        </div>
      </section>
      
      {/* Other homepage sections */}
    </div>
  );
};

export default HomePage;
