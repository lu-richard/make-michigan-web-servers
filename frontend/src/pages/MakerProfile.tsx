import DashboardNavBar from '../components/DashboardNavBar';
import { useAppContext } from '../context/AppContext';
import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGetList } from '@/lib/api';
import type { AdminCredential } from '@/types/types';
import Loading from './Loading';

// const context = useContext(AppContext);
// // console.log('App context in Dashboard:', context);
// const { profile } = context ?? {};
// console.log('Profile data:', profile);

// useEffect(() => {
//         const fetchCanvasAPIData = async () => {
//             try {
//                 const data = await fetch("https://canvas.instructure.com/api/v1/courses/14186829/users?enrollment_type=student");

//                 if (!data.ok) {
//                     throw new Error(`Failed to fetch. Error status: ${data.status}`)
//                 }

//                 const response = await data.json();

//                 console.log(response);
//             }
//             catch (e) {
//                 console.error((e as Error).message);
//             }
//         }

//         fetchCanvasAPIData();
//     }, []);

const useMakerProfileData = () => {
    const { profile } = useAppContext();
    const [userCredentials, setUserCredentials] = useState<AdminCredential[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchUserCredentials = async () => {
            try {
                setLoading(true);

                const userCreds = await apiGetList<AdminCredential>('/view-credentials-admin/', {
                    recipient_user_id: profile!.user_id
                });

                setUserCredentials(userCreds);
                console.log(profile!.user_id);
                console.log(userCreds);
            }
            catch (e) {
                console.log((e as Error).message);
                setErrorMessage("An error occurred. Please refresh the page.");
            }
            finally {
                setLoading(false);
            }
        };
        
        fetchUserCredentials();
    }, []);
    
    return { profile, userCredentials, loading, errorMessage};
};

function MakerProfile() {
    const { profile, loading, errorMessage } = useMakerProfileData();
    
    return (
        <>
            {
                loading ? <Loading /> :
                errorMessage ? <p className="text-center mt-[35vh]">{errorMessage}</p> :
                <>
                    <DashboardNavBar />
                    <div className="mx-24 my-12 flex flex-col gap-12">
                        <Card className="p-8">
                            <CardHeader>
                                <CardTitle className="text-3xl font-bold">Welcome Back, {profile?.first_name ? profile.first_name : 'User'}!</CardTitle>
                                <p>Track your trainings, reservations, events and makerspace access.</p>
                            </CardHeader>
                        </Card>
                        <section className="flex flex-row justify-center items-center gap-4">
                            <Card className="w-full min-h-60 pt-0">
                                <CardHeader className="flex flex-row justify-between px-12 py-3 bg-navy-blue">
                                    <CardTitle className="text-2xl font-bold text-white">Recent Certifications</CardTitle>
                                    <Button className="bg-maize text-black">
                                        All Certifications
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    
                                    
                                </CardContent>
                                
                            </Card>
                            <Card className="w-full min-h-60 pt-0">
                                <CardHeader className="flex flex-row justify-between px-12 py-3 bg-navy-blue">
                                    <CardTitle className="text-2xl font-bold text-white">Pinned Equipment</CardTitle>
                                    <Button className="bg-maize text-black">
                                        Explore All Equipment
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    
                                    
                                </CardContent>
                                
                            </Card>
                        </section>
                        <Card className="min-h-80 pt-0">
                            <CardHeader className="flex flex-row justify-between px-12 py-3 bg-navy-blue">
                                <CardTitle className="text-2xl font-bold text-white">Wishlist</CardTitle>
                                <Button className="bg-maize text-black">
                                    Explore All Trainings
                                </Button>
                            </CardHeader>
                            <CardContent>
                                
                            </CardContent>
                            
                        </Card>
                        <Card className="min-h-60 pt-0">
                            <CardHeader className="px-12 py-3 bg-navy-blue">
                                <CardTitle className="text-2xl font-bold text-white">Issue Reports</CardTitle>
                            </CardHeader>
                            <CardContent>
                                
                                
                            </CardContent>
                            
                        </Card>
                    </div>
                </>
            }
        </>
    );
}

export default MakerProfile;