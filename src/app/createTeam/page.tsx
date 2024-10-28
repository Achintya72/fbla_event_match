"use client";

import EventsContext from "@/backend/eventsContext";
import ComboBox from "@/components/ComboBox";
import Navbar from "@/components/Navbar";
import DensityChip from "@/components/DensityChip";
import { CaretLeft, Trash } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useContext, useLayoutEffect, useState } from "react";
import { eventDensity } from "@/utils/eventDensity";
import Button from "@/components/Button";
import { CompEvent, Student, Team } from "@/backend/types";
import StudentContext from "@/backend/studentContext";
import LoginContext from "@/backend/loginContext";
import { addDoc, arrayUnion, collection, doc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "@/backend/firebase";


export default function CreateTeam() {
    const { events } = useContext(EventsContext);
    const { authUser } = useContext(LoginContext);
    const { getMe, students, rehydrateStudents, addNewTeam } = useContext(StudentContext);
    const me = getMe();
    const initialTeammates = me ? [me] : [];
    const [event, changeEvent] = useState<CompEvent | null>(null);
    const router = useRouter();
    const [errors, changeErrors] = useState<string[]>([]);
    const [teammates, changeTeammates] = useState<(Student | null)[]>(initialTeammates);
    const [loading, changeLoading] = useState(false);

    useLayoutEffect(() => {
        if (!authUser) {
            router.push("/login");
        }
    }, [authUser, router]);

    const submit = async () => {
        if(!loading) {

            changeErrors([]);
            let newErrors: string[] = [];
            if(event == null) {
                newErrors = ["Must select an event!", ...newErrors]
            }
            const nullTeammates = teammates.filter(t => t == null).length;
            if(nullTeammates > 0) {
                newErrors = [...newErrors, `You have ${nullTeammates} empty teammates`];
            }
            if(event != null && teammates.length > event.maxMembers ) {
                newErrors =  [...newErrors, "Too many teammates!"];
            }
            if(event != null && teammates.length < event.minMembers) {
                newErrors = [...newErrors, "Too few teammates!"];
            }
            const promises: Promise<Student | null>[] = teammates.filter(t => t != null).map(async ({ id }) => {
                const stuRef = doc(db, "students", id);
                const docSnap = await getDoc(stuRef);
    
                return docSnap.exists() ? ({ ...docSnap.data(), id: docSnap.id } as Student) : null;
            });
    
            const data: Student[] = (await Promise.all(promises)).filter(s => s != null);
            let seniorCount = 0;
            let juniorCount = 0;
            data.forEach(s => {
                if(s.teams.length == 6) {
                    newErrors = [...newErrors, `${s.name} already has 6 events`];
                }
                if(s.teams.find(t => t.eventId === event?.id) != undefined) {
                    newErrors = [...newErrors, `${s.name} is already doing this event`];
                }
                if(s.grade == 12) {
                    seniorCount++;
                } else if(s.grade == 11) {
                    juniorCount ++;
                } 
            })
            if(event?.intro && (seniorCount > 0 || juniorCount > 0)) {
                newErrors = [...newErrors, "Intro events are only for underclassmen!"];
            }
            if(event != null && event.level == "state-only" && Math.floor(teammates.length / 2) <=  seniorCount) {
                newErrors = [...newErrors, "For state-only events, seniors have to make up less than 50% of the team"]
            };
            changeErrors(newErrors);
            if(me != null && event != null && newErrors.length == 0) {
                changeLoading(true);
                try {

                    const batch = writeBatch(db);
                    const confirmation = await addDoc(collection(db, "teams"), {
                        captain: me.id,
                        eventId: event.id,
                        eventName: event.name,
                        students: teammates.filter(s => s != undefined).map(s => s.id)
                    } as Team);
                    batch.set(
                        doc(db, "events", event.id), {
                            teams: arrayUnion(confirmation.id)
                        }, {merge: true}
                    );
                    teammates.filter(t => t != undefined).forEach(s => {
                        batch.set(
                            doc(db, "students", s.id),
                            {
                                teams: arrayUnion({ 
                                    teamId: confirmation.id,
                                    eventId: event.id
                                })
                            }, {merge: true}
                        )
                    });
                    await batch.commit();
                    const newData = data.filter(s => s.id !== me.id).map(s => ({ ...s, teams: [...s.teams, {  teamId: confirmation.id, eventId: event.id }]}));
                    rehydrateStudents(newData);
                    addNewTeam({
                        id: confirmation.id,
                        captain: me.id,
                        eventId: event.id,
                        eventName: event.name,
                        students: teammates.filter(s => s != undefined).map(s => s.id)
                    } as Team)
                    router.push("/dashboard");
                } catch(err) {
                    console.log(err);
                    changeErrors(prev => [...prev, "Something went wrong... Try again later"])
                }
                changeLoading(false);
            }
        }
    }


    return (
        <div className="layout flex flex-col relative nav-top text-center overflow-x-hidden  text-white min-h-[100vh]">
            <Navbar />
            <main className="relative z-10 flex-1 w-full text-center flex flex-col items-center justify-center">
                <div onClick={router.back} className="flex gap-[10px] cursor-pointer justify-start w-full max-w-[400px] items-center">
                    <CaretLeft size={24} />
                    <p className="text-2xl font-raleway font-light">Back</p>
                </div>
                <div className="w-full max-w-[400px] flex flex-col items-stretch gap-[24px]">
                    <h1 className="font-space text-left font-bold">Create Team</h1>
                    <ComboBox<CompEvent>
                        value={event}
                        onChange={changeEvent}
                        label="Select Event"
                        options={events}
                        renderChip={(id: string) => {
                            const e = events.find(ev => ev.id === id);
                            if (e) {
                                return <DensityChip density={eventDensity(e)} />
                            }
                            return <DensityChip density="low" />
                        }}
                    />
                    {event != null &&
                        <>
                            {teammates.map((t, i) => (
                                <div
                                    key={i}
                                    className="flex items-stretch gap-[10px]"
                                >
                                    <ComboBox<Student>
                                        value={t}
                                        onChange={(newStu) => {
                                            changeTeammates(prev => {
                                                prev[i] = newStu;
                                                return [...prev];
                                            })
                                        }}
                                        options={students.filter(s => s.onboarded && teammates.find(p => p?.id === s.id) == undefined)}
                                        disabled={t?.id === me?.id}
                                        label={t?.id === me?.id ? "Select Teammates" : undefined}
                                        placeholder="Kaavya Trivedi"

                                    />
                                    {t?.id !== me?.id &&
                                        <Button className="!bg-red-500" onClick={() => {
                                            const newTeammates = [...teammates];
                                            newTeammates.splice(i, 1);
                                            changeTeammates(newTeammates);
                                        }} icon={<Trash size={24} />}></Button>
                                    }
                                </div>
                            ))}
                            {teammates.length < event?.maxMembers &&
                                <Button variant="text" onClick={() => {
                                    const newTeammates = [...teammates, null];
                                    changeTeammates(newTeammates);
                                }}>Add Teammate</Button>

                            }
                        </>
                    }
                    <Button onClick={submit} loading={loading}>Create</Button>
                    <ul className="text-red-500 font-raleway font-light text-left">
                        {errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                </div>
            </main>
            <div className="!absolute !z-0 yellow-circle overflow-hidden" />
            <div className="!absolute !z-0 blue-circle" />
        </div>
    )
}