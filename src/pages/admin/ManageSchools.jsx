import React, { useEffect, useMemo, useState } from 'react';
import { Search, School, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import Pagination from '../../components/common/Pagination';
import { getAdminSchools } from '../../services/adminService';

const PAGE_SIZE = 10;
const displayValue = (value) => (value === null || value === undefined || value === '' ? 'N/A' : value);

const ManageSchools = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setIsLoading(true);
        const result = await getAdminSchools({
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
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
  }, [currentPage, searchQuery]);

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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{PAGE_SIZE}</p>
            </div>
            <Phone className="h-8 w-8 text-success-500" />
          </div>
        </Card>
      </div>

      <Card padding="md">
        <Input
          placeholder="Search by school, UDISE, district, block, or cluster..."
          leftIcon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
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
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ManageSchools;
