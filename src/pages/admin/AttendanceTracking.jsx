/* eslint-disable react-hooks/set-state-in-effect */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Building2, ChevronLeft, ChevronRight, RefreshCw, Route, School, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import Table from '../../components/common/Table';
import api from '../../services/api';
import { getAdminAttendanceTracking } from '../../services/adminService';

const PAGE_SIZE_OPTIONS = [10, 15, 30, 50];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const now = new Date();

const display = (value) => (value === null || value === undefined || value === '' ? 'N/A' : value);

const StatusBadge = ({ status }) => (
  <Badge variant={status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'} size="sm">
    {status || 'pending'}
  </Badge>
);

const AttendanceTracking = () => {
  const [activeTab, setActiveTab] = useState('all_vts');
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [summary, setSummary] = useState({});
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRows = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getAdminAttendanceTracking({
        view: activeTab,
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim(),
        month: selectedMonth,
        year: selectedYear,
        district_cd: selectedDistrict,
        block_cd: selectedBlock,
      });
      setRows(Array.isArray(result.data) ? result.data : []);
      setSummary(result.summary || {});
      setPagination({
        total: Number(result.total || 0),
        totalPages: Math.max(1, Number(result.total_pages || 1)),
      });
    } catch (requestError) {
      setRows([]);
      setSummary({});
      setPagination({ total: 0, totalPages: 1 });
      const message = requestError.response?.data?.message || 'VT list could not be loaded.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, pageSize, searchQuery, selectedMonth, selectedYear, selectedDistrict, selectedBlock]);

  useEffect(() => { loadRows(); }, [loadRows]);

  useEffect(() => {
    api.get('/reports/location-master', { params: { type: 'districts' } })
      .then((response) => setDistricts(response.data?.data || []))
      .catch(() => setDistricts([]));
  }, []);

  useEffect(() => {
    setSelectedBlock('');
    setBlocks([]);
    if (!selectedDistrict) return;
    api.get('/reports/location-master', { params: { type: 'blocks', district_cd: selectedDistrict } })
      .then((response) => setBlocks(response.data?.data || []))
      .catch(() => setBlocks([]));
  }, [selectedDistrict]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setError('');
  };

  const shiftMonth = (offset) => {
    const next = new Date(selectedYear, selectedMonth - 1 + offset, 1);
    setSelectedMonth(next.getMonth() + 1);
    setSelectedYear(next.getFullYear());
    setCurrentPage(1);
  };

  const isCurrentMonth = selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  const columns = useMemo(() => {
    const common = [
      { key: 'serial', label: 'Sr. No.' },
      { key: 'district_name', label: 'District' },
      { key: 'block_name', label: 'Block' },
      { key: 'udise_code', label: 'UDISE Code' },
      { key: 'school_name', label: 'School' },
      { key: 'vt_name', label: 'VT Name' },
      { key: 'vtp_name', label: 'VTP Name' },
      { key: 'trade', label: 'Trade' },
    ];
    if (activeTab === 'all_vts') return common;
    return [
      ...common,
      { key: 'report_period', label: 'Report Month' },
      { key: 'hm_approval_status', label: 'HM Status' },
      { key: 'vtp_approval_status', label: 'VTP Status' },
      { key: 'deo_approval_status', label: 'DEO Status' },
    ];
  }, [activeTab]);

  const tableRows = useMemo(() => rows.map((row, index) => ({
    ...row,
    serial: (currentPage - 1) * pageSize + index + 1,
    report_period: row.report_month ? `${MONTHS[row.report_month - 1]} ${row.report_year}` : '',
  })), [rows, currentPage, pageSize]);

  const summaryCards = [
    { label: activeTab === 'approved_vts' ? 'Fully Approved VTs' : 'Total VTs', value: summary.total_vts || 0, Icon: Users },
    { label: 'Schools', value: summary.total_schools || 0, Icon: School },
    { label: 'VTPs', value: summary.total_vtps || 0, Icon: Building2 },
    { label: 'Trades', value: summary.total_trades || 0, Icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VT Reports Approval Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400">View all VTs and month-wise fully approved VT reports.</p>
        </div>
      </div>

      <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        <button onClick={() => changeTab('all_vts')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === 'all_vts' ? 'bg-white text-primary-600 shadow-sm dark:bg-gray-900' : 'text-gray-600 dark:text-gray-300'}`}>Total VTs</button>
        <button onClick={() => changeTab('approved_vts')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === 'approved_vts' ? 'bg-white text-primary-600 shadow-sm dark:bg-gray-900' : 'text-gray-600 dark:text-gray-300'}`}>Approved VTs</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, Icon }) => <Card key={label} variant="filled"><div className="flex items-center justify-between"><div><p className="text-lg text-gray-500 dark:text-gray-400">{label}</p><p className="text-2xl font-bold">{value}</p></div><Icon className="h-7 w-7 text-primary-500" /></div></Card>)}
      </div>

      <Card>
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max items-center gap-2">
            <div className="w-72 shrink-0"><Input placeholder="Search VT, school, UDISE, VTP or trade..." leftIcon={<Search className="h-4 w-4" />} value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }} /></div>
            <select value={selectedDistrict} onChange={(event) => { setSelectedDistrict(event.target.value); setCurrentPage(1); }} className="w-48 shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"><option value="">All Districts</option>{districts.map((item) => <option key={item.district_cd} value={item.district_cd}>{item.district_name}</option>)}</select>
            <select value={selectedBlock} onChange={(event) => { setSelectedBlock(event.target.value); setCurrentPage(1); }} disabled={!selectedDistrict} className="w-48 shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"><option value="">All Blocks</option>{blocks.map((item) => <option key={item.block_cd} value={item.block_cd}>{item.block_name}</option>)}</select>
            {activeTab === 'approved_vts' && <>
              <Button variant="ghost" size="sm" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={() => shiftMonth(-1)}>Previous</Button>
              <select value={selectedMonth} onChange={(event) => { setSelectedMonth(Number(event.target.value)); setCurrentPage(1); }} className="w-36 shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">{MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>
              <select value={selectedYear} onChange={(event) => { setSelectedYear(Number(event.target.value)); setCurrentPage(1); }} className="w-24 shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">{Array.from({ length: 7 }, (_, index) => now.getFullYear() - 5 + index).map((year) => <option key={year} value={year}>{year}</option>)}</select>
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={() => shiftMonth(1)} disabled={isCurrentMonth}>Next</Button>
            </>}
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="w-32 shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} / page</option>)}</select>
            <Button variant="ghost" leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />} onClick={loadRows} disabled={loading}>Refresh</Button>
          </div>
        </div>
      </Card>

      {error ? <Card><div className="py-8 text-center text-danger-600">{error}</div></Card> : loading ? <Card><div className="py-10 text-center text-gray-500">Loading VTs...</div></Card> : (
        <Table
          columns={columns}
          data={tableRows}
          renderRow={(row) => (
            <tr key={`${activeTab}-${row.id}`} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
              <td className="px-3.5 py-2.5">{row.serial}</td>
              <td className="px-3.5 py-2.5">{display(row.district_name)}</td>
              <td className="px-3.5 py-2.5">{display(row.block_name)}</td>
              <td className="px-3.5 py-2.5">{display(row.udise_code)}</td>
              <td className="px-3.5 py-2.5">{display(row.school_name)}</td>
              <td className="px-3.5 py-2.5 font-medium">{display(row.vt_name)}</td>
              <td className="px-3.5 py-2.5">{display(row.vtp_name)}</td>
              <td className="px-3.5 py-2.5">{display(row.trade)}</td>
              {activeTab === 'approved_vts' && <><td className="px-3.5 py-2.5 whitespace-nowrap">{row.report_period}</td><td className="px-3.5 py-2.5"><StatusBadge status={row.hm_approval_status} /></td><td className="px-3.5 py-2.5"><StatusBadge status={row.vtp_approval_status} /></td><td className="px-3.5 py-2.5"><StatusBadge status={row.deo_approval_status} /></td></>}
            </tr>
          )}
          emptyState={<div className="rounded-xl border border-gray-200 py-10 text-center text-gray-500 dark:border-gray-800"><Route className="mx-auto mb-2 h-8 w-8" />No VTs found.</div>}
        />
      )}

      {!loading && !error && <Pagination currentPage={currentPage} totalPages={pagination.totalPages} totalItems={pagination.total} pageSize={pageSize} onPageChange={setCurrentPage} />}
    </div>
  );
};

export default AttendanceTracking;
