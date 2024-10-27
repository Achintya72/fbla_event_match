"use client";

import { auth } from "@/backend/firebase";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Navbar from "@/components/Navbar";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FieldValues, useForm } from "react-hook-form";

interface SignUpForm extends FieldValues {
    email: string,
    password: string,
    confirmPassword: string
}

export default function CreateAccount() {
    const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
        mode: "all",
        reValidateMode: "onChange"
    });
    const { push } = useRouter();

    const onSubmit = async (values: SignUpForm) => {
        try {
           // TODO: Add user creation

        } catch(err) {

        }
    }

    return (
        <div className="layout flex flex-col relative nav-top text-center overflow-x-hidden  text-white min-h-[100vh]">
            <Navbar />
            <main className="relative z-10 flex-1 w-full text-center flex flex-col items-center justify-center">
                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[400px] flex flex-col items-stretch gap-[24px]">
                    <h1 className="font-space font-bold">Sign Up</h1>
                    <Input<SignUpForm>
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
                    <Input<SignUpForm>
                        name="password"
                        label="Password"
                        register={register}
                        options={{
                            required: "Required Field",
                            validate: (value: string) => {
                                if (value.length < 6) {
                                    return "Password must be atleast 6 characters long"
                                }
                                const chars = Array.from(value);
                                if (!chars.some(char => /[A-Z]/.test(char))) return "Password must have at least one uppercase letter";
                                if (!chars.some(char => /[a-z]/.test(char))) return "Password must have at least one lowercase letter";
                                if (!chars.some(char => /[0-9]/.test(char))) return "Password must have atleast one numerical digit";
                                if (!chars.some(char => /[!@#$%^&*(),.?":{}|<>]/.test(char))) return "Password must have atleast one of [!@#$%^&*(),.?\":{}|<>]";
                            }
                        }}
                        error={errors.password}
                        placeholder="••••••••••••••••"
                        type="password"
                    />
                    <Input<SignUpForm>
                        name="confirmPassword"
                        label="confirm password"
                        register={register}
                        options={{
                            required: "Required Field",
                            validate: (val: string, formValues) => {
                                if (val !== formValues.password) return "Passwords must match"
                            }
                        }}
                        error={errors.confirmPassword}
                        placeholder="••••••••••••••••"
                        type="password"
                    />
                    <Button>Sign Up</Button>
                    <Button type="button" variant="text" onClick={() => push("/login")}>Use Existing Account</Button>
                </form>
            </main>
            <div className="!absolute !z-0 yellow-circle overflow-hidden" />
            <div className="!absolute !z-0 blue-circle" />
        </div>
    )
}