import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Clock,
  RefreshCw,
  School,
  Users,
} from 'lucide-react';
import Button from '../../components/common/Button';
import api from '../../services/api';

const initialCounts = {
  schools: 0,
  vts: 0,
  vtps: 0,
};

const DeoDashboard = () => {
  const [counts, setCounts] = useState(initialCounts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardCounts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/deo/schools-vts');
      const apiCounts = response.data?.counts || {};

      setCounts({
        schools: apiCounts.schools ?? 0,
        vts: apiCounts.vts ?? 0,
        vtps: apiCounts.vtps ?? 0,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load DEO dashboard counts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(fetchDashboardCounts, 0);
    return () => window.clearTimeout(timer);
  }, [fetchDashboardCounts]);

  const stats = useMemo(
    () => [
      { label: 'Total Schools', value: counts.schools, Icon: School, bg: 'bg-blue-500' },
      { label: 'Total VTs', value: counts.vts, Icon: Users, bg: 'bg-indigo-500' },
      { label: 'Total VTPs', value: counts.vtps, Icon: Clock, bg: 'bg-yellow-500' },
    ],
    [counts]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">DEO Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor schools, VT network and attendance summaries
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
          loading={loading}
          onClick={fetchDashboardCounts}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, Icon, bg }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${bg}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
                {loading ? '...' : value}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeoDashboard;
