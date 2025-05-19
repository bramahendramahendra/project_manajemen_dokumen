// src\utils\notifManager.ts
import notificationClient from "@/helpers/notificationClient";
import { Toast } from "@/components/Toast"; // Asumsikan Anda memiliki komponen Toast

/**
 * Inisialisasi manager notifikasi
 * - Mulai koneksi SSE
 * - Setup listener untuk menampilkan notifikasi/toast ketika ada notifikasi baru
 */
export const initNotificationManager = () => {
  // Mulai koneksi SSE
  notificationClient.connect();

  // Mendengarkan notifikasi header baru untuk menampilkan toast
  notificationClient.subscribe('header', (data: any) => {
    if (data && Array.isArray(data.items) && data.items.length > 0) {
      // Hanya tampilkan toast jika ada notifikasi baru
      const latestNotif = data.items[0];
      Toast.show({
        type: 'info',
        title: latestNotif.title,
        message: latestNotif.subtitle,
        duration: 5000,
      });
    }
  });

  // Jika koneksi terputus, coba hubungkan kembali secara otomatis
  notificationClient.subscribe('connection', (status: any) => {
    if (status && status.status === 'disconnected') {
      // Tunggu 5 detik sebelum mencoba menghubungkan kembali
      setTimeout(() => {
        notificationClient.connect();
      }, 5000);
    }
  });

  // Menangani error koneksi
  notificationClient.subscribe('error', (error: any) => {
    console.error('Notification connection error:', error);
  });

  // Membersihkan koneksi saat aplikasi di-unload
  window.addEventListener('beforeunload', () => {
    notificationClient.close();
  });
};

/**
 * Tutup koneksi SSE
 */
export const closeNotificationConnection = () => {
  notificationClient.close();
};