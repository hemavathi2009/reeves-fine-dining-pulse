export type MediaType = 'image' | 'video';
export type MediaCategory = 'food' | 'interior' | 'events' | 'behind_scenes' | 'staff' | 'all';

export interface GalleryItem {
  id: string;
  url: string;
  type: MediaType;
  category: MediaCategory;
  tags?: string[];
  title?: string;
  description?: string;
  uploadedAt: any; // Firestore timestamp
  publishAt?: any; // Optional scheduled publishing
  featured?: boolean;
  views?: number;
  order?: number; // For manual ordering
}

export interface GalleryFilter {
  category: MediaCategory;
  searchQuery: string;
  sortBy: 'recent' | 'views' | 'type';
  sortDirection: 'asc' | 'desc';
}

export const CATEGORY_LABELS: Record<MediaCategory, string> = {
  all: 'All',
  food: 'Food',
  interior: 'Interior',
  events: 'Events',
  behind_scenes: 'Behind the Scenes',
  staff: 'Staff'
};
