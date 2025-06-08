import React, { useEffect, useState } from "react";
import { db } from "./lib/firebase";
import { collection, onSnapshot, updateDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { 
  CheckCircle, XCircle, Clock, Trash2, User, Mail, Phone, Utensils, 
  Info, Filter, Search, Calendar as CalendarIcon, Clock as ClockIcon, 
  AlertCircle, Maximize2, ZoomIn, X, ExternalLink, Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

// Use your real admin check here if available
const useAuth = () => {
  // ...existing code...
  const user = { email: "admin@example.com" };
  const isAdmin = user && user.email === "admin@example.com";
  return { user, isAdmin };
};

interface CartItem {
  id: string;
  name: string;
  price: number;
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

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in kitchen", label: "In Kitchen" },
  { value: "ready", label: "Ready for Pickup" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" }
];

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

const AdminPreOrders = () => {
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PreOrder[]>([]);
  const { isAdmin } = useAuth();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Add new state for image modal
  const [imageModal, setImageModal] = useState<{open: boolean, url: string | null}>({
    open: false,
    url: null
  });
  
  // Add image loading state
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  // Fetch all pre-orders
  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, "preOrders"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PreOrder));
        setPreOrders(orders);
        setFilteredOrders(orders);
      });
      return unsub;
    }
  }, [isAdmin]);

  // Apply filters
  useEffect(() => {
    let result = [...preOrders];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.name.toLowerCase().includes(query) || 
        order.email.toLowerCase().includes(query) ||
        order.orderId?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      result = result.filter(order => order.date === dateFilter);
    }
    
    setFilteredOrders(result);
  }, [searchQuery, statusFilter, dateFilter, preOrders]);

  // Get unique dates for filtering
  const getUniqueDates = () => {
    const dates = new Set<string>();
    preOrders.forEach(order => {
      if (order.date) dates.add(order.date);
    });
    return Array.from(dates).sort();
  };

  // Update order status
  const updateOrderStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, "preOrders", id), { 
        status: newStatus,
        ...(newStatus === "ready" ? { 
          estimatedPickupTime: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        } : {})
      });
      
      // Send notification to user if appropriate
      const order = preOrders.find(o => o.id === id);
      if (order) {
        try {
          // This would connect to your email API
          await fetch("/api/sendEmail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: order.email,
              subject: getEmailSubject(newStatus),
              text: getEmailBody(order, newStatus)
            })
          });
        } catch (e) {
          console.error("Failed to send email notification:", e);
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
    setActionLoading(null);
  };

  // Delete order
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }
    
    setActionLoading(id + "-delete");
    try {
      await deleteDoc(doc(db, "preOrders", id));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
    setActionLoading(null);
  };

  // Generate WhatsApp message with detailed order information
  const getWhatsAppLink = (order: PreOrder) => {
    const itemsList = order.items.map(item => 
      `- ${item.name} (${item.quantity}x) ₹${item.price.toFixed(2)}${item.specialInstructions ? ` - Note: ${item.specialInstructions}` : ''}`
    ).join('\n');
    
    const message = encodeURIComponent(
      `Hello ${order.name},\n\nThis is Reeves. We're contacting you about your pre-order #${order.orderId} for ${order.date} at ${order.time}.\n\nOrder details:\n${itemsList}\n\nTotal: ₹${order.total.toFixed(2)}\n\n${order.specialRequests ? `Special Requests: ${order.specialRequests}\n\n` : ""}Please confirm if everything is correct.\n\nThank you!`
    );
    
    const cleaned = order.phone.replace(/[^\d+]/g, '');
    return `https://wa.me/${cleaned}?text=${message}`;
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

  // Get email subject based on status
  const getEmailSubject = (status: string) => {
    switch (status) {
      case "ready": return "Your Order is Ready for Pickup! - Reeves Dining";
      case "in kitchen": return "Your Order is Being Prepared - Reeves Dining";
      case "rejected": return "Important Information About Your Order - Reeves Dining";
      case "completed": return "Thank You for Your Order - Reeves Dining";
      default: return "Order Update - Reeves Dining";
    }
  };

  // Generate email body based on status
  const getEmailBody = (order: PreOrder, status: string) => {
    const items = order.items.map(item => 
      `- ${item.name} (${item.quantity}x) ₹${item.price.toFixed(2)}`
    ).join('\n');
    
    let message = `Hello ${order.name},\n\n`;
    
    switch (status) {
      case "ready":
        message += `Great news! Your order #${order.orderId} is now ready for pickup.\n\n`;
        message += `You can pick it up at your scheduled time: ${order.time} on ${order.date}.\n\n`;
        break;
      case "in kitchen":
        message += `We're excited to let you know that your order #${order.orderId} is now being prepared by our chefs.\n\n`;
        message += `It will be ready for pickup at your scheduled time: ${order.time} on ${order.date}.\n\n`;
        break;
      case "rejected":
        message += `We regret to inform you that we are unable to fulfill your order #${order.orderId} scheduled for ${order.date} at ${order.time}.\n\n`;
        message += `Please contact us at (555) 123-4567 to discuss alternatives or to arrange a refund.\n\n`;
        break;
      case "completed":
        message += `Thank you for dining with us! Your order #${order.orderId} has been marked as completed.\n\n`;
        message += `We hope you enjoyed your meal and look forward to serving you again soon!\n\n`;
        break;
      default:
        message += `Your order #${order.orderId} scheduled for ${order.date} at ${order.time} has been updated to: ${status}.\n\n`;
    }
    
    message += `Order Details:\n${items}\n\n`;
    message += `Total: ₹${order.total.toFixed(2)}\n\n`;
    
    if (order.specialRequests) {
      message += `Special Requests: ${order.specialRequests}\n\n`;
    }
    
    message += `Thank you for choosing Reeves Dining!\n`;
    message += `For any questions, please contact us at (555) 123-4567.`;
    
    return message;
  };

  // Toggle expanded order view
  const toggleExpandOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
    setDateFilter(null);
  };

  // Handle image load and error events
  const handleImageLoad = (orderId: string) => {
    setImageLoading(prev => ({ ...prev, [orderId]: false }));
  };

  const handleImageError = (orderId: string) => {
    setImageLoading(prev => ({ ...prev, [orderId]: false }));
    setImageError(prev => ({ ...prev, [orderId]: true }));
  };

  // Open image modal
  const openImageModal = (url: string) => {
    setImageModal({ open: true, url });
  };

  // Close image modal
  const closeImageModal = () => {
    setImageModal({ open: false, url: null });
  };

  if (!isAdmin) return (
    <div className="text-center text-red-400 py-12 flex flex-col items-center">
      <AlertCircle size={40} className="mb-4" />
      <h2 className="text-xl font-bold mb-2">Access Denied</h2>
      <p>You don't have permission to access this area.</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto bg-black/40 border border-amber-600/20 rounded-xl p-6 md:p-8 shadow-2xl">
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-400 mb-6 flex items-center gap-3">
        <Utensils className="text-amber-400" size={28} />
        Pre-Orders Management
        <Badge variant="outline" className="ml-2 text-amber-400 border-amber-400">
          {preOrders.length}
        </Badge>
      </h2>

      {/* Filters Section */}
      <div className="mb-8 p-4 bg-black/30 rounded-lg border border-amber-600/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
            <Input
              type="text"
              placeholder="Search by name, email or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-charcoal/70 border-amber-600/30 text-cream focus:border-amber-400"
            />
          </div>

          <div className="w-full md:w-48">
            <select 
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="w-full h-10 px-3 py-2 bg-charcoal/70 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48">
            <select 
              value={dateFilter || ""}
              onChange={(e) => setDateFilter(e.target.value || null)}
              className="w-full h-10 px-3 py-2 bg-charcoal/70 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none"
            >
              <option value="">All Dates</option>
              {getUniqueDates().map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>

          <Button 
            variant="outline"
            onClick={resetFilters}
            className="border-amber-600/30 text-amber-400 hover:bg-amber-600/20"
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-cream/70 text-center py-12 flex flex-col items-center bg-black/20 rounded-lg border border-amber-600/10"
          >
            <Info className="text-amber-400 mb-3" size={32} />
            {preOrders.length === 0 ? (
              <p className="text-lg">No pre-orders found.</p>
            ) : (
              <>
                <p className="text-lg">No orders match your filters.</p>
                <Button 
                  variant="link" 
                  onClick={resetFilters}
                  className="text-amber-400 mt-2"
                >
                  Clear all filters
                </Button>
              </>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredOrders.map(order => {
              const status = order.status || "pending";
              const isExpanded = expandedOrder === order.id;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-br from-black/80 to-charcoal/90 border border-amber-600/30 rounded-xl shadow-lg hover:border-amber-500/50 transition-all duration-300"
                >
                  <div className="p-5">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={`${statusStyles[status]} px-3 py-1`}>
                            {statusIcons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                          
                          <span className="text-amber-400 font-semibold">
                            #{order.orderId || 'N/A'}
                          </span>
                          
                          <span className="text-sm text-cream/60">
                            {order.createdAt?.toDate?.().toLocaleString() || ""}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-2 text-cream">
                          <User size={14} className="text-amber-400" />
                          <span className="font-medium">{order.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleExpandOrder(order.id)}
                          className="bg-amber-600/20 text-amber-400 border border-amber-400/30 hover:bg-amber-600/30"
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(order.id)}
                          disabled={actionLoading === order.id + "-delete"}
                          className="bg-red-600/20 text-red-400 border border-red-400/30 hover:bg-red-600/30"
                        >
                          {actionLoading === order.id + "-delete" ? (
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                              ...
                            </span>
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Basic Order Info */}
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={14} className="text-amber-400" />
                        <span className="text-cream text-sm">{order.date}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ClockIcon size={14} className="text-amber-400" />
                        <span className="text-cream text-sm">{order.time}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-amber-400" />
                        <span className="text-cream text-sm truncate">{order.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-amber-400" />
                        <span className="text-cream text-sm">{order.phone || "N/A"}</span>
                      </div>
                    </div>
                    
                    {/* Order total */}
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-cream text-sm">
                        {order.items?.length || 0} item(s)
                      </span>
                      <span className="text-amber-400 font-bold">
                        Total: ₹{order.total?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 border-t border-amber-600/20 bg-black/40">
                          <h4 className="text-amber-400 font-semibold mb-3">Order Details</h4>
                          
                          {/* Order Items */}
                          <div className="mb-5 bg-charcoal/40 rounded-lg border border-amber-600/10 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-black/40 border-b border-amber-600/20">
                                <tr>
                                  <th className="text-left p-3 text-amber-400">Item</th>
                                  <th className="text-center p-3 text-amber-400">Qty</th>
                                  <th className="text-right p-3 text-amber-400">Price</th>
                                  <th className="text-right p-3 text-amber-400">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items?.map((item, idx) => (
                                  <tr key={idx} className="border-b border-amber-600/10 last:border-0">
                                    <td className="p-3 text-cream">
                                      <div className="font-medium">{item.name}</div>
                                      {item.specialInstructions && (
                                        <div className="text-xs text-cream/60 mt-1">{item.specialInstructions}</div>
                                      )}
                                    </td>
                                    <td className="p-3 text-center text-cream">{item.quantity}</td>
                                    <td className="p-3 text-right text-cream">₹{item.price.toFixed(2)}</td>
                                    <td className="p-3 text-right text-amber-400">
                                      ₹{(item.price * item.quantity).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-black/40 border-t border-amber-600/20">
                                <tr>
                                  <td colSpan={3} className="p-3 text-right font-semibold text-cream">Total</td>
                                  <td className="p-3 text-right font-bold text-amber-400">₹{order.total?.toFixed(2) || '0.00'}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                          
                          {/* Special Requests */}
                          {order.specialRequests && (
                            <div className="mb-5">
                              <h5 className="text-sm font-medium text-amber-400 mb-1">Special Requests</h5>
                              <div className="bg-charcoal/40 border border-amber-600/10 rounded-lg p-3 text-cream/90 text-sm">
                                {order.specialRequests}
                              </div>
                            </div>
                          )}
                          
                          {/* Enhanced Payment Information Section */}
                          <div className="mb-5">
                            <h5 className="text-sm font-medium text-amber-400 mb-1">Payment Information</h5>
                            <div className="bg-charcoal/40 border border-amber-600/10 rounded-lg p-4">
                              <div className="flex justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-cream/80">Status:</span>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    order.paymentStatus === 'completed' 
                                      ? 'bg-green-600/20 text-green-400 border border-green-400/50' 
                                      : 'bg-amber-600/20 text-amber-400 border border-amber-400/50'
                                  }`}>
                                    {order.paymentStatus === 'completed' ? 'Paid' : 'Pending Payment'}
                                  </span>
                                </div>
                                <div className="text-cream/80">
                                  <span>Method: </span>
                                  <span className="text-cream font-medium capitalize">
                                    {order.paymentMethod || 'Online'}
                                  </span>
                                </div>
                              </div>
                              
                              {order.paymentScreenshotUrl && (
                                <div className="bg-gradient-to-br from-amber-900/10 to-amber-800/5 rounded-lg p-4 border border-amber-600/30">
                                  <div className="flex justify-between items-center mb-3">
                                    <div className="text-sm text-amber-400 font-medium flex items-center gap-2">
                                      <img 
                                        src="/icons/payment-verified.svg" 
                                        alt="Payment Verified" 
                                        className="w-5 h-5" 
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                      />
                                      Payment Verification
                                    </div>
                                    <div className="text-xs text-cream/60">
                                      {order.paymentStatus === 'completed' ? 'Verified' : 'Pending Verification'}
                                    </div>
                                  </div>
                                  
                                  {/* Start: Enhanced Screenshot Display */}
                                  <div className="relative group">
                                    {/* Loading Indicator */}
                                    {imageLoading[order.id] && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                        <div className="w-8 h-8 border-4 border-amber-600/30 border-t-amber-500 rounded-full animate-spin"></div>
                                      </div>
                                    )}
                                    
                                    {/* Error State */}
                                    {imageError[order.id] ? (
                                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex flex-col items-center">
                                        <AlertCircle className="text-red-400 mb-2" size={24} />
                                        <p className="text-red-400 text-sm">Unable to load image</p>
                                        <a 
                                          href={order.paymentScreenshotUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-amber-400 hover:text-amber-300 text-xs mt-2 underline"
                                        >
                                          Try opening directly
                                        </a>
                                      </div>
                                    ) : (
                                      <div className="bg-black/40 rounded-lg overflow-hidden shadow-lg border border-amber-600/30 transition-all duration-300 hover:border-amber-400/60 group">
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                          {/* Image */}
                                          <img 
                                            src={order.paymentScreenshotUrl} 
                                            alt="Payment Screenshot" 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onLoad={() => handleImageLoad(order.id)}
                                            onError={() => handleImageError(order.id)}
                                          />
                                          
                                          {/* Overlay with Controls */}
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center">
                                              <div className="text-cream/90 text-sm">Payment Proof</div>
                                              <div className="flex gap-2">
                                                <button 
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openImageModal(order.paymentScreenshotUrl);
                                                  }}
                                                  className="w-8 h-8 rounded-full bg-amber-500/30 flex items-center justify-center text-amber-400 hover:bg-amber-500/50 transition-colors"
                                                >
                                                  <ZoomIn size={16} />
                                                </button>
                                                <a 
                                                  href={order.paymentScreenshotUrl}
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  className="w-8 h-8 rounded-full bg-amber-500/30 flex items-center justify-center text-amber-400 hover:bg-amber-500/50 transition-colors"
                                                  onClick={e => e.stopPropagation()}
                                                >
                                                  <ExternalLink size={16} />
                                                </a>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="mt-2 flex justify-center">
                                      <button
                                        onClick={() => openImageModal(order.paymentScreenshotUrl)}
                                        className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1"
                                      >
                                        <Maximize2 size={12} /> View Full Image
                                      </button>
                                    </div>
                                  </div>
                                  {/* End: Enhanced Screenshot Display */}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-amber-400 mb-1">Status Update</h5>
                              <div className="flex gap-2">
                                <select 
                                  className="flex-1 bg-charcoal/70 border border-amber-600/30 rounded text-cream focus:border-amber-400 focus:outline-none p-2 text-sm"
                                  value={status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                  disabled={!!actionLoading}
                                >
                                  {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                                
                                {actionLoading === order.id && (
                                  <div className="flex items-center justify-center px-3">
                                    <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-amber-400 mb-1">Contact Customer</h5>
                              <div className="flex gap-2">
                                {order.phone && (
                                  <>
                                    <a
                                      href={`tel:${order.phone}`}
                                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Phone size={14} /> Call
                                    </a>
                                    
                                    <a
                                      href={getWhatsAppLink(order)}
                                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                      </svg>
                                      WhatsApp
                                    </a>
                                  </>
                                )}
                                
                                <a
                                  href={`mailto:${order.email}`}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Mail size={14} /> Email
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Image Modal/Lightbox */}
      <AnimatePresence>
        {imageModal.open && imageModal.url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={closeImageModal}
          >
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <a 
                href={imageModal.url}
                download
                target="_blank"
                rel="noopener noreferrer" 
                onClick={e => e.stopPropagation()}
                className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 hover:bg-amber-500/40 transition-all"
              >
                <Download size={18} />
              </a>
              <a 
                href={imageModal.url}
                target="_blank"
                rel="noopener noreferrer" 
                onClick={e => e.stopPropagation()}
                className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 hover:bg-amber-500/40 transition-all"
              >
                <ExternalLink size={18} />
              </a>
              <button 
                onClick={closeImageModal}
                className="w-10 h-10 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-400 hover:bg-red-500/40 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <motion.div 
              className="relative max-w-4xl max-h-[80vh] bg-black/60 p-2 border border-amber-400/30 shadow-2xl rounded-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <img 
                src={imageModal.url} 
                alt="Payment Screenshot" 
                className="max-w-full max-h-[calc(80vh-2rem)] object-contain rounded"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPreOrders;
