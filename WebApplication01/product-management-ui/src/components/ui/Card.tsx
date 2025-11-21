import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'bordered' | 'elevated';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        const variants = {
            default: 'glass-card rounded-2xl',
            bordered: 'bg-white dark:bg-[#151b2b] border-2 border-gray-200 dark:border-gray-700 rounded-2xl',
            elevated: 'bg-white dark:bg-[#151b2b] shadow-xl border border-gray-100 dark:border-gray-800 rounded-2xl',
        };

        return (
            <div
                ref={ref}
                className={cn('rounded-xl overflow-hidden', variants[variant], className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={cn('text-lg font-semibold text-gray-900 dark:text-gray-100', className)}
                {...props}
            >
                {children}
            </h3>
        );
    }
);

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
    return (
        <p
            ref={ref}
            className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}
            {...props}
        >
            {children}
        </p>
    );
});

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn('px-6 py-4', className)} {...props}>
                {children}
            </div>
        );
    }
);

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
