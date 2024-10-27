"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { auth } from "./firebase";

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
    }, [])

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