import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';

const AttendanceStatusHub = ({ tabs, renderView }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get('view') || 'overview';
  const activeView = tabs.some((tab) => tab.id === requestedView) ? requestedView : 'overview';

  useEffect(() => {
    if (requestedView !== activeView) {
      setSearchParams({ view: activeView }, { replace: true });
    }
  }, [activeView, requestedView, setSearchParams]);

  const changeView = (view) => {
    setSearchParams({ view });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary-50 p-2.5 dark:bg-primary-900/20">
            <CalendarCheck className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Status</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor attendance and manage role-specific VT reports.</p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Attendance status views">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeView(tab.id)}
                aria-current={activeView === tab.id ? 'page' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  activeView === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div key={activeView}>{renderView(activeView)}</div>
    </div>
  );
};

export default AttendanceStatusHub;
