"use client";

import classNames from "@/utils/classnames";
import { InputHTMLAttributes } from "react";
import { FieldError, FieldValues, Path, RegisterOptions, UseFormRegister } from "react-hook-form";

interface InputProps<T extends FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
    label: string,
    name: Path<T>,
    register: UseFormRegister<T>,
    error: FieldError | undefined,
    options?: RegisterOptions<T, Path<T>>,
    grow?: boolean
}

export default function Input<T extends FieldValues>({ label, name, register, grow, options, error, className, ...props }: InputProps<T>) {
    return (
        <div className={
            classNames("flex flex-col items-stretch gap-[6px]", grow ? "flex-1" : "")
        }>
            <label htmlFor={label} className="font-raleway text-left text-xs font-light tracking-widest uppercase text-white">{label}</label>
            <input
                {...register(name, options)}
                id={label}
                {...props}
                onSubmit={(e) => e.preventDefault()}
                className={
                    classNames(
                        className ?? "",
                        "font-raleway p-[15px] bg-[rgba(255,255,255,0.05)] rounded-[8px]",
                        "outline-none border-none",
                        error == undefined ? " focus:border focus:border-solid focus:border-secondary"
                        : "!border !border-solid border-red-500"
                    )
                }
            />
            {error && <small className="text-left text-xs font-raleway text-red-500">{error.message}</small>}
        </div>
    )

}