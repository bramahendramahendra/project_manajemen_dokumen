import { useEffect, useState } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
import Image from "next/image";
import { apiRequest } from "@/helpers/apiClient";
import notificationClient from "@/helpers/notificationClient";
import { DEBUG_MODE } from "@/utils/config";

type NotificationItem = {
  url: string;
  image: string;
  title: string;
  subTitle: string;
};

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');

  // Initial fetch untuk notifikasi
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest("/notifications/header", "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Notification data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        const notif: NotificationItem[] = result.responseData.items.map((item: any) => ({
          url: item.url,
          image: item.image,
          title: item.title,
          subTitle: item.subtitle,
        }));

        setNotifications(notif);
        setNotifying(notif.length > 0); // Set notifying berdasarkan keberadaan notifikasi
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
        console.error("Error fetching initial notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Efek untuk mengelola koneksi SSE
  useEffect(() => {
    // Subscribe ke event header untuk mendapatkan notifikasi secara real-time
    const unsubscribeHeader = notificationClient.subscribe('header', (data: any) => {
      try {
        if (data && Array.isArray(data.items)) {
          const notif: NotificationItem[] = data.items.map((item: any) => ({
            url: item.url,
            image: item.image,
            title: item.title,
            subTitle: item.subtitle,
          }));
          
          setNotifications(notif);
          setNotifying(notif.length > 0); // Update status notifying
          setError(null); // Clear error ketika berhasil menerima data
        }
      } catch (err) {
        console.error("Error processing header notification:", err);
      }
    });

    // Subscribe ke event error
    const unsubscribeError = notificationClient.subscribe('error', (error: any) => {
      console.error('SSE Error in notification dropdown:', error);
      setError('Koneksi notifikasi bermasalah');
    });

    // Subscribe ke event connection untuk status
    const unsubscribeConnection = notificationClient.subscribe('connection', (data: any) => {
      setConnectionStatus(data.status);
      
      if (data.status === 'connected') {
        setError(null);
      } else if (data.status === 'disconnected') {
        if (DEBUG_MODE) setError('Koneksi notifikasi terputus');
      } else if (data.status === 'reconnecting') {
        if (DEBUG_MODE) setError(`Menyambung kembali... (${data.attempt || 0})`);
      } else if (data.status === 'authentication_failed') {
        if (DEBUG_MODE) setError('Sesi berakhir, silakan login ulang');
      } else if (data.status === 'failed') {
        if (DEBUG_MODE) setError('Gagal terhubung ke server notifikasi');
      }
    });

    // Mulai koneksi SSE jika belum terhubung
    notificationClient.connect();

    // Cleanup: unsubscribe ketika komponen unmount
    return () => {
      unsubscribeHeader();
      unsubscribeError();
      unsubscribeConnection();
    };
  }, []);

  // Function untuk handle manual refresh
  const handleRefreshNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest("/notifications/header", "GET");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      const notif: NotificationItem[] = result.responseData.items.map((item: any) => ({
        url: item.url,
        image: item.image,
        title: item.title,
        subTitle: item.subtitle,
      }));

      setNotifications(notif);
      setNotifying(notif.length > 0);
      
      // Juga reconnect SSE jika bermasalah
      if (connectionStatus !== 'connected') {
        notificationClient.reconnect();
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error refreshing notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative hidden sm:block">
      <li>
        <Link
          onClick={() => {
            setNotifying(false);
            setDropdownOpen(!dropdownOpen);
          }}
          href="#"
          className="relative flex h-12 w-12 items-center justify-center rounded-full border border-stroke bg-gray-2 text-dark hover:text-[#0C479F] dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:hover:text-white"
        >
          <span className="relative">
            <svg
              className="fill-current duration-300 ease-in-out"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.0001 1.0415C6.43321 1.0415 3.54172 3.933 3.54172 7.49984V8.08659C3.54172 8.66736 3.36981 9.23513 3.04766 9.71836L2.09049 11.1541C0.979577 12.8205 1.82767 15.0855 3.75983 15.6125C4.3895 15.7842 5.0245 15.9294 5.66317 16.0482L5.66475 16.0525C6.30558 17.7624 8.01834 18.9582 10 18.9582C11.9817 18.9582 13.6944 17.7624 14.3352 16.0525L14.3368 16.0483C14.9755 15.9295 15.6106 15.7842 16.2403 15.6125C18.1724 15.0855 19.0205 12.8205 17.9096 11.1541L16.9524 9.71836C16.6303 9.23513 16.4584 8.66736 16.4584 8.08659V7.49984C16.4584 3.933 13.5669 1.0415 10.0001 1.0415ZM12.8137 16.2806C10.9446 16.504 9.05539 16.504 7.18626 16.2806C7.77872 17.1319 8.8092 17.7082 10 17.7082C11.1908 17.7082 12.2213 17.1319 12.8137 16.2806ZM4.79172 7.49984C4.79172 4.62335 7.12357 2.2915 10.0001 2.2915C12.8765 2.2915 15.2084 4.62335 15.2084 7.49984V8.08659C15.2084 8.91414 15.4533 9.72317 15.9124 10.4117L16.8696 11.8475C17.5072 12.804 17.0204 14.104 15.9114 14.4065C12.0412 15.462 7.95893 15.462 4.08872 14.4065C2.9797 14.104 2.49291 12.804 3.13055 11.8475L4.08772 10.4117C4.54676 9.72317 4.79172 8.91414 4.79172 8.08659V7.49984Z"
                fill=""
              />
            </svg>

            <span
              className={`absolute -top-0.5 right-0 z-1 h-2.5 w-2.5 rounded-full border-2 border-gray-2 bg-red-light dark:border-dark-3 ${
                !notifying ? "hidden" : "inline"
              }`}
            >
              <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-red-light opacity-75"></span>
            </span>
            
            {/* Connection status indicator */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 z-1 h-2 w-2 rounded-full border border-gray-2 dark:border-dark-3 ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'reconnecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            ></span>
          </span>
        </Link>

        {dropdownOpen && (
          <div
            className={`absolute -right-27 mt-7.5 flex max-h-[550px] w-75 flex-col rounded-xl border-[0.5px] border-stroke bg-white px-5.5 pb-5.5 pt-5 shadow-default dark:border-dark-3 dark:bg-gray-dark sm:right-0 sm:w-[364px]`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-medium text-dark dark:text-white">
                Notifications
              </h5>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary px-2 py-0.5 text-body-xs font-medium text-white">
                  {notifications.length} new
                </span>
                {/* Refresh button */}
                <button
                  onClick={handleRefreshNotifications}
                  disabled={loading}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors"
                  title="Refresh notifications"
                >
                  <svg
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Connection status bar */}
            {(error || connectionStatus !== 'connected') && (
              <div className={`mb-3 p-2 rounded-md text-xs ${
                connectionStatus === 'connected' ? 'bg-green-50 text-green-700 border border-green-200' :
                connectionStatus === 'reconnecting' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {error || `Status: ${connectionStatus}`}
              </div>
            )}

            <ul className={`${showAll ? 'scrollbar-visible h-96' : 'no-scrollbar h-auto'} mb-5 flex flex-col gap-1 overflow-y-auto`}>
              {loading ? (
                <li className="text-sm text-gray-500 px-2.5 py-2">Loading...</li>
              ) : error && notifications.length === 0 ? (
                <li className="text-sm text-red-500 px-2.5 py-2">{error}</li>
              ) : notifications.length === 0 ? (
                <li className="text-sm text-gray-500 px-2.5 py-2">Tidak ada notifikasi</li>
              ) : (
                notifications
                  .slice(0, showAll ? notifications.length : 4)
                  .map((item, index) => (
                  <li key={index}>
                    <Link
                      className="flex items-center gap-4 rounded-[10px] p-2.5 hover:bg-gray-2 dark:hover:bg-dark-3"
                      href={item.url || "#"}
                    >
                      <span className="block h-14 w-14 rounded-full">
                        <Image
                          width={112}
                          height={112}
                          src={item.image}
                          style={{
                            width: "auto",
                            height: "auto",
                          }}
                          alt="User"
                        />
                      </span>

                      <span className="block">
                        <span className="block font-medium text-dark dark:text-white">
                          {item.title}
                        </span>
                        <span className="block text-body-sm font-medium text-dark-5 dark:text-dark-6">
                          {item.subTitle}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>

            {!loading && !error && notifications.length > 4 && (
              <button
                className="flex items-center justify-center rounded-[7px] border border-primary p-2.5 font-medium text-primary hover:bg-blue-light-5 dark:border-dark-4 dark:text-dark-6 dark:hover:border-primary dark:hover:bg-blue-light-3 dark:hover:text-primary"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : "See all notifications"}
              </button>
            )}
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;