import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToastStore, type Toast as ToastType } from '../../store/toast.store';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const styles = {
    success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
};

export const Toast: React.FC<ToastType> = ({ id, type, message, duration = 5000 }) => {
    const removeToast = useToastStore((state) => state.removeToast);
    const Icon = icons[type];

    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, removeToast]);

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in-right max-w-md w-full pointer-events-auto',
                styles[type]
            )}
            role="alert"
        >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium">{message}</div>
            <button
                onClick={() => removeToast(id)}
                className="text-current opacity-60 hover:opacity-100 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const toasts = useToastStore((state) => state.toasts);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
};
