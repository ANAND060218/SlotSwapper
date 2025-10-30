import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { AuthContext, IAuthContext } from './AuthContext';
import { toast } from 'react-hot-toast'; // <-- IMPORTED TOAST

interface ISocketContext {
  socket: Socket | null;
  notifications: string[];
  hasUnread: boolean;
  lastUpdate: number;
  clearUnread: () => void;
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === null) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);
  const { user } = useContext(AuthContext) as IAuthContext;

  const clearUnread = () => {
    setHasUnread(false);
  };

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      newSocket.emit('join_room', user._id);
      setSocket(newSocket);

      const handleNewNotification = (data: { message: string }) => {
        setNotifications(prev => [data.message, ...prev.slice(0, 4)]);
        setHasUnread(true);
        setLastUpdate(Date.now());
        toast.success(data.message); // <-- SHOWS TOAST ON EVENT
      };

      newSocket.on('new_request', handleNewNotification);
      newSocket.on('request_response', handleNewNotification);

      return () => {
        newSocket.off('new_request', handleNewNotification);
        newSocket.off('request_response', handleNewNotification);
        newSocket.disconnect();
      };
    } else {
      socket?.disconnect();
      setSocket(null);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, notifications, hasUnread, lastUpdate, clearUnread }}>
      {children}
    </SocketContext.Provider>
  );
};