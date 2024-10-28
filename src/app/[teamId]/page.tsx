"use client";

import EventsContext from "@/backend/eventsContext";
import { db } from "@/backend/firebase";
import StudentContext from "@/backend/studentContext";
import { CompEvent, Student, Team } from "@/backend/types";
import Button from "@/components/Button";
import ComboBox from "@/components/ComboBox";
import DensityChip from "@/components/DensityChip";
import Navbar from "@/components/Navbar";
import { eventDensity } from "@/utils/eventDensity";
import { CaretLeft, Trash } from "@phosphor-icons/react/dist/ssr";
import { arrayUnion, doc, getDoc, writeBatch } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useContext, useState } from "react";

export default function EditTeam() {
    const { teamId } = useParams();
    const { myTeams } = useContext(StudentContext);

    const thisTeam = myTeams.find(t => t.id === teamId);
    return (
        <div className="layout flex flex-col relative nav-top text-center overflow-x-hidden  text-white min-h-[100vh]">
            <Navbar />
            <main className="relative z-10 flex-1 w-full text-center flex flex-col items-center justify-center">
                {thisTeam ? <EditTeamForm team={thisTeam} /> : <h2 className="font-space text-3xl font-bold">This team doesn't exist, or you don't have accesss</h2>}
            </main>
        </div >
    )
}

function EditTeamForm({ team }: { team: Team }) {
    const { events } = useContext(EventsContext);
    const { students, getMe, rehydrateStudents } = useContext(StudentContext);
    const [event, changeEvent] = useState<CompEvent | null>(events.find(e => e.id === team.eventId) ?? null);
    const initialStudents = team.students.map(s => students.find(stu => stu.id === s) ?? null);
    const [teammates, changeTeammates] = useState<(Student | null)[]>(initialStudents);
    const router = useRouter();
    const [loading, changeLoading] = useState(false);
    const [errors, changeErrors] = useState<string[]>([]);
    const me = getMe();

    const submit = async () => {
        if (!loading) {

            changeErrors([]);
            let newErrors: string[] = [];
            if (event == null) {
                newErrors = ["Must select an event!", ...newErrors]
            }
            let nullTeammates = teammates.filter(t => t == null).length;
            if (nullTeammates > 0) {
                newErrors = [...newErrors, `You have ${nullTeammates} empty teammates`];
            }
            if (event != null && teammates.length > event.maxMembers) {
                newErrors = [...newErrors, "Too many teammates!"];
            }
            if (event != null && teammates.length < event.minMembers) {
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
                if (s.teams.filter(t => t.teamId != team.id).length >= 6) {
                    newErrors = [...newErrors, `${s.name} already has 6 events`];
                }
                if (s.teams.filter(t => t.teamId != team.id).find(t => t.eventId === event?.id) != undefined) {
                    newErrors = [...newErrors, `${s.name} is already doing this event`];
                }
                if (s.grade == 12) {
                    seniorCount++;
                } else if (s.grade == 11) {
                    juniorCount++;
                }
            })
            if (event?.intro && (seniorCount > 0 || juniorCount > 0)) {
                newErrors = [...newErrors, "Intro events are only for underclassmen!"];
            }
            if (event != null && event.level == "state-only" && Math.floor(teammates.length / 2) <= seniorCount) {
                newErrors = [...newErrors, "For state-only events, seniors have to make up less than 50% of the team"]
            };
            changeErrors(newErrors);
            if (me != null && event != null && newErrors.length == 0) {
                changeLoading(true);
                try {

                    const batch = writeBatch(db);
                    initialStudents.filter(t => t != undefined).forEach(s => {
                        batch.set(
                            doc(db, "students", s.id),
                            {
                                teams: s.teams.filter(t => t.teamId !== team.id) 
                            }, { merge: true }
                        )
                    });
                    teammates.filter(t => t !=undefined).forEach(s => {
                        batch.set(
                            doc(db, "students", s.id),
                            {
                                teams: arrayUnion({ teamId: team.id, eventId: team.eventId })
                            }, { merge: true }
                        )
                    })
                    await batch.commit();
                    // local rehydration
                    const removingFromInitial = initialStudents.filter(s => s != undefined).map(s => ({ ...s, teams: s.teams.filter(t => t.teamId !== team.id )}));
                    console.log(removingFromInitial);
                    rehydrateStudents(removingFromInitial);
                    const addingNew = teammates.filter(s => s != undefined).map(s => ({ ...s, teams: [...s.teams.filter(t => t.teamId !== team.id), { teamId: team.id, eventId: team.eventId }]}));
                    console.log(addingNew);
                    rehydrateStudents(addingNew);
                    router.push("/dashboard");
                } catch (err) {
                    console.log(err);
                    changeErrors(prev => [...prev, "Something went wrong... Try again later"])
                }
                changeLoading(false);
            }
        }
    }

    return (
        <>
            <div onClick={router.back} className="flex gap-[10px] cursor-pointer justify-start w-full max-w-[400px] items-center">
                <CaretLeft size={24} />
                <p className="text-2xl font-raleway font-light">Back</p>
            </div>
            <div className="w-full max-w-[400px] flex flex-col items-stretch gap-[24px]">
                <h1 className="font-space text-left font-bold">Edit Team</h1>
                <ComboBox<CompEvent>
                    value={event}
                    onChange={changeEvent}
                    label="Select Event"
                    options={events}
                    disabled
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
                                        let newTeammates = [...teammates];
                                        newTeammates.splice(i, 1);
                                        changeTeammates(newTeammates);
                                    }} icon={<Trash size={24} />}></Button>
                                }
                            </div>
                        ))}
                        {teammates.length < event?.maxMembers &&
                            <Button variant="text" onClick={() => {
                                let newTeammates = [...teammates, null];
                                changeTeammates(newTeammates);
                            }}>Add Teammate</Button>

                        }
                    </>
                }
                <Button loading={loading} onClick={submit}>Save Changes</Button>
                <ul className="text-red-500 font-raleway font-light text-left">
                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
            </div>
        </>
    )
}