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
  const { userRole, selectedTable, storeConfig } = useCartStore();

  useEffect(() => {
    if (!storeConfig?.id) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      transports: ['polling', 'websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);

      // Join store room
      socketInstance.emit('join', `store_${storeConfig.id}`);
      // Join table room if already selected
      if (selectedTable) {
        socketInstance.emit('join', `store_${storeConfig.id}_table_${selectedTable}`);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [storeConfig?.id]);

  // Join table room reactively when table or connection state changes, without disconnecting
  useEffect(() => {
    if (socket && isConnected && storeConfig?.id && selectedTable) {
      socket.emit('join', `store_${storeConfig.id}_table_${selectedTable}`);
    }
  }, [socket, isConnected, selectedTable, storeConfig?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
