import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

interface ToastManagerProps {
  toasts: Array<ToastProps & { id: string }>;
}

// Komponen Toast tunggal
const ToastItem: React.FC<ToastProps & { id: string; onClose: () => void }> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Menentukan warna berdasarkan tipe
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'info':
      default:
        return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  const getIconByType = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`flex items-center p-4 mb-4 rounded-lg border-l-4 shadow-md animate-fade-in ${getTypeStyles()}`}
      role="alert"
    >
      <div className="flex items-center justify-center mr-3">
        {getIconByType()}
      </div>
      <div className="flex-1">
        {title && <p className="font-bold">{title}</p>}
        <p>{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 hover:bg-gray-200"
      >
        <span className="sr-only">Close</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
        </svg>
      </button>
    </div>
  );
};

// Komponen untuk menampilkan kumpulan toasts
const ToastContainer: React.FC<ToastManagerProps> = ({ toasts }) => {
  const [portalElement, setPortalElement] = useState<Element | null>(null);

  useEffect(() => {
    let element = document.getElementById('toast-container');
    if (!element) {
      element = document.createElement('div');
      element.id = 'toast-container';
      element.className = 'fixed top-4 right-4 z-50 w-80 max-w-full';
      document.body.appendChild(element);
    }
    setPortalElement(element);

    return () => {
      if (element && element.parentNode && toasts.length === 0) {
        element.parentNode.removeChild(element);
      }
    };
  }, [toasts]);

  if (!portalElement) return null;

  return createPortal(
    <>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onClose={() => Toast.remove(toast.id)}
        />
      ))}
    </>,
    portalElement
  );
};

// Singleton untuk memanajemen toast
class ToastManager {
  private static instance: ToastManager;
  private toasts: Array<ToastProps & { id: string }> = [];
  private subscribers: Array<(toasts: Array<ToastProps & { id: string }>) => void> = [];

  private constructor() {}

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((subscriber) => subscriber([...this.toasts]));
  }

  public subscribe(callback: (toasts: Array<ToastProps & { id: string }>) => void): () => void {
    this.subscribers.push(callback);
    callback([...this.toasts]);

    return () => {
      this.subscribers = this.subscribers.filter((subscriber) => subscriber !== callback);
    };
  }

  public show(toast: ToastProps): string {
    const id = this.generateId();
    this.toasts.push({ ...toast, id });
    this.notifySubscribers();
    return id;
  }

  public remove(id: string): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notifySubscribers();
  }

  public clear(): void {
    this.toasts = [];
    this.notifySubscribers();
  }
}

// Hook untuk menggunakan toast dalam komponen
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  useEffect(() => {
    const unsubscribe = Toast.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return { toasts };
};

// Komponen provider toast
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} />
    </>
  );
};

// Ekspor API publik
export const Toast = {
  show: (toast: ToastProps) => ToastManager.getInstance().show(toast),
  remove: (id: string) => ToastManager.getInstance().remove(id),
  clear: () => ToastManager.getInstance().clear(),
  subscribe: (callback: (toasts: Array<ToastProps & { id: string }>) => void) => 
    ToastManager.getInstance().subscribe(callback),
};