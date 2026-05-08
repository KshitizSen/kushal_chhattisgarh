import React, { useEffect, useMemo, useState } from 'react';
import { Search, UserCog, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Pagination from '../../components/common/Pagination';
import { getAdminVtpList } from '../../services/adminService';

const PAGE_SIZE = 10;
const displayValue = (value) => (value === null || value === undefined || value === '' ? 'N/A' : value);

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

const ManageVTP = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [vtps, setVtps] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchVtps = async () => {
      try {
        setIsLoading(true);
        const result = await getAdminVtpList({
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchQuery,
        });

        setVtps(result.data || []);
        setPagination({
          total: result.total || 0,
          totalPages: result.total_pages || 1,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load VTP list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVtps();
  }, [currentPage, searchQuery]);

  const activeCount = vtps.filter((vtp) => vtp.status === 'active').length;
  const inactiveCount = vtps.filter((vtp) => vtp.status === 'inactive').length;

  const columns = useMemo(() => [
    { key: 'vtp_name', label: 'VTP Name' },
    { key: 'vc_name', label: 'VC Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created' },
    { key: 'updated_at', label: 'Updated' },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage VTP Providers</h1>
          <p className="text-gray-600 dark:text-gray-400">Vocational coordinator and provider master list</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total VC</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
            </div>
            <UserCog className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active on Page</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactive on Page</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveCount}</p>
            </div>
            <XCircle className="h-8 w-8 text-danger-500" />
          </div>
        </Card>
      </div>

      <Card padding="md">
        <Input
          placeholder="Search VTP by provider, coordinator, mobile, or email..."
          leftIcon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </Card>

      <Card padding="none">
        {isLoading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading VTP providers...</div>
        ) : (
          <Table
            columns={columns}
            data={vtps}
            renderRow={(vtp) => (
              <tr key={vtp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-white">{displayValue(vtp.vtp_name)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {displayValue(vtp.id)}</p>
                </td>
                <td className="px-4 py-3">{displayValue(vtp.vc_name)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    {displayValue(vtp.mobile)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    {displayValue(vtp.email)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={vtp.status === 'active' ? 'success' : 'danger'} size="sm">
                    {displayValue(vtp.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3">{formatDate(vtp.created_at)}</td>
                <td className="px-4 py-3">{formatDate(vtp.updated_at)}</td>
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

export default ManageVTP;
