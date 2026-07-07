// import { LineChart } from '@mui/x-charts/LineChart';
// import { PieChart } from '@mui/x-charts/PieChart';
// import styles from '../styles/adminDashboardUsageStats.module.css';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { NavLink, Outlet } from 'react-router-dom';

function AdminDashboardUsageStats() {
    // const data = [
    //     { label: 'Undergraduate (Non-ME)', value: 206, color: '#0088FE' },
    //     { label: 'Undergraduate (ME)', value: 152, color: '#00C49F' },
    //     { label: 'Graduate', value: 74, color: '#FFBB28' },
    // ];

    // const settings = {
    //     margin: { left: 60 },
    //     width: 300,
    //     height: 300,
    //     hideLegend: false,
    // };

    return (
        <div className="px-16" >
            <h2 className="text-2xl font-medium mb-4 text-center">Usage Statistics</h2>
            <div className="flex justify-center items-center rounded-sm p-1 w-fit gap-1">
                <NavLink to='/admindashboard/usage' end className={({ isActive }) => `border border-neutral-300 rounded-sm py-2 px-8 text-text ${isActive ? "bg-main-bg" : "bg-neutral-100"}`}>
                    <p className="text-sm">Facility</p>
                </NavLink>
                <NavLink to='equipment' className={({ isActive }) => `border border-neutral-300 rounded-sm py-2 px-8 text-text ${isActive ? "bg-main-bg" : "bg-neutral-100"}`}>
                    <p className="text-sm">Equipment</p>
                </NavLink>
                <NavLink to='user' className={({ isActive }) => `border border-neutral-300 rounded-sm py-2 px-8 text-text ${isActive ? "bg-main-bg" : "bg-neutral-100"}`}>
                    <p className="text-sm">User</p>
                </NavLink>
            </div>
            <Outlet />

            {/* <h3 className={styles["big-card-heading"]}>Facility-Wide Statistics</h3>
            <div className={styles["big-card"]}>
                <div className={styles.chart}>
                    <h4 className={styles["chart-heading"]}>Cumulative Hours</h4>
                    <LineChart
                        xAxis={[{ data: [1, 2, 3, 5, 7, 8, 11, 12, 13, 15, 17, 18] }]}
                        series={[
                            {
                            data: [2, 5.5, 20, 78.2, 115.3, 162.1, 200, 340, 370, 480, 562, 672],
                            },
                        ]}
                        height={300}
                        width={500}
                    />
                </div>
                <div className={styles.chart}>
                    <h4 className={styles["chart-heading"]}>Daily Hours</h4>
                    <LineChart
                        xAxis={[{ data: [1, 2, 3, 5, 7, 8, 11, 12, 13, 15, 17, 18] }]}
                        series={[
                            {
                            data: [2, 5.5, 20, 78.2, 115.3, 162.1, 200, 340, 370, 480, 562, 672],
                            },
                        ]}
                        height={300}
                        width={500}
                    />
                </div>
            </div>
            <div className={styles["single-line"]}>
                <h3 className={styles["big-card-heading"]}>Equipment-Specific Statistics</h3>
                <button type="button" className={styles["selected-equipment"]}>
                    CNC Mill
                    <KeyboardArrowDownIcon />
                </button>
            </div>
            <div className={styles["big-card"]}>
                <div className={styles.chart}>
                    <h4 className={styles["chart-heading"]}>Cumulative Hours</h4>
                    <LineChart
                        xAxis={[{ data: [1, 2, 3, 5, 7, 8, 11, 12, 13, 15, 17, 18] }]}
                        series={[
                            {
                            data: [2, 5.5, 20, 78.2, 115.3, 162.1, 200, 340, 370, 480, 562, 672],
                            },
                        ]}
                        height={300}
                        // width={500}
                    />
                </div>
                <div className={styles.chart}>
                    <h4 className={styles["chart-heading"]}>Daily Hours</h4>
                    <LineChart
                        xAxis={[{ data: [1, 2, 3, 5, 7, 8, 11, 12, 13, 15, 17, 18] }]}
                        series={[
                            {
                            data: [2, 5.5, 20, 78.2, 115.3, 162.1, 200, 340, 370, 480, 562, 672],
                            },
                        ]}
                        height={300}
                        // width={500}
                    />
                </div>
                <div>
                    <h4 className={styles["pie-chart-heading"]}>User Distribution</h4>
                    <PieChart
                        series={[{ innerRadius: 50, outerRadius: 100, data, arcLabel: 'value' }]}
                        {...settings}
                    />
                </div>
            </div> */}

            {/* <div className={styles.highlights}>
                <div className={styles.highlight}>
                    <p>Most used machine<br /><span className={styles.emphasis}>Sewing Machine</span></p>
                </div>
                <div className={styles.highlight}>
                    <p>Total Space Usage Time<br /><span className={styles.emphasis}>1,478.5 hrs</span></p>
                </div>
                <div className={styles.highlight}>
                    <p>Total Space Users<br /><span className={styles.emphasis}>432</span></p>
                </div>
            </div>
            <div className={styles.charts}>
                <div>
                    <div className={styles["chart-top-info"]}>
                        <h2>Equipment Monthly Usage Hours</h2>
                        <button type="button" className={styles["selected-equipment"]}>
                            CNC Mill
                            <KeyboardArrowDownIcon />
                        </button>
                    </div>
                    <LineChart
                        xAxis={[{ data: [1, 2, 3, 5, 7, 8, 11, 12, 13, 15, 17, 18] }]}
                        series={[
                            {
                            data: [2, 5.5, 20, 78.2, 115.3, 162.1, 200, 340, 370, 480, 562, 672],
                            },
                        ]}
                        height={500}
                    />
                </div>
                <div>
                    <h2>User Distribution</h2>
                    <PieChart
                        series={[{ innerRadius: 125, outerRadius: 200, data, arcLabel: 'value' }]}
                        {...settings}
                    />
                </div>
            </div> */}
        </div>
    );
}

export default AdminDashboardUsageStats;