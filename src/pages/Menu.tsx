import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Filter, Star, Utensils, ChevronRight, Gift, Clock, Coffee, 
         Leaf, Flame, Search, ChevronsDown, Sparkles, Salad } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  dietary?: string[];
  allergens?: string[];
  featured?: boolean;
  ingredients?: string[];
  specialOffer?: boolean;
  specialOfferText?: string;
  variations?: {
    size: string;
    price: number;
  }[];
  visibility?: boolean;
  videoUrl?: string;
}

// Category config with icons and descriptions
const categoryConfig = {
  all: {
    title: "All Items",
    description: "Explore our complete menu selection",
    icon: <Utensils className="w-5 h-5" />
  },
  starters: {
    title: "Starters",
    description: "Begin your culinary journey with elegant appetizers",
    icon: <Salad className="w-5 h-5" />
  },
  mains: {
    title: "Main Courses",
    description: "Exquisite entrées featuring the finest ingredients",
    icon: <Utensils className="w-5 h-5" />
  },
  desserts: {
    title: "Desserts",
    description: "Indulge in decadent sweet creations",
    icon: <Gift className="w-5 h-5" />
  },
  beverages: {
    title: "Beverages",
    description: "Refreshing drinks and signature cocktails",
    icon: <Coffee className="w-5 h-5" />
  },
  "chef's specials": {
    title: "Chef's Specials",
    description: "Exclusive dishes crafted by our master chef",
    icon: <Sparkles className="w-5 h-5" />
  }
};

