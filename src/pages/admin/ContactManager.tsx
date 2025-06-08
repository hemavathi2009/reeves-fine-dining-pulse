import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Mail, Phone, User, Eye, Trash2, MessageSquare, ChevronRight, ArrowLeft } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: any;
}

const ContactManager = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [mobileDetailView, setMobileDetailView] = useState(false);
  
  // Check if device is mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'contacts'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      
      // Sort by creation date, newest first
      items.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      setContacts(items);
    });

    return unsubscribe;
  }, []);

  const updateContactStatus = async (id: string, status: 'read' | 'replied') => {
    await updateDoc(doc(db, 'contacts', id), { status });
  };

  const deleteContact = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await deleteDoc(doc(db, 'contacts', id));
      if (selectedContact?.id === id) {
        setSelectedContact(null);
        if (isMobile) setMobileDetailView(false);
      }
    }
  };

  const handleContactSelect = async (contact: Contact) => {
    setSelectedContact(contact);
    if (isMobile) {
      setMobileDetailView(true);
    }
    if (contact.status === 'unread') {
      await updateContactStatus(contact.id, 'read');
    }
  };

  const handleBackToList = () => {
    setMobileDetailView(false);
  };

  const filteredContacts = filter === 'all' 
    ? contacts 
    : contacts.filter(contact => contact.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'replied': return 'text-green-400 bg-green-400/10';
      case 'read': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-amber-400 bg-amber-400/10';
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'reservation': return '📅';
      case 'private-event': return '🎉';
      case 'feedback': return '💬';
      case 'press': return '📰';
      default: return '📧';
    }
  };

  // Conditional rendering for mobile view
  if (isMobile && mobileDetailView && selectedContact) {
    return (
      <div className="space-y-6 admin-content-with-actions">
        {/* Mobile Back Button */}
        <button 
          onClick={handleBackToList}
          className="flex items-center gap-2 text-amber-400 mb-4"
        >
          <ArrowLeft size={18} />
          <span>Back to contacts</span>
        </button>

        <div className="bg-black/30 border border-amber-600/20 p-4 rounded">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-amber-400">Contact Details</h3>
            <button
              onClick={() => deleteContact(selectedContact.id)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-amber-400 font-semibold mb-2">
                <User size={16} className="inline mr-2" />
                Name
              </label>
              <p className="text-cream">{selectedContact.name}</p>
            </div>

            <div>
              <label className="block text-amber-400 font-semibold mb-2">
                <Mail size={16} className="inline mr-2" />
                Email
              </label>
              <p className="text-cream break-all">{selectedContact.email}</p>
            </div>

            {selectedContact.phone && (
              <div>
                <label className="block text-amber-400 font-semibold mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone
                </label>
                <div className="flex flex-wrap gap-2">
                  <p className="text-cream">{selectedContact.phone}</p>
                  <a 
                    href={`tel:${selectedContact.phone}`} 
                    className="bg-green-700 text-white px-2 py-1 rounded text-xs inline-flex items-center"
                  >
                    Call
                  </a>
                </div>
              </div>
            )}

            <div>
              <label className="block text-amber-400 font-semibold mb-2">
                <MessageSquare size={16} className="inline mr-2" />
                Subject
              </label>
              <p className="text-cream capitalize">
                {getSubjectIcon(selectedContact.subject)} {selectedContact.subject.replace('-', ' ')}
              </p>
            </div>

            <div>
              <label className="block text-amber-400 font-semibold mb-2">
                Message
              </label>
              <div className="text-cream bg-charcoal/50 p-4 border border-amber-600/20 whitespace-pre-wrap rounded">
                {selectedContact.message}
              </div>
            </div>

            <div>
              <label className="block text-amber-400 font-semibold mb-2">
                Status
              </label>
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedContact.status)}`}>
                {selectedContact.status}
              </span>
            </div>

            <div>
              <label className="block text-amber-400 font-semibold mb-2">
                Received
              </label>
              <p className="text-cream">
                {selectedContact.createdAt?.toDate().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile fixed action buttons */}
        {selectedContact.status !== 'replied' && (
          <div className="admin-mobile-actions">
            <button
              onClick={() => updateContactStatus(selectedContact.id, 'replied')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-black px-4 py-3 font-semibold transition-colors rounded admin-touch-button"
            >
              Mark as Replied
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={cn("flex justify-between items-center", isMobile && "flex-col gap-4 items-stretch")}>
        <h2 className="text-3xl font-bold text-amber-400">Contact Management</h2>
        
        <div className={cn("flex space-x-2", isMobile && "overflow-x-auto admin-tabs-mobile py-2 space-x-1")}>
          {['all', 'unread', 'read', 'replied'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={cn(
                `px-4 py-2 text-sm font-semibold transition-colors capitalize ${
                  filter === status
                    ? 'bg-amber-600 text-black'
                    : 'bg-charcoal border border-amber-600/30 text-cream hover:border-amber-400'
                }`,
                isMobile && "admin-tab-mobile flex-shrink-0"
              )}
            >
              {status} ({status === 'all' ? contacts.length : contacts.filter(c => c.status === status).length})
            </button>
          ))}
        </div>
      </div>

      <div className={cn("grid lg:grid-cols-3 gap-8", isMobile && "grid-cols-1")}>
        {/* Contacts List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={cn(
                `bg-black/30 border border-amber-600/20 p-6 hover:border-amber-600/40 transition-all duration-300 cursor-pointer ${
                  selectedContact?.id === contact.id ? 'border-amber-600/60 bg-amber-600/10' : ''
                }`,
                isMobile && "p-4"
              )}
              onClick={() => handleContactSelect(contact)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xl">{getSubjectIcon(contact.subject)}</span>
                    <h3 className={`text-lg font-semibold ${contact.status === 'unread' ? 'text-amber-400' : 'text-cream'}`}>
                      {contact.name}
                    </h3>
                    {contact.status === 'unread' && (
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    )}
                  </div>
                  
                  <p className="text-amber-300 font-medium mb-2 capitalize">
                    {contact.subject.replace('-', ' ')}
                  </p>
                  
                  <p className={cn("text-cream/80 text-sm line-clamp-2", isMobile && "line-clamp-1")}>
                    {contact.message}
                  </p>
                  
                  <div className={cn(
                    "flex items-center space-x-4 mt-3 text-sm text-cream/60", 
                    isMobile && "flex-wrap gap-2 space-x-0"
                  )}>
                    <span className="flex items-center space-x-1">
                      <Mail size={14} />
                      <span className={cn(isMobile && "hidden")}>
                        {contact.email}
                      </span>
                    </span>
                    {contact.phone && (
                      <span className="flex items-center space-x-1">
                        <Phone size={14} />
                        <span className={cn(isMobile && "hidden")}>
                          {contact.phone}
                        </span>
                        {/* Call button - always visible on mobile */}
                        <a
                          href={`tel:${contact.phone}`}
                          title="Call"
                          className="ml-2 bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded flex items-center"
                          style={{ fontSize: 12 }}
                        >
                          Call
                        </a>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                    {contact.status}
                  </span>
                  {isMobile && <ChevronRight size={16} className="text-amber-400/50" />}
                  {!isMobile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactSelect(contact);
                      }}
                      className="text-amber-400 hover:text-amber-300"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="text-center py-12 text-cream">
              <p className="text-lg">No contacts found for this filter.</p>
            </div>
          )}
        </div>

        {/* Contact Details - Desktop Only */}
        {!isMobile && (
          <div className="lg:col-span-1">
            {selectedContact ? (
              <div className="bg-black/30 border border-amber-600/20 p-6 sticky top-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-amber-400">Contact Details</h3>
                  <button
                    onClick={() => deleteContact(selectedContact.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-amber-400 font-semibold mb-2">
                      <User size={16} className="inline mr-2" />
                      Name
                    </label>
                    <p className="text-cream">{selectedContact.name}</p>
                  </div>

                  <div>
                    <label className="block text-amber-400 font-semibold mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Email
                    </label>
                    <p className="text-cream">{selectedContact.email}</p>
                  </div>

                  {selectedContact.phone && (
                    <div>
                      <label className="block text-amber-400 font-semibold mb-2">
                        <Phone size={16} className="inline mr-2" />
                        Phone
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="text-cream">{selectedContact.phone}</p>
                        <a
                          href={`tel:${selectedContact.phone}`}
                          title="Call"
                          className="bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded flex items-center"
                          style={{ fontSize: 12 }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Call
                        </a>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-amber-400 font-semibold mb-2">
                      <MessageSquare size={16} className="inline mr-2" />
                      Subject
                    </label>
                    <p className="text-cream capitalize">
                      {getSubjectIcon(selectedContact.subject)} {selectedContact.subject.replace('-', ' ')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-amber-400 font-semibold mb-2">
                      Message
                    </label>
                    <div className="text-cream bg-charcoal/50 p-4 border border-amber-600/20 whitespace-pre-wrap">
                      {selectedContact.message}
                    </div>
                  </div>

                  <div>
                    <label className="block text-amber-400 font-semibold mb-2">
                      Status
                    </label>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedContact.status)}`}>
                      {selectedContact.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-amber-400 font-semibold mb-2">
                      Received
                    </label>
                    <p className="text-cream">
                      {selectedContact.createdAt?.toDate().toLocaleString()}
                    </p>
                  </div>

                  {selectedContact.status !== 'replied' && (
                    <div className="pt-4 border-t border-amber-600/20">
                      <button
                        onClick={() => updateContactStatus(selectedContact.id, 'replied')}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-black px-4 py-3 font-semibold transition-colors"
                      >
                        Mark as Replied
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-black/30 border border-amber-600/20 p-6 text-center text-cream">
                <p>Select a contact to view details</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManager;
