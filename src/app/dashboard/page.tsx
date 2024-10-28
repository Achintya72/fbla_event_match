"use client";
import EventsContext from "@/backend/eventsContext"
import LoginContext from "@/backend/loginContext";
import StudentContext from "@/backend/studentContext";
import Navbar from "@/components/Navbar";
import { PencilLine, Plus, SignOut, Trash, UsersFour } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import "./styles.css";
import { useContext, useLayoutEffect } from "react";
import Button from "@/components/Button";
import classNames from "@/utils/classnames";
import { Student, Team } from "@/backend/types";
import { arrayRemove, deleteDoc, doc, getDoc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "@/backend/firebase";

export default function Dashboard() {
    const { authUser } = useContext(LoginContext);
    const { getMe, myTeams, getStudent, students, rehydrateStudents, removeMyTeam } = useContext(StudentContext);
    const student = getMe();
    const { push } = useRouter();

    useLayoutEffect(() => {
        if (authUser == null) {
            push("/login");
        }
    }, [authUser]);


    const deleteTeam = async (team: Team) => {
        await setDoc(doc(db, "events", team.eventId), {
            teams: arrayRemove(team.id)
        }, { merge: true });
        await deleteDoc(doc(db, "teams", team.id));
        team.students.forEach(async s => {
            const response = (await getDoc(doc(db, "students", s))).data() as Student;
            await setDoc(doc(db, "students", s), {
                teams: response.teams.filter(t => t.teamId !== team.id)
            }, { merge: true})
        });
        // rehydrate locally
        const newStudents = team.students.map(sId => students.find(s => s.id === sId)).filter(s => s != undefined).map(s => ({ ...s, teams: s.teams.filter(t => t.teamId !== team.id)}));
        rehydrateStudents(newStudents);
        removeMyTeam(team);
    }

    const leaveTeam = async (team: Team) => {
        if(student != null) {
            const batch = writeBatch(db);
            batch.set(doc(db, "teams", team.id), {
                students: arrayRemove(student.id)
            }, { merge: true})
            batch.set(doc(db, "students", student.id), {
                teams: student.teams.filter(t => t.teamId !== team.id)
            }, { merge: true })
            await batch.commit();
            removeMyTeam(team);
        }
    }

    return (
        <div className="flex flex-col relative overflow-x-hidden  text-white min-h-[100vh]">
            <div className="nav-top flex flex-col gap-[50px]">
                <Navbar />
                <main className="relative  z-10 w-full overflow-x-hidden overflow-y-visible flex flex-col items-center justify-center">
                    {student == undefined ? <p className="font-raleway">Account doesn't exist</p> :
                        <div className="flex flex-col w-full">
                            <div className="flex justify-between items-center">
                                <h4 className="text-2xl font-light font-raleway">Good Evening,</h4>
                                <PencilLine size={24} onClick={() => push("/editStudent")} />
                            </div>
                            <h1 className="font-space font-bold">{student.name.length == 0 ? "No Name" : student.name}</h1>
                            <strong className="font-space">Grade {student.grade}</strong>
                            <div className="w-full flex items-center justify-between">
                                <h6 className="font-bold mt-[24px] font-space text-2xl">Your Teams</h6>
                                <Button
                                    variant="secondary"
                                    disabled={!student.onboarded && student.teams.length < 6}
                                    icon={<Plus size={20} />}
                                    onClick={() => push("/createTeam")}
                                >Create Team</Button>
                            </div>
                            <div className="w-full">
                                {!student.onboarded && <p className="font-raleway">Please add your name and grade first</p>}
                                <div className="mt-[24px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                                    {myTeams.map(t => (
                                        <div
                                            className={classNames(
                                                "p-[1px] bg-[rgba(255,255,255,0.3)]",
                                                "team flex flex-col"
                                            )}
                                            key={t.id}>
                                            <div className="bg-background flex-1 w-full p-[20px] flex flex-col gap-[6px]">
                                                <div className="flex gap-[10px] items-center">
                                                    <h4 className="font-space flex-1 font-bold text-xl">{t.eventName}</h4>
                                                    {t.captain === student.id ? 
                                                        <>
                                                            <UsersFour size={24} className="cursor-pointer" onClick={() => push(`/${t.id}`)} />
                                                            <Trash size={24} onClick={() => deleteTeam(t)}/>
                                                        </>
                                                        :
                                                        <SignOut size={24} onClick={() => leaveTeam(t)}/>    
                                                
                                                }
                                                </div>
                                                {t.students.map(sId => (
                                                    <p className="font-raleway font-light" key={sId}>{getStudent(sId)?.name} {t.captain === sId && "(Captain)"} </p>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        </div>
                    }
                </main>
            </div >
            <div className="stationaryBlue" />
            <div className="stationaryYellow" />
        </div >
    )
}