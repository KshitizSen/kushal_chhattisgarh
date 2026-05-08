import React, { useEffect, useMemo, useState } from 'react';
import { Search, UserCheck, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import Pagination from '../../components/common/Pagination';
import { getAdminDeoList } from '../../services/adminService';

const PAGE_SIZE = 10;
const displayValue = (value) => (value === null || value === undefined || value === '' ? 'N/A' : value);

const ManageDEO = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deos, setDeos] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchDeos = async () => {
      try {
        setIsLoading(true);
        const result = await getAdminDeoList({
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
        });

        setDeos(result.data || []);
        setPagination({
          total: result.total || 0,
          totalPages: result.total_pages || 1,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load DEO list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeos();
  }, [currentPage, searchQuery]);

  const columns = useMemo(() => [
    { key: 'deo_name', label: 'DEO Name' },
    { key: 'district_name', label: 'District' },
    { key: 'designation', label: 'Designation' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'alternate_mobile', label: 'Alternate Mobile' },
    { key: 'email', label: 'Email' },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage DEO</h1>
          <p className="text-gray-600 dark:text-gray-400">District education officer master list</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total DEO</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
            </div>
            <UserCheck className="h-8 w-8 text-primary-500" />
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
          placeholder="Search by DEO name, district, designation, mobile, or email..."
          leftIcon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </Card>

      <Card padding="none">
        {isLoading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading DEO list...</div>
        ) : (
          <Table
            columns={columns}
            data={deos}
            renderRow={(deo) => (
              <tr key={deo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-white">{displayValue(deo.deo_name)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {displayValue(deo.id)}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{displayValue(deo.district_name)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Code: {displayValue(deo.district_cd)}</p>
                </td>
                <td className="px-4 py-3">{displayValue(deo.designation)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    {displayValue(deo.mobile)}
                  </div>
                </td>
                <td className="px-4 py-3">{displayValue(deo.alternate_mobile)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    {displayValue(deo.email)}
                  </div>
                </td>
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

export default ManageDEO;
