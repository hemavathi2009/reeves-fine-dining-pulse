
import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Upload, Image } from 'lucide-react';
import { motion } from 'framer-motion';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

interface MenuFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image?: string;
  imageFile?: FileList;
}

const MenuManager = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MenuFormData>();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      setMenuItems(items.sort((a, b) => a.name.localeCompare(b.name)));
    });

    return unsubscribe;
  }, []);

  const onSubmit = async (data: MenuFormData) => {
    try {
      setUploading(true);
      let imageUrl = data.image || '';
      
      if (data.imageFile && data.imageFile[0]) {
        console.log('Uploading image to Cloudinary...');
        imageUrl = await uploadToCloudinary(data.imageFile[0]);
        console.log('Image uploaded successfully:', imageUrl);
      }

      const menuData = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price),
        category: data.category,
        image: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingItem) {
        console.log('Updating menu item:', editingItem.id);
        await updateDoc(doc(db, 'menuItems', editingItem.id), {
          ...menuData,
          updatedAt: new Date()
        });
        setEditingItem(null);
      } else {
        console.log('Adding new menu item...');
        await addDoc(collection(db, 'menuItems'), menuData);
      }

      reset();
      setShowForm(false);
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
    setValue('price', item.price.toString());
    setValue('category', item.category);
    setValue('image', item.image || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'menuItems', id));
        console.log('Menu item deleted successfully');
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setShowForm(false);
    reset();
  };

  const categories = ['appetizers', 'mains', 'desserts', 'beverages'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-amber-400">Menu Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 font-semibold transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Menu Item</span>
        </button>
      </div>
      
      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 border border-amber-600/20 p-6"
        >
          <h3 className="text-xl font-semibold text-amber-400 mb-4">
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <input
                  {...register('name', { required: 'Item name is required' })}
                  placeholder="Item Name *"
                  className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <input
                  {...register('price', { 
                    required: 'Price is required',
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: 'Please enter a valid price'
                    }
                  })}
                  type="number"
                  step="0.01"
                  placeholder="Price *"
                  className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
                />
                {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>}
              </div>
            </div>
            
            <div>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
              >
                <option value="">Select Category *</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>}
            </div>
            
            <div>
              <textarea
                {...register('description', { required: 'Description is required' })}
                placeholder="Description *"
                rows={3}
                className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none"
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
            </div>
            
            <div>
              <input
                {...register('image')}
                placeholder="Image URL (optional)"
                className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none mb-2"
              />
              
              <div className="flex items-center space-x-2">
                <Upload size={16} className="text-amber-400" />
                <input
                  {...register('imageFile')}
                  type="file"
                  accept="image/*"
                  className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none file:mr-4 file:py-1 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-black hover:file:bg-amber-700"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-2 font-semibold transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>{editingItem ? 'Update Item' : 'Add Item'}</span>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Menu Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/30 border border-amber-600/20 p-4 hover:border-amber-600/40 transition-all duration-300"
          >
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-32 object-cover mb-4" />
            ) : (
              <div className="w-full h-32 bg-charcoal/50 flex items-center justify-center mb-4">
                <Image size={32} className="text-amber-400/50" />
              </div>
            )}
            <h4 className="text-lg font-semibold text-amber-400 mb-2">{item.name}</h4>
            <p className="text-cream text-sm mb-2 line-clamp-2">{item.description}</p>
            <p className="text-amber-400 font-bold text-lg">${item.price.toFixed(2)}</p>
            <p className="text-cream/70 text-sm capitalize mb-4">{item.category}</p>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(item)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm transition-colors flex items-center space-x-1"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm transition-colors flex items-center space-x-1"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {menuItems.length === 0 && (
        <div className="text-center py-12 text-cream">
          <p className="text-lg">No menu items available. Add your first item to get started.</p>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
