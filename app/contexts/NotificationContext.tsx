"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
}

interface NotificationContextType {
    showNotification: (type: Notification['type'], title: string, message: string) => void;
    showSuccess: (title: string, message: string) => void;
    showError: (title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((type: Notification['type'], title: string, message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        const notification: Notification = { id, type, title, message };
        
        setNotifications((prev) => [...prev, notification]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    }, []);

    const showSuccess = useCallback((title: string, message: string) => {
        showNotification('success', title, message);
    }, [showNotification]);

    const showError = useCallback((title: string, message: string) => {
        showNotification('error', title, message);
    }, [showNotification]);

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification, showSuccess, showError }}>
            {children}
            
            {/* Notification Container */}
            <div className="fixed top-4 right-4 z-50 space-y-4 max-w-md">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`rounded-lg shadow-lg p-4 flex items-start space-x-3 animate-slide-in ${
                            notification.type === 'success'
                                ? 'bg-green-50 border border-green-200'
                                : notification.type === 'error'
                                ? 'bg-red-50 border border-red-200'
                                : notification.type === 'warning'
                                ? 'bg-yellow-50 border border-yellow-200'
                                : 'bg-blue-50 border border-blue-200'
                        }`}
                    >
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            {notification.type === 'success' && (
                                <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            )}
                            {notification.type === 'error' && (
                                <svg
                                    className="w-6 h-6 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            )}
                            {notification.type === 'warning' && (
                                <svg
                                    className="w-6 h-6 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            )}
                            {notification.type === 'info' && (
                                <svg
                                    className="w-6 h-6 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p
                                className={`text-sm font-semibold ${
                                    notification.type === 'success'
                                        ? 'text-green-800'
                                        : notification.type === 'error'
                                        ? 'text-red-800'
                                        : notification.type === 'warning'
                                        ? 'text-yellow-800'
                                        : 'text-blue-800'
                                }`}
                            >
                                {notification.title}
                            </p>
                            <p
                                className={`text-sm mt-1 ${
                                    notification.type === 'success'
                                        ? 'text-green-700'
                                        : notification.type === 'error'
                                        ? 'text-red-700'
                                        : notification.type === 'warning'
                                        ? 'text-yellow-700'
                                        : 'text-blue-700'
                                }`}
                            >
                                {notification.message}
                            </p>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className={`flex-shrink-0 ${
                                notification.type === 'success'
                                    ? 'text-green-600 hover:text-green-800'
                                    : notification.type === 'error'
                                    ? 'text-red-600 hover:text-red-800'
                                    : notification.type === 'warning'
                                    ? 'text-yellow-600 hover:text-yellow-800'
                                    : 'text-blue-600 hover:text-blue-800'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
