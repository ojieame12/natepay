import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverable = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "bg-white border-2 border-hare-grey rounded-3xl p-6",
                    hoverable && "transition-transform hover:-translate-y-1 hover:shadow-lg hover:border-macaw-blue cursor-pointer",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
