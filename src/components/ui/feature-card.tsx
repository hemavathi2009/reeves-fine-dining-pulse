import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  backgroundImage: string;
  className?: string;
  href?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  backgroundImage,
  className,
  href = "#"
}) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-500 group",
        className
      )}
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dark overlay for better readability - multiple layers for depth */}
      <div className="absolute inset-0 bg-black/50 opacity-100"></div>
      <div className="absolute inset-0 bg-amber-900/50 opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
      
      <div className="relative z-10 p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 transition-transform duration-500 group-hover:scale-110">
          {icon}
        </div>
        <h3 className="text-2xl font-serif font-bold text-amber-400 mb-4">{title}</h3>
        <p className="text-cream leading-relaxed mb-6">{description}</p>
        <a href={href} className="inline-flex items-center gap-2 text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors">
          <span>Learn More</span>
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
};
