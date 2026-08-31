import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Briefcase, CalendarDays, CheckCircle, RefreshCw, Users, XCircle } from 'lucide-react';
import Card, { StatCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import AttendanceStatusChart from '../../components/charts/AttendanceStatusChart';
import { getAdminAttendanceStatus, getAdminLocationOptions } from '../../services/adminService';

const emptyData = {
  as_of_date: '',
  counts: { total_vts: 0, total_present: 0, total_absent: 0, on_leave: 0, on_duty: 0 },
  chart: { group_by: 'district', categories: [], total_vts: [], present: [], absent: [], on_leave: [], on_duty: [] },
};

const selectClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-800 sm:w-56';
const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');

const AttendanceStatus = () => {
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [data, setData] = useState(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocksLoading, setIsBlocksLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getAdminLocationOptions({ type: 'districts', signal: controller.signal })
      .then((result) => setDistricts(result.data || []))
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') setLocationError(requestError.response?.data?.message || 'Districts could not be loaded.');
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedDistrict) return undefined;

    const controller = new AbortController();
    let active = true;
    getAdminLocationOptions({ type: 'blocks', district_cd: selectedDistrict, signal: controller.signal })
      .then((result) => { if (active) setBlocks(result.data || []); })
      .catch((requestError) => {
        if (active && requestError.code !== 'ERR_CANCELED') setLocationError(requestError.response?.data?.message || 'Blocks could not be loaded.');
      })
      .finally(() => { if (active) setIsBlocksLoading(false); });
    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedDistrict]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    getAdminAttendanceStatus({ district_cd: selectedDistrict, block_cd: selectedBlock, signal: controller.signal })
      .then((result) => { if (active) setData({ ...emptyData, ...(result.data || {}) }); })
      .catch((requestError) => {
        if (active && requestError.code !== 'ERR_CANCELED') {
          setError(requestError.response?.data?.message || 'Attendance status could not be loaded.');
          setData(emptyData);
        }
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedDistrict, selectedBlock, refreshKey]);

  const stats = useMemo(() => [
    { title: 'Total VTs', value: data.counts.total_vts, icon: <Users className="h-6 w-6" />, description: 'Active vocational teachers' },
    { title: 'Total Present', value: data.counts.total_present, icon: <CheckCircle className="h-6 w-6" />, description: 'Present, late and half day' },
    { title: 'Total Absent', value: data.counts.total_absent, icon: <XCircle className="h-6 w-6" />, description: 'Absent or attendance not marked' },
    { title: 'On Leave', value: data.counts.on_leave, icon: <CalendarDays className="h-6 w-6" />, description: 'Approved leave today' },
    { title: 'On Duty', value: data.counts.on_duty, icon: <Briefcase className="h-6 w-6" />, description: 'Approved official duty' },
  ], [data.counts]);

  const chartTitle = `${data.chart.group_by === 'school' ? 'School' : data.chart.group_by === 'block' ? 'Block' : 'District'}-wise Attendance Status`;
  const displayDate = data.as_of_date
    ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${data.as_of_date}T00:00:00`))
    : '';

  const handleDistrictChange = (event) => {
    const value = event.target.value;
    setSelectedDistrict(value);
    setSelectedBlock('');
    setBlocks([]);
    setLocationError('');
    setError('');
    setIsBlocksLoading(Boolean(value));
    setIsLoading(true);
  };

  const handleBlockChange = (event) => {
    setSelectedBlock(event.target.value);
    setError('');
    setIsLoading(true);
  };

  const handleRefresh = () => {
    setError('');
    setIsLoading(true);
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Status</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Live status of active VTs{displayDate ? ` for ${displayDate}` : ''}</p>
        </div>
        <Button variant="ghost" leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />} onClick={handleRefresh} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      <Card padding="md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>District</span>
            <select className={selectClass} value={selectedDistrict} onChange={handleDistrictChange}>
              <option value="">All Districts</option>
              {districts.map((district) => <option key={district.district_cd} value={district.district_cd}>{district.district_name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>Block</span>
            <select className={selectClass} value={selectedBlock} onChange={handleBlockChange} disabled={!selectedDistrict || isBlocksLoading}>
              <option value="">{isBlocksLoading ? 'Loading Blocks...' : 'All Blocks'}</option>
              {blocks.map((block) => <option key={block.block_cd} value={block.block_cd}>{block.block_name}</option>)}
            </select>
          </label>
        </div>
        {locationError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{locationError}</p>}
      </Card>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span className="text-sm">{error}</span></div>
          <button type="button" className="text-sm font-semibold underline" onClick={handleRefresh}>Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => <StatCard key={stat.title} {...stat} value={isLoading ? '...' : formatCount(stat.value)} />)}
      </div>

      <Card padding="md">
        {isLoading ? (
          <div className="flex h-[480px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">Loading attendance chart...</div>
        ) : data.chart.categories.length ? (
          <AttendanceStatusChart data={data.chart} title={chartTitle} />
        ) : (
          <div className="flex h-72 flex-col items-center justify-center text-center">
            <Users className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="font-medium text-gray-700 dark:text-gray-300">No VT attendance data found</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try another district or block.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceStatus;
