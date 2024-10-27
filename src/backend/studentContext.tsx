"use client";

import { createContext, PropsWithChildren, useContext, useEffect, useLayoutEffect, useState } from "react";
import { Student, StudentID, Team } from "./types";
import LoginContext from "./loginContext";
import { collection, doc, DocumentSnapshot, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Loader from "@/components/Loader";

interface StudentContextData {
    students: Student[],
    populated: boolean,
    myTeams: Team[],
    populatedTeams: boolean,
    getMe: () => Student | undefined
}

const StudentContext = createContext<StudentContextData>({
    students: [],
    myTeams: [],
    populatedTeams: false,
    getMe: () => undefined,
    populated: false,
});

function StudentContextProvider({ children }: PropsWithChildren) {
    const [students, changeStudents] = useState<Student[]>([]);
    const [populated, changePopulated] = useState<boolean>(false);
    const [populatedTeams, changePopulatedTeams] = useState<boolean>(false);
    const [myTeams, changeMyTeams] = useState<Team[]>([]);
    const { authUser } = useContext(LoginContext);
    
    useEffect(() => {
        changePopulated(false);
        const getStudents = async () => {
            const response = await getDocs(collection(db, "students"));
            const newStudents = response.docs.map(doc => {
                return {...doc.data(), id: doc.id as StudentID} as Student
            });
            changeStudents(newStudents);
            changePopulated(true);
        }
        
        if(authUser) {
            getStudents();
        } else {
            changeStudents([]);
            changePopulated(true);
        }
    }, [authUser, getDocs, collection, db, changeStudents, changePopulated]);
    

    useEffect(() => {
        const getMyNewTeams = async () => {
            const myProfile = getMe();
            if(myProfile != undefined) {
                const promises: Promise<Team | null>[] = myProfile.teams.map(async ({ teamId }) => {
                    const teamRef = doc(db, "teams", teamId);
                    const docSnap = await getDoc(teamRef);

                    return docSnap.exists() ? ({...docSnap.data(), id: docSnap.id} as Team) : null;
                });

                const data: Team[] = (await Promise.all(promises)).filter(team => team != null);
                changeMyTeams(data);
                changePopulatedTeams(true);
                
            }
        }

        if(authUser) {
            getMyNewTeams();
        } else {
            changeMyTeams([]);
            changePopulatedTeams(true);
        }
    }, [authUser, students, getDoc, doc, db, changeMyTeams, changePopulatedTeams ]);

    const getMe = () => {
        return students.find(s => s.id === authUser?.uid);
    }

    const values: StudentContextData = {
        students,
        populated,
        myTeams,
        populatedTeams,
        getMe
    }

    return (
        <StudentContext.Provider value={values}>{children}</StudentContext.Provider>
    )
}

export default StudentContext;
export { StudentContextProvider };