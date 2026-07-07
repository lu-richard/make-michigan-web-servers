import { Outlet, Link } from 'react-router-dom';
// import styles from '../styles/adminDashboard.module.css';

function AdminDashboard() {
    return (
        <>
            <div className="flex items-center mb-6 px-28 bg-main-bg drop-shadow-sm">
                <Link to='/admindashboard' className="group relative mr-10 text-text">
                    <p className="p-5">Reports</p>
                    <div className="w-full h-1 bg-navy-blue absolute bottom-0 max-h-0 group-hover:max-h-none hover:text-navy-blue"></div>
                </Link>
                <Link to='training' className="group relative mr-10 text-text">
                    <p className="p-5">Training</p>
                    <div className="w-full h-1 bg-navy-blue absolute bottom-0 max-h-0 group-hover:max-h-none hover:text-navy-blue"></div>
                </Link>
                <Link to='usage' className="group relative mr-10 text-text">
                    <p className="p-5">Usage Statistics</p>
                    <div className="w-full h-1 bg-navy-blue absolute bottom-0 max-h-0 group-hover:max-h-none hover:text-navy-blue"></div>
                </Link>
                <Link to='add-equipment-model' className=" group relative mr-10 text-text">
                    <p className="p-5">Add Equipment Model</p>
                    <div className="w-full h-1 bg-navy-blue absolute bottom-0 max-h-0 group-hover:max-h-none hover:text-navy-blue"></div>
                </Link>
            </div>
            <Outlet />
        </>
    );
}

export default AdminDashboard;