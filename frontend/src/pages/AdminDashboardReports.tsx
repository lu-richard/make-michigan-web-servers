import { useState, useEffect } from "react";
// import { useAppContext } from '../context/AppContext';
// import styles from '../styles/AdminDashboardReports.module.css';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import PeopleIcon from '@mui/icons-material/People';
import type { IssueReportCardData } from "../types/types";
import supabase from "../lib/supabase";
import Loading from "./Loading";
import IssueReportCard from "../components/IssueReportCard";
import SearchIcon from '@mui/icons-material/Search';

function AdminDashboardReports() {
    // const { profile } = useAppContext();
    const [issueReports, setIssueReports] = useState<IssueReportCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        const fetchIssueReports = async () => {
            try {
                const { data, error } = await supabase.from('view_issue_report_cards').select();

                if (error) {
                    throw new Error(error.message);
                }

                setIssueReports(data);
            }
            catch (e) {
                console.error((e as Error).message);
            }
            finally {
                setLoading(false);
            }
        };

        fetchIssueReports();
    }, []);

    return (
        <>
            {
                loading ? <div className="h-[80vh]"><Loading /></div> :
                <div className="px-28 min-h-[70vh]">
                    <h1 className="font-semibold text-3xl mb-12">Reports</h1>
                    <div className="flex justify-center items-center rounded-md bg-neutral-200 p-1 mb-8 w-fit gap-1">
                        <button className={`py-2 px-4 rounded-md font-medium text-sm cursor-pointer ${isActive ? 'bg-main-bg' : ''}`} onClick={() => setIsActive(true)}>
                            Active
                        </button>
                        <button className={`py-2 px-4 rounded-md font-medium text-sm cursor-pointer ${!isActive ? 'bg-main-bg' : ''}`} onClick={() => setIsActive(false)}>
                            Resolved
                        </button>
                    </div>
                    <div className="flex items-center w-1/2 px-4 rounded-sm border mb-4">
                        <SearchIcon />
                        <input type="text" placeholder="Search reports" className="w-full py-3 px-1" />
                    </div>
                    <div className="relative flex justify-between items-center font-semibold my-12">
                        <p className="absolute left-0">Title</p>
                        <p className="absolute left-1/7">Type</p>
                        <p className="absolute left-2/7">Tool</p>
                        <p className="absolute left-3/7">Status</p>
                        <p className="absolute left-4/7">Reporter</p>
                        <p className="absolute left-5/7">Date Reported</p>
                        <p className="absolute left-6/7">More</p>
                    </div>
                    {
                        issueReports.length === 0 ?
                        <p>No issue reports found.</p> :
                        <ul>
                            {
                                issueReports.filter((issueReport) => isActive == !issueReport.is_resolved).map((issueReport) => <li className=" border-t last:border-b"><IssueReportCard key={issueReport["issue_report_id"]} issueReportCard={issueReport} /></li>)
                            }
                        </ul>
                    }
                </div>
            }
        </>
    );
}

export default AdminDashboardReports;