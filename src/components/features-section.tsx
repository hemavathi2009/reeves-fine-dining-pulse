import React from 'react';
import { FeatureCard } from './ui/feature-card';
import { Coffee, UtensilsCrossed, Wine, Users } from 'lucide-react';

export const FeaturesSection = () => {
  return (
    <section className="py-16 bg-charcoal">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-serif font-bold text-amber-400 text-center mb-12">
          Experience Excellence
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Coffee className="text-black" size={30} />}
            title="Artisan Cuisine"
            description="Each dish is meticulously crafted using the finest seasonal ingredients"
            backgroundImage="/images/artisan-cuisine.jpg"
          />
          
          <FeatureCard
            icon={<UtensilsCrossed className="text-black" size={30} />}
            title="Master Chefs"
            description="Our culinary team brings decades of experience from world-renowned restaurants"
            backgroundImage="/images/chef-working.jpg"
          />
          
          <FeatureCard
            icon={<Wine className="text-black" size={30} />}
            title="Premium Wines"
            description="Expertly curated wine selection to complement every dish perfectly"
            backgroundImage="/images/wine-selection.jpg"
          />
          
          <FeatureCard
            icon={<Users className="text-black" size={30} />}
            title="Private Events"
            description="Create unforgettable celebrations in our elegant private dining spaces"
            backgroundImage="/images/private-dining.jpg"
          />
        </div>
      </div>
    </section>
  );
};