// Dietary tags with icons
const dietaryTags = {
  vegan: { icon: <Leaf className="w-4 h-4" />, label: "Vegan", color: "bg-green-500/10 text-green-500 border-green-500/30" },
  vegetarian: { icon: <Leaf className="w-4 h-4" />, label: "Vegetarian", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
  "gluten-free": { icon: <Star className="w-4 h-4" />, label: "Gluten Free", color: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  spicy: { icon: <Flame className="w-4 h-4" />, label: "Spicy", color: "bg-red-500/10 text-red-500 border-red-500/30" },
  "limited-time": { icon: <Clock className="w-4 h-4" />, label: "Limited Time", color: "bg-purple-500/10 text-purple-500 border-purple-500/30" }
};

const Menu = () => {
  // State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDietary, setSelectedDietary] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [scrolledPast, setScrolledPast] = useState(false);
  
  // Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  
  // Responsive media query
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Scroll animations
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.9]);
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  
  // Intersection observers for filter bar
  const [filterBarRef2, filterBarInView] = useInView({
    threshold: 0
  });
  
  // Load menu items from Firebase
  useEffect(() => {
    // Modify the query to avoid the composite index requirement
    // We'll fetch all visible items first, then sort them in memory
    const menuQuery = query(
      collection(db, 'menuItems'),
      where('visibility', '!=', false)
    );
    
    const unsubscribe = onSnapshot(menuQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      
      // Sort items in memory instead of using orderBy in the query
      const sortedItems = items.sort((a, b) => {
        // First sort by category
        const categoryCompare = a.category.localeCompare(b.category);
        if (categoryCompare !== 0) return categoryCompare;
        
        // Then sort by name
        return a.name.localeCompare(b.name);
      });
      
      setMenuItems(sortedItems);
      
      // Extract unique categories including "all" and "chef's specials"
      const categorySet = new Set(items.map(item => item.category.toLowerCase()));
      const uniqueCategories = ['all', ...Array.from(categorySet)];
      
      // If there are featured items, add chef's specials
      if (items.some(item => item.featured)) {
        uniqueCategories.push("chef's specials");
      }
      
      setCategories(uniqueCategories);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Filter menu items when selection changes
  useEffect(() => {
    let result = [...menuItems];
    
    // Apply category filter
    if (selectedCategory === "chef's specials") {
      result = result.filter(item => item.featured);
    } else if (selectedCategory !== 'all') {
      result = result.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Apply dietary filter
    if (selectedDietary) {
      result = result.filter(item => 
        item.dietary?.some(tag => 
          tag.toLowerCase() === selectedDietary.toLowerCase()
        )
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.ingredients?.some(ingredient => 
          ingredient.toLowerCase().includes(query)
        )
      );
    }
    
    setFilteredItems(result);
  }, [selectedCategory, selectedDietary, searchQuery, menuItems]);

  // Listen to scroll events to make filter bar sticky
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const { bottom } = heroRef.current.getBoundingClientRect();
        setScrolledPast(bottom <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle filter selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setExpandedItem(null);
  };
  
  const handleDietaryChange = (tag: string) => {
    setSelectedDietary(selectedDietary === tag ? null : tag);
    setExpandedItem(null);
  };

  // Handle item expansion for detail view
  const toggleItemExpansion = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  // Get current category config
  const getCurrentCategory = () => {
    return categoryConfig[selectedCategory as keyof typeof categoryConfig] || 
           categoryConfig.all;
  };
  
  // Render dietary tags for menu items
  const renderDietaryTags = (dietaryArray?: string[]) => {
    if (!dietaryArray || dietaryArray.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {dietaryArray.map(tag => {
          const dietaryInfo = dietaryTags[tag.toLowerCase() as keyof typeof dietaryTags];
          if (!dietaryInfo) return null;
          
          return (
            <Badge 
              key={tag}
              variant="outline"
              className={cn("text-xs px-2 py-0 h-5 font-normal", dietaryInfo.color)}
            >
              {dietaryInfo.icon}
              <span className="ml-1">{dietaryInfo.label}</span>
            </Badge>
          );
        })}
      </div>
    );
  };

  // Get the available dietary filters from the current filtered items
  const getAvailableDietaryFilters = () => {
    const allTags = new Set<string>();
    
    menuItems.forEach(item => {
      if (item.dietary) {
        item.dietary.forEach(tag => allTags.add(tag.toLowerCase()));
      }
    });
    
    return Array.from(allTags);
  };

  // Render loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal pt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-16">
            <Skeleton className="h-16 w-1/3 mx-auto bg-amber-600/20" />
            <Skeleton className="h-4 w-1/2 mx-auto mt-6 bg-amber-600/10" />
          </div>
          
          <div className="mb-12">
            <Skeleton className="h-12 w-full mx-auto bg-amber-600/10 rounded-xl" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-black/40 rounded-xl overflow-hidden">
                <Skeleton className="h-48 w-full bg-amber-600/10" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-2/3 bg-amber-600/10" />
                  <Skeleton className="h-4 w-full bg-amber-600/10" />
                  <Skeleton className="h-4 w-full bg-amber-600/10" />
                  <Skeleton className="h-4 w-1/2 bg-amber-600/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal overflow-x-hidden">
      {/* Hero Section with Parallax */}
      <motion.div 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative h-[70vh] bg-black flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          {/* Replace video with professional image */}
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="Fine dining cuisine"
            className="w-full h-full object-cover opacity-70 brightness-125"
          />
          {/* Reduced darkness of overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-charcoal"></div>
        </div>
        
        <div className="container mx-auto px-6 z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif font-bold text-amber-400 mb-6"
          >
            Our Curated Menu
          </motion.h1>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "150px" }}
            transition={{ duration: 1, delay: 0.7 }}
            className="h-[3px] bg-amber-400 mx-auto mb-8"
          />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-cream max-w-3xl mx-auto leading-relaxed"
          >
            A symphony of flavors crafted with passion, precision, and the finest ingredients
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-12"
          >
            <Button
              onClick={() => {
                const filterElement = filterBarRef.current;
                if (filterElement) {
                  filterElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-black px-8 py-6 text-lg font-medium group"
            >
              Explore Menu
              <ChevronsDown className="ml-2 group-hover:animate-bounce" size={18} />
            </Button>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Filter Bar */}
      <div 
        ref={filterBarRef}
        className="py-8 bg-charcoal relative z-20"
      >
        <div 
          ref={filterBarRef2}
          className={cn(
            "transition-all duration-300",
            scrolledPast && !filterBarInView ? "opacity-100" : "opacity-0"
          )}
        >
          <div 
            className={cn(
              "fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-amber-600/20 py-4 px-6 z-30 transition-transform duration-300",
              scrolledPast && !filterBarInView ? "translate-y-0" : "-translate-y-full"
            )}
          >
            <div className="container mx-auto flex justify-between items-center">
              <h2 className="text-amber-400 font-serif text-xl hidden md:block">
                {getCurrentCategory().title}
              </h2>
              
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 max-w-[70vw] md:max-w-none">
                {categories.map((category) => {
                  const categoryInfo = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.all;
                  
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={cn(
                        "px-3 py-1.5 whitespace-nowrap text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-1.5",
                        selectedCategory === category
                          ? "bg-amber-600 text-black"
                          : "bg-black/40 text-cream hover:bg-amber-600/20"
                      )}
                    >
                      {categoryInfo.icon}
                      <span className="capitalize">
                        {categoryInfo.title}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              <div className="relative w-40 hidden md:block">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-amber-400" size={16} />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-black/30 border-amber-600/30 text-cream rounded-full h-8 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6">
          {/* Main filter UI */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div>
              <h2 className="text-3xl font-serif font-bold text-amber-400 mb-2 flex items-center gap-2">
                {getCurrentCategory().icon}
                {getCurrentCategory().title}
              </h2>
              <p className="text-cream/70">
                {getCurrentCategory().description}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search our menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/30 border-amber-600/30 text-cream rounded-lg focus:ring-1 focus:ring-amber-400"
                />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-amber-400 flex items-center whitespace-nowrap">
                  <Filter size={14} className="mr-1" /> Dietary:
                </span>
                
                {getAvailableDietaryFilters().map(tag => {
                  const dietaryInfo = dietaryTags[tag as keyof typeof dietaryTags];
                  if (!dietaryInfo) return null;
                  
                  return (
                    <button
                      key={tag}
                      onClick={() => handleDietaryChange(tag)}
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full border transition-all duration-300 flex items-center gap-1 whitespace-nowrap",
                        selectedDietary === tag
                          ? dietaryInfo.color.replace('/10', '/30')
                          : "border-cream/20 text-cream/70 hover:border-cream/40"
                      )}
                    >
                      {dietaryInfo.icon}
                      <span>{dietaryInfo.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mb-8 text-sm text-cream/60">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
            {(selectedCategory !== 'all' || selectedDietary || searchQuery) && (
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDietary(null);
                  setSearchQuery('');
                }}
                className="ml-2 text-amber-400 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Menu Items Grid */}
      <div className="container mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${selectedDietary}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredItems.length > 0 ? (
              <>
                {filteredItems.map((item, index) => {
                  const isExpanded = expandedItem === item.id;
                  
                  return (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      isExpanded={isExpanded}
                      onExpand={() => toggleItemExpansion(item.id)}
                      renderDietaryTags={renderDietaryTags}
                      isMobile={isMobile}
                    />
                  );
                })}
              </>
            ) : (
              <div className="col-span-full text-center py-16">
                <Utensils className="text-amber-400/50 mx-auto mb-6" size={64} />
                <h3 className="text-2xl font-semibold text-amber-400 mb-4">
                  No items found
                </h3>
                <p className="text-cream/70 max-w-lg mx-auto mb-8">
                  We couldn't find any menu items matching your current filters.
                  Try adjusting your search or browse our categories.
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedDietary(null);
                    setSearchQuery('');
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 font-semibold"
                >
                  View All Items
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Menu Item Card Component
interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  isExpanded: boolean;
  onExpand: () => void;
  renderDietaryTags: (dietary?: string[]) => JSX.Element | null;
  isMobile: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, index, isExpanded, onExpand, renderDietaryTags, isMobile 
}) => {
  const [cardRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ 
        duration: 0.5, 
        delay: Math.min(index * 0.1, 1),
        type: "spring",
        stiffness: 100
      }}
      whileHover={!isMobile && !isExpanded ? { y: -10, transition: { duration: 0.2 } } : {}}
      layout
      className={cn(
        "bg-black/40 backdrop-blur-sm border border-amber-600/20 rounded-xl overflow-hidden",
        "transition-all duration-500 ease-in-out",
        isExpanded ? "shadow-[0_10px_50px_rgba(234,179,8,0.2)]" : "hover:border-amber-600/40",
        isExpanded && "md:col-span-2 md:row-span-2 lg:col-span-2"
      )}
    >
      <div className="relative">
        {/* Image */}
        <div 
          className={cn(
            "relative overflow-hidden",
            isExpanded ? "h-72" : "h-48"
          )}
        >
          {item.image ? (
            <motion.img 
              src={item.image} 
              alt={item.name}
              layoutId={`image-${item.id}`}
              className={cn(
                "w-full h-full object-cover transition-transform duration-1000",
                !isExpanded && "group-hover:scale-110"
              )}
            />
          ) : (
            <div className="w-full h-full bg-charcoal/70 flex items-center justify-center">
              <Utensils className="text-amber-400/50" size={48} />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          {/* Special badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {item.featured && (
              <Badge className="bg-amber-600 text-black border-none">
                <Sparkles className="mr-1 h-3 w-3" /> Chef's Special
              </Badge>
            )}
            
            {item.specialOffer && (
              <Badge className="bg-red-600 text-white border-none">
                <Clock className="mr-1 h-3 w-3" /> Limited Time
              </Badge>
            )}
          </div>
          
          {/* Expand button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onExpand}
            className="absolute bottom-4 right-4 text-cream hover:text-amber-400 hover:bg-black/50"
          >
            {isExpanded ? 'Collapse' : 'Details'} <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-start gap-4 mb-3">
            <motion.h3 
              layoutId={`title-${item.id}`}
              className="text-xl font-semibold text-amber-400 transition-colors"
            >
              {item.name}
            </motion.h3>
            
            <div className="flex items-center space-x-1">
              {item.variations ? (
                <div className="text-right">
                  <div className="text-amber-400 font-bold">
                    ${item.variations[0].price.toFixed(2)}
                    <span className="text-xs ml-1">{item.variations[0].size}</span>
                  </div>
                  {item.variations.length > 1 && (
                    <div className="text-cream/60 text-xs">
                      from ${Math.min(...item.variations.map(v => v.price)).toFixed(2)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-amber-400 font-bold text-lg">
                  ${item.price.toFixed(2)}
                </div>
              )}
            </div>
          </div>
          
          <motion.p 
            layoutId={`desc-${item.id}`}
            className={cn(
              "text-cream/90 text-sm leading-relaxed",
              isExpanded ? "" : "line-clamp-2"
            )}
          >
            {item.description}
          </motion.p>
          
          {/* Dietary tags */}
          <motion.div layoutId={`tags-${item.id}`}>
            {renderDietaryTags(item.dietary)}
          </motion.div>
          
          {/* Expanded content */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mt-6 space-y-4"
            >
              {/* Ingredients */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div>
                  <h4 className="text-amber-400 font-medium mb-2">Ingredients</h4>
                  <p className="text-cream/80 text-sm">
                    {item.ingredients.join(', ')}
                  </p>
                </div>
              )}
              
              {/* Price variations */}
              {item.variations && item.variations.length > 1 && (
                <div>
                  <h4 className="text-amber-400 font-medium mb-2">Available Sizes</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.variations.map((variation) => (
                      <div 
                        key={variation.size}
                        className="bg-black/30 border border-amber-600/20 rounded-lg px-3 py-1.5 text-sm"
                      >
                        <span className="text-cream">{variation.size}</span>
                        <span className="text-amber-400 ml-2 font-medium">
                          ${variation.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add to order button */}
              <div className="flex justify-end pt-4">
                <Button className="bg-amber-600 hover:bg-amber-700 text-black">
                  Add to Pre-Order
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Menu;
