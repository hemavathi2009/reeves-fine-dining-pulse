import React, { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle, XCircle, Clock, Utensils, Info, User, Mail, Phone } from "lucide-react";

// Add MenuItem type for dropdown
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

interface PreOrder {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  menuItems: string;
  specialRequests: string;
  createdAt: any;
  status?: string;
}

const PreOrders = () => {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    menuItems: "",
    specialRequests: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch menu items for dropdown
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menuItems"), (snap) => {
      setMenuItems(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as MenuItem))
      );
    });
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "preOrders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPreOrders(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PreOrder))
      );
    });
    return unsub;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date: Date | undefined) => {
    setForm({ ...form, date: date ? date.toISOString().split("T")[0] : "" });
  };

  // Handle menu selection (multi-select)
  const handleMenuSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setSelectedMenu(options);
    setForm({ ...form, menuItems: options.join(", ") });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.name || !form.email || !form.date || !form.time || !form.menuItems) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      await addDoc(collection(db, "preOrders"), {
        ...form,
        createdAt: new Date(),
      });
      toast({
        title: "Pre-order Placed!",
        description: "Your pre-order has been submitted successfully.",
      });
      setForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        menuItems: "",
        specialRequests: "",
      });
      setSelectedMenu([]);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to place pre-order. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const statusStyles: Record<string, string> = {
    approved: "bg-green-600/20 text-green-400 border-green-400",
    rejected: "bg-red-600/20 text-red-400 border-red-400",
    pending: "bg-amber-600/20 text-amber-400 border-amber-400",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    approved: <CheckCircle className="inline mr-1" size={16} />,
    rejected: <XCircle className="inline mr-1" size={16} />,
    pending: <Clock className="inline mr-1" size={16} />,
  };

  // Helper to format date/time
  function formatDateTime(date: any, time: string) {
    try {
      if (date && typeof date.toDate === "function") {
        const d = date.toDate();
        return `${d.toLocaleDateString()} at ${time}`;
      }
      if (typeof date === "string") {
        return `${new Date(date).toLocaleDateString()} at ${time}`;
      }
    } catch {
      // fallback
    }
    return `${date} at ${time}`;
  }

  return (
    <div className="min-h-screen bg-charcoal pt-20 pb-8 px-2 sm:px-4">
      <div className="max-w-3xl mx-auto bg-black/40 border border-amber-600/20 rounded-2xl p-4 sm:p-10 shadow-2xl">
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-amber-400 mb-6 sm:mb-8 text-center drop-shadow-lg">
          Pre-Order Your Experience
        </h1>
        <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="bg-charcoal border-amber-600/30 text-cream rounded-lg shadow"
            />
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="bg-charcoal border-amber-600/30 text-cream rounded-lg shadow"
            />
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone (optional)"
              className="bg-charcoal border-amber-600/30 text-cream rounded-lg shadow"
            />
            <Input
              name="time"
              value={form.time}
              onChange={handleChange}
              placeholder="Preferred Time (e.g. 7:30 PM)"
              required
              className="bg-charcoal border-amber-600/30 text-cream rounded-lg shadow"
            />
          </div>
          <div>
            <label className="block text-amber-400 font-semibold mb-2">Date</label>
            <Calendar
              mode="single"
              selected={form.date ? new Date(form.date) : undefined}
              onSelect={handleDateChange}
              fromDate={new Date()}
              className="w-full"
            />
          </div>
          {/* Menu Selection Area */}
          <div>
            <label className="block text-amber-400 font-semibold mb-2">Menu Selection</label>
            <select
              multiple
              value={selectedMenu}
              onChange={handleMenuSelect}
              className="w-full bg-charcoal border border-amber-600/30 text-cream rounded-lg p-3 focus:border-amber-400 focus:outline-none"
              style={{ minHeight: 80, fontSize: "1rem" }}
              required
            >
              {menuItems.map(item => (
                <option key={item.id} value={item.name}>
                  {item.name} {item.price ? `($${item.price.toFixed(2)})` : ""}
                </option>
              ))}
            </select>
            <div className="text-xs text-cream/60 mt-2">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple items.
            </div>
          </div>
          <Textarea
            name="specialRequests"
            value={form.specialRequests}
            onChange={handleChange}
            placeholder="Special Requests (allergies, celebrations, etc.)"
            className="bg-charcoal border-amber-600/30 text-cream rounded-lg shadow"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 text-lg rounded-lg shadow-lg transition-all"
            style={{ minHeight: 48, fontSize: "1.1rem" }}
          >
            {loading ? "Placing Pre-Order..." : "Place Pre-Order"}
          </Button>
        </form>
      </div>

      {/* User's Pre-Orders */}
      <div className="max-w-3xl mx-auto mt-10 sm:mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 drop-shadow">
          <Utensils className="text-amber-400" size={24} />
          Your Pre-Orders
        </h2>
        <div className="space-y-6 sm:space-y-8">
          {preOrders
            .filter((order) => user && order.email === user.email)
            .map((order) => {
              const status = order.status || "pending";
              // Split menu items into array for bullet points
              const menuList = order.menuItems
                ? order.menuItems.split(",").map(item => item.trim()).filter(Boolean)
                : [];
              return (
                <div
                  key={order.id}
                  className="relative bg-gradient-to-br from-black/80 to-charcoal/90 border-2 rounded-2xl shadow-xl p-4 sm:p-8 transition-all duration-200 border-amber-600/30 hover:border-amber-400"
                  style={{
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-3">
                    <div className="flex items-center gap-4">
                      <span className={`flex items-center px-4 py-1 text-sm font-semibold rounded-full border ${statusStyles[status]} shadow`}>
                        {statusIcons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span className="text-xs text-cream/60">
                        Placed: {order.createdAt?.toDate?.().toLocaleString?.() || ""}
                      </span>
                    </div>
                    {(status === "pending" || status === "approved") && (
                      <a
                        href="tel:+15551234567"
                        className="ml-auto bg-amber-600 hover:bg-amber-700 text-black px-4 py-2 rounded-lg font-semibold text-sm shadow transition"
                        title="Call the restaurant"
                      >
                        Contact Restaurant
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-cream">
                        <User size={18} className="text-amber-400" />
                        <span className="font-semibold">{order.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-cream/80">
                        <Mail size={18} className="text-amber-400" />
                        <span>{order.email}</span>
                      </div>
                      {order.phone && (
                        <div className="flex items-center gap-2 mb-2 text-cream/80">
                          <Phone size={18} className="text-amber-400" />
                          <span>{order.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2 text-cream/80">
                        <Clock size={18} className="text-amber-400" />
                        <span>{formatDateTime(order.date, order.time)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="mb-3">
                        <span className="font-semibold text-amber-400">Menu:</span>
                        <ul className="bg-charcoal/70 border border-amber-600/20 rounded-lg p-3 mt-1 text-cream text-sm shadow-inner list-disc pl-6">
                          {menuList.length > 0
                            ? menuList.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))
                            : <li>No menu items selected.</li>
                          }
                        </ul>
                      </div>
                      {order.specialRequests && (
                        <div>
                          <span className="font-semibold text-amber-400">Special Requests:</span>
                          <div className="bg-charcoal/50 border border-amber-600/20 rounded-lg p-3 mt-1 text-cream/90 text-sm whitespace-pre-line shadow-inner">
                            {order.specialRequests}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {status === "pending" && (
                    <div className="mt-4 text-amber-400 text-sm">
                      <Clock className="inline mr-1" size={16} />
                      Your pre-order is pending confirmation. You will receive an email once it is approved.
                    </div>
                  )}
                  {status === "approved" && (
                    <div className="mt-4 text-green-400 text-sm">
                      <CheckCircle className="inline mr-1" size={16} />
                      Your pre-order has been approved! We look forward to serving you.
                    </div>
                  )}
                  {status === "rejected" && (
                    <div className="mt-4 text-red-400 text-sm">
                      <XCircle className="inline mr-1" size={16} />
                      Sorry, your pre-order was not approved. Please contact us for more information.
                    </div>
                  )}
                </div>
              );
            })}
          {user && preOrders.filter((order) => order.email === user.email).length === 0 && (
            <div className="text-cream/70 text-center py-12 flex flex-col items-center">
              <Info className="text-amber-400 mb-2" size={32} />
              No pre-orders yet.
            </div>
          )}
          {!user && (
            <div className="text-amber-400 text-center py-12">
              Sign in to view your pre-orders.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreOrders;
