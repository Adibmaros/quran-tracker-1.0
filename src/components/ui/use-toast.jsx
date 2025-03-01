
// components/ui/use-toast.jsx
"use client"

import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = "default", duration = 5000 }) => {
    const id = Date.now();
    
    const newToast = {
      id,
      title,
      description,
      variant,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto dismiss
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);
  };

  const dismissToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              rounded-lg shadow-lg p-4 flex items-start gap-3 transform transition-all
              ${
                toast.variant === "destructive"
                  ? "bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/80 dark:text-red-200"
                  : "bg-white border-l-4 border-emerald-500 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-200"
              }
            `}
            role="alert"
          >
            <div className="flex-1">
              {toast.title && <h3 className="font-semibold mb-1">{toast.title}</h3>}
              {toast.description && <p className="text-sm">{toast.description}</p>}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};