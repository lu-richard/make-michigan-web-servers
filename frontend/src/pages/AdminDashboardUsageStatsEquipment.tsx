import { useEffect, useMemo, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import type { SelectChangeEvent } from '@mui/material';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';

interface Equipment {
  id: string;
  name: string;
}

interface UserStatusDistributionItem {
  id: number;
  value: number;
  label: string;
}

interface EquipmentStats {
  semesterUsage: number[];
  dailyUsage: number[];
  userStatusDistribution: UserStatusDistributionItem[];
  issueReports: number[];
  eligibleUsersOverTime: number[];
}

type StatisticType =
  | 'semesterUsage'
  | 'dailyUsage'
  | 'userStatusDistribution'
  | 'issueReports'
  | 'eligibleUsersOverTime'
  | 'all';

const semesterXAxis = ['F24', 'W25', 'F25', 'W26', 'F26'];
const dayXAxis = ['2/1', '2/2', '2/3', '2/4', '2/5', '2/6', '2/7'];

/**
 * DEMO DUMMY DATA
 * Replace with real API data later.
 */
const dummyEquipmentList: Equipment[] = [
  { id: 'cnc-mill', name: 'CNC Mill' },
  { id: 'laser-cutter', name: 'Laser Cutter' },
  { id: '3d-printer', name: '3D Printer' },
];

const dummyEquipmentStatsMap: Record<string, EquipmentStats> = {
  'cnc-mill': {
    semesterUsage: [754, 963, 842, 1103, 643],
    dailyUsage: [5, 6, 4.5, 7, 6.5, 4, 5.5],
    userStatusDistribution: [
      { id: 0, value: 65, label: 'User' },
      { id: 1, value: 15, label: 'Trainee' },
      { id: 2, value: 10, label: 'Mentor' },
      { id: 3, value: 10, label: 'Operator' },
    ],
    issueReports: [2, 1, 0, 1, 0],
    eligibleUsersOverTime: [22, 34, 47, 58, 71],
  },
  'laser-cutter': {
    semesterUsage: [623, 710, 768, 845, 902],
    dailyUsage: [4, 5, 4.5, 6, 6.5, 5.5, 5],
    userStatusDistribution: [
      { id: 0, value: 60, label: 'User' },
      { id: 1, value: 18, label: 'Trainee' },
      { id: 2, value: 12, label: 'Mentor' },
      { id: 3, value: 10, label: 'Operator' },
    ],
    issueReports: [3, 2, 1, 2, 1],
    eligibleUsersOverTime: [18, 29, 41, 56, 68],
  },
  '3d-printer': {
    semesterUsage: [430, 540, 620, 705, 790],
    dailyUsage: [3.5, 4, 4.5, 5, 5.5, 4.5, 4],
    userStatusDistribution: [
      { id: 0, value: 70, label: 'User' },
      { id: 1, value: 12, label: 'Trainee' },
      { id: 2, value: 8, label: 'Mentor' },
      { id: 3, value: 10, label: 'Operator' },
    ],
    issueReports: [1, 1, 0, 1, 2],
    eligibleUsersOverTime: [30, 44, 59, 76, 94],
  },
};

function AdminDashboardUsageStatsEquipment() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [selectedStatistic, setSelectedStatistic] = useState<StatisticType>('all');
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * DEMO MODE: load equipment list from dummy data
   *
   * LATER API VERSION:
   * Replace with:
   *   const response = await fetch('/api/equipment');
   *   const data = await response.json();
   *   setEquipmentList(data);
   */
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        setLoading(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 400));

        setEquipmentList(dummyEquipmentList);
        if (dummyEquipmentList.length > 0) {
          setSelectedEquipment(dummyEquipmentList[0].id);
        }
      } catch (err) {
        setError('Failed to load equipment list');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, []);

  /**
   * DEMO MODE: load selected equipment stats from dummy data
   *
   * LATER API VERSION:
   * Replace with:
   *   const response = await fetch(`/api/equipment/${selectedEquipment}/stats`);
   *   const data = await response.json();
   *   setStats(data);
   */
  useEffect(() => {
    if (!selectedEquipment) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 400));

        const data = dummyEquipmentStatsMap[selectedEquipment];
        if (!data) {
          throw new Error('No demo stats found for selected equipment');
        }

        setStats(data);
      } catch (err) {
        setError('Failed to load equipment statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedEquipment]);

  const handleEquipmentChange = (event: SelectChangeEvent<string>) => {
    setSelectedEquipment(event.target.value);
  };

  const handleStatisticChange = (event: SelectChangeEvent<string>) => {
    setSelectedStatistic(event.target.value as StatisticType);
  };

  const statisticOptions = useMemo(
    () => [
      { value: 'all', label: 'All Statistics' },
      { value: 'semesterUsage', label: 'Tool Usage Per Semester' },
      { value: 'dailyUsage', label: 'Tool Usage Per Day' },
      { value: 'userStatusDistribution', label: 'User Status Distribution' },
      { value: 'issueReports', label: 'Issue Reports Per Semester' },
      { value: 'eligibleUsersOverTime', label: 'Eligible Users Over Time' },
    ],
    []
  );

  const showCard = (cardType: StatisticType) =>
    selectedStatistic === 'all' || selectedStatistic === cardType;

  if (error) {
    return (
      <div className="mt-4">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Top Controls */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        {/* Equipment Selector */}
        <div className="max-w-xs min-w-[220px]">
          <FormControl fullWidth>
            <InputLabel id="equipment-select-label">Select Equipment</InputLabel>
            <Select
              labelId="equipment-select-label"
              value={selectedEquipment}
              label="Select Equipment"
              onChange={handleEquipmentChange}
              disabled={loading || equipmentList.length === 0}
            >
              {equipmentList.map((equipment) => (
                <MenuItem key={equipment.id} value={equipment.id}>
                  {equipment.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Statistic Selector */}
        <div className="max-w-xs min-w-[260px]">
          <FormControl fullWidth>
            <InputLabel id="statistic-select-label">Select Statistic</InputLabel>
            <Select
              labelId="statistic-select-label"
              value={selectedStatistic}
              label="Select Statistic"
              onChange={handleStatisticChange}
              disabled={loading}
            >
              {statisticOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <CircularProgress />
        </div>
      )}

      {/* Charts */}
      {!loading && stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6 mb-20">
          {/* Tool Usage Per Semester */}
          {showCard('semesterUsage') && (
            <div className="h-[35rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-6 pt-4 drop-shadow-md xl:col-span-3">
              <h4 className="text-center text-sm font-medium">
                Tool Usage Per Semester
              </h4>
              <LineChart
                xAxis={[{ scaleType: 'point', data: semesterXAxis, label: 'Semester' }]}
                yAxis={[{ min: 0, label: 'Hours' }]}
                series={[
                  {
                    showMark: false,
                    curve: 'linear',
                    data: stats.semesterUsage,
                    label: 'Hours',
                  },
                ]}
                height={500}
              />
            </div>
          )}

          {/* Tool Usage Per Day */}
          {showCard('dailyUsage') && (
            <div className="relative h-[35rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-6 pt-4 drop-shadow-md xl:col-span-3">
              <h4 className="text-center text-sm font-medium">
                Tool Usage Per Day
              </h4>
              <BarChart
                xAxis={[{ data: dayXAxis, scaleType: 'band', label: 'Day' }]}
                series={[
                  {
                    data: stats.dailyUsage,
                    label: 'Hours',
                  },
                ]}
                height={500}
              />
              <p className="absolute bottom-4 right-6 font-[Arial] text-sm">2026</p>
            </div>
          )}

          {/* User Status Distribution */}
          {showCard('userStatusDistribution') && (
            <div className="h-[25rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-16 pt-6 drop-shadow-md xl:col-span-2">
              <h4 className="mb-4 text-center text-sm font-medium">
                User Status Distribution
              </h4>
              <PieChart
                series={[
                  {
                    data: stats.userStatusDistribution,
                    outerRadius: 110,
                  },
                ]}
                height={280}
              />
            </div>
          )}

          {/* Issue Reports Per Semester */}
          {showCard('issueReports') && (
            <div className="h-[25rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-16 pt-6 drop-shadow-md xl:col-span-2">
              <h4 className="mb-4 text-center text-sm font-medium">
                Issue Reports Per Semester
              </h4>
              <BarChart
                xAxis={[{ data: semesterXAxis, scaleType: 'band', label: 'Semester' }]}
                series={[
                  {
                    data: stats.issueReports,
                    label: '# of Reports',
                  },
                ]}
                height={280}
              />
            </div>
          )}

          {/* Eligible Users Over Time */}
          {showCard('eligibleUsersOverTime') && (
            <div className="h-[25rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-16 pt-6 drop-shadow-md xl:col-span-2">
              <h4 className="mb-4 text-center text-sm font-medium">
                Eligible Users Over Time
              </h4>
              <LineChart
                xAxis={[
                  {
                    scaleType: 'point',
                    data: semesterXAxis,
                    label: 'Semester',
                  },
                ]}
                yAxis={[{ min: 0, label: '# of Eligible Users' }]}
                series={[
                  {
                    showMark: true,
                    curve: 'linear',
                    data: stats.eligibleUsersOverTime,
                    label: 'Eligible Users',
                  },
                ]}
                height={280}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboardUsageStatsEquipment;