"use client";
import { db } from "@/backend/firebase";
import StudentContext from "@/backend/studentContext";
import { CompEvent, Student, Team } from "@/backend/types";
import Button from "@/components/Button";
import ComboBox from "@/components/ComboBox";
import DensityChip from "@/components/DensityChip";
import classNames from "@/utils/classnames";
import { eventDensity } from "@/utils/eventDensity";
import { CaretDown } from "@phosphor-icons/react";
import { Check, Trash, X } from "@phosphor-icons/react/dist/ssr";
import { deleteDoc, doc } from "firebase/firestore";
import { Dispatch, SetStateAction, useContext, useState } from "react";

function EventView({
    event,
    changeEvent,
    events,
    allTeams,
    changeTeams
} : {
    event: CompEvent | null,
    changeEvent: Dispatch<SetStateAction<CompEvent | null>>,
    events: CompEvent[],
    allTeams: Team[],
    changeTeams: Dispatch<SetStateAction<Team[]>>
}) {
    const [hideEmpty, changeHideEmpty] = useState(true);

    const searchedEvents = event == null ? events : events.filter((e) => e.id === event.id);
    const eventsToRender = searchedEvents.filter(e => !hideEmpty || e.teams.length > 0);

    return (
        <>
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
                    <EventDetails changeTeams={changeTeams} event={e} key={e.id} teams={allTeams} />
                )
            })}
        </>
    )
}

const EventDetails = ({ event, teams, changeTeams }: { event: CompEvent, teams: Team[], changeTeams: Dispatch<SetStateAction<Team[]>> }) => {
    const [showTeams, changeShowTeams] = useState(false);
    const { students } = useContext(StudentContext);

    const eventTeams = teams.filter((t) => t.eventId === event.id);

    return (
        <div className="flex flex-col gap-[10px]">
            <div className="flex gap-[10px] items-center cursor-pointer" onClick={() => changeShowTeams(prev => !prev)}>
                <DensityChip density={eventDensity(event)} />
                <h2 className="font-space flex-1 text-2xl font-semibold">{event.name} ({event.teams.length} out of {event.maxTeams})</h2>
                <CaretDown size={24} className={classNames("transition-all", showTeams ? "rotate-180" : "")} />
            </div>
            {showTeams &&
                <div className="flex gap-[20px] flex-wrap">
                    {eventTeams.map(t => <TeamDetails changeTeams={changeTeams} key={t.id} team={t} teams={teams} students={students}/>)}
                </div>
            }
        </div>
    )
}


const TeamDetails = ({ team, students, exists = true, teams, changeTeams, showName = false }: { exists?: boolean, changeTeams: Dispatch<SetStateAction<Team[]>>, teams: Team[], team: Team, students: Student[], showName?: boolean }) => {
    
    const teamStudents: Student[] = students.filter((s) => team.students.includes(s.id));


    const deleteTeam = async () => {
        const teamRef = doc(db, "teams", team.id);
        await deleteDoc(teamRef);
    }

    return (
        <div className={classNames("p-[20px] min-w-[200px] max-w-[350px] flex-1 border border-solid", exists ? "border-gray-600" : "border-red-500")}>
            <div className="relative inline-flex p-[5px] rounded-[10px] gap-[10px] bg-[rgba(255,255,255,0.1)] ">
                <div 
                    className={classNames(team?.status === "selected" ? "bg-green-500" : "bg-red-500", "absolute w-[30px] h-[30px] top-[2px] left-[2px] transition-all z-0 rounded-[8px]")}
                    style={{
                        transform: (team.status ?? "rejected") === "rejected" ? " translateX(calc(4px + 100%))" : ""
                    }}
                />
                
                <Check 
                    size={24} 
                    className="relative z-10 cursor-pointer"
                    onClick={() => {
                        changeTeams(prev => {
                            const myIndex = prev.findIndex(t => t.id === team.id);
                            if(myIndex != -1) {
                                prev[myIndex].status = "selected";
                                return [...prev];
                            }
                            return prev;
                        })
                    }}    
                />
                <X 
                    size={24}  
                    className="relative z-10 cursor-pointer"  
                    onClick={() => {
                        changeTeams(prev => {
                            const myIndex = prev.findIndex(t => t.id === team.id);
                            if(myIndex != -1) {
                                prev[myIndex].status = "rejected";
                                return [...prev];
                            }
                            return prev;
                        })
                    }} 
                />
            </div>
            {!exists && 
                <>
                    <small className="font-raleway block">Team: {team.id}</small>
                    <small className="font-raleway block">Event: {team.eventId}</small>
                </>
            }
            {showName && <h3 className="mt-[6px] font-space font-semibold text-xl">{team.eventName}</h3>}
            <small className="font-raleway block font-light">Members: {teamStudents.length}</small>
            {teamStudents.map(stu => <StudentDetails allTeams={teams} key={stu.id} student={stu}/>)}
            <div className="flex gap-[10px] self-end">
            {!exists && <Trash size={24} onClick={deleteTeam}/> }

            </div>
        </div>
    )
}

const StudentDetails = ({ student, allTeams }: { student: Student, allTeams: Team[] }) => {
    const myTeams = allTeams.filter(t => t.students.includes(student.id));
    const count = myTeams.reduce((prevCount, team) => {
        if(team.status === "selected") return prevCount + 1;
        return prevCount
    }, 0);
    return (
        <p className="font-raleway" key={student.id}>{student.name} ({student.grade}) - {count}</p>
    )
}


export {TeamDetails} ;
export default EventView;