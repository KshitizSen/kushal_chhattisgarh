/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, School } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import Table from '../../components/common/Table';
import vtpService from '../../services/vtpService';

const selectClass = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';

const SchoolsList = () => {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1 });
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');
  const [cluster, setCluster] = useState('');
  const [trade, setTrade] = useState('');
  const [options, setOptions] = useState({ districts: [], blocks: [], clusters: [], trades: [] });
  const [loading, setLoading] = useState(false);

  const loadSchools = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vtpService.getSchools({ page, limit, search: search.trim(), district_cd: district, block_cd: block, cluster_cd: cluster, trade });
      setRows(response.data?.data || []);
      setPagination(response.data?.pagination || { totalItems: 0, totalPages: 1 });
    } catch (error) {
      setRows([]);
      toast.error(error.response?.data?.message || 'Unable to load schools.');
    } finally { setLoading(false); }
  }, [page, limit, search, district, block, cluster, trade]);

  useEffect(() => { loadSchools(); }, [loadSchools]);
  useEffect(() => {
    Promise.all([vtpService.getSchoolOptions({ type: 'districts' }), vtpService.getSchoolOptions({ type: 'trades' })])
      .then(([districts, trades]) => setOptions((current) => ({ ...current, districts: districts.data?.data || [], trades: trades.data?.data || [] })))
      .catch(() => toast.error('Unable to load school filters.'));
  }, []);
  useEffect(() => {
    setBlock(''); setCluster(''); setOptions((current) => ({ ...current, blocks: [], clusters: [] }));
    if (!district) return;
    vtpService.getSchoolOptions({ type: 'blocks', district_cd: district }).then((response) => setOptions((current) => ({ ...current, blocks: response.data?.data || [] })));
  }, [district]);
  useEffect(() => {
    setCluster(''); setOptions((current) => ({ ...current, clusters: [] }));
    if (!district || !block) return;
    vtpService.getSchoolOptions({ type: 'clusters', district_cd: district, block_cd: block }).then((response) => setOptions((current) => ({ ...current, clusters: response.data?.data || [] })));
  }, [district, block]);

  const columns = useMemo(() => [
    { key: 'serial', label: 'Sr. No.' }, 
    { key: 'district_name', label: 'District' }, 
    { key: 'block_name', label: 'Block' }, 
    { key: 'udise_code', label: 'UDISE Code' },
    { key: 'school_name', label: 'School Name' }, 
    // { key: 'cluster_name', label: 'Cluster' },
    { key: 'total_vts', label: 'VTs' }, 
    { key: 'total_trades', label: 'Trades' }, 
    { key: 'trade_names', label: 'Trade Names' },
  ], []);
  const data = rows.map((row, index) => ({ ...row, serial: (page - 1) * limit + index + 1 }));

  return <div className="space-y-6">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Schools List</h1><p className="text-gray-500">Schools mapped to your VTP organization</p></div><Button leftIcon={<RefreshCw className="h-4 w-4" />} onClick={loadSchools} loading={loading}>Refresh</Button></div>
    <Card><div className="overflow-x-auto"><div className="flex min-w-max items-center gap-2"><div className="w-72"><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} placeholder="Search school or UDISE..." /></div>
      <select className={`${selectClass} w-44`} value={district} onChange={(event) => { setDistrict(event.target.value); setPage(1); }}><option value="">All Districts</option>{options.districts.map((item) => <option key={item.district_cd} value={item.district_cd}>{item.district_name}</option>)}</select>
      <select className={`${selectClass} w-44`} value={block} disabled={!district} onChange={(event) => { setBlock(event.target.value); setPage(1); }}><option value="">All Blocks</option>{options.blocks.map((item) => <option key={item.block_cd} value={item.block_cd}>{item.block_name}</option>)}</select>
      <select className={`${selectClass} w-44`} value={cluster} disabled={!block} onChange={(event) => { setCluster(event.target.value); setPage(1); }}><option value="">All Clusters</option>{options.clusters.map((item) => <option key={item.cluster_cd} value={item.cluster_cd}>{item.cluster_name}</option>)}</select>
      <select className={`${selectClass} w-44`} value={trade} onChange={(event) => { setTrade(event.target.value); setPage(1); }}><option value="">All Trades</option>{options.trades.map((item) => <option key={item.trade} value={item.trade}>{item.trade}</option>)}</select>
      <select className={`${selectClass} w-32`} value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}>{[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size} / page</option>)}</select>
    </div></div></Card>
    {loading && !rows.length ? <Card><div className="py-10 text-center text-gray-500">Loading schools...</div></Card> : <Table columns={columns} data={data} emptyState={<div className="py-10 text-center text-gray-500"><School className="mx-auto mb-2 h-9 w-9" />No schools found.</div>} />}
    <Pagination currentPage={page} totalPages={pagination.totalPages || 1} totalItems={pagination.totalItems || 0} pageSize={limit} onPageChange={setPage} />
  </div>;
};

export default SchoolsList;
