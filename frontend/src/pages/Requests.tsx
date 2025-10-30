import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Button } from '../components/ui/Button'
import { format } from 'date-fns' 
import { useSocket } from '../contexts/SocketContext'
import { Check, X, Ban } from 'lucide-react'
import { toast } from 'react-hot-toast';

interface ISlotStub {
  _id: string;
  title: string;
  startTime: string | null; 
}
interface IUserStub {
  name: string;
}
interface IRequest {
  _id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requesterId: IUserStub;
  requesterSlotId: ISlotStub;
  targetSlotId: ISlotStub;
  targetUserId: IUserStub;
}

const formatEventDate = (dateStr: string | null) => {
  if (!dateStr) return "No start time";
  try { return format(new Date(dateStr), 'PPp'); } 
  catch (error) { return "Invalid Date"; }
};


const Requests: React.FC = () => {
  const [incoming, setIncoming] = useState<IRequest[]>([])
  const [outgoing, setOutgoing] = useState<IRequest[]>([])
  const { lastUpdate, socket } = useSocket();

  const fetchAll = async () => {
    try {
      const res = await api.get('/swap-requests')
      
      // --- FIX #1: DEFENSIVE STATE UPDATES ---
      setIncoming(Array.isArray(res.data.incoming) ? res.data.incoming : [])
      setOutgoing(Array.isArray(res.data.outgoing) ? res.data.outgoing : [])

    } catch (e) { 
      console.error(e) 
      // On error, reset all to empty arrays
      setIncoming([])
      setOutgoing([])
    }
  }

  useEffect(()=>{ 
    fetchAll() 
  },[])

  useEffect(() => {
    if (socket) {
      const handleRefresh = () => fetchAll();
      socket.on('new_request', handleRefresh);
      socket.on('request_response', handleRefresh);

      return () => {
        socket.off('new_request', handleRefresh);
        socket.off('request_response', handleRefresh);
      };
    }
  }, [socket, lastUpdate]);

  const respond = async (id:string, accept:boolean) => {
    try {
      await api.post(`/swap-response/${id}`, { accept })
      fetchAll()
    } catch (err:any) { 
      toast.error(err?.response?.data?.error || 'Action failed');
    }
  }

  const abortRequest = async (mySlotId: string) => {
    if (window.confirm('Are you sure you want to abort this swap request?')) {
      try {
        await api.put(`/events/${mySlotId}`, { status: 'BUSY' });
        fetchAll();
        toast.success("Request aborted.");
      } catch (err: any) {
        toast.error(err?.response?.data?.error || 'Failed to abort request');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Incoming Requests</h3>
        <ul className="space-y-4">

          {/* --- FIX #2: DEFENSIVE RENDER --- */}
          {Array.isArray(incoming) && incoming.length > 0 ? (
            incoming.map(i=> (
              <li key={i._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border rounded-lg transition-colors hover:bg-accent">
                <div>
                  <div className="font-medium">{i.requesterId.name} requests:</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium text-destructive">Their Slot:</span> {i.requesterSlotId.title}
                    <br/>
                    <span className="font-medium text-primary">Your Slot:</span> {i.targetSlotId.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ({formatEventDate(i.requesterSlotId.startTime)})
                  </div>
                </div>
                {i.status === 'PENDING' ? (
                  <div className="flex gap-2 mt-3 sm:mt-0 flex-shrink-0">
                    <Button size="sm" onClick={()=>respond(i._id, true)} className="flex items-center gap-1.5">
                      <Check className="h-4 w-4" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={()=>respond(i._id, false)} className="flex items-center gap-1.5">
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground mt-2 sm:mt-0 capitalize">{i.status.toLowerCase()}</span>
                )}
              </li>
            ))
          ) : (
             <p className="py-4 text-center text-muted-foreground text-sm">You have no incoming swap requests.</p>
          )}
        </ul>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Outgoing Requests</h3>
        <ul className="space-y-4">

          {/* --- FIX #2: DEFENSIVE RENDER --- */}
          {Array.isArray(outgoing) && outgoing.length > 0 ? (
            outgoing.map(o=> (
              <li key={o._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border rounded-lg transition-colors hover:bg-accent">
                <div>
                  <div className="font-medium">To: {o.targetUserId.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium text-primary">Your Slot:</span> {o.requesterSlotId.title}
                    <br/>
                    <span className="font-medium text-destructive">Their Slot:</span> {o.targetSlotId.title}
                  </div>
                  <div className="text-sm mt-2">Status: <span className="font-semibold text-muted-foreground capitalize">{o.status.toLowerCase()}</span></div>
                </div>
                
                {o.status === 'PENDING' && (
                  <div className="mt-3 sm:mt-0">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => abortRequest(o.requesterSlotId._id)}
                      className="flex items-center gap-1.5"
                    >
                      <Ban className="h-4 w-4" />
                      Abort
                    </Button>
                  </div>
                )}
              </li>
            ))
          ) : (
             <p className="py-4 text-center text-muted-foreground text-sm">You have not sent any swap requests.</p>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Requests
