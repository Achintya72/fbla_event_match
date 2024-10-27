"use client";

import classNames from "@/utils/classnames";
import { X } from "@phosphor-icons/react/dist/ssr";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function ErrorChip({ message, changeMessage }: { message: string | null, changeMessage: Dispatch<SetStateAction<string | null>> }) {
    const [show, changeShow] = useState(false);

    useEffect(() => {
        changeShow(false);
        if (message) {
            changeShow(true);
            setTimeout(() => {
                changeMessage(null);
            }, 10000);
        } else {
            changeShow(false);
        }
    }, [message]);

    return (
        <>
            {
                show ? <div
                    onClick={() => {
                        changeMessage(null);
                    }}
                    className={
                        classNames("z-50 bg-red-600 flex items-center p-[15px]",
                            "rounded-[8px] w-full max-w-[250px] absolute",
                            "left-[50%] bottom-[20px] errorChip",
                            "text-white font-raleway font-bold",
                            "drop-shadow-[0_-4px_16px_rgba(255,0,0,0.15)]"
                        )
                    }

                >
                    < p className="flex-1 text-left" > {message}</p >
                    <X size={20} />
                </div > : <></>
            }
        </>
    )
}