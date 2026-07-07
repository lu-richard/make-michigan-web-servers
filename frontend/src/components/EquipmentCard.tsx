import type { EquipmentCardData } from "../types/types";
// import styles from '../styles/equipmentCard.module.css';
import supabase from "../lib/supabase";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function EquipmentCard({ equipmentCard }: { equipmentCard: EquipmentCardData }) {
    const equipmentDetailPath = `/equipment-detail/${equipmentCard["equipment_id"]}`;
    const [coverImage, setCoverImage] = useState<string | null>(null);

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
        <Link to={equipmentDetailPath} className="flex flex-col p-12 bg-main-bg drop-shadow-xl/10 border border-neutral-300 rounded-2xl text-text">
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
    );
}

export default EquipmentCard;