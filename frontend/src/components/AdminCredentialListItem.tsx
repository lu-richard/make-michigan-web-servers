import styles from '../styles/adminCredentialListItem.module.css';
import type { AdminCredential } from '../types/types';
import labels from '../constants/labels';

function AdminCredentialListItem({ userCredential }: { userCredential: AdminCredential }) {
    return (
        <div className={styles.container}>
            <p className={styles.name}>{userCredential["credential_model_name"]}</p>
            <p className={styles.status}>{labels[userCredential["credential_status"] as keyof typeof labels]}</p>
            <p className={styles["completion-date"]}>{userCredential["completion_date"]}</p>
            <p className={styles["issuing-makerspace-name"]}>{userCredential["makerspace_name"]}</p>
            {
                userCredential["credential_status"] !== "active_user" &&
                <div className={styles["quick-approve"]}>
                    <button type="button" className={styles.approve}>Approve</button>
                    <button type="button" className={styles.deny}>Deny</button>
                </div>
            }
        </div>
    );
}

export default AdminCredentialListItem;