import supabase from "../lib/supabase";
import { useState } from "react";
import { Link } from "react-router-dom";
import Loading from "./Loading";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import labels from "@/constants/labels";
import type { ProfileData } from "@/types/types";
import { apiPost } from "@/lib/api";
import { useAppContext } from "@/context/AppContext";

function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleInitial, setMiddleInitial] = useState(""); 
    const [uniqname, setUniqname] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [roles, setRoles] = useState<Set<string>>(new Set());
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const { setProfile } = useAppContext();

    // Funtion for signing a new user up
    const signUpUser = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        uniqname: uniqname,
                    }
                }
            });

            if (error || data.user === null) {
                throw new Error(`${error}`);
            }

            const response = await apiPost<ProfileData>('/profiles/', {
                is_superuser: 0,
                user_id: data.user.id,
                uniqname: uniqname,
                first_name: firstName,
                middle_initial: middleInitial === "" ? null : middleInitial,
                last_name: lastName,
                pronouns: pronouns === "" ? null : pronouns,
                roles: Array.from(roles),
                system_theme: "light",
                locale: "en_US",
                is_active: 1
            });
            setProfile!(response);
        }
        catch (e) {
            console.error(e);
            setErrorMessage("Sign up failed. Please check your account does not already exist and try again.");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <>
            {
                loading ? <div className="h-[100vh]"><Loading /></div> :
                <div className="flex flex-col justify-center items-center bg-navy-blue">
                    <div className="p-12 bg-main-bg rounded-3xl w-[40vw]">
                        <h1 className="text-2xl font-semibold">Sign Up</h1>
                        <div className="my-6 text-xl">
                            <p>U-M Email</p>
                            <input type="email" value={email} placeholder="name@umich.edu" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="my-6 text-xl">
                            <p>Password</p>
                            <input type="password" value={password} placeholder="Your Password" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md"onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="my-6 text-xl">
                            <p>First Name</p>
                            <input type="text" value={firstName} placeholder="Jane" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div className="my-6 text-xl">
                            <p>Middle Initial &#40;OPTIONAL&#41;</p>
                            <input type="text" maxLength={1} value={middleInitial} placeholder="Middle Initial" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setMiddleInitial(e.target.value)} />
                        </div>
                        <div className="my-6 text-xl">
                            <p>Last Name</p>
                            <input type="text" value={lastName} placeholder="Doe" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setLastName(e.target.value)} />
                        </div>
                        <div className="my-6 text-xl">
                            <p>U-M Uniqname</p>
                            <input type="text" value={uniqname} placeholder="janedoe" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setUniqname(e.target.value)} />
                        </div>
                        <div className="my-6 text-xl">
                            <p>Pronouns &#40;OPTIONAL&#41;</p>
                            <input type="text" value={pronouns} placeholder="she/her" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setPronouns(e.target.value)} />
                        </div>
                        <div className="my-6 text-xl">
                            
                            <DropdownMenu>
                                <Card className="flex flex-row">
                                    {
                                        Array.from(roles).map((r) => <Card className="w-fit px-4" key={r}>{labels[r as keyof typeof labels]}</Card>)
                                    }
                                </Card>
                                <DropdownMenuTrigger>
                                    <Button>Select Roles</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={
                                        () => {
                                            if (!roles.has("undergrad_student")) {
                                                setRoles((r) => new Set(r).add("undergrad_student"));
                                            }
                                            else {
                                                setRoles((r) => {
                                                    const newRoles = new Set(r);
                                                    newRoles.delete("undergrad_student");
                                                    return newRoles;
                                                });
                                            }
                                        }
                                    }>Undergraduate Student</DropdownMenuItem>
                                    <DropdownMenuItem onClick={
                                        () => {
                                            if (!roles.has("grad_student")) {
                                                setRoles((r) => new Set(r).add("grad_student"));
                                            }
                                            else {
                                                setRoles((r) => {
                                                    const newRoles = new Set(r);
                                                    newRoles.delete("grad_student");
                                                    return newRoles;
                                                });
                                            }
                                        }
                                    }>Graduate Student</DropdownMenuItem>
                                    <DropdownMenuItem onClick={
                                        () => {
                                            if (!roles.has("shop_mentor")) {
                                                setRoles((r) => new Set(r).add("shop_mentor"));
                                            }
                                            else {
                                                setRoles((r) => {
                                                    const newRoles = new Set(r);
                                                    newRoles.delete("shop_mentor");
                                                    return newRoles;
                                                });
                                            }
                                        }
                                    }>Shop Mentor</DropdownMenuItem>
                                    <DropdownMenuItem onClick={
                                        () => {
                                            if (!roles.has("shop_manager")) {
                                                setRoles((r) => new Set(r).add("shop_manager"));
                                            }
                                            else {
                                                setRoles((r) => {
                                                    const newRoles = new Set(r);
                                                    newRoles.delete("shop_manager");
                                                    return newRoles;
                                                });
                                            }
                                        }
                                    }>Shop Manager</DropdownMenuItem>
                                    <DropdownMenuItem onClick={
                                        () => {
                                            if (!roles.has("staff")) {
                                                setRoles((r) => new Set(r).add("staff"));
                                            }
                                            else {
                                                setRoles((r) => {
                                                    const newRoles = new Set(r);
                                                    newRoles.delete("staff");
                                                    return newRoles;
                                                });
                                            }
                                        }
                                    }>Staff</DropdownMenuItem>
                                    <DropdownMenuItem onClick={
                                        () => {
                                            if (!roles.has("alum")) {
                                                setRoles((r) => new Set(r).add("alum"));
                                            }
                                            else {
                                                setRoles((r) => {
                                                    const newRoles = new Set(r);
                                                    newRoles.delete("alum");
                                                    return newRoles;
                                                });
                                            }
                                        }
                                    }>Alumni</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <button type="button" className="bg-arb-blue py-3 px-5 rounded-3xl text-[#fff]" onClick={signUpUser}>Sign Up</button>
                        <p className="text-[red] mt-4 mb-6">{errorMessage}</p>
                        <Link to="/signin" className="italic text-arb-blue hover:text-navy-blue">Already have an account? Sign in here.</Link>
                    </div>
                </div>
            }
        </>
    ); 
}

export default SignUp;