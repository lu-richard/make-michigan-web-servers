import DashboardNavBar from '../components/DashboardNavBar';
import styles from '../styles/dashboard.module.css';
import { useAppContext } from '../context/AppContext';
import { useEffect } from 'react';

//     const useDashboardData = () => {
//     const [profile, setProfile] = useState<DashboardData | null>(null);
//     const { session } = useAppContext();

//     useEffect(() => {
//         const fetchProfile = async () => {
//             const userId = session?.user?.id;
//             if (!userId) return; // don't run until session exists

//             // Try sessionStorage cache first (one cache entry per user)
//             try {
//                 const cached = sessionStorage.getItem(`profile:${userId}`);
//                 if (cached) {
//                     setProfile(JSON.parse(cached));
//                     return;
//                 }
//             } catch {
//                 // ignore sessionStorage errors and continue to fetch
//             }

//             try {
//                 const { data, error } = await supabase
//                   .from('profiles')
//                   .select('first_name, last_name')
//                   .eq('user_id', userId)
//                   .single();

//                 if (error) {
//                     throw new Error(`${error}`);
//                 }

//                 setProfile(data);

//                 // store in sessionStorage so future mounts don't re-fetch
//                 try {
//                     sessionStorage.setItem(`profile:${userId}`, JSON.stringify(data));
//                 } catch {
//                     // ignore storage errors
//                 }
//             }
//             catch (e) {
//                 console.error(e);
//             }
//         };

//         fetchProfile();
//     }, [session?.user?.id]);

//     return { profile, session };
// };


function MakerProfile() {
    // const context = useContext(AppContext);
    // console.log('App context in Dashboard:', context);
    // const { profile } = context ?? {};
    // console.log('Profile data:', profile);

    
    useEffect(() => {
        const fetchCanvasAPIData = async () => {
            try {
                const data = await fetch("https://canvas.instructure.com/api/v1/courses/14186829/users?enrollment_type=student");

                if (!data.ok) {
                    throw new Error(`Failed to fetch. Error status: ${data.status}`)
                }

                const response = await data.json();

                console.log(response);
            }
            catch (e) {
                console.error((e as Error).message);
            }
        }

        fetchCanvasAPIData();
    }, []);

    const { profile } = useAppContext();
    return (
        <>
            <DashboardNavBar />
            <div className={styles.container}>
                <h1 className={styles.header}>Welcome Back, {profile?.first_name ? profile.first_name : 'User'}!</h1>
                <div className={styles.section}>
                    <h2>Stats</h2>
                    {/* write a suggestions engine for this */}
                </div>
                <div className={styles.section}>
                    <h2>Completed Trainings</h2>
                </div>
                <div className={styles.section}>
                    <h2>Eligible Trainings</h2>
                    {/* write a suggestions engine for this */}
                </div>
                <div className={styles.section}>
                    <h2>Notifications</h2>
                    {/* write a suggestions engine for this */}
                </div>
                <div className={styles.section}>
                    <h2>Issue Reports</h2>
                    {/* write a suggestions engine for this */}
                </div>
            </div>
        </>
    );
}

export default MakerProfile;