import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import type { AdminCredential, ProfileData } from "../types/types";
import supabase from "../lib/supabase";
import Loading from "./Loading";
import styles from '../styles/adminProfileDetail.module.css';
import AdminCredentialListItem from "../components/AdminCredentialListItem";
import labels from "../constants/labels";
import SearchIcon from '@mui/icons-material/Search';

const useAdminProfileDetailData = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [credentials, setCredentials] = useState<AdminCredential[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    // const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

    // useEffect(() => {
    //     const timeout = setTimeout(() => setDebouncedSearchValue(searchValue), 500);

    //     return clearTimeout(timeout);
    // }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await supabase.from('profiles').select('user_id, uniqname, first_name, middle_initial, last_name, roles').eq('user_id', id!).maybeSingle();

            if (error) {
                throw new Error(error.message);
            }

            setProfile(data);
        };

        const fetchCredentials = async () => {
            const { data, error } = await supabase.from('view_credentials_admin').select().eq('recipient_user_id', id!);

            if (error) {
                throw new Error(error.message);
            }

            setCredentials(data);
        }

        const fetchAdminProfile = async () => {
            try {
                await Promise.all([fetchProfile(), fetchCredentials()]);
            }
            catch (e) {
                console.error((e as Error).message);
            }
            finally {
                setLoading(false);
            }
        };

        fetchAdminProfile();
    }, []);

    return { searchValue, setSearchValue, profile, credentials, loading };
};

function AdminProfileDetail() {
    const { searchValue, setSearchValue, profile, credentials, loading } = useAdminProfileDetailData();

    return (
        <>
            {
                loading ? <Loading /> :
                profile ?
                <div className={styles.container}>
                    <h1 className={styles["main-heading"]}>View User Trainings</h1>
                    <h2 className={styles["student-name"]}>{profile!["first_name"]} {profile!["middle_initial"] && profile!["middle_initial"] + ". "}{profile!["last_name"]}</h2>
                    <div className={styles["roles"]}>
                        {profile.roles?.map((role) => <p key={role} className={styles.role}>{labels[role]}</p>)}
                        <p className={`${styles.role} ${styles["modify-or-revoke"]}`}>Modify or Revoke a Certificate</p>
                    </div>
                    <div className={styles["search-bar"]}>
                        <SearchIcon />
                        <input type="text" value={searchValue} placeholder="Search by certificate name, certificate status, or completion date" className={styles["text-field"]} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                    <div className={styles["column-names"]}>
                        <p className={styles["column-name"]}>Certificate Name</p>
                        <p className={styles["column-name"]}>Status</p>
                        <p className={styles["column-name"]}>Completion Date</p>
                        <p className={styles["column-name"]}>Name of Issuing Makerspace</p>
                        <p className={styles["column-name"]}>Quick Approve</p>
                    </div>
                    {
                        credentials.length === 0 ? <p className={styles["no-results-message"]}>No Certificates Yet</p> :
                        <div>
                            {credentials.map((userCredential) => <AdminCredentialListItem key={userCredential["credential_id"]} userCredential={userCredential} />)}
                        </div>
                    }
                </div> :
                <p>The page you are looking for does not exist.</p>
            }
        </>
    );
}

export default AdminProfileDetail;