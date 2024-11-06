"use client";

import LoginContext from "@/backend/loginContext";
import { rules } from "@/backend/rules";
import StudentContext from "@/backend/studentContext";
import { Student } from "@/backend/types";
import Button from "@/components/Button";
import ErrorChip from "@/components/ErrorChip";
import Input from "@/components/Input";
import Navbar from "@/components/Navbar";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useContext, useLayoutEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";

interface OnboardingValues extends FieldValues {
    name: string,
    grade: 9 | 10 | 11 | 12
}

export default function EditStudent() {
    const { authUser } = useContext(LoginContext);
    const { getMe, editStudent } = useContext(StudentContext);
    const student = getMe();
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<OnboardingValues>({
        mode: "all",
        reValidateMode: "onChange",
        defaultValues: {
            name: student?.name,
            grade: student?.grade
        }
    });
    const [error, changeError] = useState<string | null>(null);
    const [loading, changeLoading] = useState(false);

    useLayoutEffect(() => {
        if (authUser == null) {
            router.push("/login");
        }
    }, [authUser, router]);

    useLayoutEffect(() => {
        if(!rules.allowOnboarding) {
            router.push("/dashboard");
        }
    }, [router]);

    const onSubmit = async (values: OnboardingValues) => {
        if (!loading) {
            changeLoading(true);
            await editStudent({
                ...student,
                name: values.name,
                grade: values.grade,
                onboarded: true
            } as Student, changeError);
            if (!error) {
                router.back();
            }
            changeLoading(false);
        }
    }

    return (
        <div className="layout flex flex-col relative nav-top overflow-x-hidden  text-white min-h-[100vh]">
            <Navbar />
            <main className="relative z-10 flex-1 w-full flex flex-col items-center justify-center">
                <div onClick={router.back} className="flex gap-[10px] cursor-pointer justify-start w-full max-w-[400px] items-center">
                    <CaretLeft size={24} />
                    <p className="text-2xl font-raleway font-light">Back</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[400px] flex flex-col items-stretch gap-[24px]">
                    <h1 className="font-space font-bold">Edit Details</h1>
                    <Input<OnboardingValues>
                        register={register}
                        error={errors.name}
                        label="name"
                        type="name"
                        name="name"
                        options={{
                            required: "Required field"
                        }}
                        placeholder="Kaavya Trivedi"
                    />
                    <Input<OnboardingValues>
                        register={register}
                        error={errors.grade}
                        label="Grade"
                        type="number"
                        name="grade"
                        options={{
                            required: "Required field",
                            min: { value: 9, message: "Must atleast a freshman" },
                            max: { value: 12, message: "Can atmost be a senior" }
                        }}
                        placeholder="9"
                    />
                    <Button loading={loading}>Save</Button>
                </form>
            </main>
            <ErrorChip message={error} changeMessage={changeError} />
        </div>
    )
}