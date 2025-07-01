import notificationClient from "@/helpers/notificationClient";
import { DEBUG_MODE } from "@/utils/config";
// import { Toast } from "@/components/Toast"; // Uncomment jika sudah ada komponen Toast

// State management untuk notification manager
let isInitialized = false;
let unsubscribeFunctions: Function[] = [];

/**
 * Inisialisasi manager notifikasi
 * - Mulai koneksi SSE
 * - Setup listener untuk menampilkan notifikasi/toast ketika ada notifikasi baru
 * - Setup error handling dan reconnection logic
 */
export const initNotificationManager = () => {
  // Prevent double initialization
  if (isInitialized) {
    if (DEBUG_MODE) console.log('Notification manager already initialized');
    return;
  }

  if (DEBUG_MODE) console.log('Initializing notification manager...');
  
  // Mulai koneksi SSE
  notificationClient.connect();

  // Subscribe ke notifikasi header baru untuk menampilkan toast
  const unsubscribeHeader = notificationClient.subscribe('header', (data: any) => {
    try {
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        // Hanya tampilkan toast jika ada notifikasi baru
        const latestNotif = data.items[0];
        
        if (DEBUG_MODE) console.log('New header notification received:', latestNotif);
        
        // Uncomment dan sesuaikan dengan komponen Toast yang Anda miliki
        // Toast.show({
        //   type: 'info',
        //   title: latestNotif.title,
        //   message: latestNotif.subtitle,
        //   duration: 5000,
        // });
        
        // Alternative: menggunakan browser notification API
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(latestNotif.title, {
            body: latestNotif.subtitle,
            icon: latestNotif.image || '/favicon.ico',
            tag: 'notification-header'
          });
        }
      }
    } catch (error) {
      console.error('Error processing header notification:', error);
    }
  });

  // Subscribe ke notifikasi sidebar untuk logging
  const unsubscribeSidebar = notificationClient.subscribe('sidebar', (data: any) => {
    try {
      if (data && typeof data.unread_count === 'number') {
        if (DEBUG_MODE) console.log('Sidebar notification count updated:', data.unread_count);
        
        // Bisa ditambahkan logic untuk update global state atau context
        // dispatch({ type: 'UPDATE_NOTIFICATION_COUNT', payload: data.unread_count });
      }
    } catch (error) {
      console.error('Error processing sidebar notification:', error);
    }
  });

  // Subscribe ke connection status
  const unsubscribeConnection = notificationClient.subscribe('connection', (status: any) => {
    if (DEBUG_MODE) console.log('SSE Connection status changed:', status);
    
    try {
      if (status && status.status === 'connected') {
        if (DEBUG_MODE) console.log('✅ Notification service connected');
        
        // Bisa ditambahkan logic untuk update UI state
        // dispatch({ type: 'SET_NOTIFICATION_STATUS', payload: 'connected' });
        
      } else if (status.status === 'disconnected') {
        if (DEBUG_MODE) console.log('❌ Notification service disconnected');
        
        // Automatic reconnect sudah di-handle di notificationClient
        // Tapi bisa ditambahkan UI indicator di sini
        
      } else if (status.status === 'reconnecting') {
        if (DEBUG_MODE) console.log(`🔄 Reconnecting to notification service (attempt ${status.attempt || 0})...`);
        
      } else if (status.status === 'authentication_failed') {
        if (DEBUG_MODE) console.log('🚫 Notification service authentication failed - session expired');
        
        // Ini biasanya berarti user perlu login ulang
        // UI akan redirect otomatis oleh apiClient
        
      } else if (status.status === 'failed') {
        if (DEBUG_MODE) console.log('💥 Notification service connection failed');
        
        // Show user-friendly error message
        // Toast.show({
        //   type: 'error',
        //   title: 'Notification Service',
        //   message: 'Unable to connect to notification service',
        //   duration: 5000,
        // });
      }
    } catch (error) {
      console.error('Error processing connection status:', error);
    }
  });

  // Subscribe ke error events
  const unsubscribeError = notificationClient.subscribe('error', (error: any) => {
    console.error('Notification service error:', error);
    
    try {
      // Show user-friendly error message
      // Toast.show({
      //   type: 'warning',
      //   title: 'Connection Issue',
      //   message: 'Notification service is experiencing issues',
      //   duration: 3000,
      // });
    } catch (toastError) {
      console.error('Error showing error toast:', toastError);
    }
  });

  // Store unsubscribe functions untuk cleanup
  unsubscribeFunctions = [
    unsubscribeHeader,
    unsubscribeSidebar,
    unsubscribeConnection,
    unsubscribeError
  ];

  // Setup event listeners untuk browser events
  setupBrowserEventListeners();

  // Request notification permission jika belum ada
  requestNotificationPermission();

  isInitialized = true;
  if (DEBUG_MODE) console.log('✅ Notification manager initialized successfully');
};

