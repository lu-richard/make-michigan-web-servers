import { Link, useParams } from "react-router-dom";
import type { EquipmentDetailData } from "../types/types";
import { useState, useEffect } from "react";
import { apiGet } from "../lib/api";
import supabase from "../lib/supabase";
import Loading from "./Loading";
// import styles from '../styles/equipmentDetail.module.css';
import labels from "../constants/labels";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const useEquipmentDetailData = () => {
    const { id } = useParams();
    const [equipment, setEquipment] = useState<EquipmentDetailData | null>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const data = await apiGet<EquipmentDetailData>(`/view-equipment-detail-pages/${id}`);

                setEquipment(data);

                if (data?.manufacturer_image_urls?.length) {
                    const { data: image } = supabase
                        .storage
                        .from('equipment-model-photos')
                        .getPublicUrl(data["manufacturer_image_urls"][0]);
                    
                    setCoverImage(image.publicUrl);
                }
            }
            catch (e) {
                console.error((e as Error).message);
            }
            finally {
                setLoading(false);
            }
        };

        fetchEquipment();
    }, []);

    return { equipment, coverImage, loading };
};

function EquipmentDetail() {
    const { equipment, coverImage, loading } = useEquipmentDetailData();
    
    return (
        <>
            {
                loading ? <div className="h-[80vh]"><Loading /></div> :
                equipment ?
                <>
                    <div className="py-12 px-80 bg-arb-blue text-[#fff] flex justify-between font-light">
                        <div>
                            <h1 className="text-4xl font-semibold">{equipment["equipment_type"]}<span className="ml-6 italic font-light text-2xl">{equipment["equipment_model_name"]}</span></h1>
                            <section className="mt-4">
                                <Link to={`/makerspace-detail/${equipment["makerspace_id"]}`} className="flex justify-center items-center gap-1 font-medium text-xl w-fit">
                                    <p>{equipment["makerspace_name"]}</p>
                                    <ArrowForwardIcon />
                                </Link>
                                <p className="text-lg">{equipment.building}</p>
                                <p className="text-lg">{equipment.rooms?.map((room, index) => <span key={room}>{room}{index < equipment.rooms!.length - 1 && ', '}</span>)}</p>
                            </section>
                        </div>
                        <div>
                            <h4 className="text-xl font-medium underline">Functions</h4>
                            <p className="text-lg">{equipment.capabilities?.map((capability, index) => <span key={index}>{capability}{index < equipment.capabilities!.length - 1 && ', '}</span>)}</p>
                            <h4 className="text-xl font-medium mt-8">Necessary Credential:</h4>
                            {
                                equipment["credential_model_id"] ?
                                <Link to={`/dashboard/trainings/training-detail/${equipment["makerspace_id"]}/${equipment["credential_model_id"]}`} className="flex justify-center items-center gap-1 text-lg w-fit">
                                    <p>{equipment["credential_model_name"]}</p>
                                    <ArrowForwardIcon />
                                </Link> :
                                <p className="text-lg">None</p>
                            }
                        </div>
                    </div>
                    <div className="py-12 px-16 flex">
                        {coverImage && <div className="block mx-auto w-1/2 px-36 self-start"><img src={coverImage} className="w-full" /></div>}
                        <section className="text-xl ml-8 w-1/2">
                            <section className="mb-12">
                                <p><span className="font-medium">Current Status:</span> {equipment["equipment_status"] || "N/A"}</p>
                                {
                                    equipment.materials && equipment.materials.length > 0 &&
                                    <p className="mt-4"><span className="font-medium">Materials:</span> {equipment.materials.join(', ')}</p>
                                }
                                {
                                    typeof equipment["equipment_specific_specs"] === "object" && equipment["equipment_specific_specs"] && Object.entries(equipment["equipment_specific_specs"]).map(([key, value]) => <p key={key} className="mt-4"><span className="font-medium">{labels[key as keyof typeof labels] || key}:</span> {value as string}</p>)
                                }
                                {equipment.notes && <p className="mt-4">{equipment.notes}</p>}
                            </section>
                            <section className="mb-12">
                                <h2 className="font-medium underline mb-2">Specifications</h2>
                                <p><span className="font-medium">Model:</span> {equipment.model}</p>
                                <p><span className="font-medium">Make:</span> {equipment.make}</p>
                                <p><span className="font-medium">CNC:</span> {equipment["is_cnc"] ? "Yes" : "No"}</p>
                                {
                                    typeof equipment["equipment_model_specific_specs"] === "object" &&
                                    equipment["equipment_model_specific_specs"] &&
                                    Object.entries(equipment["equipment_model_specific_specs"]).map(([key, value], index) => typeof value === "string" && <p key={index}><span className="font-medium">{labels[key as keyof typeof labels] || key}:</span> {value}</p>)
                                }
                            </section>
                        </section>
                    </div>
                </> :
                <p>The page you are looking for does not exist.</p>
            }
        </>
    );
}

export default EquipmentDetail;