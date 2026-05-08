import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import vtpService from '../services/vtpService';

const useVtpStore = create(
  devtools(
    (set, get) => ({
      // VT Approvals
      vts: [],
      vtsLoading: false,
      vtsError: null,
      vtCounts: { pending: 0, accepted: 0, rejected: 0, total: 0 },

      // Leave Management
      leaves: [],
      leaveCounts: { pending: 0, approved: 0, rejected: 0, total: 0 },
      leaveLoading: false,
      leaveError: null,
      pagination: { total: 0, total_pages: 1, page: 1, limit: 20 },

      // Leave Balances
      balances: [],
      balanceSummary: {},
      balanceLoading: false,

      // Actions - VTs
      fetchVts: async (status = 'all') => {
        set({ vtsLoading: true, vtsError: null });
        try {
          const res = await vtpService.getVts(status);
          if (res.data?.status) {
            set({ 
              vts: res.data.data, 
              vtCounts: res.data.counts,
              vtsLoading: false 
            });
          }
        } catch (error) {
          set({ vtsLoading: false, vtsError: error.message });
        }
      },

      // Actions - Leaves
      fetchLeaves: async (params = {}) => {
        set({ leaveLoading: true, leaveError: null });
        try {
          const res = await vtpService.getLeaves(params);
          if (res.data?.success) {
            set({
              leaves: res.data.data,
              pagination: {
                total: res.data.total,
                total_pages: res.data.total_pages,
                page: res.data.page,
                limit: res.data.limit,
              },
              leaveLoading: false,
            });
            
            // Background fetch for counts if status filter is active
            if (params.status) {
              const countRes = await vtpService.getLeaves({ limit: 1 });
              if (countRes.data?.success) {
                // Logic to build counts from data (simplified for now)
                // In production, backend should return counts in every request
              }
            }
          }
        } catch (error) {
          set({ leaveLoading: false, leaveError: error.message });
        }
      },

      approveLeave: async (leaveId) => {
        try {
          const res = await vtpService.approveLeave(leaveId);
          if (res.data?.status) {
            await get().fetchLeaves();
            return { success: true, message: res.data.message };
          }
          return { success: false, message: res.data?.message };
        } catch (error) {
          return { success: false, message: error.message };
        }
      },

      rejectLeave: async (leaveId, reason) => {
        try {
          const res = await vtpService.rejectLeave(leaveId, reason);
          if (res.data?.status) {
            await get().fetchLeaves();
            return { success: true, message: res.data.message };
          }
          return { success: false, message: res.data?.message };
        } catch (error) {
          return { success: false, message: error.message };
        }
      },

      // Actions - Balances
      fetchBalances: async () => {
        set({ balanceLoading: true });
        try {
          const res = await vtpService.getLeaveBalances();
          if (res.data?.status) {
            set({
              balances: res.data.data.teachers,
              balanceSummary: res.data.data.summary,
              balanceLoading: false,
            });
          }
        } catch (error) {
          set({ balanceLoading: false });
        }
      },

      resetStore: () => {
        set({
          vts: [],
          vtsLoading: false,
          vtCounts: { pending: 0, accepted: 0, rejected: 0, total: 0 },
          leaves: [],
          leaveLoading: false,
          balances: [],
        });
      }
    }),
    { name: 'VtpStore' }
  )
);

export default useVtpStore;
