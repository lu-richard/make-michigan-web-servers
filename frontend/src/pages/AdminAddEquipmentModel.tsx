// import styles from '../styles/adminAddEquipmentModel.module.css';
import { useState } from 'react';

function AdminAddEquipmentModel() {
    const [model, setModel] = useState("");
    const [make, setMake] = useState("");
    const [type, setType] = useState("");
    const [fullName, setFullName] = useState("");
    const [isCNC, setIsCNC] = useState(false);
    const [specsURL, setSpecsURL] = useState("");
    // const [capabilities, setCapabilities] = useState<String[] | null>(null);

    return (
        <div className="px-60">
            <h1 className="font-medium">Add Equipment Model</h1>
            <p className="mt-4 max-w-[45vw]">Add a new equipment model to the database. You can create as many instances of an existing model as needed under Add Equipment.</p>
            <div className="flex items-center mt-6">
                <div className="max-w-96 w-full mt-4 mr-4">
                    <h2 className="text-4">Model</h2>
                    <input type="text" value={model} className="block p-2 border border-neutral-200 rounded-sm  mt-2 w-full" onChange={(e) => setModel(e.target.value)} />
                </div>
                <div className="max-w-96 w-full mt-4 mr-4">
                    <h2 className="text-4">Make</h2>
                    <input type="text" value={make} className="block p-2 border border-neutral-200 rounded-sm  mt-2 w-full" onChange={(e) => setMake(e.target.value)} />
                </div>
                <div className="max-w-96 w-full mt-4">
                    <h2 className="text-4">Equipment Type &#40;e.g. Lathe, 3D Printer&#41;</h2>
                    <input type="text" value={type} className="block p-2 border border-neutral-200 rounded-sm  mt-2 w-full" onChange={(e) => setType(e.target.value)} />
                </div>
            </div>
            <div className="max-w-96 w-full mt-4">
                <h2 className="text-4">Full Name &#40;OPTIONAL&#41;</h2>
                <input type="text" value={fullName} className="block p-2 border border-neutral-200 rounded-sm  mt-2 w-full" onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="max-w-96 w-full mt-4">
                <h2 className="text-4">Is CNC</h2>
                <input type="checkbox" checked={isCNC} className="h-6 w-6 mt-2" onChange={() => setIsCNC((isCNC) => !isCNC)} />
            </div>
            <div className="max-w-96 w-full mt-4">
                <h2 className="text-4">Specifications URL</h2>
                <input type="text" value={specsURL} className="block p-2 border border-neutral-200 rounded-sm  mt-2 w-full" onChange={(e) => setSpecsURL(e.target.value)} />
            </div>
            <div className="max-w-96 w-full mt-4">
                <h2 className="text-4">Capabilities</h2>
            </div>

        </div>
    );
}

export default AdminAddEquipmentModel;