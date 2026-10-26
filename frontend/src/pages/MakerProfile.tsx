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
import type { AdminCredential, PinnedEquipment, WishlistedCredentialModel } from '@/types/types';
import Loading from './Loading';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';

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
    const [pinnedEquipment, setPinnedEquipment] = useState<PinnedEquipment[]>([]);
    const [wishlistedCredentialModels, setWishlistedCredentialModels] = useState<WishlistedCredentialModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [userCreds, pinnedEq, wishlistedCredModels] = await Promise.all([
                    apiGetList<AdminCredential>('/view-credentials-admin/', {
                        recipient_user_id: profile!.user_id
                    }),
                    apiGetList<PinnedEquipment>('/view-pinned-equipment/', {
                        user_id: profile!.user_id
                    }),
                    apiGetList<WishlistedCredentialModel>('/view-wishlisted-credential-models/', {
                        user_id: profile!.user_id
                    })
                ]);

                setUserCredentials(userCreds);
                setPinnedEquipment(pinnedEq);
                setWishlistedCredentialModels(wishlistedCredModels);
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
        
        fetchData();
    }, []);
    
    return { profile, userCredentials, pinnedEquipment, wishlistedCredentialModels, loading, errorMessage};
};

function MakerProfile() {
    const { profile, userCredentials, pinnedEquipment, wishlistedCredentialModels, loading, errorMessage } = useMakerProfileData();
    
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
                                    {/* recipient_user_id: string;
                                        credential_id: string;
                                        completion_date: string | null;
                                        expiration_date: string | null;
                                        credential_model_name: string;
                                        credential_status: CredentialStatus;
                                        author_user_id: string;
                                        author_first_name: string;
                                        author_middle_initial: string | null;
                                        author_last_name: string;
                                        issuing_makerspace_id: string;
                                        makerspace_name: string; */}
                                    {
                                        userCredentials.map(
                                            (uc) =>
                                            <Card key={uc.credential_id} className="w-fit p-0">
                                                <CardContent className="flex flex-row justify-center align-center gap-2 px-0">
                                                    <div className="p-4">
                                                        <CardTitle className="text-2xl">{uc.credential_model_name}</CardTitle>
                                                        <p>{uc.makerspace_name}</p>
                                                        <p>Certified: {uc.completion_date === null ? "Unknown" : uc.completion_date}</p>
                                                    </div>
                                                    <div className="bg-black flex flex-col justify-center align-center px-2">
                                                        <Link to={`/dashboard/trainings/training-detail/${uc.issuing_makerspace_id}/${uc.credential_model_id}`}>
                                                            <ArrowForwardIcon className="text-white min-w-10 min-h-10" />
                                                        </Link>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    }
                                    
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
                                    {
                                        pinnedEquipment.map(
                                            (pe) =>
                                            <Card key={pe.equipment_id} className="w-fit p-0">
                                                <CardContent className="flex flex-row justify-center align-center gap-2 px-0">
                                                    <div className="p-4">
                                                        <CardTitle className="text-2xl">{pe.equipment_model_name}</CardTitle>
                                                        <p>{pe.equipment_type}</p>
                                                        <p>{pe.makerspace_name}</p>
                                                    </div>
                                                    <div className="bg-black flex flex-col justify-center align-center px-2">
                                                        <Link to={`/equipment-detail/${pe.equipment_id}`}>
                                                            <ArrowForwardIcon className="text-white min-w-10 min-h-10" />
                                                        </Link>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    }
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
                                {
                                    wishlistedCredentialModels.map(
                                        (wcm) =>
                                        <Card key={wcm.credential_model_id} className="w-fit p-0">
                                            <CardContent className="flex flex-row justify-center align-center gap-2 px-0">
                                                <div className="p-4">
                                                    <CardTitle className="text-2xl">{wcm.credential_model_name}</CardTitle>
                                                    <p>{wcm.credential_type}</p>
                                                    <p>{wcm.makerspace_name}</p>
                                                </div>
                                                <div className="bg-black flex flex-col justify-center align-center px-2">
                                                    <Link to={`/dashboard/trainings/training-detail/${wcm.makerspace_id}/${wcm.credential_model_id}`}>
                                                        <ArrowForwardIcon className="text-white min-w-10 min-h-10" />
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                }
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