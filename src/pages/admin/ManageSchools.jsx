import React, { useEffect, useMemo, useState } from 'react';
import { Search, School, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import { getAdminSchools } from '../../services/adminService';

const PAGE_SIZE_OPTIONS = [10, 15, 30, 50];
const displayValue = (value) => (value === null || value === undefined || value === '' ? 'N/A' : value);

const ManageSchools = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize, selectedDistrict, selectedBlock, selectedCluster]);

  useEffect(() => {
    api.get('/reports/location-master', { params: { type: 'districts' } })
      .then((response) => setDistricts(response.data?.data || []))
      .catch(() => setDistricts([]));
  }, []);

  useEffect(() => {
    if (!selectedDistrict) {
      setBlocks([]);
      setSelectedBlock('');
      setClusters([]);
      setSelectedCluster('');
      return;
    }

    api.get('/reports/location-master', { params: { type: 'blocks', district_cd: selectedDistrict } })
      .then((response) => setBlocks(response.data?.data || []))
      .catch(() => setBlocks([]));

    setSelectedBlock('');
    setClusters([]);
    setSelectedCluster('');
  }, [selectedDistrict]);

  useEffect(() => {
    if (!selectedDistrict || !selectedBlock) {
      setClusters([]);
      setSelectedCluster('');
      return;
    }

    api.get('/reports/location-master', {
      params: { type: 'clusters', district_cd: selectedDistrict, block_cd: selectedBlock },
    })
      .then((response) => setClusters(response.data?.data || []))
      .catch(() => setClusters([]));

    setSelectedCluster('');
  }, [selectedDistrict, selectedBlock]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setIsLoading(true);
        const result = await getAdminSchools({
          page: currentPage,
          limit: pageSize,
          search: searchQuery,
          district_cd: selectedDistrict,
          block_cd: selectedBlock,
          cluster_cd: selectedCluster,
        });

        setSchools(result.data || []);
        setPagination({
          total: result.total || 0,
          totalPages: result.total_pages || 1,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load schools');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchools();
  }, [currentPage, pageSize, searchQuery, selectedDistrict, selectedBlock, selectedCluster]);

  const columns = useMemo(() => [
    { key: 'school_name', label: 'Se no' },
    { key: 'school_name', label: 'School', width: '70%' },
    { key: 'udise_sch_code', label: 'UDISE' },
    { key: 'edu_state_name', label: 'State' },
    { key: 'district_name', label: 'District' },
    { key: 'block_name', label: 'Block' },
    { key: 'cluster_name', label: 'Cluster' },
    { key: 'address', label: 'Address' },
    { key: 'email', label: 'Email' },
    { key: 'sch_mobile', label: 'Mobile' },
    // { key: 'codes', label: 'Codes' },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Schools</h1>
          <p className="text-gray-600 dark:text-gray-400">VT schools from master school data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total VT Schools</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
            </div>
            <School className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Page</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentPage}</p>
            </div>
            <MapPin className="h-8 w-8 text-accent-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Page Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pageSize}</p>
            </div>
            <Phone className="h-8 w-8 text-success-500" />
          </div>
        </Card>
      </div>

      <Card padding="md">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            placeholder="Search by school, UDISE, district, block, or cluster..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <select
            value={selectedDistrict}
            onChange={(event) => setSelectedDistrict(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">All Districts</option>
            {districts.map((district) => (
              <option key={district.district_cd} value={district.district_cd}>{district.district_name}</option>
            ))}
          </select>
          <select
            value={selectedBlock}
            onChange={(event) => setSelectedBlock(event.target.value)}
            disabled={!selectedDistrict}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">All Blocks</option>
            {blocks.map((block) => (
              <option key={block.block_cd} value={block.block_cd}>{block.block_name}</option>
            ))}
          </select>
          <select
            value={selectedCluster}
            onChange={(event) => setSelectedCluster(event.target.value)}
            disabled={!selectedBlock}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">All Clusters</option>
            {clusters.map((cluster) => (
              <option key={cluster.cluster_cd} value={cluster.cluster_cd}>{cluster.cluster_name}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card padding="none">
        {isLoading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading schools...</div>
        ) : (
          <Table
            columns={columns}
            data={schools}
            renderRow={(school, index) => (
              <tr key={school.id || school.udise_sch_code} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-white">{index + 1}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-white">{displayValue(school.school_name)}</p>
                </td>
                <td className="px-4 py-3">{displayValue(school.udise_sch_code)}</td>
                <td className="px-4 py-3">
                  <p>{displayValue(school.edu_state_name)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Code: {displayValue(school.edu_state_cd)}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{displayValue(school.district_name)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Code: {displayValue(school.district_cd)}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{displayValue(school.block_name)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Code: {displayValue(school.block_cd)}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{displayValue(school.cluster_name)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Code: {displayValue(school.cluster_cd)}</p>
                </td>
                <td className="max-w-xs px-4 py-3">{displayValue(school.address)}</td>
                <td className="px-4 py-3">{displayValue(school.email)}</td>
                <td className="px-4 py-3">{displayValue(school.sch_mobile)}</td>
                {/* <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  <p>LGD State: {displayValue(school.lgd_state_id)}</p>
                  <p>LGD District: {displayValue(school.lgd_district_id)}</p>
                  <p>LGD Block: {displayValue(school.lgd_block_id)}</p>
                  <p>Status: {displayValue(school.sch_status_id)}</p>
                </td> */}
              </tr>
            )}
          />
        )}
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ManageSchools;
