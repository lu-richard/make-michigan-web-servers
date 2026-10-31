import { Outlet, Navigate, useLocation } from "react-router-dom";
import Loading from "../pages/Loading";
import { useAppContext } from '../context/AppContext';
// import { useContext } from "react";

function ProtectedRoute() {
    const { profile, loading } = useAppContext();
    const { pathname } = useLocation();

    if (loading) {
        return <div className="h-[100vh]"><Loading /></div>;
    }

    // Okta sign-in happens in Apache before the app loads, so a missing profile means /me/ failed, not that the user is signed out.
    if (!profile) {
        return <p className="p-12">We couldn't load your profile. Please refresh the page.</p>;
    }

    // First-time users only get what Okta provides; send them to fill in the rest once.
    if (!profile.profile_completed && pathname !== '/complete-profile') {
        return <Navigate to="/complete-profile" />;
    }

    return <Outlet />;
}

export default ProtectedRoute;