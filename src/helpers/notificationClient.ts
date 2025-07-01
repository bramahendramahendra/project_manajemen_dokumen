import { refreshAccessToken } from "./tokenService";

// Tipe data untuk event notifikasi
export type NotificationEvent = {
  type: 'header' | 'sidebar';
  data: any;
};

// Class untuk mengelola koneksi SSE
export class NotificationClient {
  private eventSource: EventSource | null = null;
  private subscribers: Map<string, Function[]> = new Map();
  private reconnectAttempt = 0;
  private maxReconnectAttempt = 5;
  private reconnectTimeout = 3000; // 3 detik
  private isConnecting = false;
  private shouldReconnect = true;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private baseUrl: string) {
    this.subscribers.set('header', []);
    this.subscribers.set('sidebar', []);
    this.subscribers.set('error', []);
    this.subscribers.set('connection', []);
  }

  // Memulai koneksi SSE
  connect() {
    if (this.eventSource || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      console.log('Establishing SSE connection...');
      this.eventSource = new EventSource(`${this.baseUrl}/notifications/stream`, { 
        withCredentials: true // Penting untuk mengirim cookies
      });

      // Event ketika koneksi terbuka
      this.eventSource.onopen = () => {
        console.log('SSE connection established successfully');
        this.isConnecting = false;
        this.reconnectAttempt = 0;
        this.notifySubscribers('connection', { status: 'connected' });
        this.startHeartbeat();
      };

      // Event ketika menerima pesan umum
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as NotificationEvent;
          this.notifySubscribers(data.type, data.data);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      // Event spesifik untuk header
      this.eventSource.addEventListener('header', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.notifySubscribers('header', data);
        } catch (error) {
          console.error('Failed to parse header event:', error);
        }
      });

      // Event spesifik untuk sidebar
      this.eventSource.addEventListener('sidebar', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.notifySubscribers('sidebar', data);
        } catch (error) {
          console.error('Failed to parse sidebar event:', error);
        }
      });

      // Event untuk connection status
      this.eventSource.addEventListener('connection', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.notifySubscribers('connection', data);
        } catch (error) {
          console.error('Failed to parse connection event:', error);
        }
      });

      // Handle error dan reconnection
      this.eventSource.onerror = async (error) => {
        console.error('SSE connection error:', error);
        this.isConnecting = false;
        this.stopHeartbeat();
        
        // Tutup koneksi saat ini
        this.closeConnection();
        
        // Notify subscribers about error
        this.notifySubscribers('error', error);
        
        // Coba reconnect jika masih diizinkan
        if (this.shouldReconnect && this.reconnectAttempt < this.maxReconnectAttempt) {
          this.attemptReconnect();
        } else if (this.reconnectAttempt >= this.maxReconnectAttempt) {
          console.error('Max reconnect attempts reached');
          this.notifySubscribers('connection', { status: 'failed', reason: 'Max attempts reached' });
        }
      };

    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
      this.isConnecting = false;
      this.notifySubscribers('error', error);
    }
  }

  // Attempt reconnection dengan token refresh
  private async attemptReconnect() {
    if (!this.shouldReconnect) return;

    this.reconnectAttempt++;
    console.log(`Attempting to reconnect (attempt ${this.reconnectAttempt}/${this.maxReconnectAttempt})...`);
    
    this.notifySubscribers('connection', { 
      status: 'reconnecting', 
      attempt: this.reconnectAttempt 
    });

    try {
      // Coba refresh token dulu sebelum reconnect
      const refreshResponse = await refreshAccessToken();
      
      if (refreshResponse.ok) {
        console.log('Token refreshed successfully, reconnecting SSE...');
        // Tunggu sebentar sebelum reconnect
        setTimeout(() => {
          if (this.shouldReconnect) {
            this.connect();
          }
        }, this.reconnectTimeout);
      } else {
        console.error('Failed to refresh token during reconnect');
        // Jika refresh token gagal, redirect ke login
        this.shouldReconnect = false;
        this.notifySubscribers('connection', { 
          status: 'authentication_failed',
          message: 'Session expired, please login again'
        });
        
        // Redirect ke login page
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    } catch (refreshError) {
      console.error('Error during token refresh for reconnect:', refreshError);
      
      // Jika ada error dalam refresh, coba reconnect tanpa refresh
      setTimeout(() => {
        if (this.shouldReconnect) {
          this.connect();
        }
      }, this.reconnectTimeout * this.reconnectAttempt); // Exponential backoff
    }
  }

  // Menutup koneksi SSE saat ini tanpa reconnect
  private closeConnection() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.stopHeartbeat();
  }

  // Menutup koneksi SSE dan hentikan reconnect
  close() {
    this.shouldReconnect = false;
    this.closeConnection();
    this.notifySubscribers('connection', { status: 'disconnected' });
  }

  // Start heartbeat untuk detect connection issues
  private startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      // Check if connection is still alive
      if (this.eventSource && this.eventSource.readyState === EventSource.CLOSED) {
        console.log('Detected closed SSE connection, attempting reconnect...');
        this.closeConnection();
        this.attemptReconnect();
      }
    }, 30000); // Check every 30 seconds
  }

  // Stop heartbeat
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Berlangganan event
  subscribe(eventType: string, callback: Function) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)?.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  // Kirim notifikasi ke semua subscriber
  private notifySubscribers(eventType: string, data: any) {
    const callbacks = this.subscribers.get(eventType) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  // Method untuk manual reconnect (dipanggil dari luar setelah token refresh)
  reconnect() {
    console.log('Manual reconnect requested...');
    this.close();
    this.reconnectAttempt = 0;
    this.shouldReconnect = true;
    
    // Tunggu sebentar sebelum reconnect
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  // Get connection status
  getConnectionStatus() {
    if (!this.eventSource) return 'disconnected';
    
    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING:
        return 'connecting';
      case EventSource.OPEN:
        return 'connected';
      case EventSource.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  // Reset reconnect attempt counter
  resetReconnectAttempts() {
    this.reconnectAttempt = 0;
  }
}

// Singleton instance untuk aplikasi
const notificationClient = new NotificationClient(process.env.NEXT_PUBLIC_API_URL || '');

export default notificationClient;