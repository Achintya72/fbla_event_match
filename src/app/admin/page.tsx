"use client";

import EventsContext from "@/backend/eventsContext";
import { db } from "@/backend/firebase";
import StudentContext from "@/backend/studentContext";
import { CompEvent, Team } from "@/backend/types";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import EventView from "./eventView";
import StudentView from "./studentView";

export default function Admin() {
    const { getMe } = useContext(StudentContext);
    const [loading, changeLoading] = useState(true);

    const [event, changeEvent] = useState<CompEvent | null>(null);
    const [allTeams, changeTeams] = useState<Team[]>([]);
    const [publishing, changePublishing] = useState(false);
    const { events } = useContext(EventsContext);

    const { push } = useRouter();
    const [view, changeView] = useState<"student" | "event">(
        "event"
    );

    useLayoutEffect(() => {
        if (!(getMe()?.admin ?? false)) {
            push("/");
        }
    }, [getMe, push]);

    useEffect(() => {
        const getTeams = async () => {
            changeLoading(true);
            const response = await getDocs(collection(db, "teams"));
            changeTeams(response.docs.map(t => ({ ...t.data(), id: t.id } as Team)));
            changeLoading(false);
        }

        getTeams();
    }, []);
  
    const publish = async () => {
        changePublishing(true);
        const batch = writeBatch(db);
        allTeams.forEach(t => {
            const teamRef = doc(db, "teams", t.id);
            batch.set(teamRef, {
                status: (t.status ?? "rejected")
            }, { merge: true});
        });
        await batch.commit();
        changePublishing(false);
    }

    return (
        <div className="layout flex flex-col relative nav-top overflow-x-hidden  text-white min-h-[100vh]">
            <Navbar />
            {loading ? <Loader /> :
                <main className="relative z-10 flex-1 gap-[20px] w-full flex flex-col">
                    <h1 className="font-space font-bold">Admin</h1>
                    <div className="flex items-center justify-between">
                        <div className="relative self-start flex p-[5px] rounded-[10px] bg-[rgba(255,255,255,0.1)]">
                            <div
                                className="w-[125px] transition-all duration-300 z-0 absolute top-[5px] bottom-[5px] bg-blue rounded-[5px]"
                                style={{
                                    transform: view === "event" ? "" : "translateX(100%)"
                                }}
                            />
                            <p className="cursor-pointer relative z-10 font-raleway w-[125px] text-center py-[10px]" onClick={() => changeView("event")}>Event View</p>
                            <p className="cursor-pointer relative z-10 font-raleway w-[125px] text-center py-[10px]" onClick={() => changeView("student")}>Student View</p>
                        </div>
                        <Button variant="secondary" loading={publishing} onClick={publish}>Publish</Button>
                    </div>
                    {view === "event" ?
                        <EventView
                            event={event}
                            changeEvent={changeEvent}
                            events={events}
                            allTeams={allTeams}
                            changeTeams={changeTeams}
                        />
                        : <StudentView teams={allTeams} changeTeams={changeTeams} />
                    }
               
                </main>
            }
        </div>
    )
}
