import { create } from 'zustand';
import { io } from 'socket.io-client';

const URL = import.meta.env.PROD ? undefined : '/';

const saveUser = (user) => {
  if (user) {
    localStorage.setItem('setu_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('setu_user');
  }
};

const loadUser = () => {
  try {
    const stored = localStorage.getItem('setu_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  authError: null,
  user: loadUser(), // Restore user from localStorage on init
  systemMode: 'PEACE', // 'PEACE' | 'DISASTER'
  offlineQueue: [], // Queue for messages when offline
  messages: [], // Global message state
  typingUsers: [], // Array of usernames currently typing

  connect: (username, role = 'civilian', adminToken = null) => {
    const existingSocket = get().socket;
    if (existingSocket) {
      existingSocket.disconnect();
    }

    set({ authError: null });

    const socket = io(URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    socket.on('connect', () => {
      set({ isConnected: true, authError: null });
      // Send admin token along with auth:join for server-side verification
      socket.emit('auth:join', { username, role, adminToken });
      
      // Attempt to flush offline queue
      const { offlineQueue } = get();
      if (offlineQueue.length > 0) {
        console.log(`Syncing ${offlineQueue.length} offline messages...`);
        offlineQueue.forEach(msg => {
           socket.emit('message:send', msg);
        });
        set({ offlineQueue: [] });
      }
    });

    socket.on('disconnect', () => {
      // Only update connection status, DON'T clear user
      set({ isConnected: false });
    });

    socket.on('auth:success', (data) => {
      const user = { _id: data.userId, role: data.role, username, token: data.token };
      set({ user, systemMode: data.mode || 'PEACE', authError: null });
      saveUser(user); // Persist to localStorage
    });

    socket.on('auth:error', (data) => {
      console.error('Auth error:', data.message);
      // Disconnect and clear state on auth failure
      socket.disconnect();
      set({ socket: null, isConnected: false, user: null, messages: [], authError: data.message });
      saveUser(null);
    });

    socket.on('system:error', (data) => {
      console.error('System error:', data.message);
      alert(`SYSTEM ALERT: ${data.message}`);
    });
    
    socket.on('system:mode_change', ({ mode }) => {
      set({ systemMode: mode });
    });

    // Global Message Listeners
    socket.on('message:history', (history) => {
      const taggedHistory = history.map(msg => ({ ...msg, isHistory: true }));
      set({ messages: taggedHistory });
    });

    socket.on('message:receive', (msg) => {
      set((state) => ({ messages: [...state.messages, msg] }));
    });

    socket.on('incident:new', (incident) => {
      const msg = {
        _id: Date.now() + Math.random(),
        type: 'system',
        content: `🚨 ALERT: ${incident.type} reported!`,
        senderName: 'SYSTEM'
      };
      set((state) => ({ messages: [...state.messages, msg] }));
    });

    socket.on('message:deleted', ({ msgId }) => {
      set((state) => ({ messages: state.messages.filter(m => m._id !== msgId) }));
    });

    socket.on('message:cleared_all', () => {
      set({ messages: [] });
    });

    socket.on('user:typing', ({ username }) => {
      if (!username) return;
      set(state => ({ typingUsers: [...new Set([...state.typingUsers, username])] }));
    });

    socket.on('user:stop_typing', ({ username }) => {
      set(state => ({ typingUsers: state.typingUsers.filter(u => u !== username) }));
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) socket.disconnect();
    set({ socket: null, isConnected: false, user: null, messages: [] });
    saveUser(null); // Clear localStorage
  },

  sendMessage: (content, type = 'text') => {
    const { socket, isConnected, user } = get();
    const payload = { content, type };

    const tempId = Date.now() + Math.random().toString();
    const tempMsg = {
      _id: tempId,
      senderName: user?.username || 'Me',
      content,
      type,
      isMe: true,
      createdAt: Date.now()
    };
    set((state) => ({ messages: [...state.messages, tempMsg] }));

    if (isConnected && socket) {
      socket.emit('message:send', payload, (ack) => {
        if (ack && ack.status === 'ok') {
          set((state) => ({
            messages: state.messages.map(m => m._id === tempId ? { ...m, _id: ack.id } : m)
          }));
        } else {
          console.error('Message failed to send', ack?.error);
        }
      });
    } else {
      // Queue it
      set(state => ({ offlineQueue: [...state.offlineQueue, payload] }));
      console.log('Message queued (Offline)');
    }
  },

  deleteMessage: (msgId) => {
    const { socket, isConnected } = get();
    if (isConnected && socket) {
      socket.emit('message:delete', { msgId }, (ack) => {
        if (ack && ack.status !== 'ok') console.error('Delete failed', ack.error);
      });
    }
  },

  clearAllMessages: () => {
    const { socket, isConnected } = get();
    if (isConnected && socket) {
      socket.emit('message:clear_all', (ack) => {
        if (ack && ack.status !== 'ok') console.error('Clear failed', ack.error);
      });
    }
  },

  sendTypingStart: () => {
    const { socket, isConnected } = get();
    if (isConnected && socket) socket.emit('typing:start');
  },

  sendTypingStop: () => {
    const { socket, isConnected } = get();
    if (isConnected && socket) socket.emit('typing:stop');
  }
}));
