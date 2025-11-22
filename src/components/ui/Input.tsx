import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="space-y-2 w-full">
                {label && (
                    <label className="block text-sm font-bold text-wolf-grey uppercase tracking-wide ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full px-4 py-3 rounded-xl border-2 border-hare-grey bg-swan-white text-eel-black font-bold placeholder:text-wolf-grey/50 outline-none transition-colors",
                        "focus:border-macaw-blue focus:bg-macaw-blue/5",
                        error && "border-cardinal-red focus:border-cardinal-red focus:bg-cardinal-red/5",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-cardinal-red text-sm font-bold ml-1 animate-pulse">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
