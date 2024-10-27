"use client";

import { auth } from "@/backend/firebase";
import Button from "@/components/Button";
import ErrorChip from "@/components/ErrorChip";
import Input from "@/components/Input";
import Navbar from "@/components/Navbar";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";

interface LoginForm extends FieldValues {
    email: string,
    password: string
}

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>(
        {
            mode: "all",
            reValidateMode: "onChange"
        }
    );
    const [error, changeError] = useState<string | null>(null);
    const { push } = useRouter();

    const onSubmit = async (formValues: LoginForm) => {
        try {
            await signInWithEmailAndPassword(auth, formValues.email, formValues.password);
            push("/dashboard");
        } catch(err) {
            console.log(err);
            changeError("Something went wrong. Try again later")
        }
    }

    return (
        <div className="layout flex flex-col relative nav-top text-center overflow-x-hidden  text-white min-h-[100vh]">
            <Navbar />
            <main className="relative z-10 flex-1 w-full text-center flex flex-col items-center justify-center">
                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[400px] flex flex-col items-stretch gap-[24px]">
                    <h1 className="font-space font-bold">Log In</h1>
                    <Input<LoginForm>
                        label="School Email"
                        register={register}
                        options={{
                            required: "Required Field",
                            pattern: { value: /^\d{7}@lwsd\.org$/, message: "School emails only" }
                        }}
                        error={errors.email}
                        placeholder="1111111@lwsd.org"
                        type="email"
                        name="email"
                    />
                    <Input<LoginForm>
                        name="password"
                        label="Password"
                        register={register}
                        options={{
                            required: "Field is required",
                            minLength: { value: 5, message: "Must be atleast 5 characters" }
                        }}
                        error={errors.password}
                        placeholder="••••••••••••••••"
                        type="password"
                    />
                    <Button type="submit">Log In</Button>
                    <Button type="button" variant="text" onClick={() => push("/createAccount")}>Create Account</Button>
                </form>
            </main>
            <div className="!absolute !z-0 yellow-circle overflow-hidden" />
            <div className="!absolute !z-0 blue-circle" />
            <ErrorChip message={error} changeMessage={changeError}/>
        </div>
    )
}