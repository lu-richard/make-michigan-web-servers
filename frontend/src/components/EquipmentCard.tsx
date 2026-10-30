import type { EquipmentCardData } from "../types/types";
// import styles from '../styles/equipmentCard.module.css';
import supabase from "../lib/supabase";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { apiPost, apiDelete } from "@/lib/api";
import { useAppContext } from "@/context/AppContext";

function EquipmentCard({ equipmentCard, initIsPinned }: { equipmentCard: EquipmentCardData, initIsPinned: boolean }) {
    const equipmentDetailPath = `/equipment-detail/${equipmentCard["equipment_id"]}`;
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isPinned, setIsPinned] = useState(initIsPinned);
    const { profile } = useAppContext();
    const pinEquipment = async () => {
        try {
            if (!isPinned) {
                const response = await apiPost('/pinned-equipment/', {
                    user_id: profile!.user_id,
                    equipment_id: equipmentCard.equipment_id
                });

                console.log(response);
            }
            else {
                const response = await apiDelete(`/profiles/${profile!.user_id}/pinned-equipment/${equipmentCard.equipment_id}/`);
                console.log(response);
            }
            
            setIsPinned((p) => !p);
        }
        catch (e) {
            console.error((e as Error).message);
        }
    };

    useEffect(() => {
        if (equipmentCard["manufacturer_image_urls"] && equipmentCard["manufacturer_image_urls"].length > 0) {
            const { data } = supabase
                .storage
                .from('equipment-model-photos')
                .getPublicUrl(equipmentCard["manufacturer_image_urls"][0]);
            
            setCoverImage(data.publicUrl);
        }
    }, []);

    return (
        <div className="relative flex flex-col bg-main-bg drop-shadow-xl/10 border border-neutral-300 rounded-2xl text-text">
            <button className="absolute right-4 top-3" onClick={() => pinEquipment()}>
                {isPinned ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                <p className="text-xs">{isPinned ? "Unpin" : "Pin"}</p>
            </button>
            <Link to={equipmentDetailPath} className="p-12">
                {coverImage && <img src={coverImage} />}
                <h1 className="text-2xl mt-4 font-medium">{equipmentCard["equipment_type"]}</h1>
                <h2 className="italic text-lg">{equipmentCard["equipment_model_name"]}</h2>
                <div className="mt-4">
                    <p>{equipmentCard.building}</p>
                    <p>{equipmentCard.rooms?.map((room, index) => <span key={room}>{room}{index < equipmentCard.rooms!.length - 1 && ', '}</span>)}</p>
                </div>
                <p className="mt-6 underline">Functions</p>
                <p>{equipmentCard.capabilities?.map((capability, index) => <span key={index}>{capability}{index < equipmentCard.capabilities!.length - 1 && ', '}</span>)}</p>
            </Link>
        </div>
    );
}

export default EquipmentCard;