import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import type { MakerspaceDetailData } from "../types/types";
import { apiGet } from "../lib/api";
import supabase from "../lib/supabase";
// import styles from '../styles/makerspaceDetail.module.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Loading from "./Loading";
import headshots from '../constants/headshots';
import labels from "../constants/labels";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const useMakerspaceDetailData = () => {
    const { id } = useParams();
    const [makerspace, setMakerspace] = useState<MakerspaceDetailData | null>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [floorplanImage, setFloorplanImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMakerspace = async () => {
            try {
                const data = await apiGet<MakerspaceDetailData>(`/view-makerspace-detail-pages/${id}`);

                setMakerspace(data);

                if (data?.["cover_image"]) {
                    const { data: coverImg } = supabase
                        .storage
                        .from('makerspace-photos')
                        .getPublicUrl(data["cover_image"]);
                
                    setCoverImage(coverImg.publicUrl);
                }
                if (data?.["floorplan_image"]) {
                    const { data: floorplanImg } = supabase
                        .storage
                        .from('makerspace-photos')
                        .getPublicUrl(data["floorplan_image"]);
                    
                    setFloorplanImage(floorplanImg.publicUrl);
                }
            }
            catch (e) {
                console.error((e as Error).message);
            }
            finally {
                setLoading(false);
            }
        };

        fetchMakerspace();
    }, []);

    return { makerspace, coverImage, floorplanImage, loading };
};

function MakerspaceDetail() {
    const { makerspace, coverImage, floorplanImage, loading } = useMakerspaceDetailData();
    const [toggleEquipmentList, setToggleEquipmentList] = useState(false);
    
    // const toggleEquipmentList = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    //     (e.currentTarget as HTMLElement).classList.toggle(styles.active);
    // };

    return (
        <>
            {
                loading ? <div className="h-[80vh]"><Loading /></div> :
                makerspace ?
                <>
                    <div className="py-12 pl-56 pr-80 bg-arb-blue text-[#fff] flex justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{makerspace["makerspace_name"]}</h1>
                            <p className="text-lg font-light mt-2">{makerspace.building}</p>
                            <p className="text-lg font-light">{makerspace.rooms?.map((room, index) => <span key={room}>{room}{index < makerspace.rooms!.length - 1 && ', '}</span>)}</p>
                            {
                                makerspace.themes &&
                                <div className="mt-4 flex">
                                    {makerspace.themes.map((tag) => <p key={tag} className="py-2 px-4 bg-maize rounded-3xl text-text mr-3 text-sm">{labels[tag as keyof typeof labels]}</p>)}
                                </div>
                            }
                        </div>
                        <div className="mt-2">
                            <h3 className="text-nowrap font-semibold text-xl">Who Can Use This Space?</h3>
                            <ul>
                                {makerspace.audience?.map((aud, index) => <li key={index} className="text-lg">{aud}</li>)}
                            </ul>
                        </div>
                    </div>
                    <div className="py-12 px-16">
                        <div className="flex">
                            {
                                coverImage &&
                                <div>
                                    <img src={coverImage} className="block mx-auto max-w-[45vw] self-start" />
                                    {
                                        floorplanImage &&
                                        <div className="mt-8 max-w-[45vw]">
                                            <h4 className="text-xl font-medium">Floor Plan</h4>
                                            <div className="border-t"></div>
                                            <img src={floorplanImage} />
                                        </div>
                                    }    
                                </div>
                            }
                            <section className="text-lg ml-12">
                                <p className="mb-4">Current Status: {makerspace["makerspace_status"] || "N/A"}</p>
                                <p>{makerspace.description}</p>
                                <button type="button" className="mt-4 flex justify-center items-center cursor-pointer" onClick={() => setToggleEquipmentList((toggleEquipmentList) => !toggleEquipmentList)}>
                                    <span className={`${toggleEquipmentList && "underline"}`}>Equipment</span>
                                    <KeyboardArrowDownIcon className={`${toggleEquipmentList && "transition-transform rotate-180"}`} />
                                </button>
                                <ul className={toggleEquipmentList ? "max-h-none" : "max-h-0 overflow-hidden"}>
                                    {
                                        makerspace["equipment_list"]?.map(
                                            (makerspaceEquipment) =>
                                            <li key={makerspaceEquipment["equipment_id"]} className="flex justify-center items-center gap-1 w-fit ml-4">
                                                <Link to={`/equipment-detail/${makerspaceEquipment["equipment_id"]}`}>{makerspaceEquipment["equipment_name"]}</Link>
                                                <ArrowForwardIcon />
                                            </li>
                                        )
                                    }
                                </ul>
                                <div className="mt-12 text-4">
                                    <h4 className="underline">Contact</h4>
                                    <p>{makerspace["contact_email"]}<br />{`(${makerspace["contact_phone"].substring(0, 3)}) ${makerspace["contact_phone"].substring(3, 6)}-${makerspace["contact_phone"].substring(6)}`}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-12 ml-4">
                                    {
                                        makerspace.staff_ids?.map((staffId) =>
                                        <div key={staffId} className="text-sm flex flex-col justify-center items-center py-8 bg-main-bg rounded-4xl drop-shadow-xl/20">
                                            {headshots[staffId].imgPath && <img src={headshots[staffId].imgPath} className="[clip-path:circle(48%)] max-w-28 mb-4" />}
                                            <p className="text-4 font-medium mb-1">{staffId}</p>
                                            <p className="itlaic mb-2 max-w-48">{headshots[staffId].title}</p>
                                            {headshots[staffId].email && <p className="text-navy-blue mb-1">{headshots[staffId].email}</p>}
                                            {headshots[staffId].phone && <p>{headshots[staffId].phone}</p>}
                                        </div>)
                                    }
                                </div>
                            </section>
                        </div>
                    </div>
                </>
                : <p>The page you are looking for does not exist.</p>
            }
        </>
    );
}

export default MakerspaceDetail;