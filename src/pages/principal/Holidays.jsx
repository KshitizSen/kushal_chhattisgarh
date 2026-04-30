import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Calendar, List, ChevronLeft, ChevronRight, Download,
  RefreshCw, Search, Sun, Moon, Star, School,
  CalendarDays, Loader2, AlertCircle, Globe, Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

// ── Constants ─────────────────────────────────────────────────────────────────
const DAYS_SHORT   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS       = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 2 + i); // ±2 years

// Normalise Calendarific type string → our category
// Backend now sends an explicit 'category' field ('national' | 'state')
// Fall back to string matching only if category is absent
const mapType = (h) => {
  if (h.category === 'national') return 'national';
  if (h.category === 'state')    return 'state';
  // Legacy / fallback
  const t = (h.primary_type || h.type || '').toLowerCase();
  if (t.includes('national') || t.includes('public'))            return 'national';
  if (t.includes('local') || t.includes('regional') || t.includes('optional')) return 'state';
  if (t.includes('school') || t.includes('education'))           return 'school';
  return 'national';
};

const TYPE_CFG = {
  national: { label: 'National',  bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-300',   dot: 'bg-blue-500',   Icon: Star },
  state:    { label: 'State/Regional', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500', Icon: Moon },
  school:   { label: 'School',    bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-300',  dot: 'bg-green-500',  Icon: School },
  vacation: { label: 'Vacation',  bg: 'bg-orange-100 dark:bg-orange-900/30',text: 'text-orange-700 dark:text-orange-300',dot: 'bg-orange-500', Icon: Sun },
};

const TypeBadge = ({ type }) => {
  const c = TYPE_CFG[type] || TYPE_CFG.national;
  const { Icon } = c;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const Holidays = () => {
  const [year, setYear]           = useState(CURRENT_YEAR);
  const [viewMode, setViewMode]   = useState('calendar');   // 'calendar' | 'list'
  const [calMonth, setCalMonth]   = useState(new Date());   // month shown in calendar
  const [holidays, setHolidays]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected]   = useState(null);        // selected holiday for modal

  // ── Fetch from backend ──────────────────────────────────────────────────────
  const fetchHolidays = useCallback(async (yr) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/holidays?year=${yr}`);
      if (!data.success) throw new Error(data.message || 'Failed to load');
      // Normalise type
      const normalised = data.data.map(h => ({
        ...h,
        category: mapType(h),
      }));
      setHolidays(normalised);
      if (data.source === 'stale_cache') {
        toast('Showing cached data — API temporarily unavailable', { icon: '⚠️' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch holidays';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays(year);
    // Keep calendar month in sync with selected year
    setCalMonth(new Date(year, 0, 1));
  }, [year, fetchHolidays]);

  // ── Holiday lookup helpers ──────────────────────────────────────────────────
  const holidayByDateStr = useMemo(() => {
    const map = {};
    holidays.forEach(h => {
      const key = h.day || h.date?.slice(0, 10);
      if (key) map[key] = h;
    });
    return map;
  }, [holidays]);

  const toKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return holidays.filter(h =>
      (!typeFilter || h.category === typeFilter) &&
      (!q || h.name.toLowerCase().includes(q) || h.description?.toLowerCase().includes(q))
    );
  }, [holidays, search, typeFilter]);

  // ── Group by month for list view ────────────────────────────────────────────
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(h => {
      const m = new Date(h.date).getMonth();
      if (!groups[m]) groups[m] = [];
      groups[m].push(h);
    });
    return groups;
  }, [filtered]);

  // ── Calendar helpers ────────────────────────────────────────────────────────
  const yr = calMonth.getFullYear();
  const mo = calMonth.getMonth();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const firstDay    = new Date(yr, mo, 1).getDay();
  const today       = toKey(new Date());

  // ── Summary counts ──────────────────────────────────────────────────────────
  const counts = useMemo(() => {
    const c = { national: 0, state: 0, school: 0, vacation: 0 };
    holidays.forEach(h => { if (c[h.category] !== undefined) c[h.category]++; });
    return c;
  }, [holidays]);

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Public Holidays</h1>
          <p className="text-sm text-gray-500 mt-0.5">Chhattisgarh holidays — sourced from Calendarific</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Year selector */}
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500">
            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
            onClick={() => fetchHolidays(year)} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Stat strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(TYPE_CFG).map(([key, cfg]) => {
          const { Icon } = cfg;
          return (
            <button key={key} onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                ${typeFilter === key
                  ? 'border-primary-400 ring-2 ring-primary-200 dark:ring-primary-800 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-sm'}`}>
              <div className={`p-2 rounded-xl ${cfg.bg} flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${cfg.text}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">{counts[key] ?? 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">{cfg.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Error state ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Failed to load holidays</p>
            <p className="text-xs mt-0.5 opacity-80">{error}</p>
            {error.includes('API_KEY') && (
              <p className="text-xs mt-1">
                → Add <code className="bg-red-100 dark:bg-red-800 px-1 rounded">CALENDARIFIC_API_KEY</code> in backend <code>.env</code>.
                Get a free key at <a href="https://calendarific.com/signup" target="_blank" rel="noreferrer" className="underline">calendarific.com</a>.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Toolbar: Search + Filter + View Toggle ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search holidays..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        </div>
        {/* Type filter */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
          <option value="">All Types</option>
          {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {[['calendar', Calendar], ['list', List]].map(([mode, Icon]) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize
                ${viewMode === mode ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>
              <Icon className="h-4 w-4" />{mode}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Fetching holidays from Calendarific…</p>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <AnimatePresence mode="wait">
          {viewMode === 'calendar' ? (
            <motion.div key="calendar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CalendarView
                calMonth={calMonth} setCalMonth={setCalMonth}
                toKey={toKey} today={today} year={year}
                holidayByDateStr={holidayByDateStr}
                onSelect={h => setSelected(h)} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ListView grouped={grouped} filtered={filtered} onSelect={h => setSelected(h)} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── Holiday detail modal ─────────────────────────────────────────────── */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''} size="md">
        {selected && <HolidayDetail h={selected} />}
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR VIEW
// ═══════════════════════════════════════════════════════════════════════════════
const CalendarView = ({ calMonth, setCalMonth, toKey, today, year, holidayByDateStr, onSelect }) => {
  const mo         = calMonth.getMonth();
  const yr         = calMonth.getFullYear();
  const daysInMo   = new Date(yr, mo + 1, 0).getDate();
  const firstDay   = new Date(yr, mo, 1).getDay();

  const prev = () => setCalMonth(new Date(yr, mo - 1, 1));
  const next = () => setCalMonth(new Date(yr, mo + 1, 1));

  // Collect all cells (empties + days)
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMo; d++) cells.push(d);

  return (
    <Card variant="elevated">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={prev} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {MONTHS[mo]} {yr}
        </h2>
        <button onClick={next} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_SHORT.map(d => (
          <div key={d} className={`text-center text-xs font-semibold py-1.5 ${d === 'Sun' || d === 'Sat' ? 'text-red-400' : 'text-gray-500'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const key     = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const holiday = holidayByDateStr[key];
          const isToday = key === today;
          const isWeekend = (idx % 7 === 0) || (idx % 7 === 6);
          const typeCfg = holiday ? (TYPE_CFG[holiday.category] || TYPE_CFG.national) : null;

          return (
            <motion.button key={key} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => holiday && onSelect(holiday)}
              className={`relative h-16 sm:h-20 rounded-xl border p-1.5 text-left transition-all
                ${holiday
                  ? `${typeCfg.bg} border-transparent cursor-pointer`
                  : isWeekend
                    ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40'
                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-200'}
                ${isToday ? 'ring-2 ring-primary-500' : ''}`}>
              <span className={`text-sm font-semibold
                ${isToday ? 'text-primary-600 dark:text-primary-400'
                  : isWeekend ? 'text-red-400 dark:text-red-500'
                  : 'text-gray-700 dark:text-gray-300'}`}>
                {day}
              </span>
              {holiday && (
                <p className={`text-[9px] sm:text-[10px] leading-tight mt-0.5 font-medium line-clamp-2 ${typeCfg.text}`}>
                  {holiday.name}
                </p>
              )}
              {isToday && (
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
        {Object.entries(TYPE_CFG).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`h-2.5 w-2.5 rounded-full ${v.dot}`} />
            {v.label}
          </span>
        ))}
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// LIST VIEW (grouped by month)
// ═══════════════════════════════════════════════════════════════════════════════
const ListView = ({ grouped, filtered, onSelect }) => {
  if (filtered.length === 0) {
    return (
      <Card variant="elevated">
        <div className="text-center py-14">
          <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No holidays found</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b)).map(([monthIdx, monthHolidays]) => (
        <Card key={monthIdx} variant="elevated">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
            {MONTHS[Number(monthIdx)]}
            <span className="ml-2 text-xs font-normal text-gray-400">({monthHolidays.length} holiday{monthHolidays.length !== 1 ? 's' : ''})</span>
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {monthHolidays.map((h, idx) => {
              const d = new Date(h.date);
              const dayName = DAYS_SHORT[d.getDay()];
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <motion.button key={idx} onClick={() => onSelect(h)} whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors rounded-lg px-2">
                  {/* Date badge */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-center
                    ${TYPE_CFG[h.category]?.bg || 'bg-gray-100'}`}>
                    <span className={`text-xs font-medium ${isWeekend ? 'text-red-500' : 'text-gray-500'}`}>{dayName}</span>
                    <span className={`text-lg font-bold leading-none ${TYPE_CFG[h.category]?.text || 'text-gray-700'}`}>{d.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{h.name}</p>
                    {h.description && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{h.description}</p>
                    )}
                  </div>
                  <TypeBadge type={h.category} />
                </motion.button>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOLIDAY DETAIL (inside modal)
// ═══════════════════════════════════════════════════════════════════════════════
const HolidayDetail = ({ h }) => {
  const d = new Date(h.date);
  const typeCfg = TYPE_CFG[h.category] || TYPE_CFG.national;
  const { Icon } = typeCfg;

  return (
    <div className="space-y-4">
      {/* Coloured header block */}
      <div className={`flex items-center gap-4 p-4 rounded-xl ${typeCfg.bg}`}>
        <div className={`p-3 rounded-xl bg-white/60 dark:bg-black/20`}>
          <Icon className={`h-7 w-7 ${typeCfg.text}`} />
        </div>
        <div>
          <p className={`text-lg font-bold ${typeCfg.text}`}>{h.name}</p>
          <p className={`text-sm ${typeCfg.text} opacity-80`}>
            {d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Type</p>
          <TypeBadge type={h.category} />
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Day</p>
          <p className="font-medium">{d.toLocaleDateString('en-IN', { weekday: 'long' })}</p>
        </div>
      </div>
      {h.description && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
          <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-500 font-medium uppercase tracking-wide">
            <Info className="h-3.5 w-3.5" /> Description
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{h.description}</p>
        </div>
      )}
      {/* API attribution */}
      <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
        <Globe className="h-3.5 w-3.5" />
        <span>Data sourced from Calendarific — Chhattisgarh (IN)</span>
      </div>
    </div>
  );
};

export default Holidays;
