import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Button } from '../components/ui/Button'
import { format } from 'date-fns' 
import { toast } from 'react-hot-toast';

interface ISwappableSlot {
  _id: string;
  title: string;
  startTime: string | null;
  owner_name?: string; 
  userId: { name: string, email: string }; 
}

interface IMySlot {
  _id: string;
  title: string;
  startTime: string | null;
  status: string;
}

const Marketplace: React.FC = () => {
  const [slots, setSlots] = useState<ISwappableSlot[]>([])
  const [mySwappable, setMySwappable] = useState<IMySlot[]>([])
  const [selectedTheir, setSelectedTheir] = useState<string | null>(null)
  const [selectedMy, setSelectedMy] = useState<string | null>(null)

  const fetchAll = async () => {
    try {
      const res = await api.get('/swappable-slots')
      const mine = await api.get('/events')
      
      // --- FIX #1: DEFENSIVE STATE UPDATES ---
      setSlots(Array.isArray(res.data) ? res.data : [])
      
      const mySwappableSlots = Array.isArray(mine.data) ? mine.data.filter((e:IMySlot)=>e.status==='SWAPPABLE') : []
      setMySwappable(mySwappableSlots)

    } catch (e) { 
      console.error(e) 
      // On error, reset all to empty arrays
      setSlots([])
      setMySwappable([])
    }
  }

  useEffect(()=>{ fetchAll() },[])

  const requestSwap = async () => {
    if (!selectedMy || !selectedTheir) {
      return toast.error('Please select one of your slots and one target slot');
    }
    try {
      await api.post('/swap-request', { mySlotId: selectedMy, theirSlotId: selectedTheir })
      toast.success('Swap request sent!');
      setSelectedMy(null)
      setSelectedTheir(null)
      fetchAll() 
    } catch (err:any) { 
      toast.error(err?.response?.data?.error || 'Request failed');
    }
  }

  const formatEventDate = (dateStr: string | null) => {
    if (!dateStr) return "No start time";
    try { return format(new Date(dateStr), 'PPp'); } 
    catch (error) { return "Invalid Date"; }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Available Slots</h3>
        <ul className="space-y-3">
          
          {/* --- FIX #2: DEFENSIVE RENDER --- */}
          {Array.isArray(slots) && slots.length > 0 ? (
            slots.map(s => (
              <li key={s._id} className="p-3 border rounded-lg has-[:checked]:bg-accent has-[:checked]:border-primary transition-colors hover:bg-accent">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="their_slot"
                    checked={selectedTheir === s._id} 
                    onChange={()=>setSelectedTheir(s._id)} 
                  />
                  <div>
                    <div className="font-medium">{s.title} — <span className="text-sm text-muted-foreground">{s.owner_name || s.userId.name}</span></div>
                    <div className="text-xs text-muted-foreground">
                      {formatEventDate(s.startTime)}
                    </div>
                  </div>
                </label>
              </li>
            ))
          ) : (
             <p className="py-4 text-center text-muted-foreground text-sm">No swappable slots available right now.</p>
          )}
        </ul>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Your Swappable Slots</h3>
        <ul className="space-y-3">

          {/* --- FIX #2: DEFENSIVE RENDER --- */}
          {Array.isArray(mySwappable) && mySwappable.length > 0 ? (
            mySwappable.map(s=> (
              <li key={s._id} className="p-3 border rounded-lg has-[:checked]:bg-accent has-[:checked]:border-primary transition-colors hover:bg-accent">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="my_slot"
                    checked={selectedMy === s._id} 
                    onChange={()=>setSelectedMy(s._id)} 
                  />
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatEventDate(s.startTime)}
                    </div>
                  </div>
                </label>
              </li>
            ))
          ) : (
             <p className="py-4 text-center text-muted-foreground text-sm">You have no slots marked as "swappable".</p>
          )}
        </ul>
        <Button 
          className="mt-6 w-full" 
          onClick={requestSwap}
          disabled={!selectedMy || !selectedTheir}
        >
          Request Swap
        </Button>
      </div>
    </div>
  )
}

export default Marketplace
