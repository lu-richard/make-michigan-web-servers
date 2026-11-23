import { useState, useEffect } from "react";
// import { useAppContext } from '../context/AppContext';
// import styles from '../styles/AdminDashboardReports.module.css';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import PeopleIcon from '@mui/icons-material/People';
import type { IssueReportCardData } from "../types/types";
import { apiGetList } from "../lib/api";
import Loading from "./Loading";
import IssueReportCard from "../components/IssueReportCard";
import SearchIcon from '@mui/icons-material/Search';

const useAdminDashboardReportsData = () => {
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
    const [searchLimit, setSearchLimit] = useState(10);
    const [issueReports, setIssueReports] = useState<IssueReportCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearchValue(searchValue), 500);

        return () => clearTimeout(timeout);
    }, [searchValue]);

    useEffect(() => {
        const fetchIssueReports = async () => {
            try {
                const issueReports = await apiGetList<IssueReportCardData>('/view-issue-report-cards/', {
                    search: debouncedSearchValue || undefined,
                    limit: searchLimit,
                });
                
                setIssueReports(issueReports);
            }
            catch (e) {
                console.error((e as Error).message);
            }
            finally {
                setLoading(false);
            }
        };

        fetchIssueReports();
    }, [debouncedSearchValue, searchLimit]);

    return { searchValue, setSearchValue, searchLimit, setSearchLimit, issueReports, loading, isActive, setIsActive};
};

function AdminDashboardReports() {
    const { searchValue, setSearchValue, searchLimit, setSearchLimit, issueReports, loading, isActive, setIsActive } = useAdminDashboardReportsData();

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
                        <input type="text" value={searchValue} placeholder="Search reports" className="w-full py-3 px-1" onChange={(e) => setSearchValue(e.target.value)}/>
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
                                issueReports.filter((issueReport) => isActive == !issueReport.is_resolved).map((issueReport) => <li key={issueReport["issue_report_id"]} className="border-t last:border-b"><IssueReportCard issueReportCard={issueReport} /></li>)
                            }
                            <p className="text-center mt-16 mb-12">Results 1-{issueReports.length}</p>
                            {
                                issueReports.length === searchLimit &&
                                <button type="button" className="block mx-auto bg-arb-blue text-[#fff] py-3 px-5 rounded-3xl hover:bg-arb-blue-hover cursor-pointer" onClick={() => setSearchLimit((searchLimit) => searchLimit + 10)}>See More</button>
                            }
                        </ul>
                    }
                </div>
            }
        </>
    );
}

export default AdminDashboardReports;