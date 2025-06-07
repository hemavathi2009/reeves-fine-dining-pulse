import React, { useEffect, useState, useRef } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, where, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import QRCode from "react-qr-code";
import { 
  CheckCircle, XCircle, Clock, Utensils, Info, User, Mail, 
  Phone, Search, ShoppingCart, Filter, X, Plus, Minus, 
  Calendar as CalendarIcon, Clock as ClockIcon, ChevronRight, 
  AlertCircle, ChevronsRight, RefreshCw, Trash2, Upload,
  Copy, Check, CreditCard, QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { uploadToCloudinary } from "../lib/cloudinary";

// Enhanced MenuItem type with dietary information
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  dietary?: string[]; // Vegan, Vegetarian, Gluten-Free, etc.
  allergens?: string[]; // Nuts, Dairy, Shellfish, etc.
  isSpecial?: boolean; // Chef's special
}

interface CartItem extends MenuItem {
  quantity: number;
  specialInstructions?: string;
}

interface PreOrder {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  items: CartItem[];
  status?: string;
  specialRequests?: string;
  createdAt: any;
  total: number;
  orderId?: string;
  estimatedPickupTime?: string;
  paymentStatus?: 'pending' | 'completed';
  paymentScreenshotUrl?: string;
  paymentMethod?: 'upi' | 'qr';
}

