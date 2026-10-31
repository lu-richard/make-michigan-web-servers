import { useState } from 'react';
import {
    Field,
    FieldLabel
} from '@/components/ui/field';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import labels from '@/constants/labels';
import { Button } from '@/components/ui/button';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiPatch } from '@/lib/api';
import type { ProfileData } from '@/types/types';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

function CompleteProfile() {
    const [pronouns, setPronouns] = useState("");
    const [roles, setRoles] = useState<Set<string>>(new Set());
    const roleOptions = ["undergrad_student", "grad_student", "alum", "shop_mentor", "shop_manager", "staff"];
    const { setProfile } = useAppContext();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-navy-blue">
            <div className="p-12 bg-main-bg rounded-3xl w-[40vw]">
                <h1 className="text-2xl font-semibold">Complete Your Profile</h1>
                <div className="my-6 text-xl">
                    <p>Pronouns &#40;OPTIONAL&#41;</p>
                    <input type="text" value={pronouns} placeholder="she/her" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setPronouns(e.target.value)} />
                </div>
                <Field className="max-w-96 w-full">
                    <FieldLabel>Roles</FieldLabel>
                    <Card>
                        <CardContent>
                            {
                                Array.from(roles).map(
                                    (r) =>
                                    <Card key={r}>
                                        <CardContent>
                                            <p>{labels[r as keyof typeof labels]}</p>
                                            <Button variant="ghost" onClick={
                                                () => {
                                                    setRoles((oldR) => {
                                                        const newRoles = new Set(oldR);
                                                        newRoles.delete(r);
                                                        return newRoles;
                                                    });
                                                }
                                            }>
                                                <DeleteIcon />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )
                            }
                        </CardContent>
                    </Card>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>Add Role</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {
                                roleOptions.map(
                                    (r) =>
                                    <DropdownMenuItem key={r} onClick={
                                        () => {
                                            if (!roles.has(r)) {
                                                setRoles((oldR) => new Set(oldR).add(r));
                                            }
                                        }
                                    }>
                                        {labels[r as keyof typeof labels]}
                                    </DropdownMenuItem>
                                )
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Field>
                <Button className="w-full mt-16"
                    onClick={
                        async () => {
                            try {
                                if (roles.size === 0) {
                                    throw new Error("Failed to submit due to missing fields");
                                }

                                const response = await apiPatch<ProfileData>(`/me/`, {
                                        pronouns: pronouns === "" ? null : pronouns,
                                        roles: Array.from(roles),
                                        profile_completed: true
                                    }
                                );
                                
                                setProfile!(response);
                                navigate('/');
                            }
                            catch (e) {
                                console.log((e as Error).message);
                            }
                        }
                    }
                >
                    Submit
                </Button>
            </div>
        </div>
    );
}

export default CompleteProfile;