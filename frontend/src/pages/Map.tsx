import styles from '../styles/map.module.css';
import { useState, useEffect, useMemo, useRef } from 'react';
import type { Makerspace } from '@/types/api';
import { apiGetList } from '@/lib/api';
import Loading from './Loading';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Leaflet's default icon prepends an auto-detected image folder to its URLs, which breaks Vite's bundled asset URLs,
// so build the standard marker explicitly from the bundled images instead.
const MARKER_ICON = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// All current makerspaces are on North Campus.
const CAMPUS_CENTER: [number, number] = [42.2930, -83.7130];
const CAMPUS_ZOOM = 16;

// Makerspaces in the same building share coordinates, so their pins would stack and hide each other.
// Spread each such group evenly around a small circle (~35 m) so every pin is visible and clickable.
const OVERLAP_RADIUS_DEGREES = 0.0003;

function spreadOverlappingMarkers(makerspaces: Makerspace[]): Record<string, [number, number]> {
    const groups: Record<string, Makerspace[]> = {};

    for (const m of makerspaces) {
        const key = `${Number(m.latitude)},${Number(m.longitude)}`;
        (groups[key] ??= []).push(m);
    }

    const positions: Record<string, [number, number]> = {};

    for (const group of Object.values(groups)) {
        // Sort so each makerspace keeps the same spot around the circle between loads.
        group.sort((a, b) => a.makerspace_name.localeCompare(b.makerspace_name));

        group.forEach((m, i) => {
            const lat = Number(m.latitude);
            const lng = Number(m.longitude);

            if (group.length === 1) {
                positions[m.makerspace_id] = [lat, lng];
                return;
            }

            const angle = (2 * Math.PI * i) / group.length;
            // A degree of longitude is shorter than a degree of latitude away from the equator; scale it so the circle stays round.
            positions[m.makerspace_id] = [
                lat + OVERLAP_RADIUS_DEGREES * Math.cos(angle),
                lng + (OVERLAP_RADIUS_DEGREES * Math.sin(angle)) / Math.cos((lat * Math.PI) / 180),
            ];
        });
    }

    return positions;
}

function Map() {
    const [makerspaces, setMakerspaces] = useState<Makerspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerPositions = useMemo(() => spreadOverlappingMarkers(makerspaces), [makerspaces]);

    const resetView = () => {
        mapRef.current?.closePopup();
        mapRef.current?.setView(CAMPUS_CENTER, CAMPUS_ZOOM);
    };

    useEffect(() => {
        const fetchMakerspaces = async () => {
            try {
                const spaces = await apiGetList<Makerspace>('/makerspaces/');

                setMakerspaces(spaces);
            }
            catch (e) {
                console.error((e as Error).message);
                setErrorMessage("An error occurred. Please refresh this page.");
            }
            finally {
                setLoading(false);
            }
        };

        fetchMakerspaces();
    }, []);


    return (
        <>
            {
                loading ? <div className="h-[80vh]"><Loading /></div> :
                errorMessage ? <p className="text-center mt-[35vh]">{errorMessage}</p> :
                <div className={styles.container}>
                    <div className={styles["top-bar"]}>
                        <h1>Map of U-M Makerspaces</h1>
                        <button type="button" className='bg-arb-blue text-[#fff] py-3 px-5 rounded-3xl hover:bg-arb-blue-hover cursor-pointer' onClick={resetView}>Reset</button>
                        {/* <button type="button" className={styles["tutorial-button"]}>How do you use this map?</button> */}
                    </div>
                    <MapContainer ref={mapRef} center={CAMPUS_CENTER} zoom={CAMPUS_ZOOM} scrollWheelZoom className="h-[80vh] w-full mt-8">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {makerspaces.map((m) => (
                            <Marker key={m.makerspace_id} position={markerPositions[m.makerspace_id]} icon={MARKER_ICON}>
                                <Popup>
                                    <p className="font-semibold">{m.makerspace_name}</p>
                                    <p>{m.building}</p>
                                    <Link to={`/makerspace-detail/${m.makerspace_id}`}>View makerspace</Link>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            }
        </>
        
    );
}

export default Map;