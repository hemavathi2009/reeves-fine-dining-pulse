import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, updateDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { CheckCircle, XCircle, Clock, Trash2, User, Mail, Phone, Utensils, Info } from "lucide-react";

// Use your real admin check here if available
const useAuth = () => {
  // ...existing code...
  const user = { email: "admin@example.com" };
  const isAdmin = user && user.email === "admin@example.com";
  return { user, isAdmin };
};

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

const AdminPreOrders = () => {
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const { isAdmin } = useAuth();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, "preOrders"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        setPreOrders(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PreOrder))
        );
      });
      return unsub;
    }
  }, [isAdmin]);

  const handleApprove = async (id: string) => {
    setActionLoading(id + "-approve");
    await updateDoc(doc(db, "preOrders", id), { status: "approved" });
    // Send notification to user
    const po = preOrders.find(po => po.id === id);
    if (po) {
      try {
        await fetch("/api/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: po.email,
            subject: "Your Pre-Order is Confirmed!",
            text: `Hello ${po.name},\n\nYour pre-order for ${po.date} at ${po.time} has been confirmed by Reeves Dining.\n\nOrder details:\nMenu: ${po.menuItems}\n${po.specialRequests ? `Special Requests: ${po.specialRequests}\n` : ""}\nWe look forward to serving you!\n\nThank you!`
          })
        });
      } catch (e) {
        // Optionally handle error
        console.error("Failed to send confirmation email:", e);
      }
    }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading(id + "-reject");
    await updateDoc(doc(db, "preOrders", id), { status: "rejected" });
    // Optionally notify user of rejection here
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id + "-delete");
    await deleteDoc(doc(db, "preOrders", id));
    setActionLoading(null);
  };

  const getWhatsAppLink = (po: PreOrder) => {
    // Professional message for double-checking the order
    const message = encodeURIComponent(
      `Hello ${po.name},\n\nThis is Reeves Dining. We are reaching out to confirm your pre-order for ${po.date} at ${po.time}.\n\nOrder details:\nMenu: ${po.menuItems}\n${po.specialRequests ? `Special Requests: ${po.specialRequests}\n` : ""}If you have any changes or questions, please let us know. Kindly reply to confirm your order.\n\nThank you!`
    );
    const cleaned = po.phone.replace(/[^\d+]/g, '');
    return `https://wa.me/${cleaned}?text=${message}`;
  };

  if (!isAdmin) return <div className="text-center text-red-400 py-12">Access denied.</div>;

  return (
    <div className="max-w-5xl mx-auto bg-black/40 border border-amber-600/20 rounded-xl p-8 shadow-2xl mt-8">
      <h2 className="text-4xl font-serif font-bold text-amber-400 mb-8 flex items-center gap-3">
        <Utensils className="text-amber-400" size={32} />
        Pre-Orders <span className="text-base text-cream/60 font-normal">({preOrders.length})</span>
      </h2>
      <div className="space-y-6">
        {preOrders.length === 0 && (
          <div className="text-cream/70 text-center py-12 text-lg flex flex-col items-center">
            <Info className="text-amber-400 mb-2" size={32} />
            No pre-orders found.
          </div>
        )}
        {preOrders.map(po => {
          const status = po.status || "pending";
          return (
            <div
              key={po.id}
              className="relative bg-gradient-to-br from-black/60 to-charcoal/80 border border-amber-600/30 rounded-lg p-6 shadow-lg hover:border-amber-400 transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 gap-2">
                <div className="flex items-center gap-4">
                  <span className={`flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${statusStyles[status]}`}>
                    {statusIcons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  <span className="text-xs text-cream/60">
                    Placed: {po.createdAt?.toDate?.().toLocaleString?.() || ""}
                  </span>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => handleApprove(po.id)}
                    disabled={actionLoading === po.id + "-approve"}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 text-sm rounded flex items-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    {actionLoading === po.id + "-approve" ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(po.id)}
                    disabled={actionLoading === po.id + "-reject"}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 text-sm rounded flex items-center gap-1 disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    {actionLoading === po.id + "-reject" ? "Rejecting..." : "Reject"}
                  </button>
                  <button
                    onClick={() => handleDelete(po.id)}
                    disabled={actionLoading === po.id + "-delete"}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-1.5 text-sm rounded flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {actionLoading === po.id + "-delete" ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 text-cream">
                    <User size={16} className="text-amber-400" />
                    <span className="font-semibold">{po.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1 text-cream/80">
                    <Mail size={16} className="text-amber-400" />
                    <span>{po.email}</span>
                  </div>
                  {po.phone && (
                    <div className="flex items-center gap-2 mb-1 text-cream/80">
                      <Phone size={16} className="text-amber-400" />
                      <span>{po.phone}</span>
                      <a
                        href={`tel:${po.phone}`}
                        title="Call"
                        className="ml-2 bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded flex items-center"
                        style={{ fontSize: 12 }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Call
                      </a>
                      <a
                        href={getWhatsAppLink(po)}
                        title="WhatsApp"
                        className="ml-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded flex items-center"
                        style={{ fontSize: 12 }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1 text-cream/80">
                    <Clock size={16} className="text-amber-400" />
                    <span>{po.date} at {po.time}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-2">
                    <span className="font-semibold text-amber-400">Menu:</span>
                    <div className="bg-charcoal/60 border border-amber-600/20 rounded p-2 mt-1 text-cream text-sm whitespace-pre-line">
                      {po.menuItems}
                    </div>
                  </div>
                  {po.specialRequests && (
                    <div>
                      <span className="font-semibold text-amber-400">Special Requests:</span>
                      <div className="bg-charcoal/40 border border-amber-600/20 rounded p-2 mt-1 text-cream/90 text-sm whitespace-pre-line">
                        {po.specialRequests}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPreOrders;
