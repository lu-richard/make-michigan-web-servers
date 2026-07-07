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

interface Facility {
  id: string;
  name: string;
}

interface UserDistributionItem {
  id: number;
  value: number;
  label: string;
}

interface FacilityStats {
  semesterUsage: number[];
  dailyUsage: number[];
  userDistribution: UserDistributionItem[];
  issueReports: number[];
  membersOverTime: number[];
}

type StatisticType =
  | 'semesterUsage'
  | 'dailyUsage'
  | 'userDistribution'
  | 'issueReports'
  | 'membersOverTime'
  | 'all';

const semesterXAxis = ['F24', 'W25', 'F25', 'W26', 'F26'];
const dayXAxis = ['2/1', '2/2', '2/3', '2/4', '2/5', '2/6', '2/7'];

/**
 * DEMO DUMMY DATA
 * Replace this with API data later.
 */
const dummyFacilities: Facility[] = [
  { id: 'facility-1', name: 'Wilson Center' },
  { id: 'facility-2', name: 'Duderstadt Center' },
  { id: 'facility-3', name: 'Pierpont Commons' },
];

const dummyFacilityStatsMap: Record<string, FacilityStats> = {
  'facility-1': {
    semesterUsage: [320, 410, 460, 520, 610],
    dailyUsage: [42, 38, 51, 47, 58, 63, 49],
    userDistribution: [
      { id: 0, value: 72, label: 'Undergraduate' },
      { id: 1, value: 28, label: 'Graduate' },
    ],
    issueReports: [4, 6, 5, 8, 7],
    membersOverTime: [110, 135, 160, 188, 210],
  },
  'facility-2': {
    semesterUsage: [280, 360, 430, 490, 575],
    dailyUsage: [35, 40, 46, 52, 55, 50, 44],
    userDistribution: [
      { id: 0, value: 64, label: 'Undergraduate' },
      { id: 1, value: 36, label: 'Graduate' },
    ],
    issueReports: [3, 5, 4, 6, 5],
    membersOverTime: [95, 120, 145, 170, 198],
  },
  'facility-3': {
    semesterUsage: [210, 290, 340, 395, 455],
    dailyUsage: [28, 31, 35, 39, 41, 37, 33],
    userDistribution: [
      { id: 0, value: 58, label: 'Undergraduate' },
      { id: 1, value: 42, label: 'Graduate' },
    ],
    issueReports: [2, 3, 3, 4, 6],
    membersOverTime: [80, 96, 118, 136, 154],
  },
};

function AdminDashboardUsageStatsFacility() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [selectedStatistic, setSelectedStatistic] = useState<StatisticType>('all');
  const [stats, setStats] = useState<FacilityStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * DEMO MODE: Load facilities from dummy data
   *
   * LATER API VERSION:
   * Replace this whole useEffect with:
   *   const response = await fetch('/api/facilities');
   *   const data = await response.json();
   */
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API delay for demo
        await new Promise((resolve) => setTimeout(resolve, 400));

        setFacilities(dummyFacilities);
        if (dummyFacilities.length > 0) {
          setSelectedFacility(dummyFacilities[0].id);
        }
      } catch (err) {
        setError('Failed to load facilities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFacilities();
  }, []);

  /**
   * DEMO MODE: Load selected facility stats from dummy data
   *
   * LATER API VERSION:
   * Replace this whole useEffect with:
   *   const response = await fetch(`/api/facilities/${selectedFacility}/stats`);
   *   const data = await response.json();
   *   setStats(data);
   */
  useEffect(() => {
    if (!selectedFacility) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API delay for demo
        await new Promise((resolve) => setTimeout(resolve, 400));

        const data = dummyFacilityStatsMap[selectedFacility];
        if (!data) {
          throw new Error('No demo stats found for selected facility');
        }

        setStats(data);
      } catch (err) {
        setError('Failed to load facility statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedFacility]);

  const handleFacilityChange = (event: SelectChangeEvent<string>) => {
    setSelectedFacility(event.target.value);
  };

  const handleStatisticChange = (event: SelectChangeEvent<string>) => {
    setSelectedStatistic(event.target.value as StatisticType);
  };

  const statisticOptions = useMemo(
    () => [
      { value: 'all', label: 'All Statistics' },
      { value: 'semesterUsage', label: 'Facility Usage Per Semester' },
      { value: 'dailyUsage', label: 'Facility Usage Per Day' },
      { value: 'userDistribution', label: 'User Distribution' },
      { value: 'issueReports', label: 'Issue Reports Per Semester' },
      { value: 'membersOverTime', label: 'Members Over Time' },
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
        {/* Facility Selector */}
        <div className="max-w-xs min-w-[220px]">
          <FormControl fullWidth>
            <InputLabel id="facility-select-label">Select Facility</InputLabel>
            <Select
              labelId="facility-select-label"
              value={selectedFacility}
              label="Select Facility"
              onChange={handleFacilityChange}
              disabled={loading || facilities.length === 0}
            >
              {facilities.map((facility) => (
                <MenuItem key={facility.id} value={facility.id}>
                  {facility.name}
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

      {/* Loading Indicator */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <CircularProgress />
        </div>
      )}

      {/* Charts */}
      {!loading && stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6 mb-20">
          {/* Facility Usage Per Semester */}
          {showCard('semesterUsage') && (
            <div className="h-[35rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-6 pt-4 drop-shadow-md xl:col-span-3">
              <h4 className="text-center text-sm font-medium">
                Facility Usage Per Semester
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

          {/* Facility Usage Per Day */}
          {showCard('dailyUsage') && (
            <div className="h-[35rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-6 pt-4 drop-shadow-md xl:col-span-3 relative">
              <h4 className="text-center text-sm font-medium">
                Facility Usage Per Day
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

          {/* User Distribution */}
          {showCard('userDistribution') && (
            <div className="h-[25rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-16 pt-6 drop-shadow-md xl:col-span-2">
              <h4 className="mb-4 text-center text-sm font-medium">
                Undergraduate vs. Graduate User Distribution
              </h4>
              <PieChart
                series={[
                  {
                    data: stats.userDistribution,
                    outerRadius: 110,
                  },
                ]}
                height={280}
              />
            </div>
          )}

          {/* Issue Reports */}
          {showCard('issueReports') && (
            <div className="h-[25rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-16 pt-6 drop-shadow-md xl:col-span-2">
              <h4 className="mb-4 text-center text-sm font-medium">
                Total Issue Reports Per Semester
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

          {/* Members Over Time */}
          {showCard('membersOverTime') && (
            <div className="h-[25rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-16 pt-6 drop-shadow-md xl:col-span-2">
              <h4 className="mb-4 text-center text-sm font-medium">
                Total Members Over Time
              </h4>
              <LineChart
                xAxis={[
                  {
                    scaleType: 'point',
                    data: semesterXAxis,
                    label: 'Semester',
                  },
                ]}
                yAxis={[{ min: 0, label: '# of Members' }]}
                series={[
                  {
                    showMark: true,
                    curve: 'linear',
                    data: stats.membersOverTime,
                    label: 'Members',
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

export default AdminDashboardUsageStatsFacility;