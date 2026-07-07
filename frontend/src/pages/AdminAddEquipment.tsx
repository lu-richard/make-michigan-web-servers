import styles from '../styles/adminAddEquipmentModel.module.css';
import { useState } from 'react';

function AdminAddEquipment() {
    const [model, setModel] = useState("");
    const [make, setMake] = useState("");
    const [type, setType] = useState("");
    const [fullName, setFullName] = useState("");
    const [isCNC, setIsCNC] = useState(false);
    const [specsURL, setSpecsURL] = useState("");
    // const [capabilities, setCapabilities] = useState<String[] | null>(null);

    return (
        <div className={styles.container}>
            <h1 className={styles["main-heading"]}>Add Equipment Model</h1>
            <p className={styles["main-heading-subinfo"]}>Add a new instance of equipment. Must be associated with an existing equipment model. Equipment models can be created under Add Equipment Model.</p>
            <div className={styles["basic-info"]}>
                <div className={styles.question}>
                    <h2 className={styles["question-heading"]}>Model</h2>
                    <input type="text" value={model} className={styles["text-field"]} onChange={(e) => setModel(e.target.value)} />
                </div>
                <div className={styles.question}>
                    <h2 className={styles["question-heading"]}>Make</h2>
                    <input type="text" value={make} className={styles["text-field"]} onChange={(e) => setMake(e.target.value)} />
                </div>
                <div className={styles.question}>
                    <h2 className={styles["question-heading"]}>Equipment Type &#40;e.g. Lathe, 3D Printer&#41;</h2>
                    <input type="text" value={type} className={styles["text-field"]} onChange={(e) => setType(e.target.value)} />
                </div>
            </div>
            <div className={styles.question}>
                <h2 className={styles["question-heading"]}>Full Name &#40;OPTIONAL&#41;</h2>
                <input type="text" value={fullName} className={styles["text-field"]} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className={styles.question}>
                <h2 className={styles["question-heading"]}>Is CNC</h2>
                <input type="checkbox" checked={isCNC} className={styles.checkbox} onChange={() => setIsCNC((isCNC) => !isCNC)} />
            </div>
            <div className={styles.question}>
                <h2 className={styles["question-heading"]}>Specifications URL</h2>
                <input type="text" value={specsURL} className={styles["text-field"]} onChange={(e) => setSpecsURL(e.target.value)} />
            </div>
            <div className={styles.question}>
                <h2 className={styles["question-heading"]}>Capabilities</h2>
            </div>

        </div>
    );
}

export default AdminAddEquipment;