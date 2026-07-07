import type { ProfileData } from "../types/types";
import styles from '../styles/profileListItem.module.css';
import labels from "../constants/labels";
import { Link } from "react-router-dom";

function AdminProfileListItem({ profileListItem }: { profileListItem: ProfileData }) {
    const adminProfileHomePath = `/admin-profile-detail/${profileListItem["user_id"]}`;

    return (
        <Link to={adminProfileHomePath} className={styles.container}>
            <p className={styles.name}>{profileListItem["first_name"]} {profileListItem["last_name"]}</p>
            <p className={styles.uniqname}>{profileListItem["uniqname"]}</p>
            <div className={styles.roles}>
                {profileListItem["roles"]?.map((role) => <p key={role} className={styles.role}>{labels[role]}</p>)}
            </div>
        </Link>
    );
}

export default AdminProfileListItem;