import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface QueueUpdate {
  appointmentId: string;
  position: number;
  estimatedWait: number;
  status: string;
}

interface SlotUpdate {
  doctorId: string;
  date: string;
  slots: Array<{ time: string; available: boolean }>;
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [queueUpdate, setQueueUpdate] = useState<QueueUpdate | null>(null);
  const [slotUpdate, setSlotUpdate] = useState<SlotUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
    });
    socketRef.current = newSocket;
    // Defer setState to satisfy react-hooks/set-state-in-effect
    queueMicrotask(() => setSocket(newSocket));

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('queue:update', (data: QueueUpdate) => {
      setQueueUpdate(data);
    });

    newSocket.on('queue-update', (data: any) => {
      const appointmentId = data?.appointmentId || data?.queueItem?.appointmentId || '';
      setQueueUpdate({
        appointmentId,
        position: data?.queueItem?.position ?? 0,
        estimatedWait: data?.queueItem?.estimatedWait ?? 0,
        status: data?.queueItem?.status ?? '',
      });
    });

    newSocket.on('slot:update', (data: SlotUpdate) => {
      setSlotUpdate(data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = (room: string) => {
    socketRef.current?.emit('join:room', room);
  };

  const leaveRoom = (room: string) => {
    socketRef.current?.emit('leave:room', room);
  };

  return { isConnected, queueUpdate, slotUpdate, joinRoom, leaveRoom, socket };
};
