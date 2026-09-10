import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Search, RefreshCw, Loader2, AlertCircle, CalendarDays,
  Plus, ChevronDown, RotateCcw, CalendarPlus,
  Calendar, User, Phone, School, FileText, MessageSquare,
  ChevronLeft, ChevronRight, Star, List, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';

// ── Constants ─────────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 2 + i);
const PAGE_SIZE = 12;
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Holiday type colours
const HOLIDAY_COLORS = {
  master: {
    bg:     'bg-blue-100 dark:bg-blue-900/30',
    text:   'text-blue-700 dark:text-blue-300',
    dot:    'bg-blue-500',
    border: 'border-blue-200 dark:border-blue-800',
    label:  'Official Holiday',
    ring:   'ring-blue-400',
  },
  school: {
    bg:     'bg-emerald-100 dark:bg-emerald-900/30',
    text:   'text-emerald-700 dark:text-emerald-300',
    dot:    'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-800',
    label:  'School Holiday',
    ring:   'ring-emerald-400',
  },
};

// Helper: date → YYYY-MM-DD string
const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const Holidays = () => {
  const user = useAuthStore((s) => s.user);

  // ── Master holidays state ───────────────────────────────────────────────────
  const [year, setYear] = useState(CURRENT_YEAR);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Generated holidays state ────────────────────────────────────────────────
  const [genHolidays, setGenHolidays] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    principal_name: '',
    principal_mobile_number: '',
    udise_code: '',
    school_name: '',
    holiday_description: '',
    generated_holiday_date: '',
    remarks: '',
  });

  // ── Calendar state ──────────────────────────────────────────────────────────
  const [calMonth, setCalMonth] = useState(new Date(year, new Date().getMonth(), 1));
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  // ── Derive principal info from auth store ───────────────────────────────────
  const principalInfo = useMemo(() => ({
    name: user?.name || user?.t_name || '',
    mobile: user?.phone || user?.mobile || '',
    udise_code: user?.udise_code || '',
    school_name: user?.organization_name || user?.school_name || '',
  }), [user]);

  // Pre-fill form with principal info
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      principal_name: principalInfo.name,
      principal_mobile_number: String(principalInfo.mobile || ''),
      udise_code: String(principalInfo.udise_code || ''),
      school_name: principalInfo.school_name,
    }));
  }, [principalInfo]);

  // ── Fetch master holidays ───────────────────────────────────────────────────
  const fetchHolidays = useCallback(async (yr) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/holidays?year=${yr}`);
      if (!data.success) throw new Error(data.message || 'Failed to load');
      setHolidays(data.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch holidays';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch generated holidays ────────────────────────────────────────────────
  const fetchGenHolidays = useCallback(async () => {
    if (!principalInfo.udise_code) return;
    setGenLoading(true);
    try {
      const { data } = await api.get(`/holidays/generated/${principalInfo.udise_code}`);
      if (data.success) setGenHolidays(data.data);
    } catch (err) {
      console.error('Failed to fetch generated holidays:', err.message);
    } finally {
      setGenLoading(false);
    }
  }, [principalInfo.udise_code]);

  useEffect(() => {
    fetchHolidays(year);
    setCalMonth(new Date(year, new Date().getMonth(), 1));
  }, [year, fetchHolidays]);

  useEffect(() => {
    fetchGenHolidays();
  }, [fetchGenHolidays]);

  // ── Build a lookup map: dateKey → array of { type, name, data } ─────────────
  const holidayMap = useMemo(() => {
    const map = {};
    // Master holidays
    holidays.forEach(h => {
      const key = h.holiday_date?.slice(0, 10);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push({ type: 'master', name: h.holiday_name, data: h });
    });
    // School generated holidays
    genHolidays.forEach(h => {
      const key = h.generated_holiday_date?.slice(0, 10);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push({ type: 'school', name: h.holiday_description, data: h });
    });
    return map;
  }, [holidays, genHolidays]);

  // ── Filtered + paginated master holidays ────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return holidays;
    return holidays.filter(h =>
      h.holiday_name.toLowerCase().includes(q) ||
      h.month_name.toLowerCase().includes(q) ||
      h.weekday_name.toLowerCase().includes(q)
    );
  }, [holidays, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedHolidays = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // Reset page when search or year changes
  useEffect(() => { setCurrentPage(1); }, [search, year]);

  // ── Form handlers ──────────────────────────────────────────────────────────
  const validateForm = () => {
    const err = {};
    if (!formData.principal_name.trim()) err.principal_name = 'Required';
    if (!formData.principal_mobile_number) {
      err.principal_mobile_number = 'Required';
    } else if (!/^\d{10}$/.test(formData.principal_mobile_number.replace(/\D/g, ''))) {
      err.principal_mobile_number = 'Must be 10 digits';
    }
    if (!formData.udise_code) err.udise_code = 'Required';
    if (!formData.school_name.trim()) err.school_name = 'Required';
    if (!formData.holiday_description.trim()) err.holiday_description = 'Required';
    if (!formData.generated_holiday_date) err.generated_holiday_date = 'Required';
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormSubmitting(true);
    try {
      const { data } = await api.post('/holidays/generated', formData);
      if (data.success) {
        toast.success(data.message || 'Holiday declared successfully!');
        setFormData(prev => ({
          ...prev,
          holiday_description: '',
          generated_holiday_date: '',
          remarks: '',
        }));
        setFormErrors({});
        fetchGenHolidays();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to declare holiday';
      toast.error(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      holiday_description: '',
      generated_holiday_date: '',
      remarks: '',
    }));
    setFormErrors({});
  };

  // ── Format date for display ─────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Holiday Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Official holidays & school holiday declarations</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
          >
            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
            onClick={() => { fetchHolidays(year); fetchGenHolidays(); }}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Failed to load holidays</p>
            <p className="text-xs mt-0.5 opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading holidays…</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          CALENDAR VIEW
          ═══════════════════════════════════════════════════════════════════════ */}
      {!loading && !error && (
        <HolidayCalendar
          calMonth={calMonth}
          setCalMonth={setCalMonth}
          holidayMap={holidayMap}
          year={year}
          onSelect={setSelectedHoliday}
        />
      )}

      {/* ── Holiday Detail Popup ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedHoliday && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedHoliday(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header strip */}
              <div className={`p-5 ${HOLIDAY_COLORS[selectedHoliday.type].bg}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-white/60 dark:bg-black/20`}>
                      {selectedHoliday.type === 'master'
                        ? <Star className={`h-6 w-6 ${HOLIDAY_COLORS.master.text}`} />
                        : <School className={`h-6 w-6 ${HOLIDAY_COLORS.school.text}`} />}
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${HOLIDAY_COLORS[selectedHoliday.type].text}`}>
                        {selectedHoliday.name}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 ${HOLIDAY_COLORS[selectedHoliday.type].text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${HOLIDAY_COLORS[selectedHoliday.type].dot}`} />
                        {HOLIDAY_COLORS[selectedHoliday.type].label}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedHoliday(null)} className="p-1 rounded-lg hover:bg-white/40 dark:hover:bg-black/20 transition-colors">
                    <X className={`h-5 w-5 ${HOLIDAY_COLORS[selectedHoliday.type].text}`} />
                  </button>
                </div>
              </div>
              {/* Details */}
              <div className="p-5 space-y-3">
                {selectedHoliday.type === 'master' ? (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <DetailBlock label="Date" value={formatDate(selectedHoliday.data.holiday_date)} />
                    <DetailBlock label="Weekday" value={selectedHoliday.data.weekday_name} />
                    <DetailBlock label="Month" value={selectedHoliday.data.month_name} />
                    <DetailBlock label="Year" value={selectedHoliday.data.year} />
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <DetailBlock label="Date" value={formatDate(selectedHoliday.data.generated_holiday_date)} />
                      <DetailBlock label="Declared On" value={formatDate(selectedHoliday.data.created_at)} />
                    </div>
                    {selectedHoliday.data.remarks && (
                      <DetailBlock label="Remarks" value={selectedHoliday.data.remarks} fullWidth />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION A — Master Holidays Table
          ═══════════════════════════════════════════════════════════════════════ */}
      {!loading && !error && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" />
              Official Holidays
            </h2>
            {/* Search bar */}
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search holidays..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {filtered.length === 0 ? (
              <Card variant="elevated">
                <div className="text-center py-14">
                  <CalendarDays className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No holidays found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {search ? 'Try a different search term' : `No holidays recorded for ${year}`}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Holiday Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Month</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Year</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Weekday</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedHolidays.map((h, idx) => {
                        const isToday = h.holiday_date === new Date().toISOString().slice(0, 10);
                        const rowIdx = (currentPage - 1) * PAGE_SIZE + idx + 1;
                        return (
                          <tr
                            key={h.holiday_id}
                            className={`border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors
                              ${isToday ? 'bg-primary-50 dark:bg-primary-900/10' : idx % 2 === 0 ? 'bg-white dark:bg-gray-900/20' : 'bg-gray-50/50 dark:bg-gray-800/30'}
                              hover:bg-gray-50 dark:hover:bg-gray-800/50`}
                          >
                            <td className="px-4 py-3 text-gray-400 font-medium">{rowIdx}</td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                                  ${isToday ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 ring-2 ring-primary-500' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                  {new Date(h.holiday_date).getDate()}
                                </div>
                                {formatDate(h.holiday_date)}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{h.holiday_name}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{h.month_name}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{h.year}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${h.weekday_name === 'Sunday' || h.weekday_name === 'Saturday'
                                  ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                {h.weekday_name}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={PAGE_SIZE}
                      totalItems={filtered.length}
                      onPageChange={setCurrentPage}
                      variant="minimal"
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION B — Generate School Holiday
          ═══════════════════════════════════════════════════════════════════════ */}
      <Card variant="elevated" padding="none">
        <button
          type="button"
          onClick={() => setFormOpen(!formOpen)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors rounded-t-[1.5rem]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <CalendarPlus className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Declare School Holiday</h2>
              <p className="text-xs text-gray-500 mt-0.5">Generate a custom holiday for your school</p>
            </div>
          </div>
          <motion.div animate={{ rotate: formOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {formOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                <div className="border-t border-gray-100 dark:border-gray-800 pt-5" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Principal Name" icon={User} value={formData.principal_name} onChange={v => handleFormChange('principal_name', v)} error={formErrors.principal_name} readOnly={!!principalInfo.name} placeholder="Enter principal name" />
                  <FormField label="Mobile Number" icon={Phone} value={formData.principal_mobile_number} onChange={v => handleFormChange('principal_mobile_number', v)} error={formErrors.principal_mobile_number} readOnly={!!principalInfo.mobile} placeholder="10-digit mobile number" type="tel" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="UDISE Code" icon={School} value={formData.udise_code} onChange={v => handleFormChange('udise_code', v)} error={formErrors.udise_code} readOnly={!!principalInfo.udise_code} placeholder="Enter UDISE code" />
                  <FormField label="School Name" icon={School} value={formData.school_name} onChange={v => handleFormChange('school_name', v)} error={formErrors.school_name} readOnly={!!principalInfo.school_name} placeholder="Enter school name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Holiday Date" icon={Calendar} value={formData.generated_holiday_date} onChange={v => handleFormChange('generated_holiday_date', v)} error={formErrors.generated_holiday_date} type="date" placeholder="Select date" />
                  <FormField label="Holiday Description" icon={FileText} value={formData.holiday_description} onChange={v => handleFormChange('holiday_description', v)} error={formErrors.holiday_description} placeholder="e.g. Annual Day Celebration" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" />Remarks (Optional)</span>
                  </label>
                  <textarea value={formData.remarks} onChange={e => handleFormChange('remarks', e.target.value)} rows={3} placeholder="Any additional notes or remarks..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" variant="primary" loading={formSubmitting} leftIcon={<Plus className="h-4 w-4" />}>Generate Holiday</Button>
                  <Button type="button" variant="ghost" onClick={handleReset} disabled={formSubmitting} leftIcon={<RotateCcw className="h-4 w-4" />}>Reset</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION C — School Generated Holidays Table
          ═══════════════════════════════════════════════════════════════════════ */}
      {principalInfo.udise_code && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <School className="h-5 w-5 text-emerald-500" />
              School Declared Holidays
            </h2>
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw className={`h-4 w-4 ${genLoading ? 'animate-spin' : ''}`} />} onClick={fetchGenHolidays} disabled={genLoading}>
              Refresh
            </Button>
          </div>

          {genLoading ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Loading school holidays…</p>
            </div>
          ) : genHolidays.length === 0 ? (
            <Card variant="elevated">
              <div className="text-center py-12">
                <CalendarDays className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">No holidays declared yet</p>
                <p className="text-xs text-gray-400 mt-1">Use the form above to declare a school holiday</p>
              </div>
            </Card>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {genHolidays.map((h, idx) => (
                        <tr key={h.generated_holiday_id}
                          className={`border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors
                            ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900/20' : 'bg-gray-50/50 dark:bg-gray-800/30'}
                            hover:bg-gray-50 dark:hover:bg-gray-800/50`}>
                          <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{formatDate(h.generated_holiday_date)}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">{h.holiday_description}</td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">{h.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOLIDAY CALENDAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const HolidayCalendar = ({ calMonth, setCalMonth, holidayMap, year, onSelect }) => {
  const mo = calMonth.getMonth();
  const yr = calMonth.getFullYear();
  const daysInMo = new Date(yr, mo + 1, 0).getDate();
  const firstDay = new Date(yr, mo, 1).getDay();
  const todayKey = toDateKey(new Date());

  const prev = () => setCalMonth(new Date(yr, mo - 1, 1));
  const next = () => setCalMonth(new Date(yr, mo + 1, 1));

  // Build cells array (nulls for leading empties + day numbers)
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMo; d++) cells.push(d);

  return (
    <Card variant="elevated">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={prev} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {MONTHS[mo]} {yr}
        </h2>
        <button onClick={next} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_SHORT.map(d => (
          <div key={d} className={`text-center text-xs font-semibold py-2 ${d === 'Sun' || d === 'Sat' ? 'text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;

          const key = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const entries = holidayMap[key] || [];
          const isToday = key === todayKey;
          const isWeekend = (idx % 7 === 0) || (idx % 7 === 6);
          const hasMaster = entries.some(e => e.type === 'master');
          const hasSchool = entries.some(e => e.type === 'school');
          const hasHoliday = entries.length > 0;

          // Determine cell background
          let cellBg = isWeekend
            ? 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40'
            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900';

          if (hasMaster && hasSchool) {
            cellBg = 'bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-transparent';
          } else if (hasMaster) {
            cellBg = `${HOLIDAY_COLORS.master.bg} border-transparent`;
          } else if (hasSchool) {
            cellBg = `${HOLIDAY_COLORS.school.bg} border-transparent`;
          }

          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => hasHoliday && onSelect(entries[0])}
              className={`relative h-20 sm:h-24 rounded-xl border p-1.5 text-left transition-all
                ${cellBg}
                ${hasHoliday ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
                ${isToday ? 'ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-gray-900' : ''}`}
            >
              {/* Day number */}
              <span className={`text-sm font-semibold
                ${isToday ? 'text-primary-600 dark:text-primary-400'
                  : isWeekend ? 'text-red-400 dark:text-red-500'
                  : hasHoliday ? (hasMaster ? HOLIDAY_COLORS.master.text : HOLIDAY_COLORS.school.text)
                  : 'text-gray-700 dark:text-gray-300'}`}>
                {day}
              </span>

              {/* Holiday names (up to 2 lines) */}
              {entries.length > 0 && (
                <div className="mt-0.5 space-y-0.5">
                  {entries.slice(0, 2).map((entry, i) => (
                    <p key={i} className={`text-[9px] sm:text-[10px] leading-tight font-medium line-clamp-1 ${HOLIDAY_COLORS[entry.type].text}`}>
                      {entry.name}
                    </p>
                  ))}
                  {entries.length > 2 && (
                    <p className="text-[8px] text-gray-400 font-medium">+{entries.length - 2} more</p>
                  )}
                </div>
              )}

              {/* Dots indicator (bottom-right) */}
              {hasHoliday && (
                <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
                  {hasMaster && <span className={`h-2 w-2 rounded-full ${HOLIDAY_COLORS.master.dot}`} />}
                  {hasSchool && <span className={`h-2 w-2 rounded-full ${HOLIDAY_COLORS.school.dot}`} />}
                </div>
              )}

              {/* Today dot */}
              {isToday && !hasHoliday && (
                <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-primary-500" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
        <span className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className={`h-3 w-3 rounded-full ${HOLIDAY_COLORS.master.dot}`} />
          Official Holiday
        </span>
        <span className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className={`h-3 w-3 rounded-full ${HOLIDAY_COLORS.school.dot}`} />
          School Holiday
        </span>
        <span className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="h-3 w-3 rounded-full ring-2 ring-primary-500 bg-transparent" />
          Today
        </span>
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// DETAIL BLOCK (used in modal)
// ═══════════════════════════════════════════════════════════════════════════════
const DetailBlock = ({ label, value, fullWidth }) => (
  <div className={`p-3 bg-gray-50 dark:bg-gray-800 rounded-xl ${fullWidth ? 'col-span-2' : ''}`}>
    <p className="text-base text-gray-500 mb-1 font-medium uppercase tracking-wide">{label}</p>
    <p className="font-medium text-gray-800 dark:text-gray-200">{value}</p>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// FORM FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const FormField = ({ label, icon: Icon, value, onChange, error, readOnly, type = 'text', placeholder, required }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
      <span className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      readOnly={readOnly}
      required={required}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all
        ${error
          ? 'border-red-300 dark:border-red-700 focus:ring-red-500 bg-red-50/30 dark:bg-red-900/10'
          : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500 bg-white dark:bg-gray-900'}
        ${readOnly
          ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          : 'text-gray-900 dark:text-white'}
        placeholder-gray-400 focus:ring-2 focus:border-transparent`}
    />
    {error && (
      <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    )}
  </div>
);

export default Holidays;
