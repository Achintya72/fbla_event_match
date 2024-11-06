"use client";

import StudentContext from "@/backend/studentContext";
import { Student, Team } from "@/backend/types";
import ComboBox from "@/components/ComboBox";
import classNames from "@/utils/classnames";
import { CaretDown, Warning } from "@phosphor-icons/react/dist/ssr";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { TeamDetails } from "./eventView";

export default function StudentView({
    teams,
    changeTeams,
}: {
    teams: Team[],
    changeTeams: Dispatch<SetStateAction<Team[]>>
}) {
    const { students } = useContext(StudentContext);
    const [stu, changeStu] = useState<Student | null>(null);

    const studentsToRender = (stu != null ? students.filter(s => s.id === (stu.id ?? "")) : students).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
            <div className="relative flex items-end gap-[20px]">
                <ComboBox<Student>
                    value={stu}
                    onChange={changeStu}
                    options={students}
                    label="Select Student"
                />
            </div>
            {studentsToRender.map(s => <StudentDetails key={s.id} changeTeams={changeTeams} student={s} teams={teams} />)}
        </>
    )
}

const StudentDetails = ({ student, teams, changeTeams }: { student: Student, changeTeams: Dispatch<SetStateAction<Team[]>>, teams: Team[] }) => {
    const [showTeams, changeShowTeams] = useState(false);
    const { students } = useContext(StudentContext);
    const myTeams = teams.filter(t => t.students.includes(student.id));

    const count = myTeams.reduce((prevCount, team) => {
        if (team.status === "selected") return prevCount + 1;
        return prevCount
    }, 0);

    return (
        <div className="flex flex-col gap-[10px]">

            <div className="flex gap-[10px] items-center cursor-pointer" onClick={() => changeShowTeams(prev => !prev)}>
                <h2 className="font-space flex-1 text-2xl font-semibold">{student.name.trim().length != 0 ? student.name : "[No Name]"} ({count} out of {student.teams.length})</h2>
                {student.teams.length !== myTeams.length &&
                    <>
                        <div className="p-[2px] rounded-8px flex items-center justify-center bg-red-500 rounded-[4px]">
                            <Warning size={20} />
                        </div>
                        <p className="font-raleway">{student.id}</p>
                    </>
                }
                <CaretDown size={24} className={classNames("transition-all", showTeams ? "rotate-180" : "")} />
            </div>
            {showTeams &&
                <div className="flex gap-[20px] flex-wrap">
                    {myTeams.map(t => <TeamDetails changeTeams={changeTeams} exists={student.teams.findIndex(team => team.teamId === t.id) != -1} teams={teams} showName team={t} students={students} key={t.id} />)}
                </div>
            }
        </div>
    )
}