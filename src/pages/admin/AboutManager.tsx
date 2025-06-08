import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Award, Clock, Users, Heart, PenTool, Save, Plus, Trash2, 
  Info, MessageCircle, ImagePlus, Upload, RefreshCw, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Define interfaces for data types
interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  image: string;
  bio: string;
  featured?: boolean;
}

interface Value {
  id: string;
  icon: string;
  title: string;
  description: string;
}

// Icon options for values
const iconOptions = [
  { value: "Award", label: "Award" },
  { value: "Clock", label: "Clock" },
  { value: "Users", label: "Users" },
  { value: "Heart", label: "Heart" },
];

const AboutManager = () => {
  // State for different content sections
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [values, setValues] = useState<Value[]>([]);
  const [achievements, setAchievements] = useState<Value[]>([]);
  
  // State for adding/editing items
  const [editingTimeline, setEditingTimeline] = useState<TimelineEvent | null>(null);
  const [editingTeam, setEditingTeam] = useState<TeamMember | null>(null);
  const [editingValue, setEditingValue] = useState<Value | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Value | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch timeline events
        const timelineSnapshot = await getDocs(collection(db, 'timeline'));
        const timelineData = timelineSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TimelineEvent[];
        setTimeline(timelineData);
        
        // Fetch team members
        const teamSnapshot = await getDocs(collection(db, 'team'));
        const teamData = teamSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamMember[];
        setTeam(teamData);
        
        // Fetch values
        const valuesSnapshot = await getDocs(collection(db, 'values'));
        const valuesData = valuesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Value[];
        setValues(valuesData);
        
        // Fetch achievements
        const achievementsSnapshot = await getDocs(collection(db, 'achievements'));
        const achievementsData = achievementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Value[];
        setAchievements(achievementsData);
        
      } catch (error) {
        console.error("Error fetching about page data:", error);
        toast.error("Failed to load about page content");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Add or update timeline event
  const saveTimelineEvent = async (event: TimelineEvent) => {
    try {
      setSaving(true);
      if (event.id) {
        // Update existing event - convert to Firebase-compatible object
        const eventData = convertToFirebaseObject(event);
        await updateDoc(doc(db, 'timeline', event.id), eventData);
        setTimeline(prev => prev.map(item => item.id === event.id ? event : item));
        toast.success("Timeline event updated");
      } else {
        // Add new event
        const docRef = await addDoc(collection(db, 'timeline'), event);
        setTimeline(prev => [...prev, { ...event, id: docRef.id }]);
        toast.success("Timeline event added");
      }
      setEditingTimeline(null);
    } catch (error) {
      console.error("Error saving timeline event:", error);
      toast.error("Failed to save timeline event");
    } finally {
      setSaving(false);
    }
  };

  // Delete timeline event
  const deleteTimelineEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this timeline event?")) return;
    
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'timeline', id));
      setTimeline(prev => prev.filter(item => item.id !== id));
      toast.success("Timeline event deleted");
    } catch (error) {
      console.error("Error deleting timeline event:", error);
      toast.error("Failed to delete timeline event");
    } finally {
      setSaving(false);
    }
  };

  // Add or update team member
  const saveTeamMember = async (member: TeamMember) => {
    try {
      setSaving(true);
      if (member.id) {
        // Update existing member - convert to Firebase-compatible object
        const memberData = convertToFirebaseObject(member);
        await updateDoc(doc(db, 'team', member.id), memberData);
        setTeam(prev => prev.map(item => item.id === member.id ? member : item));
        toast.success("Team member updated");
      } else {
        // Add new member
        const docRef = await addDoc(collection(db, 'team'), member);
        setTeam(prev => [...prev, { ...member, id: docRef.id }]);
        toast.success("Team member added");
      }
      setEditingTeam(null);
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("Failed to save team member");
    } finally {
      setSaving(false);
    }
  };

  // Delete team member
  const deleteTeamMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'team', id));
      setTeam(prev => prev.filter(item => item.id !== id));
      toast.success("Team member deleted");
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member");
    } finally {
      setSaving(false);
    }
  };

  // Add or update value
  const saveValue = async (value: Value) => {
    try {
      setSaving(true);
      if (value.id) {
        // Update existing value - convert to Firebase-compatible object
        const valueData = convertToFirebaseObject(value);
        await updateDoc(doc(db, 'values', value.id), valueData);
        setValues(prev => prev.map(item => item.id === value.id ? value : item));
        toast.success("Core value updated");
      } else {
        // Add new value
        const docRef = await addDoc(collection(db, 'values'), value);
        setValues(prev => [...prev, { ...value, id: docRef.id }]);
        toast.success("Core value added");
      }
      setEditingValue(null);
    } catch (error) {
      console.error("Error saving core value:", error);
      toast.error("Failed to save core value");
    } finally {
      setSaving(false);
    }
  };

  // Delete value
  const deleteValue = async (id: string) => {
    if (!confirm("Are you sure you want to delete this core value?")) return;
    
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'values', id));
      setValues(prev => prev.filter(item => item.id !== id));
      toast.success("Core value deleted");
    } catch (error) {
      console.error("Error deleting core value:", error);
      toast.error("Failed to delete core value");
    } finally {
      setSaving(false);
    }
  };

  // Add or update achievement
  const saveAchievement = async (achievement: Value) => {
    try {
      setSaving(true);
      if (achievement.id) {
        // Update existing achievement - convert to Firebase-compatible object
        const achievementData = convertToFirebaseObject(achievement);
        await updateDoc(doc(db, 'achievements', achievement.id), achievementData);
        setAchievements(prev => prev.map(item => item.id === achievement.id ? achievement : item));
        toast.success("Achievement updated");
      } else {
        // Add new achievement
        const docRef = await addDoc(collection(db, 'achievements'), achievement);
        setAchievements(prev => [...prev, { ...achievement, id: docRef.id }]);
        toast.success("Achievement added");
      }
      setEditingAchievement(null);
    } catch (error) {
      console.error("Error saving achievement:", error);
      toast.error("Failed to save achievement");
    } finally {
      setSaving(false);
    }
  };

  // Delete achievement
  const deleteAchievement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'achievements', id));
      setAchievements(prev => prev.filter(item => item.id !== id));
      toast.success("Achievement deleted");
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast.error("Failed to delete achievement");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-400 rounded-full animate-spin mb-4"></div>
          <p className="text-amber-400">Loading about page content...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-amber-400 mb-2">About Page Management</h2>
        <p className="text-cream/70">
          Edit the content that appears on the About page.
        </p>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="bg-black/50 border border-amber-600/20 mb-8">
          <TabsTrigger value="timeline" className="data-[state=active]:bg-amber-600 data-[state=active]:text-black">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-amber-600 data-[state=active]:text-black">
            Team
          </TabsTrigger>
          <TabsTrigger value="values" className="data-[state=active]:bg-amber-600 data-[state=active]:text-black">
            Values
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-amber-600 data-[state=active]:text-black">
            Achievements
          </TabsTrigger>
        </TabsList>

        {/* Timeline Management */}
        <TabsContent value="timeline">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-2xl font-serif font-semibold text-amber-400">Our Journey Timeline</h3>
            <Button 
              onClick={() => setEditingTimeline({ id: '', year: '', title: '', description: '' })}
              className="bg-amber-600 hover:bg-amber-700 text-black"
            >
              <Plus size={16} className="mr-2" /> Add Event
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timeline.map(event => (
              <Card key={event.id} className="bg-black/40 border-amber-600/30">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge className="bg-amber-600/20 text-amber-400 border-amber-400/30">
                      {event.year}
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-amber-400"
                        onClick={() => setEditingTimeline(event)}
                      >
                        <PenTool size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-400"
                        onClick={() => deleteTimelineEvent(event.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-amber-400">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-cream/80 text-sm">{event.description}</p>
                  {event.image && (
                    <div className="mt-4 relative overflow-hidden rounded-md h-32">
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Timeline Event Editor */}
          {editingTimeline && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-charcoal border border-amber-600/40 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-2xl font-serif font-bold text-amber-400 mb-6">
                  {editingTimeline.id ? 'Edit Timeline Event' : 'Add Timeline Event'}
                </h3>
                
                <form onSubmit={e => {
                  e.preventDefault();
                  saveTimelineEvent(editingTimeline);
                }}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-amber-400 mb-1">Year</label>
                        <Input 
                          value={editingTimeline.year}
                          onChange={e => setEditingTimeline({...editingTimeline, year: e.target.value})}
                          className="bg-black/40 border-amber-600/30 text-cream"
                          placeholder="e.g. 2018"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-400 mb-1">Title</label>
                        <Input 
                          value={editingTimeline.title}
                          onChange={e => setEditingTimeline({...editingTimeline, title: e.target.value})}
                          className="bg-black/40 border-amber-600/30 text-cream"
                          placeholder="Event title"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-400 mb-1">Description</label>
                      <Textarea 
                        value={editingTimeline.description}
                        onChange={e => setEditingTimeline({...editingTimeline, description: e.target.value})}
                        className="bg-black/40 border-amber-600/30 text-cream min-h-[100px]"
                        placeholder="Event description"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-400 mb-1">Image URL</label>
                      <Input 
                        value={editingTimeline.image || ''}
                        onChange={e => setEditingTimeline({...editingTimeline, image: e.target.value})}
                        className="bg-black/40 border-amber-600/30 text-cream"
                        placeholder="https://example.com/image.jpg"
                      />
                      {editingTimeline.image && (
                        <div className="mt-2 relative overflow-hidden rounded-md h-32">
                          <img 
                            src={editingTimeline.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setEditingTimeline(null)}
                      className="border-amber-600/30 text-amber-400"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-amber-600 hover:bg-amber-700 text-black"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" /> Save
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-2xl font-serif font-semibold text-amber-400">Our Team</h3>
            <Button 
              onClick={() => setEditingTeam({ id: '', name: '', position: '', image: '', bio: '' })}
              className="bg-amber-600 hover:bg-amber-700 text-black"
            >
              <Plus size={16} className="mr-2" /> Add Team Member
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map(member => (
              <Card key={member.id} className="bg-black/40 border-amber-600/30">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      {member.featured && (
                        <Badge className="bg-amber-600/20 text-amber-400 border-amber-400/30 mb-2">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-amber-400"
                        onClick={() => setEditingTeam(member)}
                      >
                        <PenTool size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-400"
                        onClick={() => deleteTeamMember(member.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative overflow-hidden rounded-md h-60 mb-4">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="text-xl font-serif font-semibold text-amber-400">{member.name}</h4>
                      <p className="text-amber-300/80 text-sm">{member.position}</p>
                    </div>
                  </div>
                  <p className="text-cream/80 text-sm line-clamp-3">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Team Member Editor */}
          {editingTeam && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-charcoal border border-amber-600/40 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-2xl font-serif font-bold text-amber-400 mb-6">
                  {editingTeam.id ? 'Edit Team Member' : 'Add Team Member'}
                </h3>
                
                <form onSubmit={e => {
                  e.preventDefault();
                  saveTeamMember(editingTeam);
                }}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-amber-400 mb-1">Name</label>
                        <Input 
                          value={editingTeam.name}
                          onChange={e => setEditingTeam({...editingTeam, name: e.target.value})}
                          className="bg-black/40 border-amber-600/30 text-cream"
                          placeholder="Full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-amber-400 mb-1">Position</label>
                        <Input 
                          value={editingTeam.position}
                          onChange={e => setEditingTeam({...editingTeam, position: e.target.value})}
                          className="bg-black/40 border-amber-600/30 text-cream"
                          placeholder="Job title"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-400 mb-1">Bio</label>
                      <Textarea 
                        value={editingTeam.bio}
                        onChange={e => setEditingTeam({...editingTeam, bio: e.target.value})}
                        className="bg-black/40 border-amber-600/30 text-cream min-h-[100px]"
                        placeholder="Brief biography"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-400 mb-1">Image URL</label>
                      <Input 
                        value={editingTeam.image}
                        onChange={e => setEditingTeam({...editingTeam, image: e.target.value})}
                        className="bg-black/40 border-amber-600/30 text-cream"
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                      {editingTeam.image && (
                        <div className="mt-2 relative overflow-hidden rounded-md h-32">
                          <img 
                            src={editingTeam.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/300x400?text=Image+Error";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="featured" 
                        checked={editingTeam.featured || false}
                        onChange={e => setEditingTeam({...editingTeam, featured: e.target.checked})}
                        className="w-4 h-4 rounded border-amber-600/30 bg-black/40 text-amber-600 focus:ring-amber-500"
                      />
                      <label htmlFor="featured" className="text-sm font-medium text-amber-400">
                        Featured team member (displayed prominently)
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setEditingTeam(null)}
                      className="border-amber-600/30 text-amber-400"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-amber-600 hover:bg-amber-700 text-black"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" /> Save
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </TabsContent>

        {/* Values Management */}
        <TabsContent value="values">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-2xl font-serif font-semibold text-amber-400">Our Core Values</h3>
            <Button 
              onClick={() => setEditingValue({ id: '', icon: 'Heart', title: '', description: '' })}
              className="bg-amber-600 hover:bg-amber-700 text-black"
            >
              <Plus size={16} className="mr-2" /> Add Value
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(value => {
              const IconComponent = {
                'Award': Award,
                'Clock': Clock,
                'Users': Users,
                'Heart': Heart
              }[value.icon] || Heart;

              return (
                <Card key={value.id} className="bg-black/40 border-amber-600/30">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700">
                        <IconComponent className="text-black" size={24} />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-amber-400"
                          onClick={() => setEditingValue(value)}
                        >
                          <PenTool size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-400"
                          onClick={() => deleteValue(value.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-amber-400 mt-3">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-cream/80 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Value Editor */}
          {editingValue && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-charcoal border border-amber-600/40 rounded-xl p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-2xl font-serif font-bold text-amber-400 mb-6">
                  {editingValue.id ? 'Edit Core Value' : 'Add Core Value'}
                </h3>
                
                <form onSubmit={e => {
                  e.preventDefault();
                  saveValue(editingValue);
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-400 mb-1">Icon</label>
                      <select 
                        value={editingValue.icon}
                        onChange={e => setEditingValue({...editingValue, icon: e.target.value})}
                        className="w-full bg-black/40 border border-amber-600/30 rounded text-cream p-2"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon.value} value={icon.value}>{icon.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-400 mb-1">Title</label>
                      <Input 
                        value={editingValue.title}
                        onChange={e => setEditingValue({...editingValue, title: e.target.value})}
                        className="bg-black/40 border-amber-600/30 text-cream"
                        placeholder="Value title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-400 mb-1">Description</label>
                      <Textarea 
                        value={editingValue.description}
                        onChange={e => setEditingValue({...editingValue, description: e.target.value})}
                        className="bg-black/40 border-amber-600/30 text-cream min-h-[100px]"
                        placeholder="Value description"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setEditingValue(null)}
                      className="border-amber-600/30 text-amber-400"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-amber-600 hover:bg-amber-700 text-black"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" /> Save
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </TabsContent>

        {/* Achievements Management */}
        <TabsContent value="achievements">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-2xl font-serif font-semibold text-amber-400">Our Achievements</h3>
            <Button 
              onClick={() => setEditingAchievement({ id: '', icon: 'Award', title: '', description: '' })}
              className="bg-amber-600 hover:bg-amber-700 text-black"
            >
              <Plus size={16} className="mr-2" /> Add Achievement
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map(achievement => {
              const IconComponent = {
                'Award': Award,
                'Clock': Clock,
                'Users': Users,
                'Heart': Heart
              }[achievement.icon] || Award;

              return (
                <Card key={achievement.id} className="bg-black/40 border-amber-600/30">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-yellow-500">
                        <IconComponent className="text-black" size={24} />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-amber-400"
                          onClick={() => setEditingAchievement(achievement)}
                        >
                          <PenTool size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-400"
                          onClick={() => deleteAchievement(achievement.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-amber-400 mt-3">{achievement.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-cream/80 text-sm">{achievement.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Achievement Editor */}
          {editingAchievement && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-charcoal border border-amber-600/40 rounded-xl p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-2xl font-serif font-bold text-amber-400 mb-6">
                  {editingAchievement.id ? 'Edit Achievement' : 'Add Achievement'}
                </h3>
                
                <form onSubmit={e => {
                  e.preventDefault();
                  saveAchievement(editingAchievement);
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-400 mb-1">Icon</label>
                      <select 
                        value={editingAchievement.icon}
                        onChange={e => setEditingAchievement({...editingAchievement, icon: e.target.value})}
                        className="w-full bg-black/40 border border-amber-600/30 rounded text-cream p-2"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon.value} value={icon.value}>{icon.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-400 mb-1">Title</label>
                      <Input 
                        value={editingAchievement.title}
                        onChange={e => setEditingAchievement({...editingAchievement, title: e.target.value})}
                        className="bg-black/40 border-amber-600/30 text-cream"
                        placeholder="Achievement title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-400 mb-1">Description</label>
                      <Textarea 
                        value={editingAchievement.description}
                        onChange={e => setEditingAchievement({...editingAchievement, description: e.target.value})}
                        className="bg-black/40 border-amber-600/30 text-cream min-h-[100px]"
                        placeholder="Achievement description"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setEditingAchievement(null)}
                      className="border-amber-600/30 text-amber-400"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-amber-600 hover:bg-amber-700 text-black"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" /> Save
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AboutManager;

// Add this helper function at the top level of your component
function convertToFirebaseObject<T extends object>(obj: T): { [key: string]: any } {
  // Create a plain JavaScript object with no prototype
  const result: { [key: string]: any } = {};
  
  // Copy all enumerable properties
  Object.keys(obj).forEach(key => {
    if (key !== 'id') { // Skip the id field
      result[key] = obj[key as keyof T];
    }
  });
  
  return result;
}
