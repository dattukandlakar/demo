// service/socketService.ts

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://social-backend-y1rg.onrender.com'; // Replace with your actual backend URL

class SocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;

  connect(token: string): void {
    if (this.socket?.connected && this.currentToken === token) {
      console.log('Socket already connected with the same token');
      return;
    }

    if (!token) {
      console.log('Socket connection aborted: No auth token.');
      return;
    }

    // Disconnect existing socket if it exists
    if (this.socket) {
      this.socket.disconnect();
    }

    console.log('Attempting to connect to socket server...');
    this.currentToken = token;
    this.socket = io(SOCKET_URL, {
      auth: {
        token: token, // Pass the JWT for authentication
      },
      transports: ['websocket'], // More reliable for mobile
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully:', this.socket?.id);
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.socket = null;
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  reconnect(): void {
    if (this.currentToken) {
      console.log('🔄 Attempting to reconnect socket...');
      this.connect(this.currentToken);
    } else {
      console.warn('Cannot reconnect: No token available');
    }
  }
}

export const socketService = new SocketService();
