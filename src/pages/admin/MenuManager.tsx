
import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useForm } from 'react-hook-form';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

const MenuManager = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      setMenuItems(items);
    });

    return unsubscribe;
  }, []);

  const onSubmit = async (data: any) => {
    try {
      let imageUrl = data.image;
      
      if (data.imageFile && data.imageFile[0]) {
        setUploading(true);
        imageUrl = await uploadToCloudinary(data.imageFile[0]);
      }

      const menuData = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        image: imageUrl
      };

      if (editingItem) {
        await updateDoc(doc(db, 'menuItems', editingItem.id), menuData);
        setEditingItem(null);
      } else {
        await addDoc(collection(db, 'menuItems'), menuData);
      }

      reset();
      setUploading(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
      setUploading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setValue('name', item.name);
    setValue('description', item.description);
    setValue('price', item.price);
    setValue('category', item.category);
    setValue('image', item.image || '');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, 'menuItems', id));
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-amber-400">Menu Management</h2>
      
      {/* Add/Edit Form */}
      <div className="bg-black/30 border border-amber-600/20 p-6">
        <h3 className="text-xl font-semibold text-amber-400 mb-4">
          {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              {...register('name', { required: true })}
              placeholder="Item Name"
              className="bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
            />
            
            <input
              {...register('price', { required: true })}
              type="number"
              step="0.01"
              placeholder="Price"
              className="bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
          
          <select
            {...register('category', { required: true })}
            className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
          >
            <option value="">Select Category</option>
            <option value="appetizers">Appetizers</option>
            <option value="mains">Main Courses</option>
            <option value="desserts">Desserts</option>
            <option value="beverages">Beverages</option>
          </select>
          
          <textarea
            {...register('description', { required: true })}
            placeholder="Description"
            rows={3}
            className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
          />
          
          <input
            {...register('image')}
            placeholder="Image URL (optional)"
            className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
          />
          
          <input
            {...register('imageFile')}
            type="file"
            accept="image/*"
            className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
          />
          
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={uploading}
              className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-2 font-semibold transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : editingItem ? 'Update Item' : 'Add Item'}
            </button>
            
            {editingItem && (
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  reset();
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 font-semibold transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Menu Items List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-black/30 border border-amber-600/20 p-4">
            {item.image && (
              <img src={item.image} alt={item.name} className="w-full h-32 object-cover mb-4" />
            )}
            <h4 className="text-lg font-semibold text-amber-400">{item.name}</h4>
            <p className="text-cream text-sm mb-2">{item.description}</p>
            <p className="text-amber-400 font-bold">${item.price}</p>
            <p className="text-cream/70 text-sm capitalize">{item.category}</p>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => handleEdit(item)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuManager;
