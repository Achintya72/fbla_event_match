type StudentID = string;
type TeamID = string;
type EventID = string;

interface Student {
    id: StudentID
    name: string,
    grade: 9 | 10 | 11 | 12,
    onboarded: boolean,
    teams: StudentTeamAddress[],
}

interface StudentTeamAddress {
    teamId: TeamID,
    eventId: EventID
}

interface CompEvent {
    id: EventID,
    name: string,
    minMembers: number,
    maxMembers: number,
    maxTeams: number,
    teams: TeamID[],
    type: "test" | "roleplay" | "presentation" | "chapter" | "production",
    level: "state-only" | "regular",
    intro: boolean
}

interface Team {
    id: TeamID,
    students: StudentID[],
    captain: StudentID,
    eventId: EventID,
    eventName: string,
} 

export type {
    StudentID,
    TeamID,
    EventID,
    Student,
    StudentTeamAddress,
    CompEvent,
    Team
}