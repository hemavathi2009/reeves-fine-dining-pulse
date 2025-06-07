
import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';

interface GalleryItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

const GalleryManager = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryItem[];
      setGalleryItems(items);
    });

    return unsubscribe;
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      
      await addDoc(collection(db, 'gallery'), {
        url: imageUrl,
        title: title || '',
        description: description || '',
        createdAt: new Date()
      });

      setTitle('');
      setDescription('');
      setUploading(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      await deleteDoc(doc(db, 'gallery', id));
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-amber-400">Gallery Management</h2>
      
      {/* Upload Form */}
      <div className="bg-black/30 border border-amber-600/20 p-6">
        <h3 className="text-xl font-semibold text-amber-400 mb-4">Upload New Image</h3>
        
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Image Title (optional)"
            className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
          />
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Image Description (optional)"
            rows={2}
            className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
          />
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
          />
          
          {uploading && (
            <p className="text-amber-400">Uploading image...</p>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {galleryItems.map((item) => (
          <div key={item.id} className="bg-black/30 border border-amber-600/20 p-4">
            <img 
              src={item.url} 
              alt={item.title || 'Gallery image'}
              className="w-full h-48 object-cover mb-4"
            />
            {item.title && (
              <h4 className="text-amber-400 font-semibold mb-2">{item.title}</h4>
            )}
            {item.description && (
              <p className="text-cream text-sm mb-4">{item.description}</p>
            )}
            <button
              onClick={() => handleDelete(item.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryManager;