const PreOrders = () => {
  // UPI Payment details
  const upiId = "9392521026@axl"; // UPI ID
  const upiName = "Reeves Dining";
  const upiCurrency = "INR";

  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDietary, setActiveDietary] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [newOrderId, setNewOrderId] = useState("");
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'upi' | 'qr'>('qr');
  const [copiedUpi, setCopiedUpi] = useState(false);
  
  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: new Date(),
    time: "",
    specialRequests: "",
  });

  // Available pickup times
  const suggestedTimes = [
    "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", 
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"
  ];

  // Category and dietary filters
  const categories = ["all", "appetizers", "mains", "desserts", "beverages"];
  const dietaryOptions = ["Vegan", "Vegetarian", "Gluten-Free", "Chef's Special"];

  // Function to get unique order ID
  const generateOrderId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  // Fetch menu items
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menuItems"), (snap) => {
      const items = snap.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        // Add mock dietary data for demo purposes
        dietary: doc.data().dietary || 
          (Math.random() > 0.7 ? 
            [dietaryOptions[Math.floor(Math.random() * dietaryOptions.length)]] : 
            []),
        isSpecial: doc.data().isSpecial || Math.random() > 0.8
      } as MenuItem));
      
      setMenuItems(items);
      setFilteredItems(items);
    });
    return unsub;
  }, []);

  // Fetch user's pre-orders
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "preOrders"), 
      where("email", "==", user.email),
      orderBy("createdAt", "desc")
    );
    
    const unsub = onSnapshot(q, (snap) => {
      setPreOrders(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PreOrder))
      );
    });
    return unsub;
  }, [user]);

  // Filter menu items based on search, category and dietary preferences
  useEffect(() => {
    let filtered = [...menuItems];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => item.name.toLowerCase().includes(query) || 
               item.description.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter(item => item.category === activeCategory);
    }
    
    // Apply dietary filter
    if (activeDietary) {
      if (activeDietary === "Chef's Special") {
        filtered = filtered.filter(item => item.isSpecial);
      } else {
        filtered = filtered.filter(
          item => item.dietary && item.dietary.includes(activeDietary)
        );
      }
    }
    
    setFilteredItems(filtered);
  }, [searchQuery, activeCategory, activeDietary, menuItems]);

  // Handle search query change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Calculate total cart value
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Handle add to cart
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item.id);
      if (existingItem) {
        return prevCart.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    
    // Visual feedback
    toast({
      title: `Added to cart`,
      description: item.name,
      duration: 1500,
    });
    
    // Show cart after adding first item
    if (cart.length === 0) {
      setTimeout(() => setShowCart(true), 300);
    }
  };

  // Handle remove from cart
  const removeFromCart = (id: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === id);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(i => 
          i.id === id 
            ? { ...i, quantity: i.quantity - 1 } 
            : i
        );
      } else {
        return prevCart.filter(i => i.id !== id);
      }
    });
  };

  // Handle delete from cart
  const deleteFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // Handle special instructions
  const handleSpecialInstructions = (id: string, instructions: string) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id 
          ? { ...item, specialInstructions: instructions } 
          : item
      )
    );
  };

  // Initialize checkout process
  const startCheckout = () => {
    setIsCheckingOut(true);
    setCheckoutStep(1);
    
    // Pre-fill form if user is logged in
    if (user) {
      setCheckoutForm(prev => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || "",
      }));
    }
  };

  // Handle checkout form changes
  const handleCheckoutChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCheckoutForm({ ...checkoutForm, [e.target.name]: e.target.value });
  };

  // Handle date selection
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCheckoutForm({ ...checkoutForm, date });
    }
  };

  // Generate UPI payment link
  const generateUpiLink = (amount: number, name: string, orderId: string) => {
    const paymentNote = `Pre-Order #${orderId} - ${name}`;
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=${upiCurrency}&tn=${encodeURIComponent(paymentNote)}`;
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPaymentScreenshot(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy UPI ID to clipboard
  const copyUpiToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Submit the order
  const submitOrder = async () => {
    setLoading(true);
    
    try {
      // Create a unique order ID
      const orderId = generateOrderId();
      
      // Clean and validate cart items
      const cleanedItems = cart.map((item) => ({
        id: item.id || '',
        name: item.name || '',
        price: typeof item.price === 'number' ? item.price : 0,
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        specialInstructions: item.specialInstructions || ''
      })).filter(item => item.id && item.name);
      
      if (cleanedItems.length === 0) {
        toast({
          title: "Order failed",
          description: "No valid items in cart",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Additional validation
      if (!checkoutForm.name || !checkoutForm.email || !checkoutForm.time) {
        toast({
          title: "Order failed",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      if (!paymentScreenshot) {
        toast({
          title: "Payment Verification Required",
          description: "Please upload your payment screenshot to complete your order",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Calculate total
      const orderTotal = cleanedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate pickup time (30min after order)
      const estimatedPickupTime = new Date();
      estimatedPickupTime.setMinutes(estimatedPickupTime.getMinutes() + 30);
      
      // Upload payment screenshot to Cloudinary instead of Firebase Storage
      let paymentScreenshotUrl = "";
      
      if (paymentScreenshot) {
        try {
          console.log("Uploading payment screenshot to Cloudinary...");
          paymentScreenshotUrl = await uploadToCloudinary(paymentScreenshot);
          console.log("Cloudinary upload successful, URL:", paymentScreenshotUrl);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          toast({
            title: "Image upload issue",
            description: "We couldn't upload your payment proof, but your order will be processed",
            variant: "default",
          });
          // Set a placeholder URL to indicate upload failed but order should proceed
          paymentScreenshotUrl = "upload_failed_but_order_processed";
        }
      }
      
      const orderData = {
        name: checkoutForm.name || '',
        email: checkoutForm.email || '',
        phone: checkoutForm.phone || '',
        date: checkoutForm.date.toISOString().split('T')[0],
        time: checkoutForm.time || '',
        items: cleanedItems,
        specialRequests: checkoutForm.specialRequests || '',
        status: "pending",
        total: orderTotal,
        createdAt: Timestamp.now(),
        orderId,
        estimatedPickupTime: estimatedPickupTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        paymentStatus: paymentScreenshotUrl ? 'completed' : 'pending',
        paymentScreenshotUrl,
        paymentMethod: selectedPaymentMethod,
        paymentConfirmed: true,
        imageProvider: "cloudinary" // Add this to track where images are stored
      };
      
      console.log("Submitting order data to Firebase:", orderData);
      
      // Submit to Firebase
      await addDoc(collection(db, "preOrders"), orderData);
      
      // Show success state
      setNewOrderId(orderId);
      setOrderSuccess(true);
      setCart([]);
      
      // Fire confetti
      setTimeout(() => {
        const canvas = confettiCanvasRef.current;
        if (canvas) {
          const myConfetti = confetti.create(canvas, { resize: true });
          myConfetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }, 500);
      
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Order failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  // Move to next checkout step with updated validation
  const nextCheckoutStep = () => {
    // Validate current step
    if (checkoutStep === 1) {
      if (!checkoutForm.name || !checkoutForm.email) {
        toast({
          title: "Required fields missing",
          description: "Please fill in your name and email",
          variant: "destructive",
        });
        return;
      }
    } else if (checkoutStep === 2) {
      if (!checkoutForm.date || !checkoutForm.time) {
        toast({
          title: "Required fields missing",
          description: "Please select a pickup date and time",
          variant: "destructive",
        });
        return;
      }
    } else if (checkoutStep === 3) {
      // Payment verification will be done in the final submit
    }
    
    setCheckoutStep(prev => prev + 1);
  };

  // Reset checkout and order state with updated fields
  const resetOrder = () => {
    setIsCheckingOut(false);
    setCheckoutStep(1);
    setOrderSuccess(false);
    setShowCart(false);
    setPaymentScreenshot(null);
    setPreviewUrl("");
    setSelectedPaymentMethod('qr');
    setCopiedUpi(false);
    setCheckoutForm({
      name: "",
      email: "",
      phone: "",
      date: new Date(),
      time: "",
      specialRequests: "",
    });
  };

  // Reorder from a previous order
  const handleReorder = (order: PreOrder) => {
    // Add all items to cart with proper validation
    if (order.items && Array.isArray(order.items)) {
      const validItems = order.items.filter(item => 
        item.id && 
        item.name && 
        typeof item.price === 'number' && 
        typeof item.quantity === 'number'
      ).map(item => ({
        ...item,
        // Ensure all required MenuItem properties exist
        description: item.description || '',
        category: item.category || 'other',
        dietary: item.dietary || [],
        allergens: item.allergens || [],
        isSpecial: item.isSpecial || false,
        specialInstructions: item.specialInstructions || ''
      }));
      
      if (validItems.length > 0) {
        setCart(validItems);
        setShowCart(true);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        toast({
          title: "Items added to cart",
          description: `${validItems.length} items from your previous order`,
        });
      } else {
        toast({
          title: "Unable to reorder",
          description: "This order contains invalid items",
          variant: "destructive",
        });
      }
    }
  };
  
  // Get status label and styles
  const getStatusInfo = (status: string = 'pending') => {
    const statusStyles: Record<string, string> = {
      pending: "bg-amber-600/20 text-amber-400 border-amber-400",
      "in kitchen": "bg-blue-600/20 text-blue-400 border-blue-400",
      ready: "bg-green-600/20 text-green-400 border-green-400",
      rejected: "bg-red-600/20 text-red-400 border-red-400",
      completed: "bg-purple-600/20 text-purple-400 border-purple-400",
    };

    const statusIcons: Record<string, React.ReactNode> = {
      pending: <Clock className="inline mr-1" size={16} />,
      "in kitchen": <Utensils className="inline mr-1" size={16} />,
      ready: <CheckCircle className="inline mr-1" size={16} />,
      rejected: <XCircle className="inline mr-1" size={16} />,
      completed: <CheckCircle className="inline mr-1" size={16} />,
    };
    
    return {
      style: statusStyles[status] || statusStyles.pending,
      icon: statusIcons[status] || statusIcons.pending
    };
  };

  // Format date for display
  const formatDate = (date: any) => {
    try {
      if (date && typeof date.toDate === "function") {
        return date.toDate().toLocaleDateString();
      }
      if (typeof date === "string") {
        return new Date(date).toLocaleDateString();
      }
      return date;
    } catch {
      return date;
    }
  };

  return (
    <div className="min-h-screen bg-charcoal pt-20 pb-8 px-2 sm:px-4 overflow-x-hidden">
      {/* Confetti Canvas for Order Success */}
      <canvas 
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: '100vw', height: '100vh' }}
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-amber-400 mb-4">
            Pre-Order Your Experience
          </h1>
          <p className="text-lg text-cream/80 max-w-3xl mx-auto">
            Select your favorite dishes and reserve them for pickup at your convenience.
            Our chef prepares each dish fresh to ensure the perfect culinary experience.
          </p>
        </motion.div>
        
        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 rounded-xl bg-black/40 backdrop-blur-sm p-4 border border-amber-600/20"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={20} />
              <Input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 bg-charcoal border-amber-600/30 text-cream rounded-lg focus:ring-2 focus:ring-amber-400"
              />
            </div>
            
            {/* Category Filters */}
            <div className="flex overflow-x-auto py-1 gap-2 no-scrollbar">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 whitespace-nowrap rounded-lg text-sm font-medium ${
                    activeCategory === category 
                      ? 'bg-amber-600 text-black' 
                      : 'bg-charcoal/80 text-cream hover:bg-amber-600/20'
                  } transition-all duration-300`}
                >
                  {category === 'all' ? 'All Items' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Dietary Filters */}
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-amber-400 min-w-[18px]" />
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setActiveDietary(activeDietary === option ? null : option)}
                    className={`px-3 py-1 rounded text-xs font-medium border ${
                      activeDietary === option
                        ? 'bg-amber-600/20 border-amber-400 text-amber-400'
                        : 'border-cream/30 text-cream/70 hover:border-cream/50'
                    } transition-all duration-200`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Menu Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ 
                  y: -8,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                  transition: { duration: 0.2 }
                }}
                className="bg-black/30 border border-amber-600/20 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all duration-300"
              >
                {/* Item Image */}
                <div className="relative h-48 overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-charcoal/70 flex items-center justify-center">
                      <Utensils className="text-amber-400/50" size={40} />
                    </div>
                  )}
                  
                  {/* Quick Add Button */}
                  <motion.button
                    onClick={() => addToCart(item)}
                    initial={{ opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-4 right-4 bg-amber-600 rounded-full w-10 h-10 flex items-center justify-center text-black shadow-lg"
                  >
                    <Plus size={20} />
                  </motion.button>
                  
                  {/* Special Badge */}
                  {item.isSpecial && (
                    <div className="absolute top-4 left-4 bg-amber-600 text-black px-3 py-1 rounded-lg text-sm font-semibold shadow-lg">
                      Chef's Special
                    </div>
                  )}
                </div>
                
                {/* Item Details */}
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-amber-400">{item.name}</h3>
                    <span className="text-amber-400 font-bold">${item.price.toFixed(2)}</span>
                  </div>
                  
                  <p className="text-cream/80 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  
                  {/* Tags */}
                  {item.dietary && item.dietary.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.dietary.map(tag => (
                        <span 
                          key={tag} 
                          className="bg-charcoal/60 text-cream/70 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Add to Cart Button */}
                  <Button 
                    onClick={() => addToCart(item)}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold"
                  >
                    Add to Order
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-16">
              <Info className="text-amber-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-medium text-amber-400 mb-2">No Items Found</h3>
              <p className="text-cream/70">
                Try adjusting your search or filters to find more options.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setActiveDietary(null);
                }}
                variant="outline"
                className="mt-4 border-amber-500 text-amber-400"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
        
        {/* Pre-Order History Section */}
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-6 flex items-center gap-2">
              <Clock className="text-amber-400" size={24} />
              Your Pre-Orders
            </h2>
            
            <div className="space-y-6">
              {user ? (
                preOrders.length > 0 ? (
                  preOrders.map((order) => {
                    const status = order.status || "pending";
                    const statusInfo = getStatusInfo(status);
                    
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-gradient-to-br from-black/80 to-charcoal/90 border-2 rounded-xl shadow-xl p-6 transition-all duration-200 border-amber-600/30 hover:border-amber-400"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                          <div>
                            <span className={`flex items-center px-4 py-1 text-sm font-semibold rounded-full border ${statusInfo.style} shadow`}>
                              {statusInfo.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                            <div className="mt-2 text-xs text-cream/60">
                              Order #{order.orderId || 'N/A'} • {order.createdAt?.toDate().toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {status !== "rejected" && (
                              <a
                                href="tel:+15551234567"
                                className="bg-charcoal hover:bg-charcoal/70 text-cream px-3 py-1.5 rounded-lg text-sm shadow transition flex items-center gap-1"
                              >
                                <Phone size={14} /> Contact
                              </a>
                            )}
                            
                            <Button
                              onClick={() => handleReorder(order)}
                              className="bg-amber-600 hover:bg-amber-700 text-black font-semibold px-3 py-1.5 text-sm flex items-center gap-1"
                            >
                              <RefreshCw size={14} /> Reorder
                            </Button>
                          </div>
                        </div>
                        
                        {/* Order details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <h4 className="text-amber-400 font-medium mb-2">Order Items</h4>
                            <ul className="bg-charcoal/50 rounded-lg p-3 space-y-2">
                              {order.items?.map((item, idx) => (
                                <li key={idx} className="flex justify-between items-center text-cream border-b border-amber-600/10 last:border-0 pb-2 last:pb-0">
                                  <div>
                                    <span className="font-medium">{item.name}</span>
                                    {item.quantity > 1 && <span className="text-amber-400 ml-2">×{item.quantity}</span>}
                                    {item.specialInstructions && (
                                      <div className="text-xs text-cream/60 mt-1">{item.specialInstructions}</div>
                                    )}
                                  </div>
                                  <span>${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                            
                            <div className="flex justify-between mt-3 font-semibold text-amber-400">
                              <span>Total</span>
                              <span>${order.total?.toFixed(2) || '0.00'}</span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-amber-400 font-medium mb-2">Pickup Details</h4>
                            <div className="bg-charcoal/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2 text-cream">
                                <CalendarIcon size={16} className="text-amber-400" />
                                <span>{formatDate(order.date)}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2 text-cream">
                                <ClockIcon size={16} className="text-amber-400" />
                                <span>{order.time}</span>
                              </div>
                              {order.estimatedPickupTime && (
                                <div className="mt-3 pt-3 border-t border-amber-600/10">
                                  <div className="text-xs text-amber-400">Estimated Ready By</div>
                                  <div className="font-bold text-lg text-amber-400">
                                    {order.estimatedPickupTime}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {order.specialRequests && (
                          <div className="mt-4 bg-charcoal/30 border border-amber-600/10 p-3 rounded-lg">
                            <div className="text-amber-400 font-medium mb-1">Special Requests:</div>
                            <div className="text-cream/80 text-sm">{order.specialRequests}</div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-cream/70">
                    <Info size={40} className="mx-auto mb-4 text-amber-400/50" />
                    <p className="text-lg mb-4">You haven't placed any pre-orders yet.</p>
                    <p>Browse our menu above and place your first order!</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <User size={40} className="mx-auto mb-4 text-amber-400/50" />
                  <p className="text-lg text-cream/70 mb-4">Sign in to view your order history</p>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-black">
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Shopping Cart Sidebar */}
      <AnimatePresence>
        {showCart && !isCheckingOut && !orderSuccess && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-black/95 border-l border-amber-600/30 z-40 pt-16 backdrop-blur-sm shadow-xl"
          >
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 border-b border-amber-600/20">
                <h3 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
                  <ShoppingCart size={20} /> Your Order
                </h3>
                <button 
                  onClick={() => setShowCart(false)}
                  className="text-cream hover:text-amber-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4 px-6">
                {cart.length === 0 ? (
                  <div className="text-center text-cream/70 py-12">
                    <ShoppingCart className="mx-auto mb-4" size={32} />
                    <p>Your cart is empty</p>
                    <p className="text-sm mt-2">Add items from our menu to get started.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {cart.map((item) => (
                      <motion.li 
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-3 pb-4 border-b border-amber-600/10"
                      >
                        {/* Item image */}
                        <div className="w-16 h-16 bg-charcoal/70 rounded overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Utensils className="text-amber-400/40" size={20} />
                            </div>
                          )}
                        </div>
                        
                        {/* Item details */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-cream">{item.name}</h4>
                            <span className="text-amber-400 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          
                          <div className="text-cream/60 text-sm mt-1">
                            ${item.price.toFixed(2)} each
                          </div>
                          
                          {/* Quantity controls */}
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center text-cream hover:bg-amber-600/20 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-cream min-w-[20px] text-center">{item.quantity}</span>
                              <button 
                                onClick={() => addToCart(item)}
                                className="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center text-cream hover:bg-amber-600/20 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => deleteFromCart(item.id)}
                              className="text-cream/50 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          {/* Special instructions */}
                          <div className="mt-2">
                            <Input
                              placeholder="Special instructions"
                              value={item.specialInstructions || ''}
                              onChange={(e) => handleSpecialInstructions(item.id, e.target.value)}
                              className="text-xs h-8 py-1 px-2 bg-charcoal/60 placeholder-cream/40 text-cream border-cream/20"
                            />
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="border-t border-amber-600/20 px-6 py-4 space-y-4">
                <div className="flex justify-between text-cream text-sm">
                  <span>Subtotal</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
                
                <Button
                  onClick={startCheckout}
                  disabled={cart.length === 0}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ChevronRight size={18} />
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating Cart Button */}
      {cart.length > 0 && !showCart && !isCheckingOut && !orderSuccess && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-amber-600 hover:bg-amber-500 text-black rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300"
        >
          <div className="relative">
            <ShoppingCart size={22} />
            <span className="absolute -top-3 -right-3 bg-black text-amber-400 text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
        </motion.button>
      )}
      
      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckingOut && !orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-gradient-to-br from-black/90 to-charcoal/90 border border-amber-600/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Checkout Header */}
              <div className="p-6 border-b border-amber-600/20">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-amber-400">Complete Your Pre-Order</h3>
                  <button 
                    onClick={() => setIsCheckingOut(false)}
                    className="text-cream hover:text-amber-400 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                {/* Progress Steps */}
                <div className="flex items-center mt-6">
                  <div className={`flex-1 h-1 ${checkoutStep >= 1 ? 'bg-amber-500' : 'bg-charcoal'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    checkoutStep >= 1 ? 'bg-amber-500 text-black' : 'bg-charcoal text-cream/70'
                  }`}>1</div>
                  <div className={`flex-1 h-1 ${checkoutStep >= 2 ? 'bg-amber-500' : 'bg-charcoal'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    checkoutStep >= 2 ? 'bg-amber-500 text-black' : 'bg-charcoal text-cream/70'
                  }`}>2</div>
                  <div className={`flex-1 h-1 ${checkoutStep >= 3 ? 'bg-amber-500' : 'bg-charcoal'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    checkoutStep >= 3 ? 'bg-amber-500 text-black' : 'bg-charcoal text-cream/70'
                  }`}>3</div>
                  <div className={`flex-1 h-1 ${checkoutStep >= 4 ? 'bg-amber-500' : 'bg-charcoal'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    checkoutStep >= 4 ? 'bg-amber-500 text-black' : 'bg-charcoal text-cream/70'
                  }`}>4</div>
                  <div className={`flex-1 h-1 ${checkoutStep >= 4 ? 'bg-amber-500' : 'bg-charcoal'}`}></div>
                </div>
              </div>
              
              {/* Checkout Steps */}
              <div className="p-6">
                {/* Step 1: Contact Information */}
                {checkoutStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <h4 className="text-lg font-medium text-amber-400 mb-4">Contact Information</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-cream mb-1 block">Full Name *</label>
                        <Input
                          name="name"
                          value={checkoutForm.name}
                          onChange={handleCheckoutChange}
                          placeholder="Your full name"
                          required
                          className="bg-charcoal border-amber-600/30 text-cream"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm text-cream mb-1 block">Email Address *</label>
                        <Input
                          name="email"
                          type="email"
                          value={checkoutForm.email}
                          onChange={handleCheckoutChange}
                          placeholder="Your email"
                          required
                          className="bg-charcoal border-amber-600/30 text-cream"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm text-cream mb-1 block">Phone Number</label>
                        <Input
                          name="phone"
                          type="tel"
                          value={checkoutForm.phone}
                          onChange={handleCheckoutChange}
                          placeholder="Your phone number"
                          className="bg-charcoal border-amber-600/30 text-cream"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Step 2: Pickup Time */}
                {checkoutStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <h4 className="text-lg font-medium text-amber-400 mb-4">Choose Pickup Date & Time</h4>
                    
                    <div className="mb-4">
                      <label className="text-sm text-cream mb-1 block">Pickup Date *</label>
                      <div className="bg-charcoal border border-amber-600/30 rounded-lg p-3">
                        <Calendar
                          mode="single"
                          selected={checkoutForm.date}
                          onSelect={handleDateChange}
                          fromDate={new Date()}
                          className="mx-auto"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-cream mb-1 block">Pickup Time *</label>
                      <select
                        name="time"
                        value={checkoutForm.time}
                        onChange={handleCheckoutChange}
                        className="w-full bg-charcoal border border-amber-600/30 text-cream rounded-lg p-3 focus:border-amber-400 focus:outline-none"
                        required
                      >
                        <option value="">Select a time</option>
                        {suggestedTimes.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="bg-amber-600/10 border border-amber-600/30 rounded-lg p-4 mt-6">
                      <h5 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                        <Info size={16} /> Pickup Information
                      </h5>
                      <p className="text-cream/80 text-sm">
                        Please arrive at your selected time. Your order will be freshly prepared and ready for pickup.
                        Orders generally take 20-30 minutes to prepare once confirmed.
                      </p>
                    </div>
                  </motion.div>
                )}
                
                {/* Step 3: Review & Confirm */}
                {checkoutStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h4 className="text-lg font-medium text-amber-400">Order Summary</h4>
                    
                    {/* Order Items */}
                    <div className="bg-charcoal/50 rounded-lg p-4 space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between border-b border-amber-600/10 pb-2 last:border-0 last:pb-0">
                          <div>
                            <div className="text-cream font-medium flex items-center">
                              <span>{item.name}</span>
                              {item.quantity > 1 && <span className="text-amber-400 ml-2">×{item.quantity}</span>}
                            </div>
                            {item.specialInstructions && (
                              <div className="text-xs text-cream/60 mt-1">{item.specialInstructions}</div>
                            )}
                          </div>
                          <span className="text-amber-400">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <div className="flex justify-between pt-2 font-semibold">
                        <span className="text-cream">Total</span>
                        <span className="text-amber-400">₹{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Pickup Details */}
                    <div className="bg-charcoal/50 rounded-lg p-4">
                      <h5 className="text-amber-400 font-medium mb-3">Pickup Details</h5>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs text-cream/60">Date</div>
                          <div className="text-cream">{checkoutForm.date.toLocaleDateString()}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs text-cream/60">Time</div>
                          <div className="text-cream">{checkoutForm.time}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs text-cream/60">Name</div>
                          <div className="text-cream">{checkoutForm.name}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs text-cream/60">Contact</div>
                          <div className="text-cream">{checkoutForm.email}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Special Requests */}
                    <div>
                      <label className="text-sm text-cream mb-1 block">Special Requests (Optional)</label>
                      <Textarea
                        name="specialRequests"
                        value={checkoutForm.specialRequests}
                        onChange={handleCheckoutChange}
                        placeholder="Any special instructions or notes for your order"
                        className="bg-charcoal border-amber-600/30 text-cream h-24"
                      />
                    </div>
                    
                    {/* Payment Note */}
                    <div className="bg-amber-600/10 border border-amber-600/20 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="text-amber-400 flex-shrink-0" size={20} />
                      <p className="text-cream/80 text-sm">
                        Payment will be collected when you pick up your order. 
                        We accept all major credit cards and cash.
                      </p>
                    </div>
                  </motion.div>
                )}
                
                {/* Step 4: Payment */}
                {checkoutStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h4 className="text-lg font-medium text-amber-400 mb-2">Payment</h4>
                    <p className="text-cream/80 mb-4">
                      Please complete your payment to confirm your pre-order. Your order total is <span className="text-amber-400 font-bold">₹{calculateTotal().toFixed(2)}</span>.
                    </p>
                    
                    {/* Payment Method Selection */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <button
                        onClick={() => setSelectedPaymentMethod('qr')}
                        className={`flex-1 p-4 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                          selectedPaymentMethod === 'qr' 
                            ? 'bg-amber-600/20 border-amber-400 text-amber-400' 
                            : 'border-amber-600/30 text-cream hover:border-amber-400'
                        }`}
                      >
                        <QrCode size={18} />
                        <span>Pay via QR Code</span>
                      </button>
                      
                      <button
                        onClick={() => setSelectedPaymentMethod('upi')}
                        className={`flex-1 p-4 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                          selectedPaymentMethod === 'upi' 
                            ? 'bg-amber-600/20 border-amber-400 text-amber-400' 
                            : 'border-amber-600/30 text-cream hover:border-amber-400'
                        }`}
                      >
                        <CreditCard size={18} />
                        <span>Pay via UPI ID</span>
                      </button>
                    </div>
                    
                    {/* QR Code Payment */}
                    {selectedPaymentMethod === 'qr' && (
                      <div className="bg-white p-6 rounded-lg flex flex-col items-center">
                        <h5 className="text-black font-medium mb-4">Scan QR Code to Pay</h5>
                        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                          <QRCode 
                            value={generateUpiLink(calculateTotal(), checkoutForm.name, generateOrderId())}
                            size={200}
                            level="H"
                          />
                        </div>
                        <p className="text-black text-sm text-center">
                          Scan this QR code with any UPI app to complete your payment.
                          <br/>Include your name and order total in the payment note.
                        </p>
                      </div>
                    )}
                    
                    {/* UPI ID Payment */}
                    {selectedPaymentMethod === 'upi' && (
                      <div className="bg-charcoal/50 border border-amber-600/20 p-6 rounded-lg">
                        <h5 className="text-amber-400 font-medium mb-4">Pay via UPI ID</h5>
                        
                        <div className="bg-black/30 border border-amber-600/30 rounded-lg p-4 mb-4 flex justify-between items-center">
                          <span className="text-cream font-mono">{upiId}</span>
                          <button 
                            onClick={copyUpiToClipboard} 
                            className="text-amber-400 hover:text-amber-300 transition"
                          >
                            {copiedUpi ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                        
                        <Button 
                          onClick={() => window.location.href = generateUpiLink(calculateTotal(), checkoutForm.name, generateOrderId())}
                          className="w-full mb-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-3 font-bold flex items-center justify-center gap-2"
                        >
                          <CreditCard size={18} />
                          Open Payment App
                        </Button>
                        
                        <div className="space-y-2 text-cream/80 text-sm">
                          <p>1. Click the "Open Payment App" button above to pay directly</p>
                          <p>2. Or open any UPI app manually (Google Pay, PhonePe, Paytm, etc.)</p>
                          <p>3. Select "Send Money" or "Pay" option</p>
                          <p>4. Enter the UPI ID shown above</p>
                          <p>5. Enter amount: <span className="text-amber-400">₹{calculateTotal().toFixed(2)}</span></p>
                          <p>6. In payment note, include: <span className="text-amber-400">Pre-Order - {checkoutForm.name}</span></p>
                        </div>
                      </div>
                    )}
                    
                    {/* Payment Screenshot Upload */}
                    <div className="mt-6">
                      <h5 className="text-amber-400 font-medium mb-2">Upload Payment Screenshot</h5>
                      <p className="text-cream/70 text-sm mb-4">
                        Please upload a screenshot of your payment confirmation to verify your payment.
                      </p>
                      
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      
                      {/* Upload UI */}
                      {!previewUrl ? (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-amber-600/40 rounded-lg p-8 text-center cursor-pointer hover:border-amber-400 transition-colors"
                        >
                          <Upload className="mx-auto text-amber-400 mb-2" size={32} />
                          <p className="text-amber-400 font-medium">Click to upload screenshot</p>
                          <p className="text-cream/60 text-sm mt-1">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                      ) : (
                        <div className="border border-amber-600/40 rounded-lg p-2">
                          <div className="relative">
                            <img 
                              src={previewUrl} 
                              alt="Payment Screenshot" 
                              className="rounded-lg w-full max-h-64 object-contain"
                            />
                            <button
                              onClick={() => {
                                setPreviewUrl("");
                                setPaymentScreenshot(null);
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Payment Verification Note */}
                    <div className="bg-amber-600/10 border border-amber-600/20 rounded-lg p-4 flex items-start gap-3 mt-6">
                      <AlertCircle className="text-amber-400 flex-shrink-0" size={20} />
                      <div className="text-cream/80 text-sm">
                        <p className="mb-2">
                          <strong className="text-amber-400">Important:</strong> Your order will be confirmed only after verifying your payment.
                        </p>
                        <p>
                          Please ensure your payment screenshot clearly shows the transaction ID, amount, and recipient details.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Checkout Footer */}
              <div className="p-6 border-t border-amber-600/20 flex justify-between">
                {checkoutStep > 1 ? (
                  <Button 
                    onClick={() => setCheckoutStep(step => step - 1)}
                    variant="outline" 
                    className="px-6 border-amber-600/40 text-amber-400"
                  >
                    Back
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setIsCheckingOut(false)}
                    variant="outline" 
                    className="px-6 border-amber-600/40 text-amber-400"
                  >
                    Cancel
                  </Button>
                )}
                
                {checkoutStep < 4 ? (
                  <Button 
                    onClick={nextCheckoutStep}
                    className="bg-amber-600 hover:bg-amber-700 text-black font-semibold px-6"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button 
                    onClick={submitOrder}
                    disabled={loading || !paymentScreenshot}
                    className="bg-amber-600 hover:bg-amber-700 text-black font-semibold px-8 py-2 text-lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : (
                      "Complete Order"
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Order Success Modal */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-black/90 to-charcoal/90 border border-amber-600/30 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <CheckCircle className="text-black" size={48} />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-amber-400 mb-4">Order Confirmed!</h3>
              
              <p className="text-cream mb-6">
                Your pre-order has been successfully placed. We'll start preparing your order as the time approaches.
              </p>
              
              <div className="bg-amber-600/10 rounded-lg p-4 mb-6 inline-block">
                <div className="text-sm text-cream/60">Order ID</div>
                <div className="text-2xl font-bold text-amber-400 tracking-wider">
                  {newOrderId}
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 justify-center text-cream">
                  <User className="text-amber-400" size={16} />
                  <span>{checkoutForm.name}</span>
                </div>
                
                <div className="flex items-center gap-2 justify-center text-cream">
                  <CalendarIcon className="text-amber-400" size={16} />
                  <span>
                    {checkoutForm.date.toLocaleDateString()} at {checkoutForm.time}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 justify-center text-cream">
                  <Mail className="text-amber-400" size={16} />
                  <span>Order confirmation sent to {checkoutForm.email}</span>
                </div>
              </div>
              
              <Button 
                onClick={resetOrder}
                className="bg-amber-600 hover:bg-amber-700 text-black font-semibold px-8 py-2"
              >
                Done
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PreOrders;
