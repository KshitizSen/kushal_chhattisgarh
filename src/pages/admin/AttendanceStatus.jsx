import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Briefcase, CalendarDays, CheckCircle, Users, XCircle } from 'lucide-react';
import Card, { StatCard } from '../../components/common/Card';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import AttendanceStatusChart from '../../components/charts/AttendanceStatusChart';
import api from '../../services/api';

const emptyData = {
  as_of_date: '',
  counts: { total_vts: 0, total_present: 0, total_absent: 0, on_leave: 0, on_duty: 0 },
  chart: { group_by: 'district', categories: [], total_vts: [], present: [], absent: [], on_leave: [], on_duty: [] },
};

const selectClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-800 sm:w-56';
const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');
const emptyList = { total: 0, page: 1, limit: 10, total_pages: 1, rows: [] };

const statusLabels = {
  present: 'Present VTs',
  on_leave: 'VTs On Leave',
  on_duty: 'VTs On Duty',
  absent: 'Absent VTs',
};

const AttendanceStatus = ({ scope = 'admin' }) => {
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
  const [selectedStatus, setSelectedStatus] = useState('');
  const [listData, setListData] = useState(emptyList);
  const [listPage, setListPage] = useState(1);
  const [listLimit, setListLimit] = useState(10);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const listSectionRef = useRef(null);
  const basePath = scope === 'principal' ? '/headmaster' : `/${scope}`;
  const showDistrict = scope === 'admin' || scope === 'vtp';
  const showBlock = scope !== 'principal';
  const getStatus = useCallback(async ({ signal, ...params }) => (await api.get(`${basePath}/attendance-status`, { params, signal })).data, [basePath]);
  const getVts = useCallback(async ({ signal, ...params }) => (await api.get(`${basePath}/attendance-status/vts`, { params, signal })).data, [basePath]);
  const getOptions = useCallback(async ({ signal, ...params }) => {
    const url = scope === 'admin' ? '/reports/location-master' : `${basePath}/attendance-status/options`;
    return (await api.get(url, { params, signal })).data;
  }, [basePath, scope]);

  useEffect(() => {
    const controller = new AbortController();
    if (scope === 'principal') return () => controller.abort();
    getOptions({ type: 'districts', signal: controller.signal })
      .then((result) => {
        const options = result.data || [];
        setDistricts(options);
        if (scope === 'deo' && options[0]?.district_cd) setSelectedDistrict(String(options[0].district_cd));
      })
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') setLocationError(requestError.response?.data?.message || 'Districts could not be loaded.');
      });
    return () => controller.abort();
  }, [getOptions, scope]);

  useEffect(() => {
    if (!selectedDistrict) return undefined;

    const controller = new AbortController();
    let active = true;
    getOptions({ type: 'blocks', district_cd: selectedDistrict, signal: controller.signal })
      .then((result) => { if (active) setBlocks(result.data || []); })
      .catch((requestError) => {
        if (active && requestError.code !== 'ERR_CANCELED') setLocationError(requestError.response?.data?.message || 'Blocks could not be loaded.');
      })
      .finally(() => { if (active) setIsBlocksLoading(false); });
    return () => {
      active = false;
      controller.abort();
    };
  }, [getOptions, selectedDistrict]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    getStatus({ district_cd: selectedDistrict, block_cd: selectedBlock, signal: controller.signal })
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
  }, [getStatus, selectedDistrict, selectedBlock, refreshKey]);

  useEffect(() => {
    if (!selectedStatus) return undefined;
    const controller = new AbortController();
    let active = true;
    getVts({
      status: selectedStatus,
      district_cd: selectedDistrict,
      block_cd: selectedBlock,
      page: listPage,
      limit: listLimit,
      signal: controller.signal,
    })
      .then((result) => {
        if (active) setListData({ ...emptyList, ...(result.data || {}) });
      })
      .catch((requestError) => {
        if (active && requestError.code !== 'ERR_CANCELED') {
          setListError(requestError.response?.data?.message || 'VT list could not be loaded.');
          setListData({ ...emptyList, page: listPage, limit: listLimit });
        }
      })
      .finally(() => { if (active) setListLoading(false); });
    return () => {
      active = false;
      controller.abort();
    };
  }, [getVts, selectedStatus, selectedDistrict, selectedBlock, listPage, listLimit, listRefreshKey]);

  useEffect(() => {
    if (!selectedStatus) return undefined;
    const frame = window.requestAnimationFrame(() => {
      listSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedStatus]);

  const stats = useMemo(() => [
    { title: 'Total VTs', value: data.counts.total_vts, icon: <Users className="h-6 w-6" />, description: 'Active vocational teachers', statusKey: '' },
    { title: 'Total Present', value: data.counts.total_present, icon: <CheckCircle className="h-6 w-6" />, description: 'Present, late and half day', statusKey: 'present' },
    { title: 'On Leave', value: data.counts.on_leave, icon: <CalendarDays className="h-6 w-6" />, description: 'Approved leave today', statusKey: 'on_leave' },
    { title: 'On Duty', value: data.counts.on_duty, icon: <Briefcase className="h-6 w-6" />, description: 'Approved official duty', statusKey: 'on_duty' },
    { title: 'Total Absent', value: data.counts.total_absent, icon: <XCircle className="h-6 w-6" />, description: 'Absent or attendance not marked', statusKey: 'absent' },
  ], [data.counts]);

  const listColumns = useMemo(() => [
    { key: 'serial', label: 'No.' },
    { key: 'district_name', label: 'District', render: (value) => value || '-' },
    { key: 'block_name', label: 'Block', render: (value) => value || '-' },
    { key: 'udise_sch_code', label: 'UDISE Code', render: (value) => value || '-' },
    { key: 'school_name', label: 'School', render: (value) => value || '-' },
    { key: 'name', label: 'Name', render: (value) => value || '-' },
    { key: 'email', label: 'Email', render: (value) => value || '-' },
  ], []);

  const chartTitle = `${data.chart.group_by === 'school' ? 'School' : data.chart.group_by === 'block' ? 'Block' : 'District'}-wise Attendance Status`;
  const handleDistrictChange = (event) => {
    const value = event.target.value;
    setSelectedDistrict(value);
    setSelectedBlock('');
    setBlocks([]);
    setLocationError('');
    setError('');
    setIsBlocksLoading(Boolean(value));
    setIsLoading(true);
    setSelectedStatus('');
    setListData(emptyList);
    setListPage(1);
  };

  const handleBlockChange = (event) => {
    setSelectedBlock(event.target.value);
    setError('');
    setIsLoading(true);
    setSelectedStatus('');
    setListData(emptyList);
    setListPage(1);
  };

  const handleRefresh = () => {
    setError('');
    setIsLoading(true);
    setRefreshKey((value) => value + 1);
    if (selectedStatus) {
      setListLoading(true);
      setListError('');
      setListRefreshKey((value) => value + 1);
    }
  };

  const handleStatusSelect = (statusKey) => {
    if (!statusKey) return;
    setSelectedStatus(statusKey);
    setListPage(1);
    setListError('');
    setListLoading(true);
    if (selectedStatus === statusKey) setListRefreshKey((value) => value + 1);
  };

  const handleListPageChange = (page) => {
    setListPage(page);
    setListLoading(true);
    setListError('');
  };

  const handleListLimitChange = (event) => {
    setListLimit(Number(event.target.value));
    setListPage(1);
    setListLoading(true);
    setListError('');
  };

  const tableRows = listData.rows.map((row, index) => ({
    ...row,
    serial: (listData.page - 1) * listData.limit + index + 1,
  }));

  return (
    <div className="space-y-5">
      {(showDistrict || showBlock) && <Card padding="md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {showDistrict && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="sr-only">District</span>
            <select aria-label="District" className={selectClass} value={selectedDistrict} onChange={handleDistrictChange}>
              <option value="">All Districts</option>
              {districts.map((district) => <option key={district.district_cd} value={district.district_cd}>{district.district_name}</option>)}
            </select>
          </label>}
          {showBlock && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="sr-only">Block</span>
            <select aria-label="Block" className={selectClass} value={selectedBlock} onChange={handleBlockChange} disabled={!selectedDistrict || isBlocksLoading}>
              <option value="">{isBlocksLoading ? 'Loading Blocks...' : 'All Blocks'}</option>
              {blocks.map((block) => <option key={block.block_cd} value={block.block_cd}>{block.block_name}</option>)}
            </select>
          </label>}
        </div>
        {locationError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{locationError}</p>}
      </Card>}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span className="text-sm">{error}</span></div>
          <button type="button" className="text-sm font-semibold underline" onClick={handleRefresh}>Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map(({ statusKey, ...stat }) => statusKey ? (
          <button
            key={stat.title}
            type="button"
            aria-pressed={selectedStatus === statusKey}
            aria-label={`Show ${stat.title} VT list`}
            onClick={() => handleStatusSelect(statusKey)}
            className={`h-full rounded-xl text-left outline-none transition focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 ${selectedStatus === statusKey ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-950' : ''}`}
          >
            <StatCard {...stat} value={isLoading ? '...' : formatCount(stat.value)} />
          </button>
        ) : <StatCard key={stat.title} {...stat} value={isLoading ? '...' : formatCount(stat.value)} />)}
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

      {selectedStatus && (
        <section ref={listSectionRef} className="scroll-mt-24 space-y-4" aria-live="polite">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{statusLabels[selectedStatus]}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current-day VT details for the selected attendance status.</p>
            </div>
            <select aria-label="Rows per page" value={listLimit} onChange={handleListLimitChange} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size} / page</option>)}
            </select>
          </div>

          {listError && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              <span>{listError}</span>
              <button type="button" className="font-semibold underline" onClick={() => { setListLoading(true); setListError(''); setListRefreshKey((value) => value + 1); }}>Retry</button>
            </div>
          )}

          {listLoading ? (
            <Card><div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">Loading {statusLabels[selectedStatus].toLowerCase()}...</div></Card>
          ) : (
            <Table
              columns={listColumns}
              data={tableRows}
              keyExtractor={(row) => row.user_id}
              emptyState={<Card><div className="py-12 text-center text-gray-500 dark:text-gray-400">No {statusLabels[selectedStatus].toLowerCase()} found.</div></Card>}
            />
          )}

          {!listLoading && !listError && (
            <Pagination
              currentPage={listData.page}
              totalPages={listData.total_pages}
              totalItems={listData.total}
              pageSize={listData.limit}
              onPageChange={handleListPageChange}
            />
          )}
        </section>
      )}
    </div>
  );
};

export default AttendanceStatus;
