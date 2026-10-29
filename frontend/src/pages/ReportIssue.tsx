// import styles from '../styles/adminAddEquipmentModel.module.css';
import { useState, useEffect } from 'react';
import { apiGetList, apiPost } from '../lib/api';
import Loading from './Loading';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Makerspace, Equipment } from '@/types/api';
import { Textarea } from '@/components/ui/textarea';
import type { IssueReport } from '@/types/types';
import { useAppContext } from '@/context/AppContext';

const useReportIssueData = () => {
    const { profile } = useAppContext();
    const [selectedSpace, setSelectedSpace] = useState<Makerspace | null>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [debouncedSelectedSpace, setDebouncedSelectedSpace] = useState<Makerspace | null>(null);
    const [makerspaces, setMakerspaces] = useState<Makerspace[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSelectedSpace(selectedSpace), 500);

        return () => clearTimeout(timeout);
    }, [selectedSpace]);

    useEffect(() => {
        const fetchMakerspaces = async () => {
            try {
                const spaces = await apiGetList<Makerspace>('/makerspaces/');

                setMakerspaces(spaces);
            }
            catch (e) {
                console.error((e as Error).message);
                setErrorMessage("An error occurred. Please refresh this page.");
            }
            finally {
                setLoading(false);
            }
        };

        fetchMakerspaces();
    }, []);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                console.log(debouncedSelectedSpace);
                const eq = await apiGetList<Equipment>('/equipment/', { makerspace_id: debouncedSelectedSpace!.makerspace_id });

                if (eq.length === 0) {
                    setEquipment([]);
                    return;
                }

                setEquipment(eq);
            }
            catch (e) {
                console.error((e as Error).message);
                setErrorMessage("An error occurred. Please refresh this page.");
            }
        };

        if (debouncedSelectedSpace !== null) {
            fetchEquipment();
        }
    }, [debouncedSelectedSpace]);

    return { profile, selectedSpace, setSelectedSpace, makerspaces, selectedEquipment, setSelectedEquipment, equipment, loading, errorMessage };
};

function ReportIssue() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [issueType, setIssueType] = useState("");
    const [submitStatus, setSubmitStatus] = useState<boolean | null>(null);
    const { profile, selectedSpace, setSelectedSpace, makerspaces, selectedEquipment, setSelectedEquipment, equipment, loading, errorMessage } = useReportIssueData();

    return (
        <>
            {
                loading ? <div className="h-[80vh]"><Loading /></div> :
                errorMessage ? <p className="text-center mt-[35vh]">{errorMessage}</p> :
                <Card className="px-28 py-12 mx-60 my-12">
                    <CardHeader>
                        <CardTitle className="text-4xl">
                            Report an Issue
                        </CardTitle>
                        <CardDescription className="text-base">
                            Report an issue with a piece of equipment at any shop.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-8">
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Title</FieldLabel>
                            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </Field>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Description</FieldLabel>
                            <Textarea placeholder="Describe the issue." value={description} onChange={(e) => setDescription(e.target.value)} />
                        </Field>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Type of Issue &#40;One Word Like "Broken" or "Dirty"&#41;</FieldLabel>
                            <Input type="text" value={issueType} onChange={(e) => setIssueType(e.target.value)} />
                        </Field>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Which Shop Did This Happen In?</FieldLabel>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">{selectedSpace === null ? "Please select a makerspace." : selectedSpace.makerspace_name}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {
                                        makerspaces.map(
                                            (m) =>
                                            <DropdownMenuItem key={m.makerspace_id} onClick={() => {
                                                console.log(m);
                                                setSelectedSpace(m);
                                            }}>
                                                {m.makerspace_name}
                                            </DropdownMenuItem>
                                        )
                                    }
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Field>
                        {
                            equipment.length > 0 &&
                            <Field className="max-w-96 w-full">
                                <FieldLabel>Which Piece of Equipment Did This Happen To?</FieldLabel>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">{selectedEquipment === null ? "Please select a piece of equipment." : selectedEquipment.equipment_name}</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {
                                            equipment.map(
                                                (e) =>
                                                <DropdownMenuItem key={e.equipment_id} onClick={() => setSelectedEquipment(e)}>
                                                    {e.equipment_name}
                                                </DropdownMenuItem>
                                            )
                                        }
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </Field>
                        }
                        <Button className="w-full mt-16"
                            onClick={
                                async () => {
                                    try {
                                        if (title === "" || description === "" || issueType === "" || selectedSpace === null || selectedEquipment === null) {
                                            throw new Error("Failed to submit due to missing fields");
                                        }

                                        const response = await apiPost<IssueReport>('/issue-reports/', {
                                                title: title,
                                                description: description,
                                                issue_type: issueType,
                                                equipment_id: selectedEquipment.equipment_id,
                                                reporter_user_id: profile!.user_id,
                                                overseer_user_id: null,
                                                is_resolved: false
                                            }
                                        );

                                        setSubmitStatus(true);
                                        console.log(response);
                                    }
                                    catch (e) {
                                        console.log((e as Error).message);
                                        setSubmitStatus(false);
                                    }
                                }
                            }
                        >
                            Submit
                        </Button>
                        {
                            submitStatus !== null &&
                            (submitStatus ? <p className="text-checkmark-green">Issue successfully reported.</p> : <p className="text-red">Submission failed. Please try again.</p>)
                        }
                    </CardContent>
                </Card>
            }
        </>
    );
}

export default ReportIssue;