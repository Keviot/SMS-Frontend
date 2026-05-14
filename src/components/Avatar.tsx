import { useState, useEffect } from "react";
import { cn } from "../lib/cn";

interface AvatarProps {
    src?: string;
    name: string;
    className?: string;
    size?: "xs" | "sm" | "md" | "lg";
}

export default function Avatar({ src, name, className, size = "md" }: AvatarProps) {
    const [error, setError] = useState(false);

    // Reset error state if src changes
    useEffect(() => {
        setError(false);
    }, [src]);

    const getInitials = (name: string) => {
        if (!name) return "";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const sizeClasses = {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
    };

    const hasImage = src && src !== "" && src !== "undefined" && src !== "null" && !error;

    if (hasImage) {
        return (
            <img
                src={src}
                alt={name}
                onError={() => setError(true)}
                className={cn(
                    "rounded-full object-cover border border-[#F1F1F1]",
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-full bg-[#F1F4FF] font-bold text-[#5678E9] border border-[#F1F1F1]",
                sizeClasses[size],
                className
            )}
        >
            {getInitials(name)}
        </div>
    );
}
