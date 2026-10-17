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

interface Capability {
    capability_id: string,
    name: string
};

const useAddEquipmentModelData = () => {
    const [capabilities, setCapabilities] = useState<Capability[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    

    useEffect(() => {
        const fetchCapabilities = async () => {
            try {
                setLoading(true);

                const capabilities = await apiGetList<Capability>('/capabilities/');

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
    const [selectedCaps,  setSelectedCaps] = useState<Capability[]>([]);
    const [capSet, setCapSet] = useState<Set<string>>(new Set());
    const [submitStatus, setSubmitStatus] = useState<boolean | null>(null);
    const { capabilities, loading, errorMessage } = useAddEquipmentModelData();

    return (
        <>
            {
                loading ? <div className="h-[80vh]"><Loading /></div> :
                errorMessage ? <p className="text-center mt-[35vh]">{errorMessage}</p> :
                <div className="px-60">
                    <h1 className="font-medium">Add Equipment Model</h1>
                    <p className="mt-4 max-w-[45vw]">Add a new equipment model to the database. You can create as many instances of an existing model as needed under Add Equipment.</p>
                    <div className="flex items-center mt-6">
                        <div className="max-w-96 w-full mt-4 mr-4">
                            <Field>
                                <FieldLabel>Model</FieldLabel>
                                <Input type="text" value={model} onChange={(e) => setModel(e.target.value)} />
                            </Field>
                        </div>
                        <div className="max-w-96 w-full mt-4 mr-4">
                            <Field>
                                <FieldLabel>Make</FieldLabel>
                                <Input type="text" value={make} onChange={(e) => setMake(e.target.value)} />
                            </Field>
                        </div>
                        <div className="max-w-96 w-full mt-4">
                            <Field>
                                <FieldLabel>Equipment Type &#40;e.g. Lathe, 3D Printer&#41;</FieldLabel>
                                <Input type="text" value={type} onChange={(e) => setType(e.target.value)} />
                            </Field>
                        </div>
                    </div>
                    <Field className="max-w-96 w-full mt-4">
                        <FieldLabel>Full Name &#40;OPTIONAL&#41;</FieldLabel>
                        <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </Field>
                    <Field className="max-w-96 w-full mt-4">
                        <FieldLabel>Is CNC</FieldLabel>
                        <Checkbox className="max-w-8 h-8" checked={isCNC} onCheckedChange={() => setIsCNC((isCNC) => !isCNC)} />
                    </Field>
                    <Field className="max-w-96 w-full mt-4">
                        <FieldLabel>Specifications URL</FieldLabel>
                        <Input type="text" value={specsURL} onChange={(e) => setSpecsURL(e.target.value)} />
                    </Field>
                    <Field className="max-w-96 w-full mt-4">
                        <FieldLabel>Specifications URL</FieldLabel>
                        <Input type="text" value={specsURL} onChange={(e) => setSpecsURL(e.target.value)} />
                    </Field>
                    <Field className="max-w-96 w-full mt-4">
                        <FieldLabel>Capabilities</FieldLabel>
                        <Card>
                            <CardContent>
                                {
                                    selectedCaps.map(
                                        (c) =>
                                        <Card key={c.capability_id}>
                                            <CardContent>
                                                <p>{labels[c.name as keyof typeof labels]}</p>
                                                <Button variant="ghost" onClick={
                                                    () => {
                                                        if (capSet.has(c.capability_id)) {
                                                            setCapSet((s) => {
                                                                const newCapSet = new Set(s);
                                                                newCapSet.delete(c.capability_id);
                                                                return newCapSet;
                                                            });
                                                            setSelectedCaps((sc) => sc.filter((cap) => cap.capability_id != c.capability_id));
                                                        }
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
                            <Button variant="outline">Add Capability</Button>
                        </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {
                                    capabilities.map(
                                        (c) =>
                                        <DropdownMenuItem key={c.capability_id} onClick={
                                            () => {
                                                if (!capSet.has(c.capability_id)) {
                                                    setCapSet((s) => {
                                                        const newCapSet = new Set(s);
                                                        newCapSet.add(c.capability_id);
                                                        return newCapSet;
                                                    });
                                                    setSelectedCaps((sc) => [...sc, c]);
                                                }
                                            }
                                        }>
                                            {labels[c.name as keyof typeof labels]}
                                        </DropdownMenuItem>
                                    )
                                }
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Field>
                    <Button className="mt-12"
                        onClick={
                            async () => {
                                try {
                                    const response = await apiPost('/equipment-models/', {
                                            equipment_model_id: self.crypto.randomUUID(),
                                            model: model,
                                            make: make,
                                            equipment_type: type,
                                            specs_url: specsURL,
                                            is_cnc: isCNC,
                                            equipment_model_name: fullName === "" ? make + " " + model + " " + type : fullName,
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
                        (submitStatus ? <p className="text-checkmark-green">Equipment model successfully created.</p> : <p className="text-red">Submission failed. Please try again.</p>)
                    }
                </div>
            }
        </>
        
    );
}

export default AdminAddEquipmentModel;