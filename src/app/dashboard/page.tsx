"use client";
import EventsContext from "@/backend/eventsContext"
import LoginContext from "@/backend/loginContext";
import StudentContext from "@/backend/studentContext";
import Navbar from "@/components/Navbar";
import { PencilLine } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import "./styles.css";
import { useContext, useLayoutEffect } from "react"

export default function Dashboard() {
    const { authUser } = useContext(LoginContext);
    const { getMe } = useContext(StudentContext);
    const student = getMe();
    const { push } = useRouter();

    useLayoutEffect(() => {
        if (authUser == null) {
            push("/login");
        }
    }, [authUser])

    return (
        <div className="flex flex-col relative overflow-x-hidden  text-white min-h-[100vh]">
            <div className="nav-top flex flex-col gap-[50px]">
                <Navbar />
                <main className="relative  z-10 w-full overflow-x-hidden overflow-y-visible flex flex-col items-center justify-center">
                    {student == undefined ? <p className="font-raleway">Account doesn't exist</p> :
                        <div className="flex flex-col w-full">
                            <div className="flex justify-between items-center">
                                <h4 className="text-2xl font-light font-raleway">Good Evening,</h4>
                                <PencilLine size={24} onClick={() => push("/editStudent")}/>
                            </div>
                            <h1 className="font-space font-bold">{student.name.length == 0 ? "No Name" : student.name}</h1>
                            <strong className="font-space">Grade {student.grade}</strong>
                            <h6 className="font-bold mt-[24px] font-space text-2xl">Your Teams</h6>
                            <div className="w-full">
                                {!student.onboarded && <p className="font-raleway">Please add your name and grade first</p>}
                            </div>
                        </div>
                    }
                </main>
            </div>
            <div className="stationaryBlue" />
            <div className="stationaryYellow" />
        </div>
    )
}