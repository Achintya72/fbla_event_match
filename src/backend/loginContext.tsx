"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import Loader from "@/components/Loader";

interface LoginContextData {
    authUser: User | null,
    populated: boolean
}

const LoginContext = createContext<LoginContextData>({
    authUser: null,
    populated: false
});

function LoginContextProvider({ children }: PropsWithChildren){
    const [authUser, changeAuthUser] = useState<User | null>(null);
    const [populated, changePopulated] = useState<boolean>(false);

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            changeAuthUser(user);
            changePopulated(true);
        });
    }, [onAuthStateChanged])

    const values: LoginContextData = {
        authUser,
        populated
    }

    return (
        <LoginContext.Provider value={values}>
            {children}
        </LoginContext.Provider>
    )
}

export default LoginContext;
export { LoginContextProvider };