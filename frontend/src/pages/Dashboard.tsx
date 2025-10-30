import React, { useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { AuthContext, IAuthContext } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { format } from 'date-fns' 
import { useSocket } from '../contexts/SocketContext'
import { Plus, Repeat, Ban, Trash2, CalendarPlus } from 'lucide-react'
import { toast } from 'react-hot-toast';

interface IEvent {
  _id: string; 
  title: string;
  startTime: string | null;
  endTime: string | null;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
}

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext) as IAuthContext
  const [events, setEvents] = useState<IEvent[]>([]) // Initial state is an empty array
  const [form, setForm] = useState({ title:'', startTime:'', endTime:'' })
  const { lastUpdate } = useSocket();

  const fetchEvents = async ()=> {
    try {
      const res = await api.get('/events')
      
      // --- FIX #1: DEFENSIVE STATE UPDATE ---
      // Ensure that res.data is an array before setting it.
      // If the API ever returns anything else, default to an empty array.
      if (Array.isArray(res.data)) {
        setEvents(res.data)
      } else {
        setEvents([]) // Default to empty array on weird response
      }

    } catch (e) { 
      console.error("Failed to fetch events:", e) 
      setEvents([]) // On error, always reset to an empty array
    }
  }

  useEffect(()=>{ fetchEvents() },[])

  useEffect(() => {
    if (lastUpdate > 0) {
      fetchEvents();
    }
  }, [lastUpdate]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startTime || !form.endTime) {
      toast.error("Please fill out all fields.");
      return;
    }
    try {
      await api.post('/events', form);
      setForm({ title: '', startTime: '', endTime: '' });
      fetchEvents();
      toast.success("Event created successfully!");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Create failed');
    }
  };

  const toggle = async (ev: IEvent) => {
    try {
      const newStatus = ev.status === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
      await api.put(`/events/${ev._id}`, { status: newStatus });
      fetchEvents(); 
    } catch (e:any) { 
      toast.error(e?.response?.data?.error || 'Update failed');
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`);
        fetchEvents();
        toast.success("Event deleted.");
      } catch (e: any) {
        toast.error(e?.response?.data?.error || 'Delete failed');
      }
    }
  };

  // (Helper functions are correct)
  const formatEventDate = (dateStr: string | null) => {
    if (!dateStr) return "No start time";
    try { return format(new Date(dateStr), 'PPp'); } 
    catch (error) { return "Invalid Date"; }
  };
  const formatEventTime = (dateStr: string | null) => {
    if (!dateStr) return "No end time";
    try { return format(new Date(dateStr), 'p'); } 
    catch (error) { return ""; }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div className="lg:col-span-1">
        <form onSubmit={create} className="bg-card p-6 rounded-lg border shadow-sm space-y-4 sticky top-24">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Create New Event
          </h3>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">Title</label>
            <Input id="title" placeholder="Team Meeting" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="start-time">Start</label>
            <Input id="start-time" type="datetime-local" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="end-time">End</label>
            <Input id="end-time" type="datetime-local" value={form.endTime} onChange={e=>setForm({...form, endTime:e.target.value})} />
          </div>
          <Button type="submit" className="w-full flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-card p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Your Events</h3>
        <ul className="space-y-4">
          
          {/* --- FIX #2: DEFENSIVE RENDER ---
              Add 'Array.isArray(events)' to ensure .map() is only
              called on an actual array.
          */}
          {Array.isArray(events) && events.length > 0 ? (
            events.map(ev => (
              <li key={ev._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border rounded-lg transition-colors hover:bg-accent">
                <div>
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatEventDate(ev.startTime)} - {formatEventTime(ev.endTime)}
                  </div>
                  <div className="text-sm mt-1">Status: 
                    <span className={`ml-1 font-bold ${ev.status === 'SWAPPABLE' ? 'text-primary' : ev.status === 'SWAP_PENDING' ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                      {ev.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 flex gap-2">
                  <Button 
                    variant={ev.status === 'BUSY' ? 'outline' : 'secondary'} 
                    size="sm" 
                    onClick={() => toggle(ev)}
                    className="flex items-center gap-1.5"
                  >
                    {ev.status === 'BUSY' && <><Repeat className="h-4 w-4" /> Make Swappable</>}
                    {ev.status === 'SWAPPABLE' && <><Ban className="h-4 w-4" /> Make Busy</>}
                    {ev.status === 'SWAP_PENDING' && <><Ban className="h-4 w-4" /> Cancel Swap</>}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteEvent(ev._id)}
                    className="flex items-center gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </li>
            ))
          ) : (
            <p className="py-4 text-center text-muted-foreground">You have no events. Create one to get started!</p>
          )}

        </ul>
      </div>
    </div>
  )
}

export default Dashboard
