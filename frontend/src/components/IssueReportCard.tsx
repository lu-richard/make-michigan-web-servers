import type { IssueReportCardData } from "../types/types";
import { Link } from "react-router-dom";
// import styles from '../styles/issueReportCard.module.css';
// import PermIdentityIcon from '@mui/icons-material/PermIdentity';
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// import ScheduleIcon from '@mui/icons-material/Schedule';
// import CheckIcon from '@mui/icons-material/Check';
// import CloseIcon from '@mui/icons-material/Close';

function IssueReportCard({ issueReportCard }: { issueReportCard: IssueReportCardData }) {
    const reportDetailPath = `report-detail/${issueReportCard["issue_report_id"]}`;

    return (
        <div className="relative flex justify-between items-center py-8">
            <p className="absolute left-0">&#34;{issueReportCard.title}&#34;</p>
            <p className="absolute left-1/7">{issueReportCard["issue_type"]}</p>
            <p className="absolute left-2/7">{issueReportCard["equipment_name"]}</p>
            <p className={`absolute left-3/7 rounded-2xl py-2 px-4 border ${issueReportCard["is_resolved"] ? "border-red bg-red-light" : "border-checkmark-green bg-checkmark-green-light"}`}>{issueReportCard["is_resolved"] ? "Closed" : "Open"}</p>
            <p className="absolute left-4/7">{issueReportCard["reporter_first_name"]} {issueReportCard["reporter_last_name"]}</p>
            <p className="absolute left-5/7">{issueReportCard["created_at"]}</p>
            <Link to={reportDetailPath} className="absolute left-6/7 bg-arb-blue hover:bg-arb-blue-hover text-[#fff] font-medium py-2 px-4 rounded">
                View Request
            </Link>
        </div>

        // <div className={styles["report-card"]}>
        //     <div className={styles["top-info"]}>
        //         <p className={styles["issue-type"]}>{issueReportCard["issue_type"]}</p>
        //         <div className={styles["is-resolved"]}>
        //             <p className={styles["is-resolved-text"]}>{issueReportCard["is_resolved"] ? "Resolved" : "Unresolved"}</p>
        //             {issueReportCard["is_resolved"] ? <CheckIcon /> : <CloseIcon />}
        //         </div>
        //     </div>
        //     <h1 className={styles.title}>{issueReportCard.title}</h1>
        //     <p>{issueReportCard.description}</p>
        //     <div className={styles["bottom-info"]}>
        //         <div className={styles["bottom-info-blurb"]}>
        //             <PermIdentityIcon />
        //             <p>Submitted by {issueReportCard["reporter_first_name"]} {issueReportCard["reporter_last_name"]}</p>
        //         </div>
        //         <div className={styles["bottom-info-blurb"]}>
        //             <ScheduleIcon />
        //             <p>{issueReportCard["created_at"]}</p>
        //         </div>
        //         <div className={styles["bottom-info-blurb"]}>
        //             <p className={styles["view-request"]}>View Request</p>
        //             <ArrowForwardIcon />
        //         </div>
        //     </div>
        // </div>
    );
}

export default IssueReportCard;