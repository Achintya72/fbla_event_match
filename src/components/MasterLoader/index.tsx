"use client";

import EventsContext from "@/backend/eventsContext";
import LoginContext from "@/backend/loginContext";
import StudentContext from "@/backend/studentContext";
import { PropsWithChildren, useContext } from "react";
import Loader from "../Loader";

export default function MasterLoader({ children }: PropsWithChildren) {
    const { populated: populatedAuth } = useContext(LoginContext);
    const { populated, populatedTeams } = useContext(StudentContext);
    const { populated: populatedEvents } = useContext(EventsContext);
    const allDone = [populatedAuth, populated, populatedTeams, populatedEvents];

    if(allDone.find(p => !p) != undefined) {
        return <Loader fullScreen />
    }
    
    return children;
}