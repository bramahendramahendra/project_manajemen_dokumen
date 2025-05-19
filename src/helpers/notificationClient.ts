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

  constructor(private baseUrl: string) {
    this.subscribers.set('header', []);
    this.subscribers.set('sidebar', []);
    this.subscribers.set('error', []);
    this.subscribers.set('connection', []);
  }

  // Memulai koneksi SSE
  connect() {
    if (this.eventSource) {
      return;
    }

    try {
      this.eventSource = new EventSource(`${this.baseUrl}/notifications/stream`, { 
        withCredentials: true // Penting untuk mengirim cookies
      });

      // Event ketika koneksi terbuka
      this.eventSource.onopen = () => {
        console.log('SSE connection established');
        this.reconnectAttempt = 0;
        this.notifySubscribers('connection', { status: 'connected' });
      };

      // Event ketika menerima pesan
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as NotificationEvent;
          this.notifySubscribers(data.type, data.data);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      // Mendaftarkan event spesifik
      this.eventSource.addEventListener('header', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.notifySubscribers('header', data);
        } catch (error) {
          console.error('Failed to parse header event:', error);
        }
      });

      this.eventSource.addEventListener('sidebar', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.notifySubscribers('sidebar', data);
        } catch (error) {
          console.error('Failed to parse sidebar event:', error);
        }
      });

      // Handle error (termasuk token expired)
      this.eventSource.onerror = async (error) => {
        console.error('SSE connection error:', error);
        this.notifySubscribers('error', error);
        
        this.close();
        
        // Coba reconnect dengan backoff strategy
        if (this.reconnectAttempt < this.maxReconnectAttempt) {
          this.reconnectAttempt++;
          console.log(`Reconnecting (attempt ${this.reconnectAttempt})...`);
          
          // Coba refresh token sebelum reconnect
          try {
            const refreshResponse = await refreshAccessToken();
            if (refreshResponse.ok) {
              console.log('Token refreshed, reconnecting...');
              setTimeout(() => this.connect(), this.reconnectTimeout);
            } else {
              console.error('Failed to refresh token, redirecting to login');
              window.location.href = "/login";
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            setTimeout(() => this.connect(), this.reconnectTimeout);
          }
        } else {
          console.error('Max reconnect attempts reached');
        }
      };
    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
      this.notifySubscribers('error', error);
    }
  }

  // Menutup koneksi SSE
  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.notifySubscribers('connection', { status: 'disconnected' });
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
    callbacks.forEach(callback => callback(data));
  }
}

// Singleton instance untuk aplikasi
const notificationClient = new NotificationClient(process.env.NEXT_PUBLIC_API_URL || '');

export default notificationClient;