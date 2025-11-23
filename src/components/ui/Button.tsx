"use client";

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {

        const variants = {
            primary: 'bg-feather-green text-white shadow-btn shadow-feather-green-active active:bg-feather-green-active border-feather-green',
            secondary: 'bg-macaw-blue text-white shadow-btn shadow-macaw-blue-active active:bg-macaw-blue-active border-macaw-blue',
            danger: 'bg-cardinal-red text-white shadow-btn shadow-cardinal-red-active active:bg-cardinal-red-active border-cardinal-red',
            outline: 'bg-white text-macaw-blue border-2 border-macaw-blue shadow-btn shadow-hare-grey active:bg-hare-grey',
            ghost: 'bg-transparent text-wolf-grey hover:bg-hare-grey shadow-none active:translate-y-0',
        };

        const sizes = {
            sm: 'h-10 px-4 text-sm',
            md: 'h-12 px-6 text-base',
            lg: 'h-14 px-8 text-lg',
        };

        return (
            <motion.button
                ref={ref}
                whileTap={{ y: 4, boxShadow: '0px 0px 0px 0px' }}
                className={cn(
                    'inline-flex items-center justify-center rounded-2xl font-bold uppercase tracking-wide transition-colors outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                    variants[variant],
                    sizes[size],
                    fullWidth && 'w-full',
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
