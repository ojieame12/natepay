"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
    return (
        <Sonner
            theme="light"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-white group-[.toaster]:text-eel-black group-[.toaster]:border-hare-grey group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl group-[.toaster]:font-bold",
                    description: "group-[.toaster]:text-wolf-grey",
                    actionButton:
                        "group-[.toaster]:bg-macaw-blue group-[.toaster]:text-white",
                    cancelButton:
                        "group-[.toaster]:bg-hare-grey group-[.toaster]:text-eel-black",
                },
            }}
            {...props}
        />
    );
}
