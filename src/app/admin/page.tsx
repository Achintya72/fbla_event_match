"use client";

import EventsContext from "@/backend/eventsContext";
import { db } from "@/backend/firebase";
import StudentContext from "@/backend/studentContext";
import { CompEvent, Student, Team } from "@/backend/types";
import Button from "@/components/Button";
import ComboBox from "@/components/ComboBox";
import DensityChip from "@/components/DensityChip";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import classNames from "@/utils/classnames";
import { eventDensity } from "@/utils/eventDensity";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useLayoutEffect, useState } from "react";

export default function Admin() {
    const [event, changeEvent] = useState<CompEvent | null>(null);
    const { getMe } = useContext(StudentContext);
    const [allTeams, changeTeams] = useState<Team[]>([]);
    const [loading, changeLoading] = useState(true);
    const { events } = useContext(EventsContext);
    const { push } = useRouter();
    const [hideEmpty, changeHideEmpty] = useState(true);

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

    const searchedEvents = event == null ? events : events.filter((e) => e.id === event.id);
    const eventsToRender = searchedEvents.filter(e => !hideEmpty || e.teams.length > 0);

    return (
        <div className="layout flex flex-col relative nav-top overflow-x-hidden  text-white min-h-[100vh]">
            <Navbar />
            {loading ? <Loader /> :
                <main className="relative z-10 flex-1 gap-[20px] w-full flex flex-col ">
                    <h1 className="font-space font-bold">Admin</h1>
                    <div className="relative flex items-end gap-[20px]">
                        <ComboBox<CompEvent>
                            value={event}
                            onChange={changeEvent}
                            options={events}
                            label="Select Event"
                            renderChip={(id: string) => {
                                const e = events.find(ev => ev.id === id);
                                if (e) {
                                    return <DensityChip density={eventDensity(e)} />
                                }
                                return <DensityChip density="low" />
                            }}
                        />
                        <Button onClick={() => changeHideEmpty(prev => !prev)}>{hideEmpty ? "Show All" : "Hide Empty"}</Button>
                    </div>
                    {eventsToRender.map(e => {
                        return (
                            <EventDetails event={e} key={e.id} teams={allTeams} />
                        )
                    })}
                </main>
            }
        </div>
    )
}


const EventDetails = ({ event, teams }: { event: CompEvent, teams: Team[] }) => {
    const [showTeams, changeShowTeams] = useState(false);
    const { students } = useContext(StudentContext);

    const eventTeams = teams.filter((t) => t.eventId === event.id);

    return (
        <div className="flex flex-col gap-[10px]">
            <div className="flex gap-[10px] items-center cursor-pointer" onClick={() => changeShowTeams(prev => !prev)}>
                <DensityChip density={eventDensity(event)} />
                <h2 className="font-space flex-1 text-2xl font-semibold">{event.name} ({event.teams.length})</h2>
                <CaretDown size={24} className={classNames("transition-all", showTeams ? "rotate-180" : "")} />
            </div>
            {showTeams &&
                <div className="flex gap-[20px] flex-wrap">
                    {eventTeams.map(t => <TeamDetails key={t.id} team={t} students={students}/>)}
                </div>
            }
        </div>
    )
}


const TeamDetails = ({ team, students }: { team: Team, students: Student[] }) => {
    
    const teamStudents: Student[] = students.filter((s) => team.students.includes(s.id));
    return (
        <div className="p-[20px] min-w-[200px] max-w-[350px] flex-1 border border-solid border-gray-600">
            {teamStudents.map(stu => <p className="font-raleway" key={stu.id}>{stu.name} ({stu.grade})</p>)}
        </div>
    )
}