import { useEffect, useMemo, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import type { SelectChangeEvent } from '@mui/material';
import {
  Alert,
  Autocomplete,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
}

interface UserStats {
  facilityUsagePerSemester: number[];
  facilityUsagePerDay: number[];
  toolUsagePerSemester: number[];
  toolUsagePerDay: number[];
}

type StatisticType =
  | 'facilityUsagePerSemester'
  | 'facilityUsagePerDay'
  | 'toolUsagePerSemester'
  | 'toolUsagePerDay'
  | 'all';

const semesterXAxis = ['F24', 'W25', 'F25', 'W26', 'F26'];
const dayXAxis = ['2/1', '2/2', '2/3', '2/4', '2/5', '2/6', '2/7'];

/**
 * DEMO DUMMY DATA
 * Replace with real API data later.
 */
const dummyUsers: User[] = [
  {
    id: 'user-1',
    username: 'johndoe',
    fullName: 'John Doe',
    email: 'johndoe@umich.edu',
  },
  {
    id: 'user-2',
    username: 'janesmith',
    fullName: 'Jane Smith',
    email: 'janesmith@umich.edu',
  },
  {
    id: 'user-3',
    username: 'mlee',
    fullName: 'Mina Lee',
    email: 'mlee@umich.edu',
  },
  {
    id: 'user-4',
    username: 'rpatel',
    fullName: 'Rohan Patel',
    email: 'rpatel@umich.edu',
  },
  {
    id: 'user-5',
    username: 'abrown',
    fullName: 'Ava Brown',
    email: 'abrown@umich.edu',
  },
];

const dummyUserStatsMap: Record<string, UserStats> = {
  'user-1': {
    facilityUsagePerSemester: [32, 43, 51, 23, 37],
    facilityUsagePerDay: [1, 0, 0, 1.5, 0.5, 0, 1],
    toolUsagePerSemester: [2, 3, 1, 0, 2],
    toolUsagePerDay: [0, 0, 0, 0, 1, 0, 0],
  },
  'user-2': {
    facilityUsagePerSemester: [18, 25, 29, 31, 35],
    facilityUsagePerDay: [0, 1, 0.5, 1, 1, 0, 0.5],
    toolUsagePerSemester: [1, 1, 2, 2, 3],
    toolUsagePerDay: [0, 0, 0.5, 0, 0.5, 0, 0],
  },
  'user-3': {
    facilityUsagePerSemester: [40, 48, 44, 50, 53],
    facilityUsagePerDay: [1.5, 1, 0.5, 1, 0, 1, 1],
    toolUsagePerSemester: [4, 2, 3, 2, 4],
    toolUsagePerDay: [0, 0.5, 0, 1, 0.5, 0, 0.5],
  },
  'user-4': {
    facilityUsagePerSemester: [12, 20, 16, 22, 19],
    facilityUsagePerDay: [0, 0.5, 0, 0.5, 1, 0, 0],
    toolUsagePerSemester: [0, 1, 1, 1, 2],
    toolUsagePerDay: [0, 0, 0, 0, 0.5, 0, 0],
  },
  'user-5': {
    facilityUsagePerSemester: [27, 33, 38, 42, 39],
    facilityUsagePerDay: [1, 0.5, 1, 0, 1, 0.5, 1],
    toolUsagePerSemester: [2, 2, 3, 4, 3],
    toolUsagePerDay: [0, 0.5, 0, 0.5, 0.5, 0, 0],
  },
};

function AdminDashboardUsageStatsUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedStatistic, setSelectedStatistic] = useState<StatisticType>('all');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * DEMO MODE: load users from dummy data
   *
   * LATER API VERSION:
   * For large user datasets, do NOT preload everything.
   * Prefer server-side search with an autocomplete endpoint such as:
   *   GET /api/users/search?q=...
   */
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 400));

        setUsers(dummyUsers);
        if (dummyUsers.length > 0) {
          setSelectedUser(dummyUsers[0]);
        }
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  /**
   * DEMO MODE: load selected user stats from dummy data
   *
   * LATER API VERSION:
   * Replace with:
   *   const response = await fetch(`/api/users/${selectedUser.id}/stats`);
   *   const data = await response.json();
   *   setStats(data);
   */
  useEffect(() => {
    if (!selectedUser) return;

    const loadStats = async () => {
      try {
        setLoadingStats(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 400));

        const data = dummyUserStatsMap[selectedUser.id];
        if (!data) {
          throw new Error('No demo stats found for selected user');
        }

        setStats(data);
      } catch (err) {
        setError('Failed to load user statistics');
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [selectedUser]);

  const handleStatisticChange = (event: SelectChangeEvent<string>) => {
    setSelectedStatistic(event.target.value as StatisticType);
  };

  const statisticOptions = useMemo(
    () => [
      { value: 'all', label: 'All Statistics' },
      { value: 'facilityUsagePerSemester', label: 'Facility Usage Per Semester' },
      { value: 'facilityUsagePerDay', label: 'Facility Usage Per Day' },
      { value: 'toolUsagePerSemester', label: 'Tool Usage Per Semester' },
      { value: 'toolUsagePerDay', label: 'Tool Usage Per Day' },
    ],
    []
  );

  const showCard = (cardType: StatisticType) =>
    selectedStatistic === 'all' || selectedStatistic === cardType;

  const loading = loadingUsers || loadingStats;

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
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* User Search / Autocomplete */}
          <div className="min-w-[300px] max-w-md">
            <Autocomplete
              options={users}
              value={selectedUser}
              onChange={(_, newValue) => setSelectedUser(newValue)}
              loading={loadingUsers}
              disabled={loadingUsers || users.length === 0}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) =>
                `${option.fullName} (${option.username})`
              }
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <div className="flex flex-col">
                    <span>{option.fullName}</span>
                    <span className="text-sm text-neutral-500">
                      {option.username} • {option.email}
                    </span>
                  </div>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search User"
                  placeholder="Search by name, username, or email"
                />
              )}
            />
          </div>

          {/* Statistic Selector */}
          <div className="min-w-[260px] max-w-xs">
            <FormControl fullWidth>
              <InputLabel id="statistic-select-label">Select Statistic</InputLabel>
              <Select
                labelId="statistic-select-label"
                value={selectedStatistic}
                label="Select Statistic"
                onChange={handleStatisticChange}
                disabled={loading || !selectedUser}
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

        {/* Viewing Stats For */}
        {selectedUser && (
          <div className="rounded-md border border-neutral-300 bg-neutral-100 px-4 py-2 text-sm">
            <span className="mr-2 text-neutral-600">Viewing stats for:</span>
            <span className="font-medium">
              {selectedUser.fullName} ({selectedUser.username})
            </span>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <CircularProgress />
        </div>
      )}

      {/* Charts */}
      {!loading && stats && selectedUser && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6 mb-20">
          {/* Facility Usage Per Semester */}
          {showCard('facilityUsagePerSemester') && (
            <div className="h-[35rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-6 pt-4 drop-shadow-md xl:col-span-3">
              <h4 className="text-center text-sm font-medium">
                Student - Facility Usage Per Semester
              </h4>
              <LineChart
                xAxis={[{ scaleType: 'point', data: semesterXAxis, label: 'Semester' }]}
                yAxis={[{ min: 0, label: 'Hours' }]}
                series={[
                  {
                    showMark: false,
                    curve: 'linear',
                    data: stats.facilityUsagePerSemester,
                    label: 'Hours',
                  },
                ]}
                height={500}
              />
            </div>
          )}

          {/* Facility Usage Per Day */}
          {showCard('facilityUsagePerDay') && (
            <div className="relative h-[35rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-6 pt-4 drop-shadow-md xl:col-span-3">
              <h4 className="text-center text-sm font-medium">
                Student - Facility Usage Per Day
              </h4>
              <BarChart
                xAxis={[{ data: dayXAxis, scaleType: 'band', label: 'Day' }]}
                series={[
                  {
                    data: stats.facilityUsagePerDay,
                    label: 'Hours',
                  },
                ]}
                height={500}
              />
              <p className="absolute bottom-4 right-6 font-[Arial] text-sm">2026</p>
            </div>
          )}

          {/* Tool Usage Per Semester */}
          {showCard('toolUsagePerSemester') && (
            <div className="h-[35rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-6 pt-4 drop-shadow-md xl:col-span-3">
              <h4 className="text-center text-sm font-medium">
                Student - Tool Usage Per Semester
              </h4>
              <LineChart
                xAxis={[{ scaleType: 'point', data: semesterXAxis, label: 'Semester' }]}
                yAxis={[{ min: 0, label: 'Hours' }]}
                series={[
                  {
                    showMark: false,
                    curve: 'linear',
                    data: stats.toolUsagePerSemester,
                    label: 'Hours',
                  },
                ]}
                height={500}
              />
            </div>
          )}

          {/* Tool Usage Per Day */}
          {showCard('toolUsagePerDay') && (
            <div className="relative h-[35rem] rounded-2xl border border-neutral-300 bg-main-bg px-6 pb-6 pt-4 drop-shadow-md xl:col-span-3">
              <h4 className="text-center text-sm font-medium">
                Student - Tool Usage Per Day
              </h4>
              <BarChart
                xAxis={[{ data: dayXAxis, scaleType: 'band', label: 'Day' }]}
                series={[
                  {
                    data: stats.toolUsagePerDay,
                    label: 'Hours',
                  },
                ]}
                height={500}
              />
              <p className="absolute bottom-4 right-6 font-[Arial] text-sm">2026</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboardUsageStatsUser;