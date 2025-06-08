import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useForm } from 'react-hook-form';
import { 
  Plus, Edit, Trash2, Upload, Image, AlertCircle, Search, 
  Filter, Tag, Utensils, Star, Leaf, X, Check, EyeIcon, 
  Flame, ShieldAlert, SlidersHorizontal, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  visibility?: boolean;
}

interface MenuFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image?: string;
  ingredients?: string;
  dietary?: string[];
  allergens?: string[];
  featured?: boolean;
  visibility?: boolean;
}

// Dietary and allergen options
const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Low-Carb"];
const ALLERGEN_OPTIONS = ["Nuts", "Dairy", "Eggs", "Soy", "Wheat", "Shellfish", "Fish", "Peanuts"];

const MenuManager = () => {
  // Original state variables
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<MenuFormData>();
  const { toast } = useToast();
  const [user, loading] = useAuthState(auth);
  
  // New state variables
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get form values
  const watchFeatured = watch("featured", false);
  const watchVisibility = watch("visibility", true);
  
  // All categories from items
  const allCategories = [...new Set(['all', ...(menuItems.map(item => item.category))])];

  // Fetch menu items from Firestore
  useEffect(() => {
    if (!user) {
      console.log('No authenticated user found');
      return;
    }

    console.log('Setting up menu items listener for user:', user.email);
    const unsubscribe = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      console.log('Menu items updated:', items);
      setMenuItems(items.sort((a, b) => a.name.localeCompare(b.name)));
    }, (error) => {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: `Failed to load menu items: ${error.message}`,
        variant: "destructive"
      });
    });

    return unsubscribe;
  }, [toast, user]);

  // Filter menu items based on category and search
  useEffect(() => {
    let filtered = [...menuItems];
    
    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(query)))
      );
    }
    
    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, searchQuery]);

  // Handle file input change with preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle dietary tag selection
  const toggleDietaryTag = (tag: string) => {
    setSelectedDietary(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Toggle allergen tag selection
  const toggleAllergenTag = (tag: string) => {
    setSelectedAllergens(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Handle form submission with enhanced data
  const onSubmit = async (data: MenuFormData) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in as an admin to perform this action.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      console.log('Form data submitted:', data);
      console.log('Current user:', user.email);
      
      let imageUrl = data.image || '';
      
      // Handle file upload if there's a file
      const fileInput = fileInputRef.current;
      if (fileInput?.files?.[0]) {
        console.log('Uploading image to Cloudinary...');
        try {
          imageUrl = await uploadToCloudinary(fileInput.files[0]);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload image. Continuing without image.",
            variant: "destructive"
          });
        }
      }

      // Process ingredients into an array
      const ingredientsArray = data.ingredients 
        ? data.ingredients.split(',').map(item => item.trim()).filter(Boolean)
        : [];

      const menuData = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price),
        category: data.category,
        image: imageUrl,
        dietary: selectedDietary,
        allergens: selectedAllergens,
        ingredients: ingredientsArray,
        featured: data.featured || false,
        visibility: data.visibility !== false, // Default to true if undefined
        createdBy: user.email,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Preparing to save menu data:', menuData);

      if (editingItem) {
        console.log('Updating existing menu item:', editingItem.id);
        await updateDoc(doc(db, 'menuItems', editingItem.id), {
          ...menuData,
          updatedAt: new Date()
        });
        toast({
          title: "Success",
          description: "Menu item updated successfully!"
        });
        setEditingItem(null);
      } else {
        console.log('Adding new menu item...');
        const docRef = await addDoc(collection(db, 'menuItems'), menuData);
        console.log('Menu item added with ID:', docRef.id);
        toast({
          title: "Success",
          description: "Menu item added successfully!"
        });
      }

      // Reset all form state
      reset();
      setShowForm(false);
      setImagePreview(null);
      setSelectedDietary([]);
      setSelectedAllergens([]);
      
      // Clear the file input
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      let errorMessage = "Failed to save menu item. Please try again.";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please ensure you have admin privileges and Firestore rules allow this operation.";
      } else if (error.code === 'unauthenticated') {
        errorMessage = "Authentication required. Please log in again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Edit menu item with enhanced handling for dietary and allergens
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setValue('name', item.name);
    setValue('description', item.description);
    setValue('price', item.price.toString());
    setValue('category', item.category);
    setValue('image', item.image || '');
    setValue('ingredients', item.ingredients ? item.ingredients.join(', ') : '');
    setValue('featured', item.featured || false);
    setValue('visibility', item.visibility !== false); // Default to true if undefined
    
    setSelectedDietary(item.dietary || []);
    setSelectedAllergens(item.allergens || []);
    setImagePreview(item.image || null);
    
    setShowForm(true);
  };

  // Delete menu item
  const handleDelete = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in as an admin to perform this action.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'menuItems', id));
        console.log('Menu item deleted successfully');
        toast({
          title: "Success",
          description: "Menu item deleted successfully!"
        });
      } catch (error: any) {
        console.error('Error deleting menu item:', error);
        let errorMessage = "Failed to delete menu item. Please try again.";
        
        if (error.code === 'permission-denied') {
          errorMessage = "Permission denied. Please check your admin privileges.";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };

  // Reset form and related state
  const handleCancel = () => {
    setEditingItem(null);
    setShowForm(false);
    setImagePreview(null);
    setSelectedDietary([]);
    setSelectedAllergens([]);
    reset();
  };

  // Remove image from item
  const handleRemoveImage = async (itemId: string) => {
    if (window.confirm('Are you sure you want to remove this image?')) {
      try {
        await updateDoc(doc(db, 'menuItems', itemId), {
          image: '',
          updatedAt: new Date()
        });
        toast({
          title: "Success",
          description: "Image removed successfully!"
        });
      } catch (error) {
        console.error('Error removing image:', error);
        toast({
          title: "Error",
          description: "Failed to remove image. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Basic categories for new items
  const categories = ['appetizers', 'mains', 'desserts', 'beverages', 'sides', 'specials'];

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-amber-400 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Render auth required state
  if (!user) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-red-400 mb-2">Authentication Required</h3>
            <p className="text-cream">Please log in as an admin to manage menu items.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Add Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-3xl font-bold text-amber-400">Menu Management</h2>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-amber-400 hidden md:inline">Logged in as: {user.email}</span>
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>
      
      {/* Filters and Search */}
      {!showForm && (
        <div className="bg-black/30 border border-amber-600/20 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400/70" size={16} />
              <Input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-charcoal/70 border-amber-600/30 text-cream"
              />
            </div>
            
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                <Filter size={16} className="text-amber-400" />
                {allCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category === 'all' ? null : category)}
                    className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
                      (category === 'all' && !selectedCategory) || selectedCategory === category
                        ? 'bg-amber-600 text-black font-medium'
                        : 'bg-charcoal/70 text-cream hover:bg-amber-600/20'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-cream/60 text-sm">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </div>
        </div>
      )}
      
      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/30 border border-amber-600/20 p-6 rounded-lg"
          >
            <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <Utensils size={18} />
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Item Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-400/80 mb-1">Item Name *</label>
                  <input
                    {...register('name', { required: 'Item name is required' })}
                    placeholder="e.g. Grilled Salmon"
                    className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none rounded-md"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-amber-400/80 mb-1">Price *</label>
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
                    placeholder="e.g. 24.99"
                    className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none rounded-md"
                  />
                  {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-amber-400/80 mb-1">Category *</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="capitalize">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm text-amber-400/80 mb-1">Description *</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Describe the dish, its flavors, and preparation style"
                  rows={3}
                  className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none rounded-md"
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm text-amber-400/80 mb-1">Ingredients (comma separated)</label>
                <textarea
                  {...register('ingredients')}
                  placeholder="e.g. Atlantic salmon, olive oil, sea salt, lemon, herbs"
                  rows={2}
                  className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none rounded-md"
                />
              </div>
              
              {/* Dietary Options */}
              <div>
                <label className="block text-sm text-amber-400/80 mb-2 flex items-center gap-2">
                  <Leaf size={16} /> Dietary Options
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map(option => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => toggleDietaryTag(option)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        selectedDietary.includes(option)
                          ? 'bg-green-600/20 border-green-400 text-green-400'
                          : 'border-cream/20 text-cream/70 hover:border-cream/40'
                      }`}
                    >
                      {selectedDietary.includes(option) && <Check size={12} className="inline mr-1" />}
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Allergens */}
              <div>
                <label className="block text-sm text-amber-400/80 mb-2 flex items-center gap-2">
                  <ShieldAlert size={16} /> Allergen Warnings
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_OPTIONS.map(allergen => (
                    <button
                      type="button"
                      key={allergen}
                      onClick={() => toggleAllergenTag(allergen)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        selectedAllergens.includes(allergen)
                          ? 'bg-red-600/20 border-red-400 text-red-400'
                          : 'border-cream/20 text-cream/70 hover:border-cream/40'
                      }`}
                    >
                      {selectedAllergens.includes(allergen) && <Check size={12} className="inline mr-1" />}
                      {allergen}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm text-amber-400/80 mb-2 flex items-center gap-2">
                  <Camera size={16} /> Item Image
                </label>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register('image')}
                      placeholder="Image URL (optional)"
                      className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none rounded-md mb-2"
                    />
                    
                    <div className="flex items-center space-x-2">
                      <Upload size={16} className="text-amber-400" />
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="w-full bg-charcoal border border-amber-600/30 text-cream px-4 py-2 focus:border-amber-400 focus:outline-none rounded-md file:mr-4 file:py-1 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-black hover:file:bg-amber-700"
                      />
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  <div className="bg-charcoal/40 border border-amber-600/20 rounded-lg overflow-hidden">
                    {imagePreview ? (
                      <div className="relative h-48">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setValue('image', '');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-cream/40">
                        <div className="text-center">
                          <Image size={48} className="mx-auto mb-2 text-amber-400/30" />
                          <p>No image selected</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Item Flags */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-charcoal/40 border border-amber-600/20 rounded-lg p-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('featured')}
                      className="form-checkbox h-5 w-5 text-amber-600 rounded border-amber-400/50 bg-charcoal focus:ring-0 focus:ring-offset-0"
                    />
                    <div>
                      <div className="text-amber-400 font-medium flex items-center gap-1">
                        <Star size={16} className={watchFeatured ? "text-amber-400" : "text-amber-400/40"} />
                        Featured Item
                      </div>
                      <p className="text-xs text-cream/60">Appears in the Chef's Specials section</p>
                    </div>
                  </label>
                </div>
                
                <div className="bg-charcoal/40 border border-amber-600/20 rounded-lg p-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('visibility')}
                      className="form-checkbox h-5 w-5 text-amber-600 rounded border-amber-400/50 bg-charcoal focus:ring-0 focus:ring-offset-0"
                    />
                    <div>
                      <div className="text-amber-400 font-medium flex items-center gap-1">
                        <EyeIcon size={16} className={watchVisibility ? "text-amber-400" : "text-amber-400/40"} />
                        Visible on Menu
                      </div>
                      <p className="text-xs text-cream/60">If unchecked, item won't appear on customer menu</p>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Submit and Cancel Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 font-semibold rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'Update Item' : 'Add Item'}</span>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 font-semibold rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "bg-black/30 border rounded-lg overflow-hidden transition-all duration-300",
              item.featured ? "border-amber-400/50" : "border-amber-600/20",
              !item.visibility && "opacity-60"
            )}
          >
            {/* Item Image */}
            <div className="relative h-48 bg-charcoal/70">
              {item.image ? (
                <>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    onClick={() => setShowImageModal(item.image || null)}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => setShowImageModal(item.image || null)}
                      className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5"
                      title="View Image"
                    >
                      <EyeIcon size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveImage(item.id)}
                      className="bg-red-500/60 hover:bg-red-500/80 text-white rounded-full p-1.5"
                      title="Remove Image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image size={48} className="text-amber-400/30" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                {item.featured && (
                  <Badge className="bg-amber-600 text-black border-0 px-2 py-1 gap-1">
                    <Star size={12} />
                    Featured
                  </Badge>
                )}
                
                {item.visibility === false && (
                  <Badge className="bg-gray-600 text-white border-0 px-2 py-1 gap-1">
                    <EyeIcon size={12} />
                    Hidden
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Item Details */}
            <div className="p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h4 className="text-lg font-semibold text-amber-400">{item.name}</h4>
                <span className="text-amber-400 font-bold text-lg">₹{item.price.toFixed(2)}</span>
              </div>
              
              <p className="text-cream/80 text-sm mb-3 line-clamp-2">{item.description}</p>
              
              {/* Tags */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="bg-charcoal/60 text-cream/70 border-cream/20 text-xs capitalize">
                    {item.category}
                  </Badge>
                  
                  {item.dietary && item.dietary.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="bg-green-900/20 text-green-400 border-green-400/30 text-xs"
                    >
                      <Leaf size={10} className="mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  
                  {item.allergens && item.allergens.length > 0 && (
                    <Badge 
                      variant="outline" 
                      className="bg-red-900/20 text-red-400 border-red-400/30 text-xs"
                    >
                      <ShieldAlert size={10} className="mr-1" />
                      {item.allergens.length} {item.allergens.length === 1 ? 'allergen' : 'allergens'}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-black/20 rounded-lg border border-amber-600/10">
          <Utensils className="text-amber-400/30 mx-auto mb-4" size={48} />
          <p className="text-lg text-cream/70 mb-4">No menu items available{searchQuery || selectedCategory ? ' matching your filters' : ''}.</p>
          {searchQuery || selectedCategory ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="text-amber-400 hover:underline"
            >
              Clear filters
            </button>
          ) : (
            <p className="text-cream/60">Add your first item to get started.</p>
          )}
        </div>
      )}
      
      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-3xl max-h-[80vh]"
            >
              <img 
                src={showImageModal} 
                alt="Menu item" 
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setShowImageModal(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuManager;
