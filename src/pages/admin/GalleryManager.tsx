import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { 
  Trash2, Edit, Eye, Tag, Upload, ImagePlus, Grid, List, Search, FilterX,
  Check, X, ChevronDown, MoreVertical, Calendar, Info, Loader, SlidersHorizontal,
  Plus, Play, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { MediaCategory, CATEGORY_LABELS } from '../../types/gallery';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface GalleryItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  type: 'image' | 'video';
  uploadedAt: Date;
  views: number;
}

const GalleryManager: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<GalleryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<string>('food');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formFeatured, setFormFeatured] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Get gallery items from Firestore
  useEffect(() => {
    setIsLoading(true);
    
    // Create query with sort order
    const galleryQuery = query(
      collection(db, 'gallery'),
      orderBy(sortOrder === 'popular' ? 'views' : 'uploadedAt', 
              sortOrder === 'oldest' ? 'asc' : 'desc')
    );
    
    const unsubscribe = onSnapshot(galleryQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
      })) as GalleryItem[];
      
      setGalleryItems(items);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching gallery items:", error);
      toast({
        title: "Error loading gallery",
        description: "There was a problem fetching the gallery items.",
        variant: "destructive"
      });
      setIsLoading(false);
    });

    return unsubscribe;
  }, [sortOrder, toast]);

  // Apply filters
  useEffect(() => {
    let filtered = [...galleryItems];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.title?.toLowerCase().includes(query)) || 
        (item.description?.toLowerCase().includes(query)) ||
        (item.tags?.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    setFilteredItems(filtered);
  }, [galleryItems, categoryFilter, searchQuery]);

  // Reset form fields
  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormCategory('food');
    setFormTags([]);
    setFormFeatured(false);
    setTagInput('');
    setUploadedFiles([]);
    setUploadPreviews([]);
  };

  // Populate form with item data for editing
  const populateForm = (item: GalleryItem) => {
    setFormTitle(item.title || '');
    setFormDescription(item.description || '');
    setFormCategory(item.category || 'food');
    setFormTags(item.tags || []);
    setFormFeatured(!!item.featured);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    setUploadedFiles(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setUploadPreviews(previews);
  };

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle tag input
  const handleTagAdd = () => {
    if (tagInput.trim() && !formTags.includes(tagInput.trim())) {
      setFormTags([...formTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Remove tag from form
  const handleTagRemove = (tagToRemove: string) => {
    setFormTags(formTags.filter(tag => tag !== tagToRemove));
  };

  // Upload images to Cloudinary and add to Firestore
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Process each file
      for (const file of uploadedFiles) {
        // Determine if it's an image or video
        const fileType = file.type.startsWith('video/') ? 'video' : 'image';
        
        // Upload to Cloudinary
        const url = await uploadToCloudinary(file);
        
        // Add to Firestore
        await addDoc(collection(db, 'gallery'), {
          url,
          title: formTitle || '',
          description: formDescription || '',
          category: formCategory,
          tags: formTags.map(tag => tag.toLowerCase()),
          featured: formFeatured,
          type: fileType,
          uploadedAt: new Date(),
          views: 0
        });
      }
      
      toast({
        title: "Upload successful",
        description: `${uploadedFiles.length} ${uploadedFiles.length === 1 ? 'item' : 'items'} added to gallery.`,
      });
      
      resetForm();
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Update an existing gallery item
  const handleUpdate = async () => {
    if (!currentItem) return;
    
    try {
      await updateDoc(doc(db, 'gallery', currentItem.id), {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        tags: formTags.map(tag => tag.toLowerCase()),
        featured: formFeatured
      });
      
      toast({
        title: "Item updated",
        description: "Gallery item has been updated successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the item. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete gallery item
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'gallery', id));
        
        toast({
          title: "Item deleted",
          description: "Gallery item has been removed.",
        });
        
        // Close detail view if the current item was deleted
        if (currentItem?.id === id) {
          setIsDetailOpen(false);
          setCurrentItem(null);
        }
      } catch (error) {
        console.error('Delete failed:', error);
        toast({
          title: "Delete failed",
          description: "There was an error deleting the item.",
          variant: "destructive"
        });
      }
    }
  };

  // Batch delete selected items
  const handleBatchDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items? This action cannot be undone.`)) {
      try {
        for (const id of selectedItems) {
          await deleteDoc(doc(db, 'gallery', id));
        }
        
        toast({
          title: "Items deleted",
          description: `${selectedItems.length} items have been removed.`,
        });
        
        setSelectedItems([]);
      } catch (error) {
        console.error('Batch delete failed:', error);
        toast({
          title: "Delete failed",
          description: "There was an error deleting the items.",
          variant: "destructive"
        });
      }
    }
  };

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  // Open item detail view
  const openItemDetail = (item: GalleryItem) => {
    setCurrentItem(item);
    setIsDetailOpen(true);
    setIsEditing(false);
    populateForm(item);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-3xl font-bold text-amber-400">Gallery Management</h2>
        
        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBatchDelete}
              className="gap-1"
            >
              <Trash2 size={16} />
              Delete ({selectedItems.length})
            </Button>
          )}
          
          <Button 
            variant="default" 
            onClick={handleUploadClick}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-black"
          >
            <ImagePlus size={18} />
            Add Media
          </Button>
        </div>
      </div>
      
      {/* Filter & View Controls */}
      <div className="bg-black/30 border border-amber-600/20 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
            <Input
              placeholder="Search gallery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-charcoal/70 border-amber-600/30 text-cream"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-amber-600/30 text-amber-400">
                  <Tag size={16} className="mr-2" />
                  {categoryFilter === 'all' ? 'All Categories' : CATEGORY_LABELS[categoryFilter as MediaCategory]}
                  <ChevronDown size={16} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-charcoal border-amber-600/30">
                <DropdownMenuItem 
                  onClick={() => setCategoryFilter('all')}
                  className={categoryFilter === 'all' ? 'bg-amber-600/20 text-amber-400' : 'text-cream'}
                >
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-amber-600/20" />
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <DropdownMenuItem 
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={categoryFilter === key ? 'bg-amber-600/20 text-amber-400' : 'text-cream'}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-amber-600/30 text-amber-400">
                  <SlidersHorizontal size={16} className="mr-2" />
                  {sortOrder === 'newest' && 'Newest First'}
                  {sortOrder === 'oldest' && 'Oldest First'}
                  {sortOrder === 'popular' && 'Most Viewed'}
                  <ChevronDown size={16} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-charcoal border-amber-600/30">
                <DropdownMenuItem 
                  onClick={() => setSortOrder('newest')}
                  className={sortOrder === 'newest' ? 'bg-amber-600/20 text-amber-400' : 'text-cream'}
                >
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOrder('oldest')}
                  className={sortOrder === 'oldest' ? 'bg-amber-600/20 text-amber-400' : 'text-cream'}
                >
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOrder('popular')}
                  className={sortOrder === 'popular' ? 'bg-amber-600/20 text-amber-400' : 'text-cream'}
                >
                  Most Viewed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="border border-amber-600/30 rounded-md overflow-hidden flex">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('grid')}
                className={`px-3 rounded-none ${viewMode === 'grid' ? 'bg-amber-600/20 text-amber-400' : 'text-cream/70'}`}
              >
                <Grid size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('list')}
                className={`px-3 rounded-none ${viewMode === 'list' ? 'bg-amber-600/20 text-amber-400' : 'text-cream/70'}`}
              >
                <List size={18} />
              </Button>
            </div>
            
            {(searchQuery || categoryFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="text-amber-400"
              >
                <FilterX size={16} className="mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Upload Section */}
      <AnimatePresence>
        {uploadPreviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/30 border border-amber-600/20 p-6 rounded-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-amber-400">Upload New Media</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetForm}
                className="text-cream/70 hover:text-cream"
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="mb-6 space-y-4">
                  <Input
                    placeholder="Title (optional)"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="bg-charcoal/70 border-amber-600/30 text-cream"
                  />
                  
                  <Textarea
                    placeholder="Description (optional)"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    className="bg-charcoal/70 border-amber-600/30 text-cream resize-none"
                  />
                  
                  <div>
                    <label className="block text-amber-400 text-sm mb-2">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-charcoal/70 border border-amber-600/30 text-cream px-4 py-2 rounded-md focus:border-amber-400 focus:ring-amber-400"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-amber-400 text-sm mb-2">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTagAdd()}
                        className="bg-charcoal/70 border-amber-600/30 text-cream"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleTagAdd}
                        className="border-amber-600/30 text-amber-400"
                        disabled={!tagInput.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-amber-600/20 text-amber-400 px-3 py-1">
                          {tag}
                          <X 
                            size={14} 
                            className="ml-1 cursor-pointer" 
                            onClick={() => handleTagRemove(tag)} 
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="featured" 
                      checked={formFeatured} 
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="rounded border-amber-600/30 text-amber-600 focus:ring-amber-600"
                    />
                    <label htmlFor="featured" className="text-cream">Feature this item</label>
                  </div>
                </div>
                
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading} 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold"
                >
                  {uploading ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Upload to Gallery
                    </>
                  )}
                </Button>
              </div>
              
              <div>
                <label className="block text-amber-400 text-sm mb-2">Preview</label>
                <div className="grid grid-cols-2 gap-2">
                  {uploadPreviews.map((preview, index) => (
                    <div key={index} className="relative rounded-md overflow-hidden border border-amber-600/30 aspect-square">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 w-8 h-8 p-0 rounded-full"
                        onClick={() => {
                          const newFiles = [...uploadedFiles];
                          const newPreviews = [...uploadPreviews];
                          newFiles.splice(index, 1);
                          newPreviews.splice(index, 1);
                          setUploadedFiles(newFiles);
                          setUploadPreviews(newPreviews);
                          URL.revokeObjectURL(preview);
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                  
                  <button
                    className="border-2 border-dashed border-amber-600/30 rounded-md flex items-center justify-center text-amber-400 hover:border-amber-400 transition-colors aspect-square"
                    onClick={handleUploadClick}
                  >
                    <div className="text-center">
                      <Plus size={24} className="mx-auto mb-2" />
                      <span className="text-sm">Add More</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Gallery Grid/List View */}
      <div className={`bg-black/30 border border-amber-600/20 rounded-lg p-4 ${isLoading ? 'min-h-[400px]' : ''}`}>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(10).fill(0).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="w-full h-40 rounded-md bg-charcoal/70" />
                <Skeleton className="w-3/4 h-4 rounded bg-charcoal/70" />
                <Skeleton className="w-1/2 h-3 rounded bg-charcoal/70" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Info size={48} className="mx-auto mb-4 text-amber-400/50" />
            <h3 className="text-xl font-medium text-amber-400 mb-2">No Items Found</h3>
            <p className="text-cream/70 mb-4">
              {searchQuery || categoryFilter !== 'all' ? 
                'Try adjusting your search or filters to find more items.' : 
                'Your gallery is empty. Upload some images to get started.'}
            </p>
            <Button 
              variant="outline" 
              onClick={handleUploadClick}
              className="border-amber-600/30 text-amber-400"
            >
              <ImagePlus size={18} className="mr-2" />
              Add Media
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className={`relative rounded-md overflow-hidden border transition-all ${
                  selectedItems.includes(item.id) 
                    ? 'border-amber-400 ring-2 ring-amber-400/30' 
                    : 'border-amber-600/20 hover:border-amber-600/40'
                }`}
              >
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 p-0 bg-black/60 border-none text-cream hover:text-amber-400 hover:bg-black/80"
                    onClick={() => toggleItemSelection(item.id)}
                  >
                    {selectedItems.includes(item.id) ? (
                      <Check size={16} className="text-amber-400" />
                    ) : (
                      <Plus size={16} />
                    )}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 p-0 bg-black/60 border-none text-cream hover:text-amber-400 hover:bg-black/80"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-charcoal border-amber-600/30">
                      <DropdownMenuItem 
                        onClick={() => openItemDetail(item)}
                        className="text-cream hover:text-amber-400 cursor-pointer"
                      >
                        <Eye size={16} className="mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setCurrentItem(item);
                          setIsDetailOpen(true);
                          setIsEditing(true);
                          populateForm(item);
                        }}
                        className="text-cream hover:text-amber-400 cursor-pointer"
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-amber-600/20" />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="aspect-square cursor-pointer" onClick={() => openItemDetail(item)}>
                  {item.type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => e.currentTarget.pause()}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                          <Play size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.title || 'Gallery item'} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {item.featured && (
                      <Badge className="bg-purple-600 text-white text-xs px-1.5 py-0.5">
                        Featured
                      </Badge>
                    )}
                    <Badge className="bg-amber-600/80 text-black text-xs px-1.5 py-0.5">
                      {CATEGORY_LABELS[item.category as MediaCategory] || 'Uncategorized'}
                    </Badge>
                  </div>
                  
                  <h4 className="text-amber-400 font-medium truncate">
                    {item.title || 'Untitled'}
                  </h4>
                  <div className="flex items-center gap-1 text-cream/60 text-xs">
                    <Eye size={12} />
                    <span>{item.views || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 py-2 border-b border-amber-600/20 text-amber-400 font-medium px-2">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0} 
                  onChange={selectAllItems}
                  className="rounded border-amber-600/30 text-amber-600 focus:ring-amber-600"
                />
              </div>
              <div>Media</div>
              <div>Actions</div>
            </div>
            
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className={`grid grid-cols-[auto_1fr_auto] gap-4 py-3 px-2 rounded-md ${
                  selectedItems.includes(item.id) 
                    ? 'bg-amber-600/10 border border-amber-400/30' 
                    : 'hover:bg-black/40'
                }`}
              >
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(item.id)} 
                    onChange={() => toggleItemSelection(item.id)}
                    className="rounded border-amber-600/30 text-amber-600 focus:ring-amber-600"
                  />
                </div>
                
                <div className="flex gap-3">
                  <div 
                    className="w-12 h-12 rounded overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => openItemDetail(item)}
                  >
                    {item.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play size={16} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={item.url} 
                        alt={item.title || 'Gallery item'} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 
                        className="text-cream font-medium hover:text-amber-400 cursor-pointer"
                        onClick={() => openItemDetail(item)}
                      >
                        {item.title || 'Untitled'}
                      </h4>
                      
                      {item.featured && (
                        <Badge className="bg-purple-600 text-white text-xs px-1.5 py-0.5">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-cream/60 mt-1">
                      <span>{CATEGORY_LABELS[item.category as MediaCategory] || 'Uncategorized'}</span>
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{item.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{formatDate(item.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openItemDetail(item)}
                    className="h-8 w-8 text-cream hover:text-amber-400 hover:bg-amber-600/10"
                  >
                    <Eye size={16} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setCurrentItem(item);
                      setIsDetailOpen(true);
                      setIsEditing(true);
                      populateForm(item);
                    }}
                    className="h-8 w-8 text-cream hover:text-amber-400 hover:bg-amber-600/10"
                  >
                    <Edit size={16} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 text-cream hover:text-red-400 hover:bg-red-600/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Detail/Edit Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-charcoal border-amber-600/30 text-cream max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <div className="grid md:grid-cols-2 h-full">
            <div className="bg-black/50 flex items-center justify-center p-4">
              {currentItem?.type === 'video' ? (
                <video
                  src={currentItem?.url}
                  className="max-w-full max-h-[70vh] object-contain"
                  controls
                  autoPlay
                  loop
                />
              ) : (
                <img
                  src={currentItem?.url}
                  alt={currentItem?.title || 'Gallery item'}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              )}
            </div>
            
            <div className="p-6 relative max-h-[70vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-amber-400 text-2xl flex items-center justify-between">
                  {isEditing ? 'Edit Item' : 'Item Details'}
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-cream hover:text-amber-400"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                  )}
                </DialogTitle>
              </DialogHeader>
              
              <ScrollArea className="pr-4 pt-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-amber-400 text-sm mb-1">Title</label>
                      <Input
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="bg-charcoal/70 border-amber-600/30 text-cream"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-amber-400 text-sm mb-1">Description</label>
                      <Textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        rows={4}
                        className="bg-charcoal/70 border-amber-600/30 text-cream resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-amber-400 text-sm mb-1">Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-charcoal/70 border border-amber-600/30 text-cream px-4 py-2 rounded-md focus:border-amber-400 focus:ring-amber-400"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-amber-400 text-sm mb-1">Tags</label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Add a tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleTagAdd()}
                          className="bg-charcoal/70 border-amber-600/30 text-cream"
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleTagAdd}
                          className="border-amber-600/30 text-amber-400"
                          disabled={!tagInput.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formTags.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-amber-600/20 text-amber-400 px-3 py-1">
                            {tag}
                            <X 
                              size={14} 
                              className="ml-1 cursor-pointer" 
                              onClick={() => handleTagRemove(tag)} 
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="featured-edit" 
                        checked={formFeatured} 
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="rounded border-amber-600/30 text-amber-600 focus:ring-amber-600"
                      />
                      <label htmlFor="featured-edit" className="text-cream">Feature this item</label>
                    </div>
                    
                    <DialogFooter className="pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          populateForm(currentItem!);
                        }}
                        className="border-amber-600/30 text-amber-400"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUpdate}
                        className="bg-amber-600 hover:bg-amber-700 text-black"
                      >
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-medium text-amber-400 mb-1">
                        {currentItem?.title || 'Untitled'}
                      </h3>
                      <p className="text-cream/80">
                        {currentItem?.description || 'No description provided.'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-2 border-t border-b border-amber-600/20">
                      <div>
                        <div className="text-xs text-cream/60 mb-1">Category</div>
                        <div className="text-cream">
                          {CATEGORY_LABELS[currentItem?.category as MediaCategory] || 'Uncategorized'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-cream/60 mb-1">Media Type</div>
                        <div className="text-cream capitalize">
                          {currentItem?.type || 'Image'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-cream/60 mb-1">Uploaded</div>
                        <div className="text-cream">
                          {currentItem?.uploadedAt ? formatDate(currentItem.uploadedAt) : 'Unknown'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-cream/60 mb-1">Views</div>
                        <div className="text-cream">
                          {currentItem?.views || 0}
                        </div>
                      </div>
                    </div>
                    
                    {currentItem?.featured && (
                      <div className="flex items-center gap-2 text-purple-400 bg-purple-600/10 border border-purple-400/30 rounded-md p-2">
                        <Info size={16} />
                        <span>This item is featured</span>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-xs text-cream/60 mb-2">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {currentItem?.tags && currentItem.tags.length > 0 ? (
                          currentItem.tags.map(tag => (
                            <Badge key={tag} className="bg-amber-600/20 text-amber-400 px-3 py-1">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-cream/60 text-sm">No tags</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <div className="text-xs text-cream/60 mb-2">Direct URL</div>
                      <div className="flex gap-2">
                        <Input
                          value={currentItem?.url || ''}
                          readOnly
                          className="bg-charcoal/70 border-amber-600/30 text-cream"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            navigator.clipboard.writeText(currentItem?.url || '');
                            toast({
                              title: "URL copied",
                              description: "Image URL has been copied to clipboard",
                            });
                          }}
                          className="border-amber-600/30 text-amber-400"
                        >
                          <Copy size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    <DialogFooter className="pt-4">
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          handleDelete(currentItem?.id || '');
                        }}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete Item
                      </Button>
                      <Button 
                        onClick={() => window.open(currentItem?.url, '_blank')}
                        variant="outline"
                        className="border-amber-600/30 text-amber-400"
                      >
                        <Eye size={16} className="mr-2" />
                        View Full Size
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />
    </div>
  );
};

export default GalleryManager;
