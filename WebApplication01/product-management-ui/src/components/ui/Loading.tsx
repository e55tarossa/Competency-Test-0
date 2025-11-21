import React from 'react';

const Loading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{message}</p>
        </div>
    );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className="relative inline-block">
            <div
                className={cn(
                    'border-primary-600 rounded-full border-t-transparent animate-spin',
                    sizes[size]
                )}
            ></div>
        </div>
    );
};

export const LoadingOverlay: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
                <Loading />
            </div>
        </div>
    );
};

function cn(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

export default Loading;
