import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, RefreshCw, School, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';

const initialCounts = { total_schools: 0, total_vts: 0, total_trades: 0 };

const VTPDashboard = () => {
  const [counts, setCounts] = useState(initialCounts);
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/vtp/dashboard/counts');
      if (!response.data?.status) throw new Error(response.data?.message || 'Unable to load dashboard.');
      setCounts({ ...initialCounts, ...(response.data.data || {}) });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCounts();
  }, [fetchCounts]);

  const cards = [
    { title: 'Number of Schools', value: counts.total_schools, Icon: School, color: 'text-blue-600', background: 'bg-blue-100 dark:bg-blue-900/30', to: '/vtp/schools' },
    { title: "Number of VT's", value: counts.total_vts, Icon: Users, color: 'text-emerald-600', background: 'bg-emerald-100 dark:bg-emerald-900/30', to: '/vtp/vt-list' },
    { title: 'Number of Trades', value: counts.total_trades, Icon: BriefcaseBusiness, color: 'text-violet-600', background: 'bg-violet-100 dark:bg-violet-900/30', to: '/vtp/trades' },
  ];

  if (loading && !Object.values(counts).some(Boolean)) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader size="lg" text="Loading VTP dashboard..." /></div>;
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VTP Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Overview of schools, VT staff and trades mapped to your organization</p>
      </div>
      <Button variant="primary" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={fetchCounts} loading={loading}>
        Refresh
      </Button>
    </div>

    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {cards.map(({ title, value, Icon, color, background, to }) => <Link key={title} to={to} className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary-500"><Card variant="elevated">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{Number(value || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className={`rounded-2xl p-4 ${background}`}><Icon className={`h-7 w-7 ${color}`} /></div>
        </div>
      </Card></Link>)}
    </div>
  </div>;
};

export default VTPDashboard;
