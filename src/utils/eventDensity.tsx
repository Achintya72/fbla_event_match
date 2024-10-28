import { CompEvent } from "@/backend/types";

export const eventDensity: (event: CompEvent) => "low" | "medium" | "high" = (event) => {
    if(event.teams.length < event.maxTeams) {
        return "low";
    } 
    if(event.teams.length < event.maxTeams + 2) {
        return "medium";
    }
    return "high";
}