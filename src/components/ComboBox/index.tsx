"use client";

import classNames from "@/utils/classnames";
import { X } from "@phosphor-icons/react/dist/ssr";
import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from "react";

export type ComboElement = {
    id: string,
    name: string
};

export default function ComboBox<T extends ComboElement>(
    {
        value,
        onChange,
        placeholder = "Select Option",
        label,
        options,
        renderChip,
        disabled = false,
    }: {
        value: T | null,
        onChange: (newVal: T | null) => void,
        placeholder?: string,
        label?: string,
        renderChip?: (id: string) => ReactNode,
        options: T[],
        disabled?: boolean
    }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const selectingOption = useRef(false);
    const [showOptions, toggleOptions] = useState<boolean>(false);
    const [inputText, changeInputText] = useState<string>(value?.name ?? "");
    const [highlighted, changeHighlighted] = useState<number>(-1);

    useEffect(() => {
        changeInputText(value?.name ?? "");
    }, [value]);

    const autoFill = () => {
        if (value?.name !== inputText) {

            const closestOption = options.find(o => o.name.toLowerCase().includes(inputText.toLowerCase()));
            const chosenOption = closestOption ?? options[0];
            if (chosenOption) {
                changeInputText(chosenOption.name);
                onChange(chosenOption);
            }
        }
    }
    const filteredOptions = options.filter(o => o.name.toLowerCase().includes(inputText.toLowerCase()));

    const blurInput = () => {
        if (!selectingOption.current) {
            autoFill();
        }
        toggleOptions(false);
        changeHighlighted(-1);
        selectingOption.current = false;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        let newHighlight = highlighted;
        if (e.key === "ArrowDown") {
            newHighlight = (newHighlight + 1) % filteredOptions.length;
            changeHighlighted(newHighlight);
        } else if (e.key === "ArrowUp") {
            if (newHighlight - 1 < 0) {
                newHighlight = filteredOptions.length - 1;
            } else {
                newHighlight -= 1;

            }
            changeHighlighted(newHighlight);

        } else if (e.key === "Enter" && highlighted >= 0) {
            onChange(filteredOptions[highlighted]);
            changeInputText(filteredOptions[highlighted].name);
            toggleOptions(false);
            changeHighlighted(-1);
            selectingOption.current = true;
            inputRef.current?.blur();
        } else if (e.key === "Escape") {
            blurInput();
            changeHighlighted(-1);
        }
    }

    const clear = () => {
        onChange(null);
        changeInputText("");
        toggleOptions(false);
        changeHighlighted(-1);
    }

    useEffect(() => {
        if (highlighted != -1) {
            optionsRef.current?.scrollTo({
                top: highlighted * 44,
                behavior: "instant"
            })
        }
    }, [highlighted]);

    console.log(filteredOptions[highlighted]);
    return (
        <div className="flex flex-1 font-raleway flex-col gap-[6px] relative">
            {label && <label className="uppercase font-raleway text-left font-light text-xs tracking-widest">{label}</label>}
            <input
                ref={inputRef}
                value={inputText}
                onChange={(e) => {
                    if(!disabled) {
                        changeInputText(e.target.value);
                        if(e.target.value.length == 0) {
                            onChange(null);
                        }
                    } }}
                        
                onKeyDown={(e) => !disabled && handleKeyDown(e)}
                className={classNames(
                    "bg-[rgba(255,255,255,0.05)] font-regular p-[15px] rounded-[8px]",
                    "outline-none border-none box-border",
                    "focus:border focus:border-solid focus:border-secondary",
                    disabled ? "cursor-not-allowed" : "",
                    renderChip ? "!pl-[49px]" : ""
                )}
                onFocus={() => !disabled && toggleOptions(true)}
                onBlur={() => !disabled && setTimeout(blurInput, 300)}
                placeholder={placeholder}
                disabled={disabled}
            />
            {renderChip &&
                <div className="absolute left-[15px] bottom-[15px]">
                    {value != null ? renderChip(value.id) : <div className="bg-[rgba(255,255,255,0.1)] w-[24px] h-[24px] rounded-[4px]" />}
                </div>
            }
            {value != null && !disabled &&
                <X size={24} className="absolute right-[15px] bottom-[15px]" onClick={clear} />
            }
            {showOptions &&
                <div ref={optionsRef} className={classNames(
                    "absolute top-[110%] max-h-[200px] w-full z-50 box-border ",
                    "bg-background rounded-[8px] border border-solid border-[rgba(255,255,255,0.1)]",
                    "flex flex-col font-raleway overflow-y-scroll text-left"
                )}>
                    {filteredOptions.map((o, i) => (
                        <div
                            onClick={() => {
                                selectingOption.current = true;
                                changeInputText(o.name);
                                onChange(o);
                                toggleOptions(false);
                            }}
                            className={
                                classNames("px-[15px] flex items-center gap-[10px] py-[10px] hover:bg-[rgba(255,255,255,0.05)]",
                                    highlighted == i ? "bg-[rgba(255,255,255,0.05)]" : ""
                                )}
                            key={o.id}
                        >{renderChip && renderChip(o.id)} {o.name}</div>
                    ))}
                </div>
            }
        </div>
    )
}