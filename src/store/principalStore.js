import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import principalService from '../services/principalService';

const usePrincipalStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Dashboard Stats
        dashboardStats: {
          totalTeachers: 0,
          todayPresent: 0,
          lateTeachers: 0,
          pendingApprovals: 0,
        },
        dashboardLoading: false,

        // Teachers
        teachers: [],
        pendingTeachers: [],
        teachersLoading: false,
        teachersError: null,

        // Attendance
        attendanceData: [],
        todayAttendance: [],
        lateTeachersList: [],
        attendanceLoading: false,
        attendanceError: null,
        selectedDate: new Date().toISOString().split('T')[0],

        // School Timing
        schoolTiming: {
          startTime: '08:00',
          endTime: '16:00',
          graceTime: 15,
        },
        timingLoading: false,

        // Activities
        activities: [],
        activitiesLoading: false,
        activitiesError: null,

        // Leave Management
        leaveRequests: [],
        leaveStats: {
          totalLeaves: 0,
          usedLeaves: 0,
          pendingLeaves: 0,
          carryForward: 0,
        },
        leaveLoading: false,
        leaveError: null,

        // Leave Balance (EL - Earned Leave)
        schoolLeaveBalances: [],
        leaveBalanceSummary: {
          totalTeachers: 0,
          healthyBalance: 0,
          lowBalance: 0,
          zeroBalance: 0,
          averageBalance: 0,
          totalEarnedSchool: 0,
          totalUsedSchool: 0,
        },
        selectedTeacherBalance: null,
        leaveBalanceLoading: false,
        leaveBalanceError: null,

        // Holidays
        holidays: [],
        holidaysLoading: false,
        holidaysError: null,

        // Reports
        reportsData: null,
        reportsLoading: false,
        reportsError: null,
        dateRange: {
          start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
        },
        reportType: 'daily',

        // Dashboard Actions
        fetchDashboardStats: async () => {
          set({ dashboardLoading: true });
          try {
            const response = await principalService.getDashboardStats();
            set({
              dashboardStats: response.data,
              dashboardLoading: false,
            });
          } catch (error) {
            set({
              dashboardLoading: false,
              teachersError: error.message,
            });
          }
        },

        // Teacher Actions
        fetchTeachers: async () => {
          set({ teachersLoading: true, teachersError: null });
          try {
            const response = await principalService.getTeachers();
            set({
              teachers: response.data,
              teachersLoading: false,
            });
          } catch (error) {
            set({
              teachersLoading: false,
              teachersError: error.message,
            });
          }
        },

        fetchPendingTeachers: async () => {
          set({ teachersLoading: true, teachersError: null });
          try {
            const response = await principalService.getPendingTeachers();
            set({
              pendingTeachers: response.data,
              teachersLoading: false,
            });
          } catch (error) {
            set({
              teachersLoading: false,
              teachersError: error.message,
            });
          }
        },

        approveTeacher: async (teacherId) => {
          try {
            await principalService.approveTeacher(teacherId);
            // Refresh pending and all teachers
            await get().fetchPendingTeachers();
            await get().fetchTeachers();
            await get().fetchDashboardStats();
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        rejectTeacher: async (teacherId, reason) => {
          try {
            await principalService.rejectTeacher(teacherId, reason);
            await get().fetchPendingTeachers();
            await get().fetchTeachers();
            await get().fetchDashboardStats();
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        // Attendance Actions
        fetchAttendance: async (date) => {
          set({ attendanceLoading: true, attendanceError: null });
          try {
            const response = await principalService.getAttendance(date || get().selectedDate);
            set({
              attendanceData: response.data,
              attendanceLoading: false,
            });
          } catch (error) {
            set({
              attendanceLoading: false,
              attendanceError: error.message,
            });
          }
        },

        fetchTodayAttendance: async () => {
          set({ attendanceLoading: true, attendanceError: null });
          try {
            const today = new Date().toISOString().split('T')[0];
            const response = await principalService.getAttendance(today);
            set({
              todayAttendance: response.data,
              attendanceLoading: false,
            });
          } catch (error) {
            set({
              attendanceLoading: false,
              attendanceError: error.message,
            });
          }
        },

        fetchLateTeachers: async (date) => {
          set({ attendanceLoading: true, attendanceError: null });
          try {
            const response = await principalService.getLateTeachers(date || get().selectedDate);
            set({
              lateTeachersList: response.data,
              attendanceLoading: false,
            });
          } catch (error) {
            set({
              attendanceLoading: false,
              attendanceError: error.message,
            });
          }
        },

        updateAttendanceStatus: async (teacherId, status, date) => {
          try {
            await principalService.updateAttendanceStatus(teacherId, status, date);
            await get().fetchAttendance(date);
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        setSelectedDate: (date) => {
          set({ selectedDate: date });
        },

        // School Timing Actions
        fetchSchoolTiming: async () => {
          set({ timingLoading: true });
          try {
            const response = await principalService.getSchoolTiming();
            set({
              schoolTiming: response.data,
              timingLoading: false,
            });
          } catch (error) {
            set({ timingLoading: false });
          }
        },

        saveSchoolTiming: async (timing) => {
          set({ timingLoading: true });
          try {
            const response = await principalService.saveSchoolTiming(timing);
            set({
              schoolTiming: response.data,
              timingLoading: false,
            });
            return { success: true };
          } catch (error) {
            set({ timingLoading: false });
            return { success: false, error: error.message };
          }
        },

        // Activities Actions
        fetchActivities: async () => {
          set({ activitiesLoading: true, activitiesError: null });
          try {
            const response = await principalService.getActivities();
            set({
              activities: response.data,
              activitiesLoading: false,
            });
          } catch (error) {
            set({
              activitiesLoading: false,
              activitiesError: error.message,
            });
          }
        },

        createActivity: async (activityData) => {
          try {
            await principalService.createActivity(activityData);
            await get().fetchActivities();
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        // Leave Management Actions
        fetchLeaveRequests: async () => {
          set({ leaveLoading: true, leaveError: null });
          try {
            const response = await principalService.getLeaveRequests();
            set({
              leaveRequests: response.data,
              leaveLoading: false,
            });
          } catch (error) {
            set({
              leaveLoading: false,
              leaveError: error.message,
            });
          }
        },

        fetchLeaveStats: async (teacherId) => {
          try {
            const response = await principalService.getLeaveStats(teacherId);
            set({
              leaveStats: response.data,
            });
          } catch (error) {
            console.error('Failed to fetch leave stats:', error);
          }
        },

        approveLeave: async (leaveId) => {
          try {
            await principalService.approveLeave(leaveId);
            await get().fetchLeaveRequests();
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        rejectLeave: async (leaveId, reason) => {
          try {
            await principalService.rejectLeave(leaveId, reason);
            await get().fetchLeaveRequests();
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        // Leave Balance Actions
        fetchSchoolLeaveBalances: async (year = new Date().getFullYear()) => {
          set({ leaveBalanceLoading: true, leaveBalanceError: null });
          try {
            const response = await principalService.getSchoolLeaveBalances(year);
            set({
              schoolLeaveBalances: response.data.teachers,
              leaveBalanceSummary: response.data.summary,
              leaveBalanceLoading: false,
            });
          } catch (error) {
            set({
              leaveBalanceLoading: false,
              leaveBalanceError: error.message,
            });
          }
        },

        fetchTeacherLeaveBalance: async (teacherId, year = new Date().getFullYear()) => {
          try {
            const response = await principalService.getTeacherLeaveBalance(teacherId, year);
            set({
              selectedTeacherBalance: response.data,
            });
            return { success: true, data: response.data };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        approveLeaveWithDeduction: async (leaveId) => {
          try {
            const response = await principalService.approveLeaveWithDeduction(leaveId);
            await get().fetchLeaveRequests();
            await get().fetchSchoolLeaveBalances();
            return { success: true, data: response.data };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        checkLeaveApprovalStatus: async (leaveId) => {
          try {
            const response = await principalService.checkLeaveApproval(leaveId);
            return { success: true, data: response.data };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        // Holidays Actions
        fetchHolidays: async () => {
          set({ holidaysLoading: true, holidaysError: null });
          try {
            const response = await principalService.getHolidays();
            set({
              holidays: response.data,
              holidaysLoading: false,
            });
          } catch (error) {
            set({
              holidaysLoading: false,
              holidaysError: error.message,
            });
          }
        },

        createHoliday: async (holidayData) => {
          try {
            await principalService.createHoliday(holidayData);
            await get().fetchHolidays();
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        updateHoliday: async (holidayId, holidayData) => {
          try {
            await principalService.updateHoliday(holidayId, holidayData);
            await get().fetchHolidays();
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        deleteHoliday: async (holidayId) => {
          try {
            await principalService.deleteHoliday(holidayId);
            await get().fetchHolidays();
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        // Reports Actions
        fetchReports: async (params) => {
          set({ reportsLoading: true, reportsError: null });
          try {
            const response = await principalService.getReports({
              ...params,
              dateRange: get().dateRange,
              reportType: get().reportType,
            });
            set({
              reportsData: response.data,
              reportsLoading: false,
            });
          } catch (error) {
            set({
              reportsLoading: false,
              reportsError: error.message,
            });
          }
        },

        setDateRange: (range) => {
          set({ dateRange: range });
        },

        setReportType: (type) => {
          set({ reportType: type });
        },

        exportReport: async (teacherId, format) => {
          try {
            const response = await principalService.exportReport(teacherId, format);
            return { success: true, data: response.data };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        // Reset Store
        resetStore: () => {
          set({
            dashboardStats: {
              totalTeachers: 0,
              todayPresent: 0,
              lateTeachers: 0,
              pendingApprovals: 0,
            },
            teachers: [],
            pendingTeachers: [],
            attendanceData: [],
            todayAttendance: [],
            lateTeachersList: [],
            activities: [],
            leaveRequests: [],
            holidays: [],
            reportsData: null,
          });
        },
      }),
      {
        name: 'principal-storage',
        partialize: (state) => ({
          schoolTiming: state.schoolTiming,
          dateRange: state.dateRange,
          reportType: state.reportType,
        }),
      }
    ),
    { name: 'PrincipalStore' }
  )
);

export default usePrincipalStore;
