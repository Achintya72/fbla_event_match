"use client";

import classNames from "@/utils/classnames";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean,
    disabled?: boolean,
    variant?: "primary" | "secondary" | "text",
    icon?: ReactNode
}

const variantColors = {
    "primary": "bg-blue",
    "secondary": "bg-yellow",
    "text": "bg-transparent"
}

const variantDropShadows = {
    primary: "hover:drop-shadow-[0_4px_16px_rgba(100,144,231,0.25)]",
    secondary: "hover:drop-shadow-[0_4px_16px_rgba(197,159,86,0.25)]",
    text: "hover:bg-[rgba(255,255,255,0.05)]"
}        

export default function Button({ className, onClick, icon = null, loading = false, disabled = false, variant = "primary", children, ...props }: ButtonProps) {
    return (
        <button 
            {...props}
            onClick={onClick}
            className={
            classNames(
                "px-[16px] py-[10px] rounded-[8px] font-raleway font-bold",
                "text-center gap-[10px] transition-all",
                disabled ? "text-gray-600" : "text-white",
                variantColors[variant],
                icon == null ? "min-w-[100px]" : "",
                variantDropShadows[variant],
                className ? className : ""
            )
        }>
            {icon != null && icon}
            {loading ? "Loading" : children}
        </button>
    )
}