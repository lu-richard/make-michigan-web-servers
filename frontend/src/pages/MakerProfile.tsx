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
import type { AdminCredential, PinnedEquipment, WishlistedCredentialModel, IssueReport } from '@/types/types';
import Loading from './Loading';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { toTitleCase } from '@/constants/helpers';

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
    const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
    const [wishlistedCredentialModels, setWishlistedCredentialModels] = useState<WishlistedCredentialModel[]>([]);
    const [equipmentImages, setEquipmentImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userCreds, pinnedEq, wishlistedCredModels, issues] = await Promise.all([
                    apiGetList<AdminCredential>('/view-credentials-admin/', {
                        recipient_user_id: profile!.user_id
                    }),
                    apiGetList<PinnedEquipment>('/view-pinned-equipment/', {
                        user_id: profile!.user_id
                    }),
                    apiGetList<WishlistedCredentialModel>('/view-wishlisted-credential-models/', {
                        user_id: profile!.user_id
                    }),
                    apiGetList<IssueReport>('/issue-reports/', {
                        reporter_user: profile!.user_id
                    })
                ]);

                const eqImages: string[] = [];

                pinnedEq.forEach((pe) => {
                    if (pe["manufacturer_image_urls"] && pe["manufacturer_image_urls"].length > 0) {
                        const { data } = supabase
                            .storage
                            .from('equipment-model-photos')
                            .getPublicUrl(pe["manufacturer_image_urls"][0]);
                        
                        eqImages.push(data.publicUrl);
                    }
                });

                setUserCredentials(userCreds);
                setPinnedEquipment(pinnedEq);
                setEquipmentImages(eqImages);
                setIssueReports(issues);
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
    
    return { profile, userCredentials, pinnedEquipment, equipmentImages, issueReports, wishlistedCredentialModels, loading, errorMessage};
};

function MakerProfile() {
    const { profile, userCredentials, pinnedEquipment, equipmentImages, issueReports, wishlistedCredentialModels, loading, errorMessage } = useMakerProfileData();
    
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
                        <section className="flex flex-row justify-center items-stretch gap-4">
                            <Card className="w-full min-h-80 pt-0">
                                <CardHeader className="flex flex-row justify-between px-12 py-3 bg-navy-blue">
                                    <CardTitle className="text-2xl font-bold text-white">Recent Certifications</CardTitle>
                                    <Button className="bg-maize text-black">
                                        <Link to={`/profile-creds-detail/${profile!.user_id}`}>
                                            All Certifications
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] auto-rows-fr gap-6">
                                    {
                                        userCredentials.map(
                                            (uc) =>
                                            <Card key={uc.credential_id} className="h-full p-0">
                                                <CardContent className="flex flex-row justify-between gap-2 px-0 h-full">
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
                            <Card className="w-full min-h-80 pt-0">
                                <CardHeader className="flex flex-row justify-between px-12 py-3 bg-navy-blue">
                                    <CardTitle className="text-2xl font-bold text-white">Pinned Equipment</CardTitle>
                                    <Button className="bg-maize text-black">
                                        <Link to={`/equipment`}>
                                            Explore All Equipment
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] auto-rows-fr gap-6">
                                    {
                                        pinnedEquipment.map(
                                            (pe, i) =>
                                            <Card key={pe.equipment_id} className="h-full p-0">
                                                <CardContent className="flex flex-row justify-between gap-2 px-0 h-full">
                                                    <div className="p-4">
                                                        <CardTitle className="text-2xl">{pe.equipment_model_name}</CardTitle>
                                                        <p>{pe.equipment_type}</p>
                                                        <p>{pe.makerspace_name}</p>
                                                        <img className="max-w-24" src={equipmentImages[i]} />
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
                                    <Link to={`trainings`}>
                                        Explore All Trainings
                                    </Link>
                                </Button>
                                
                            </CardHeader>
                            <CardContent className="flex flex-row gap-6 flex-wrap">
                                {
                                    wishlistedCredentialModels.map(
                                        (wcm) =>
                                        <Card key={wcm.credential_model_id} className="w-fit p-0">
                                            <CardContent className="flex flex-row justify-center align-center gap-2 px-0">
                                                <div className="p-4">
                                                    <CardTitle className="text-2xl">{wcm.credential_model_name}</CardTitle>
                                                    <p>{toTitleCase(wcm.credential_type)}</p>
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
                        <Card className="min-h-80 pt-0">
                            <CardHeader className="px-12 py-3 bg-navy-blue">
                                <CardTitle className="text-2xl font-bold text-white">Issue Reports</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {
                                    issueReports.map(
                                        (ir) =>
                                        <Card key={ir.issue_report_id} className="w-fit flex flex-row justify-center align-center p-0">
                                            <div className="py-6 px-2">
                                                <CardHeader className="min-w-120">
                                                    <CardTitle className="text-2xl">
                                                        {ir.title}
                                                    </CardTitle>
                                                    <p>{ir.is_resolved ? "Resolved" : "Unresolved"}</p>
                                                    <p>{toTitleCase(ir.issue_type)}</p>
                                                    <p>Reported On: {ir.created_at}</p>
                                                </CardHeader>
                                                <CardContent className="min-w-120">
                                                    <p>{ir.description}</p>
                                                </CardContent>
                                            </div>
                                            <div className="bg-black flex flex-col justify-center align-center px-4">
                                                <Link to={`/report-detail/${ir.issue_report_id}`}>
                                                    <ArrowForwardIcon className="text-white min-w-10 min-h-10" />
                                                </Link>
                                            </div>
                                        </Card>
                                    )
                                }
                                
                            </CardContent>
                            
                        </Card>
                    </div>
                </>
            }
        </>
    );
}

export default MakerProfile;