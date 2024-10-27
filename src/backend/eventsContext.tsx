"use client";

import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { CompEvent, EventID } from "./types";
import LoginContext from "./loginContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

interface EventsContextData {
    populated: boolean,
    events: CompEvent[]
}

const EventsContext = createContext<EventsContextData>({
    populated: false,
    events: []
});


const EventsContextProvider = ({ children }: PropsWithChildren) => {
    const [populated, changePopulated] = useState(false);
    const [events, changeEvents] = useState<CompEvent[]>([]);
    const { authUser } = useContext(LoginContext);

    useEffect(() => {
        const fetchEvents = async () => {
            const response = await getDocs(collection(db, "events"));
            const newEvents = response.docs.map(doc => {
                return { ...doc.data(), id: doc.id as EventID } as CompEvent
            });
            changeEvents(newEvents);
            changePopulated(true);
        }
        changePopulated(false);
        if (authUser) {
            fetchEvents();
        } else {
            changeEvents([]);
            changePopulated(true);
        }
    }, [
        authUser,
        db,
        getDocs,
        changeEvents,
        changePopulated
    ]);

    const values: EventsContextData = {
        events,
        populated
    }

    return (
        <EventsContext.Provider value={values}>{children}</EventsContext.Provider>
    )
}

export default EventsContext;
export { EventsContextProvider };