import { io, Socket } from 'socket.io-client';

// Event types for type safety
export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
  AGENT_UPDATE = 'agent_update',
  AGENT_MESSAGE = 'agent_message',
  AGENT_THINKING = 'agent_thinking',
  AGENT_HANDOVER = 'agent_handover',
  EXECUTION_STARTED = 'execution_started',
  EXECUTION_COMPLETED = 'execution_completed',
  EXECUTION_ERROR = 'execution_error',
  SYSTEM_MESSAGE = 'system_message',
}

// Agent status types
export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  SPEAKING = 'speaking',
  LISTENING = 'listening',
}

// Agent data interface
export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  color: string;
  llm_type?: string;
  last_updated?: number;
}

// Message interface
export interface AgentMessage {
  id: string;
  agent_id: string;
  content: string;
  timestamp: number;
  type: 'thinking' | 'message' | 'system' | 'error';
}

// Handover interface
export interface AgentHandover {
  from: string;
  to: string;
  message?: string;
  timestamp: number;
}

// Execution status interface
export interface ExecutionStatus {
  id: string;
  status: 'started' | 'completed' | 'error';
  timestamp: number;
  error?: string;
}

// Socket service class
class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Start with 2 seconds
  private listeners: Map<string, Set<Function>> = new Map();
  private connected = false;
  private url: string;

  constructor(url: string = '') {
    // Default to window location if no URL provided
    this.url = url || `${window.location.protocol}//${window.location.host}`;
  }

  // Initialize socket connection
  public connect(): void {
    if (this.socket) {
      return;
    }

    this.socket = io(this.url, {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 10000, // Max 10 seconds between reconnection attempts
      timeout: 20000, // 20 seconds timeout
    });

    // Set up event listeners
    this.socket.on(SocketEvent.CONNECT, () => {
      console.log('Socket connected');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.notifyListeners(SocketEvent.CONNECT, null);
    });

    this.socket.on(SocketEvent.DISCONNECT, (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      this.connected = false;
      this.notifyListeners(SocketEvent.DISCONNECT, reason);
      
      // Handle reconnection manually if needed
      if (reason === 'io server disconnect') {
        // Server disconnected us, need to manually reconnect
        this.reconnect();
      }
    });

    this.socket.on(SocketEvent.CONNECT_ERROR, (error) => {
      console.error('Socket connection error:', error);
      this.notifyListeners(SocketEvent.CONNECT_ERROR, error);
      
      // Handle reconnection
      this.reconnectAttempts++;
      if (this.reconnectAttempts > this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    // Set up agent event listeners
    this.socket.on(SocketEvent.AGENT_UPDATE, (data: Agent) => {
      this.notifyListeners(SocketEvent.AGENT_UPDATE, data);
    });

    this.socket.on(SocketEvent.AGENT_MESSAGE, (data: AgentMessage) => {
      this.notifyListeners(SocketEvent.AGENT_MESSAGE, data);
    });

    this.socket.on(SocketEvent.AGENT_THINKING, (data: AgentMessage) => {
      this.notifyListeners(SocketEvent.AGENT_THINKING, data);
    });

    this.socket.on(SocketEvent.AGENT_HANDOVER, (data: AgentHandover) => {
      this.notifyListeners(SocketEvent.AGENT_HANDOVER, data);
    });

    this.socket.on(SocketEvent.EXECUTION_STARTED, (data: ExecutionStatus) => {
      this.notifyListeners(SocketEvent.EXECUTION_STARTED, data);
    });

    this.socket.on(SocketEvent.EXECUTION_COMPLETED, (data: ExecutionStatus) => {
      this.notifyListeners(SocketEvent.EXECUTION_COMPLETED, data);
    });

    this.socket.on(SocketEvent.EXECUTION_ERROR, (data: ExecutionStatus) => {
      this.notifyListeners(SocketEvent.EXECUTION_ERROR, data);
    });

    this.socket.on(SocketEvent.SYSTEM_MESSAGE, (data: AgentMessage) => {
      this.notifyListeners(SocketEvent.SYSTEM_MESSAGE, data);
    });
  }

  // Manual reconnection logic
  private reconnect(): void {
    if (!this.socket || this.connected) {
      return;
    }

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      this.socket?.connect();
    }, this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts)); // Exponential backoff
  }

  // Disconnect socket
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Add event listener
  public on(event: SocketEvent, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  // Remove event listener
  public off(event: SocketEvent, callback: Function): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.delete(callback);
    }
  }

  // Notify all listeners of an event
  private notifyListeners(event: SocketEvent, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Emit an event to the server
  public emit(event: string, data: any): void {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // Check if socket is connected
  public isConnected(): boolean {
    return this.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;