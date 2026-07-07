import CoverImage from '../assets/jpgs/makerspace.jpeg';
import FindMakerspaceImage from '../assets/jpgs/find_makerspace.jpg';
import FindEquipmentImage from '../assets/jpgs/find_equipment.jpeg';
// import styles from '../styles/home.module.css';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="relative px-60 py-32">
            <div className="absolute w-full opacity-15 top-0 left-0 h-1/2 overflow-hidden">
                <img src={CoverImage} />
            </div>
            <div className="relative mb-56 ml-20 z-5">
                <h1 className="text-7xl">Welcome to<br /><span className="text-8xl font-bold text-navy-blue">MAKE MICHIGAN!</span></h1>
                <ul className="text-[1.35rem] font-semibold pl-5 list-disc">
                    <li className="mt-10 mb-3">Explore every public facility on North Campus to see what’s available</li>
                    <li className="my-3">See guided training pathways to know exactly what’s needed for access</li>
                    <li className="my-3">Track your certifications through a personal dashboard</li>
                    <li className="my-3">Receive real-time support from a custom U-M Maizey AI assistant</li>
                    <li className="my-3">Report issues such as broken tools or missing supplies</li>
                    <li className="my-3">Contribute to safer, more confident maker communities</li>
                </ul>
            </div>
            <div className="flex justify-center items-center mb-12">
                <Link to='makerspaces' className="rounded-2xl border mx-12 bg-main-bg drop-shadow-xl/20 text-center">
                    <h3 className="text-2xl font-medium py-6">Find a Facility</h3>
                    <img src={FindMakerspaceImage} className="w-[30vw] rounded-b-2xl" />
                </Link>
                <Link to='equipment' className="rounded-2xl border mx-12 bg-main-bg drop-shadow-xl/20 text-center">
                    <h3 className="text-2xl font-medium py-6">Find Equipment</h3>
                    <img src={FindEquipmentImage} className="w-[30vw] rounded-b-2xl" />
                </Link>
            </div>
        </div>
    );
}

export default Home;