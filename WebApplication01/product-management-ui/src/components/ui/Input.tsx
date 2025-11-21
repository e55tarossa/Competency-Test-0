import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type = 'text',
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg border transition-all duration-200',
                            'bg-gray-900/50 dark:bg-gray-800/50 backdrop-blur-sm',
                            'text-gray-100 dark:text-gray-100',
                            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
                            error
                                ? 'border-red-500/50 focus:ring-red-500/50'
                                : 'border-gray-700/50 dark:border-gray-600/50 hover:border-gray-600/50',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            props.disabled && 'opacity-50 cursor-not-allowed bg-gray-900/30 dark:bg-gray-900/30',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
