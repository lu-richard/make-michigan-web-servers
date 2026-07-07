import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import Loading from "./Loading";
import type { IssueReportCardData } from "../types/types";
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const useReportDetailData = () => {
    const { id } = useParams();
    const [report, setReport] = useState<IssueReportCardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const { data, error } = await supabase.from("view_issue_report_cards").select().eq("issue_report_id", id!).maybeSingle();

                if (error) {
                    throw new Error(error.message);
                }

                setReport(data);
            }
            catch (e) {
                console.error((e as Error).message);
            }
            finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, []);

    return { report, loading };
};

function ReportDetail() {
    const { report, loading } = useReportDetailData();

    return (
        <>
            {
                loading ?
                <div className="h-[80vh]"><Loading /></div> :
                report ?
                <div className="py-4 px-40 min-h-[70vh]">
                    <div className="flex items-center">
                        <h1 className="text-3xl font-medium mr-16">&#34;{report.title}&#34;</h1>
                        <div className={`flex items-center ${report["is_resolved"] ? "text-checkmark-green" : "text-red"}`}>
                            {
                                report["is_resolved"] ?
                                <>
                                    <CheckIcon fontSize="large" />
                                    <p className="ml-2 mt-1 text-xl font-medium">Resolved</p>
                                </> :
                                <>
                                    <CloseIcon fontSize="large" />
                                    <p className="ml-2 mt-1 text-xl font-medium">Unresolved</p>
                                </>
                            }
                        </div>
                    </div>
                    <div className="flex items-center gap-6 my-8">
                        <div className="flex justify-center gap-3 mr-8">
                            <ScheduleIcon />
                            <p className="text-lg">{report["created_at"]}</p>
                        </div>
                        <div className="flex justify-center gap-3 mr-8">
                            <PermIdentityIcon />
                            <p className="text-lg">Submitted by {report["reporter_first_name"]} {report["reporter_last_name"]}</p>
                        </div>
                        <div className="flex justify-center gap-3 mr-8">
                            <PermIdentityIcon />
                            <p className="text-lg">Overseen by {report["overseer_first_name"] ? `${report["overseer_first_name"]} ${report["overseer_last_name"]}` : "N/A"}</p>
                        </div>
                    </div>
                    <h3 className="text-lg flex items-center mb-2"><span className="font-semibold mr-3">Issue Type:</span>{report["issue_type"]}</h3>
                    <h3 className="text-lg flex items-center mb-10"><span className="font-semibold mr-3">Affected Tool:</span>{report["equipment_name"]}</h3>
                    <p className="text-lg">{report.description}</p>
                </div> :
                <p>The page you are looking for does not exist.</p>
            }
        </>
    );
}

export default ReportDetail;