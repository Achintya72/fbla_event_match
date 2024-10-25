"use client";

import classNames from "@/utils/classnames";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean,
    disabled?: boolean,
    variant?: "primary" | "secondary",
    icon?: ReactNode
}

const variantColors = {
    "primary": "bg-blue",
    "secondary": "bg-yellow"
}

const variantDropShadows = {
    primary: "hover:drop-shadow-[0_4px_16px_rgba(100,144,231,0.25)]",
    secondary: "hover:drop-shadow-[0_4px_16px_rgba(197,159,86,0.25)]"
}

export default function Button({ className, icon = null, loading = false, disabled = false, variant = "primary", children, ...props }: ButtonProps) {
    return (
        <button className={
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
            {children}
        </button>
    )
}