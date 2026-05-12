import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { BASE_URL } from '../services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  time: string;
  ago: string;
  status: 'read' | 'unread';
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  markAsRead: () => {},
  clearNotifications: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const socketInstance = io(BASE_URL, {
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    socketInstance.on('notification', (data: { title: string; message: string; type: string }) => {
      console.log('Received notification:', data);
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: data.title,
        message: data.message,
        type: data.type,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ago: 'Just now',
        status: 'unread',
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Show toast notification
      if (data.type === 'success') {
        toast.success(`${data.title}: ${data.message}`);
      } else if (data.type === 'error') {
        toast.error(`${data.title}: ${data.message}`);
      } else {
        toast(`${data.title}: ${data.message}`, {
            icon: '🔔',
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, notifications, markAsRead, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
