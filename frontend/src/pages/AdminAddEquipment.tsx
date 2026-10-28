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
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea";
import labels from '@/constants/labels';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import type { Material, Makerspace, CredentialModel, MakerspaceCredentialModel, EquipmentModel, Equipment } from '@/types/api';

const useAddEquipmentData = () => {
    const [selectedSpace, setSelectedSpace] = useState<Makerspace | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [makerspaces, setMakerspaces] = useState<Makerspace[]>([]);
    const [equipmentModels, setEquipmentModels] = useState<EquipmentModel[]>([]);
    const [credentialModels, setCredentialModels] = useState<CredentialModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [mats, spaces, eqModels] = await Promise.all([
                    apiGetList<Material>('/materials/', { ordering: 'name' }),
                    apiGetList<Makerspace>('/makerspaces/', { ordering: 'makerspace_name' }),
                    apiGetList<EquipmentModel>('/equipment-models/', { ordering: 'equipment_model_name' })
                ]);
                
                console.log(mats);
                setMaterials(mats);
                setMakerspaces(spaces);
                setEquipmentModels(eqModels);
            }
            catch (e) {
                console.error((e as Error).message);
                setErrorMessage("An error occurred. Please refresh this page.");
            }
            finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchCredModels = async () => {
            try {
                const links = await apiGetList<MakerspaceCredentialModel>('/makerspace-credential-models/', { makerspace_id: selectedSpace!.makerspace_id });

                if (links.length === 0) {
                    setCredentialModels([]);
                    return;
                }

                const credModels = await apiGetList<CredentialModel>('/credential-models/', {
                    credential_model_id__in: links.map((l) => l.credential_model_id).join(','),
                    ordering: 'credential_model_name'
                });

                setCredentialModels(credModels);
            }
            catch (e) {
                console.error((e as Error).message);
                setErrorMessage("An error occurred. Please refresh this page.");
            }
        };

        if (selectedSpace !== null) {
            fetchCredModels();
        }
    }, [selectedSpace]);
    
    return { selectedSpace, setSelectedSpace, materials, makerspaces, equipmentModels, credentialModels, loading, errorMessage };
};

const convertDate = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    return `${year}-${month}-${day}`;
};

