import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { BASE_URL, notificationApi, authApi } from '../services/api';
import { useAuth } from './AuthContext';

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
  refreshNotifications: () => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  markAsRead: () => { },
  clearNotifications: () => { },
  refreshNotifications: () => { },
  activeChatId: null,
  setActiveChatId: () => { },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  // Use refs to access latest values in socket listeners without re-binding
  const currentUserRef = useRef(currentUser);
  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const fetchInitialNotifications = async () => {
    try {
      const response = await notificationApi.getAll();
      const mapped = response.notifications.map((n: any) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ago: formatAgo(n.createdAt),
        status: n.status,
      }));
      setNotifications(mapped);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchInitialNotifications();
    }
  }, [currentUser]);

  useEffect(() => {
    fetchInitialNotifications();

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

    socketInstance.on('new-message', (msg: any) => {
      console.log('Received new-message:', msg);
      const currentU = currentUserRef.current;

      const isFromMe = currentU ? String(msg.sender._id) === String(currentU._id) : false;
      const isCommunity = !msg.receiver;
      const contactId = isCommunity ? "community" : String(msg.sender._id);

      // Don't notify if message is from me or for the currently active chat
      if (isFromMe || String(contactId) === String(activeChatIdRef.current)) return;

      const newNotification: Notification = {
        id: msg._id || Date.now().toString(),
        title: `New Message from ${msg.sender.firstname}`,
        message: msg.message,
        type: 'chat',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ago: 'Just now',
        status: 'unread',
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Show toast notification
      toast(`${msg.sender.firstname}: ${msg.message}`, {
        icon: '💬',
        position: 'top-right',
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#202224',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #5678E9',
          padding: '16px',
        }
      });

      // Play sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
        audio.play().catch(() => { });
      } catch (e) { }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const clearNotifications = async () => {
    try {
      await notificationApi.clearAll();
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      notifications,
      markAsRead,
      clearNotifications,
      refreshNotifications: fetchInitialNotifications,
      activeChatId,
      setActiveChatId
    }}>
      {children}
    </SocketContext.Provider>
  );
};

function formatAgo(date: string) {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${diffInDays}d ago`;
}
