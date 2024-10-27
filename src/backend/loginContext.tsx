"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";

interface LoginContextData {
    authUser: User | null,
    loggedIn: boolean | null
}

const LoginContext = createContext<LoginContextData>({
    authUser: null,
    loggedIn: null
});

function LoginContextProvider({ children }: PropsWithChildren){
    const [authUser, changeAuthUser] = useState<User | null>(null);
    const [loggedIn, changeLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            changeAuthUser(user);
            if(user) {
                changeLoggedIn(true);
            } else {
                changeLoggedIn(false);
            }
        });
    }, [onAuthStateChanged])

    const values: LoginContextData = {
        authUser,
        loggedIn
    }

    return (
        <LoginContext.Provider value={values}>
            {children}
        </LoginContext.Provider>
    )
}

export default LoginContext;
export { LoginContextProvider };