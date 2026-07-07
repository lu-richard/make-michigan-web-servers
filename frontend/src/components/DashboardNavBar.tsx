// import styles from '../styles/dashboardNavBar.module.css';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
    { to: '/dashboard', label: 'Maker Profile' },
    { to: '/dashboard/my-trainings', label: 'My Trainings' },
    { to: '/dashboard/wishlist', label: 'Wishlist' },
    { to: '/dashboard/trainings', label: 'Trainings' },
];

function DashboardNavBar() {
    const location = useLocation();

    return (
        <div className="flex justify-space-between items-center px-6 bg-main-bg shadow-sm h-16">
            <div className="flex h-full">
                {tabs.map(tab => (
                    <Link
                        key={tab.to}
                        to={tab.to}
                        className={`px-6 flex items-center h-full relative ${location.pathname === tab.to ? "text-navy-blue" : "text-neutral-400"}`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default DashboardNavBar;