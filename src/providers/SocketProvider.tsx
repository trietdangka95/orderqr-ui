"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCartStore } from '@/store/cartStore';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { userRole, selectedTable } = useCartStore();

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      transports: ['polling', 'websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);

      // Join rooms based on role/table
      if (userRole === 'admin' || userRole === 'staff') {
        socketInstance.emit('join', 'admin_staff');
      }
      if (userRole === 'kitchen' || userRole === 'admin') {
        socketInstance.emit('join', 'kitchen');
      }
      if (selectedTable) {
        socketInstance.emit('join', `table_${selectedTable}`);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    const handle = requestAnimationFrame(() => setSocket(socketInstance));

    return () => {
      cancelAnimationFrame(handle);
      socketInstance.disconnect();
    };
  }, [userRole, selectedTable]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
