"use client";

import { createContext, Dispatch, PropsWithChildren, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { Student, StudentID, Team } from "./types";
import LoginContext from "./loginContext";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

interface StudentContextData {
    students: Student[],
    populated: boolean,
    myTeams: Team[],
    populatedTeams: boolean,
    getMe: () => Student | undefined,
    addNewUser: (id: string, data: Student, changeError: Dispatch<SetStateAction<string | null>>) => void
    editStudent: (data: Student, changeError: Dispatch<SetStateAction<string | null>>) => void
}

const StudentContext = createContext<StudentContextData>({
    students: [],
    myTeams: [],
    populatedTeams: false,
    getMe: () => undefined,
    populated: false,
    addNewUser: () => { },
    editStudent: () => {}
});

function StudentContextProvider({ children }: PropsWithChildren) {
    const [students, changeStudents] = useState<Student[]>([]);
    const [populated, changePopulated] = useState<boolean>(false);
    const [populatedTeams, changePopulatedTeams] = useState<boolean>(false);
    const [myTeams, changeMyTeams] = useState<Team[]>([]);
    const { authUser } = useContext(LoginContext);

    const getMe = useCallback(() => {
        return students.find(s => s.id === authUser?.uid);
    }, [students, authUser]);

    const addNewUser = async (id: string, data: Student, changeError: Dispatch<SetStateAction<string | null>>) => {
        console.log(id);
        try {
            await setDoc(doc(db, "students", id), {
                ...data
            });
            changeStudents(prev => [...prev, { ...data, id: id }]);
        } catch (err) {
            console.log("Uh oh", err);
            changeError("Something went wrong. Try again later");
        }
    }

    const editStudent = async (data: Student, changeError: Dispatch<SetStateAction<string | null>>) => {
        try {
            await setDoc(doc(db, "students", data.id), {
                ...data
            }, { merge: true});
            changeStudents(prev => {
                const newPrev = prev.filter(s => s.id !== data.id);
                return [...newPrev, data];
            })
        } catch(err) {
            console.log(err);
            changeError("Something's wrong. Try again later");
        }
    }

    useEffect(() => {
        changePopulated(false);
        const getStudents = async (uid: string) => {
            const response = await getDocs(collection(db, "students"));
            const newStudents = response.docs.map(doc => {
                return { ...doc.data(), id: doc.id as StudentID } as Student
            });
            if (newStudents.find(s => s.id === uid) == undefined) {
                await setDoc(doc(db, "students", uid), {
                    id: uid,
                    name: "",
                    grade: 9,
                    onboarded: false,
                    teams: []
                });
                changeStudents([...newStudents, {
                    id: uid,
                    name: "",
                    grade: 9,
                    onboarded: false,
                    teams: []
                }]);
            } else {
                changeStudents(newStudents);

            }
            changePopulated(true);
        }

        if (authUser) {
            getStudents(authUser.uid);
        } else {
            changeStudents([]);
            changePopulated(true);
        }
    }, [authUser, changeStudents, changePopulated]);


    useEffect(() => {
        const getMyNewTeams = async () => {
            const myProfile = getMe();
            if (myProfile != undefined) {
                const promises: Promise<Team | null>[] = myProfile.teams.map(async ({ teamId }) => {
                    const teamRef = doc(db, "teams", teamId);
                    const docSnap = await getDoc(teamRef);

                    return docSnap.exists() ? ({ ...docSnap.data(), id: docSnap.id } as Team) : null;
                });

                const data: Team[] = (await Promise.all(promises)).filter(team => team != null);
                changeMyTeams(data);
                changePopulatedTeams(true);

            }
        }

        if (authUser) {
            getMyNewTeams();
        } else {
            changeMyTeams([]);
            changePopulatedTeams(true);
        }
    }, [authUser, students, getMe, changeMyTeams, changePopulatedTeams]);


    const values: StudentContextData = {
        students,
        populated,
        myTeams,
        populatedTeams,
        getMe,
        addNewUser,
        editStudent
    }

    return (
        <StudentContext.Provider value={values}>{children}</StudentContext.Provider>
    )
}

export default StudentContext;
export { StudentContextProvider };