function AdminAddEquipmentModel() {
    const [name, setName] = useState("");
    const [notes, setNotes] = useState("");
    const [lastServiced, setLastServiced] = useState<Date | undefined>(new Date());
    const [selectedAccMats, setSelectedAccMats] = useState<Set<Material>>(new Set());
    const [selectedRejMats, setSelectedRejMats] = useState<Set<Material>>(new Set());
    const [selectedCredModel, setSelectedCredModel] = useState<CredentialModel | null>(null);
    const [customSpecs, setCustomSpecs] = useState<Map<string, string>>(new Map());
    const [customSpecKey, setCustomSpecKey] = useState("");
    const [customSpecValue, setCustomSpecValue] = useState("");
    const [submitStatus, setSubmitStatus] = useState<boolean | null>(null);
    const [selectedEqModel, setSelectedEqModel] = useState<EquipmentModel | null>(null);
    const { selectedSpace, setSelectedSpace, materials, makerspaces, equipmentModels, credentialModels, loading, errorMessage } = useAddEquipmentData();

    return (
        <>
            {
                loading ? <div className="h-[80vh]"><Loading /></div> :
                errorMessage ? <p className="text-center mt-[35vh]">{errorMessage}</p> :
                <Card className="px-28 py-12 mx-60 my-12">
                    <CardHeader>
                        <CardTitle className="text-4xl">
                            Add Equipment
                        </CardTitle>
                        <CardDescription className="text-base">
                            Add a new piece of equipment to the database. Each new piece of equipment must be linked to an existing model and shop.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-8">
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Name</FieldLabel>
                            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                        </Field>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Notes</FieldLabel>
                            <Textarea placeholder="Type your message here." value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </Field>
                        <section>
                            <Field className="max-w-96 w-full">
                                <FieldLabel>Custom Specifications</FieldLabel>
                                <Card>
                                    <CardContent>
                                        {
                                            Array.from(customSpecs.keys()).map((csk) =>
                                                <Card key={csk}>
                                                    <CardContent>
                                                        <p>{csk}: {customSpecs.get(csk)}</p>
                                                        <Button variant="ghost" onClick={
                                                            () => {
                                                                setCustomSpecs((cs) => {
                                                                    const newCustomSpecs = new Map(cs);
                                                                    newCustomSpecs.delete(csk);
                                                                    return newCustomSpecs;
                                                                });
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            )
                                        }
                                    </CardContent>
                                </Card>
                            </Field>
                            <div className="flex items-center gap-4 my-4">
                                <Field className="max-w-96 w-full">
                                    <FieldLabel>New Specification Category</FieldLabel>
                                    <Input type="text" value={customSpecKey} onChange={(e) => setCustomSpecKey(e.target.value)} />
                                </Field>
                                <Field className="max-w-96 w-full">
                                    <FieldLabel>New Specification Value</FieldLabel>
                                    <Input type="text" value={customSpecValue} onChange={(e) => setCustomSpecValue(e.target.value)} />
                                </Field>
                            </div>
                            <Button onClick={
                                () => {
                                    if (!customSpecs.has(customSpecKey)) {
                                        setCustomSpecs((cs) => new Map(cs).set(customSpecKey, customSpecValue));
                                    }
                                }}
                            >
                                Add Specification
                            </Button>
                        </section>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Accepted Materials</FieldLabel>
                            <Card>
                                <CardContent>
                                    {
                                            Array.from(selectedAccMats).map(
                                            (m) =>
                                            <Card key={m.material_id}>
                                                <CardContent>
                                                    <p>{m.name in labels ? labels[m.name as keyof typeof labels] : m.name}</p>
                                                    <Button variant="ghost" onClick={
                                                        () => {
                                                            setSelectedAccMats((sam) => {
                                                                const newSelectedAccMats = new Set(sam);
                                                                newSelectedAccMats.delete(m);
                                                                return newSelectedAccMats;
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
                                    <Button>Add Accepted Material</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {
                                        materials.map(
                                            (m) =>
                                            <DropdownMenuItem key={m.material_id} onClick={
                                                () => {
                                                    if (!selectedAccMats.has(m) && !selectedRejMats.has(m)) {
                                                        setSelectedAccMats((sam) => {
                                                            const newSelectedAccMats = new Set(sam);
                                                            newSelectedAccMats.add(m);
                                                            return newSelectedAccMats;
                                                        });
                                                    }
                                                }
                                            }>
                                                {m.name in labels ? labels[m.name as keyof typeof labels]: m.name}
                                            </DropdownMenuItem>
                                        )
                                    }
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Field>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Rejected Materials</FieldLabel>
                            <Card>
                                <CardContent>
                                    {
                                        Array.from(selectedRejMats).map(
                                            (m) =>
                                            <Card key={m.material_id}>
                                                <CardContent>
                                                    <p>{m.name in labels ? labels[m.name as keyof typeof labels] : m.name}</p>
                                                    <Button variant="ghost" onClick={
                                                        () => {
                                                            setSelectedRejMats((srm) => {
                                                                const newSelectedRejMats = new Set(srm);
                                                                newSelectedRejMats.delete(m);
                                                                return newSelectedRejMats;
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
                                    <Button>Add Rejected Material</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {
                                        materials.map(
                                            (m) =>
                                            <DropdownMenuItem key={m.material_id} onClick={
                                                () => {
                                                    if (!selectedRejMats.has(m) && !selectedAccMats.has(m)) {
                                                        setSelectedRejMats((srm) => {
                                                            const newSelectedRejMats = new Set(srm);
                                                            newSelectedRejMats.add(m);
                                                            return newSelectedRejMats;
                                                        });
                                                    }
                                                }
                                            }>
                                                {m.name in labels ? labels[m.name as keyof typeof labels] : m.name}
                                            </DropdownMenuItem>
                                        )
                                    }
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Field>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Late Serviced Date</FieldLabel>
                            <Calendar
                                mode="single"
                                selected={lastServiced}
                                onSelect={setLastServiced}
                                className="rounded-lg-border"
                            />
                        </Field>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>What Model Is This?</FieldLabel>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">{selectedEqModel === null ? "Please select an equipment model." : selectedEqModel?.equipment_model_name}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {
                                        equipmentModels.map(
                                            (em) =>
                                            <DropdownMenuItem key={em.equipment_model_id} onClick={() => setSelectedEqModel(em)}>
                                                {em.equipment_model_name}
                                            </DropdownMenuItem>
                                        )
                                    }
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Field>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Which Shop Does This Belong To?</FieldLabel>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">{selectedSpace === null ? "Please select a shop." : selectedSpace.makerspace_name}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {
                                        makerspaces.map(
                                            (m) =>
                                            <DropdownMenuItem key={m.makerspace_id} onClick={() => setSelectedSpace(m)}>
                                                {m.makerspace_name}
                                            </DropdownMenuItem>
                                        )
                                    }
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Field>
                        {
                            credentialModels.length > 0 &&
                            <Field className="max-w-96 w-full">
                                <FieldLabel>Which Training Unlocks This? &#40;OPTIONAL&#41;</FieldLabel>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">{selectedCredModel === null ? "Please select a training." : selectedCredModel.credential_model_name}</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {
                                            credentialModels.map(
                                                (cm) =>
                                                <DropdownMenuItem key={cm.credential_model_id} onClick={() => setSelectedCredModel(cm)}>
                                                    {cm.credential_model_name}
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
                                        if (selectedSpace === null || selectedEqModel === null || name === "") {
                                            throw new Error("Failed to submit due to missing fields");
                                        }

                                        const response = await apiPost<Equipment>('/equipment/', {
                                                equipment_name: name,
                                                last_serviced: lastServiced === undefined ? null : convertDate(lastServiced),
                                                equipment_model_id: selectedEqModel.equipment_model_id,
                                                makerspace_id: selectedSpace.makerspace_id,
                                                credential_model_id: selectedCredModel?.credential_model_id,
                                                notes: notes,
                                                specific_specs: JSON.stringify(customSpecs)
                                            }
                                        );
                                        const accMatPromises = Array.from(selectedAccMats).map((m) => apiPost('/equipment-accepted-materials/', {
                                            equipment_id: response.equipment_id,
                                            material_id: m.material_id
                                        }));
                                        const rejMatPromises = Array.from(selectedRejMats).map((m) => apiPost('/equipment-restricted-materials/', {
                                            equipment_id: response.equipment_id,
                                            material_id: m.material_id
                                        }));
                                        const matResponses = await Promise.all([...accMatPromises, ...rejMatPromises]);

                                        setSubmitStatus(true);
                                        console.log(response);
                                        console.log(matResponses);
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
                            (submitStatus ? <p className="text-checkmark-green">Equipment successfully created.</p> : <p className="text-red">Submission failed. Please try again.</p>)
                        }
                    </CardContent>
                </Card>
            }
        </>
        
    );
}

export default AdminAddEquipmentModel;
