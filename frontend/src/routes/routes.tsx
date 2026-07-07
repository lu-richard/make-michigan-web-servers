import App from "../pages/App";
import SignUp from "../pages/SignUp";
import SignIn from "../pages/SignIn";
import Error from "../pages/Error";
import Home from "../pages/Home";
import Map from "../pages/Map";
import EquipmentCatalog from "../pages/EquipmentCatalog";
import EquipmentDetail from "../pages/EquipmentDetail";
import MakerspaceCatalog from "../pages/MakerspaceCatalog";
import MakerspaceDetail from "../pages/MakerspaceDetail";
import MakerProfile from "../pages/MakerProfile";
import AskMaizey from "../pages/AskMaizey";
import Blog from "../pages/Blog";
import ProtectedRoute from "../components/ProtectedRoute";
import UnauthenticatedRoute from "../components/UnauthenticatedRoute";
// import Training from "../pages/Training";
import AdminDashboard from "../pages/AdminDashboard";
import AdminDashboardReports from "../pages/AdminDashboardReports";
import AdminDashboardUsageStats from "../pages/AdminDashboardUsageStats";
import AdminDashboardTraining from "../pages/AdminDashboardTraining";
import AdminProfileDetail from "../pages/AdminProfileDetail";
import ProfileHome from "../pages/ProfileHome";
import MyTrainings from "../pages/MyTrainings";
import SkillTree from "../pages/SkillTree";
import AdminAddEquipmentModel from "../pages/AdminAddEquipmentModel";
import AdminDashboardUsageStatsFacility from "../pages/AdminDashboardUsageStatsFacility";
import AdminDashboardUsageStatsEquipment from "../pages/AdminDashboardUsageStatsEquipment";
import AdminDashboardUsageStatsUser from "../pages/AdminDashboardUsageStatsUser";
import ReportDetail from "../pages/ReportDetail";
import SkillTreeVisual from "../pages/SkillTreeVisual";
import CredentialModelDetail from "../pages/CredentialModelDetail";
import React from "react";

void React

const routes = [
    {
        path: '/',
        element: <App />,
        errorElement: <Error />,
        children: [
            {
                element: <UnauthenticatedRoute />,
                children: [
                    { path: 'signup', element: <SignUp /> },
                    { path: 'signin', element: <SignIn /> },
                ]
            },
            {
                element: <ProtectedRoute />,
                children: [
                    { index: true, element: <Home /> },
                    { path: 'map', element: <Map /> },
                    { path: 'makerspaces', element: <MakerspaceCatalog /> },
                    { path: 'makerspace-detail/:id', element: <MakerspaceDetail /> },
                    { path: 'equipment', element: <EquipmentCatalog /> },
                    { path: 'equipment-detail/:id', element: <EquipmentDetail /> },
                    { path: 'dashboard', element: <MakerProfile /> },
                    { path: 'dashboard/my-trainings', element: <MyTrainings /> },
                    { path: 'dashboard/wishlist', element: <MakerProfile /> },
                    {
                        path: 'dashboard/trainings',
                        element: <SkillTree />,
                        children: [
                            { index: true, element: <SkillTreeVisual /> },
                            { path: 'training-detail/:makerspaceId/:credModelId', element: <CredentialModelDetail /> },
                        ],
                    },
                    {
                        path: 'admindashboard',
                        element: <AdminDashboard />,
                        children: [
                            { index: true, element: <AdminDashboardReports /> },
                            { path: 'report-detail/:id', element: <ReportDetail /> },
                            { path: 'training', element: <AdminDashboardTraining /> },
                            {
                                path: 'usage',
                                element: <AdminDashboardUsageStats />,
                                children: [
                                    { index: true, element: <AdminDashboardUsageStatsFacility /> },
                                    { path: 'equipment', element: <AdminDashboardUsageStatsEquipment /> },
                                    { path: 'user', element: <AdminDashboardUsageStatsUser /> },
                                ],
                            },
                            { path: 'add-equipment-model', element: <AdminAddEquipmentModel/> },
                        ]
                    },
                    { path: 'admin-profile-detail/:id', element: <AdminProfileDetail /> },
                    { path: 'askmaizey', element: <AskMaizey /> },
                    { path: 'blog', element: <Blog /> },
                    { path: 'profile-detail/:id', element: <ProfileHome /> },
                ]
            },
        ]
    },
];

export default routes;