/**
 * Setup event listeners untuk browser events
 */
const setupBrowserEventListeners = () => {
  // Cleanup koneksi saat aplikasi di-unload
  const handleBeforeUnload = () => {
    if (DEBUG_MODE) console.log('Closing notification connection before unload...');
    notificationClient.close();
  };

  // Reconnect saat tab menjadi visible kembali
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      if (DEBUG_MODE) console.log('Tab became visible, checking notification connection...');
      
      // Check connection status dan reconnect jika perlu
      const status = notificationClient.getConnectionStatus();
      if (status !== 'connected') {
        if (DEBUG_MODE) console.log('Reconnecting notification service after tab became visible...');
        notificationClient.connect();
      }
    }
  };

  // Reconnect saat window mendapat focus
  const handleWindowFocus = () => {
    if (DEBUG_MODE) console.log('Window gained focus, checking notification connection...');
    
    const status = notificationClient.getConnectionStatus();
    if (status !== 'connected') {
      if (DEBUG_MODE) console.log('Reconnecting notification service after window focus...');
      notificationClient.connect();
    }
  };

  // Pause koneksi saat window kehilangan focus untuk menghemat resource
  const handleWindowBlur = () => {
    if (DEBUG_MODE) console.log('Window lost focus');
    // Tidak perlu close connection, biarkan tetap berjalan di background
  };

  // Add event listeners
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleWindowFocus);
  window.addEventListener('blur', handleWindowBlur);

  // Store references untuk cleanup
  (window as any).notificationManagerCleanup = () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleWindowFocus);
    window.removeEventListener('blur', handleWindowBlur);
  };
};

/**
 * Request notification permission dari browser
 */
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      if (DEBUG_MODE) console.log('Requesting notification permission...');
      
      try {
        const permission = await Notification.requestPermission();
        if (DEBUG_MODE) console.log('Notification permission:', permission);
        
        if (permission === 'granted') {
          if (DEBUG_MODE) console.log('✅ Browser notifications enabled');
        } else {
          if (DEBUG_MODE) console.log('❌ Browser notifications denied');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    } else {
      if (DEBUG_MODE) console.log('Notification permission already set:', Notification.permission);
    }
  } else {
    if (DEBUG_MODE) console.log('Browser notifications not supported');
  }
};

/**
 * Tutup koneksi SSE dan cleanup
 */
export const closeNotificationConnection = () => {
  if (DEBUG_MODE) console.log('Closing notification manager...');
  
  try {
    // Unsubscribe dari semua events
    unsubscribeFunctions.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });
    unsubscribeFunctions = [];

    // Close SSE connection
    notificationClient.close();

    // Cleanup browser event listeners
    if ((window as any).notificationManagerCleanup) {
      (window as any).notificationManagerCleanup();
      delete (window as any).notificationManagerCleanup;
    }

    isInitialized = false;
    if (DEBUG_MODE) console.log('✅ Notification manager closed successfully');
  } catch (error) {
    console.error('Error closing notification manager:', error);
  }
};

/**
 * Restart notification manager (untuk testing atau error recovery)
 */
export const restartNotificationManager = () => {
  if (DEBUG_MODE) console.log('Restarting notification manager...');
  closeNotificationConnection();
  
  // Tunggu sebentar sebelum restart
  setTimeout(() => {
    initNotificationManager();
  }, 1000);
};

/**
 * Get current connection status
 */
export const getNotificationStatus = () => {
  return {
    isInitialized,
    connectionStatus: notificationClient.getConnectionStatus(),
    subscriberCount: unsubscribeFunctions.length
  };
};

/**
 * Manual trigger untuk reconnect (untuk testing)
 */
export const manualReconnect = () => {
  if (DEBUG_MODE) console.log('Manual reconnect triggered...');
  notificationClient.reconnect();
};