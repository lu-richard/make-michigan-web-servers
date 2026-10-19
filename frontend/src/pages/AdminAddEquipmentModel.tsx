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
import labels from '@/constants/labels';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { Capability } from '@/types/api';

const useAddEquipmentModelData = () => {
    const [capabilities, setCapabilities] = useState<Capability[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    

    useEffect(() => {
        const fetchCapabilities = async () => {
            try {
                setLoading(true);

                const capabilities = await apiGetList<Capability>('/capabilities/', { ordering: 'name' });

                setCapabilities(capabilities);
            }
            catch (e) {
                console.error((e as Error).message);
                setErrorMessage("An error occurred. Please refresh this page.");
            }
            finally {
                setLoading(false);
            }
        };

        fetchCapabilities();
    }, []);
    
    return { capabilities, loading, errorMessage };
};

function AdminAddEquipmentModel() {
    const [model, setModel] = useState("");
    const [make, setMake] = useState("");
    const [type, setType] = useState("");
    const [fullName, setFullName] = useState("");
    const [isCNC, setIsCNC] = useState(false);
    const [specsURL, setSpecsURL] = useState("");
    const [selectedCaps, setSelectedCaps] = useState<Set<Capability>>(new Set());
    const [submitStatus, setSubmitStatus] = useState<boolean | null>(null);
    const [customSpecs, setCustomSpecs] = useState<Map<string, string>>(new Map());
    const [customSpecKey, setCustomSpecKey] = useState("");
    const [customSpecValue, setCustomSpecValue] = useState("");
    const { capabilities, loading, errorMessage } = useAddEquipmentModelData();

    return (
        <>
            {
                loading ? <div className="h-[80vh]"><Loading /></div> :
                errorMessage ? <p className="text-center mt-[35vh]">{errorMessage}</p> :
                <Card className="px-28 py-12 mx-60 my-12">
                    <CardHeader>
                        <CardTitle className="text-4xl">
                            Add Equipment Model
                        </CardTitle>
                        <CardDescription className="text-base">
                            Add a new equipment model to the database. You can create as many instances of an existing model as needed under Add Equipment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-8">
                        <section className="flex items-center mt-6 gap-4">
                            <div className="max-w-96 w-full">
                                <Field>
                                    <FieldLabel>Model</FieldLabel>
                                    <Input type="text" value={model} onChange={(e) => setModel(e.target.value)} />
                                </Field>
                            </div>
                            <div className="max-w-96 w-full">
                                <Field>
                                    <FieldLabel>Make</FieldLabel>
                                    <Input type="text" value={make} onChange={(e) => setMake(e.target.value)} />
                                </Field>
                            </div>
                            <div className="max-w-96 w-full">
                                <Field>
                                    <FieldLabel>Equipment Type &#40;e.g. Lathe, 3D Printer&#41;</FieldLabel>
                                    <Input type="text" value={type} onChange={(e) => setType(e.target.value)} />
                                </Field>
                            </div>
                        </section>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Full Name &#40;OPTIONAL&#41;</FieldLabel>
                            <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </Field>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Is CNC</FieldLabel>
                            <Checkbox className="max-w-8 h-8" checked={isCNC} onCheckedChange={() => setIsCNC((isCNC) => !isCNC)} />
                        </Field>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Manufacturer Specifications URL</FieldLabel>
                            <Input type="text" value={specsURL} onChange={(e) => setSpecsURL(e.target.value)} />
                        </Field>
                        <Field className="max-w-96 w-full">
                            <FieldLabel>Capabilities</FieldLabel>
                            <Card>
                                <CardContent>
                                    {
                                        Array.from(selectedCaps).map(
                                            (c) =>
                                            <Card key={c.capability_id}>
                                                <CardContent>
                                                    <p>{labels[c.name as keyof typeof labels]}</p>
                                                    <Button variant="ghost" onClick={
                                                        () => {
                                                            setSelectedCaps((sc) => {
                                                                const next = new Set(sc);
                                                                next.delete(c);
                                                                return next;
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
                                    <Button>Add Capability</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {
                                        capabilities.map(
                                            (c) =>
                                            <DropdownMenuItem key={c.capability_id} onClick={
                                                () => {
                                                    if (!selectedCaps.has(c)) {
                                                        setSelectedCaps((sc) => new Set(sc).add(c));
                                                    }
                                                }
                                            }>
                                                {c.name in labels ? labels[c.name as keyof typeof labels] : c.name}
                                            </DropdownMenuItem>
                                        )
                                    }
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                        <Button className="w-full mt-16"
                            onClick={
                                async () => {
                                    try {
                                        if (model === "" || make === "" || type === "") {
                                            throw new Error("Failed to submit due to missing fields");
                                        }

                                        const newUUID = self.crypto.randomUUID();
                                        const response = await apiPost('/equipment-models/', {
                                                equipment_model_id: newUUID,
                                                model: model,
                                                make: make,
                                                equipment_type: type,
                                                equipment_model_name: fullName === "" ? make + " " + model + " " + type : fullName,
                                                is_cnc: isCNC,
                                                specs_url: specsURL === "" ? null : specsURL,
                                                specific_specs: JSON.stringify(customSpecs)
                                            }
                                        );
                                        const capPromises = Array.from(selectedCaps).map((c) => apiPost('/equipment-model-capabilities/', {
                                            capability_id: c.capability_id,
                                            equipment_model_id: newUUID
                                        }));
                                        const capResponses = await Promise.all(capPromises);

                                        setSubmitStatus(true);
                                        console.log(response);
                                        console.log(capResponses);
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
                            (submitStatus ? <p className="text-checkmark-green">Equipment model successfully created.</p> : <p className="text-red">Submission failed. Please try again.</p>)
                        }
                    </CardContent>
                </Card>
            }
        </>
        
    );
}

export default AdminAddEquipmentModel;