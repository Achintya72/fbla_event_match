"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "../Button";
import { useState } from "react";
import { List } from "@phosphor-icons/react";
import { X } from "@phosphor-icons/react/dist/ssr";

export default function Navbar() {
    const [showMenu, toggleMenu] = useState<boolean>(false);
    return (
        <nav className="flex relative items-center justify-between w-full text-white">
            <div className="flex gap-[20px]">
                <Image src="/fbla.png" width={30} height={30} alt="FBLA Logo" />
                <h4 className="font-space text-2xl font-bold">FBLA Event Match</h4>
            </div>
            <div className="hidden md:flex absolute left-[50%] translate-x-[-50%] gap-[20px]">
                <Link href="/" className="font-raleway font-medium" >Home</Link>
                <Link href="/dashboard" className="font-raleway font-medium" >Dashboard</Link>
            </div>
            <Button className="hidden md:block">Log In</Button>
            {!showMenu ?
                <List size={24} onClick={() => toggleMenu(true)} className="flex md:hidden" /> :
                <X size={24} className="flex md:hidden" onClick={() => toggleMenu(false)} />
            }
            {showMenu &&
                <div className="absolute z-50 right-[0px] top-[45px] text-right border border-[rgba(255,255,255,0.3)] flex gap-[20px] bg-background p-[20px] rounded-[8px] flex-col md:hidden">
                    <Link href="/" className="font-raleway font-medium" >Home</Link>
                    <Link href="/dashboard" className="font-raleway font-medium" >Dashboard</Link>
                    <Button>Log In</Button>
                </div>
            }
        </nav>
    )
}