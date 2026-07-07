import styles from '../styles/adminDashboardTraining.module.css';
import { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import type { ProfileData } from '../types/types';
import supabase from '../lib/supabase';
import Loading from './Loading';
import AdminProfileListItem from '../components/AdminProfileListItem';

const useAdminDashboardTrainingData = () => {
    const [profiles, setProfiles] = useState<ProfileData[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
    const [searchLimit, setSearchLimit] = useState(10);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearchValue(searchValue), 500);

        return () => clearTimeout(timeout);
    }, [searchValue]);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                setLoading(true);

                let query = supabase.from('profiles').select('user_id, first_name, last_name, uniqname, roles');

                if (debouncedSearchValue !== "") {
                    query.eq('uniqname', debouncedSearchValue);
                }

                const { data, error } = await query.order('first_name', { ascending: true }).limit(searchLimit);

                if (error) {
                    throw new Error(error.message);
                }

                setProfiles(data);
            }
            catch (e) {
                console.error((e as Error).message);
            }
            finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [debouncedSearchValue, searchLimit]);

    return { searchValue, setSearchValue, searchLimit, setSearchLimit, profiles, loading };
};

function AdminDashboardTraining() {
    const { searchValue, setSearchValue, searchLimit, setSearchLimit, profiles, loading } = useAdminDashboardTrainingData();

    return (
        <>
            {
                loading ? <Loading /> :
                <div className={styles.container}>
                    <h1 className={styles["main-heading"]}>Training</h1>
                    <div className={styles["search-bar"]}>
                        <SearchIcon />
                        <input type="text" value={searchValue} placeholder="Search by name or uniqname" className={styles["text-field"]} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                    <div className={styles["column-names"]}>
                        <p className={styles["column-name"]}>Name</p>
                        <p className={styles["column-name"]}>Uniqname</p>
                        <p className={styles["column-name"]}>Roles</p>
                    </div>
                    {
                        profiles.length > 0 ?
                        <>
                            <div>
                                {profiles.map((profileListItem) => <AdminProfileListItem key={profileListItem["user_id"]} profileListItem={profileListItem} />)}
                            </div>
                            <p className={styles["num-results"]}>Results 1 - {profiles.length}</p> :
                            {
                                profiles.length === searchLimit &&
                                <button type="button" className={styles["more-results-button"]} onClick={() => setSearchLimit((searchLimit) => searchLimit + 10)}>See More</button>
                            }
                        </> :
                        <p className={styles["no-results-message"]}>No results found.</p>
                    }
                </div>
            }
        </>
    );
}

export default AdminDashboardTraining;