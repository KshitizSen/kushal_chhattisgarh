import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Smartphone } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const badgeClass = (status) => ({
  approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', pending: 'bg-amber-100 text-amber-700',
}[status] || 'bg-gray-100 text-gray-700');

const DeviceChangeRequests = () => {
  const user = useAuthStore((state) => state.user);
  const isVtp = ['vtp', 'vocational_teacher_provider'].includes(user?.role);
  const layer = isVtp ? 'vtp' : 'headmaster';
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');
  const [actionModal, setActionModal] = useState({ open: false, request: null, decision: null });
  const [remarks, setRemarks] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await api.post(`/device-change/${layer}/list`, filter === 'all' ? {} : { status: filter });
      setRequests(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load device change requests.');
    } finally { setLoading(false); }
  }, [filter, layer]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const closeActionModal = () => {
    if (actionId) return;
    setActionModal({ open: false, request: null, decision: null });
    setRemarks('');
  };

  const openActionModal = (request, decision) => {
    setRemarks('');
    setActionModal({ open: true, request, decision });
  };

  const updateRequest = async () => {
    const { request, decision } = actionModal;
    if (!request || !decision) return;
    setActionId(request.id); setError('');
    try {
      await api.patch(`/device-change/${request.id}/${layer}/status`, { decision, remarks: remarks.trim() || null });
      setActionModal({ open: false, request: null, decision: null });
      setRemarks('');
      await loadRequests();
    } catch (err) { setError(err.response?.data?.message || 'Unable to update request.'); }
    finally { setActionId(null); }
  };

  const ownStatusKey = useMemo(() => isVtp ? 'vtp_status' : 'hm_status', [isVtp]);

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="flex items-center gap-2 text-2xl font-semibold text-gray-900 dark:text-white"><Smartphone className="h-6 w-6" />Device Change Requests</h1><p className="mt-1 text-sm text-gray-500">Approve or reject VT mobile device changes.</p></div>
        <button onClick={loadRequests} disabled={loading} className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
      </div>
      <div className="flex gap-2">{['pending', 'approved', 'rejected', 'all'].map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm capitalize ${filter === item ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}`}>{item}</button>)}</div>
      {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300"><tr>{['VT', 'School / VTP', 'Reason', 'HM Status', 'VTP Status', 'Requested', 'Action'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {!loading && requests.map((request) => <tr key={request.id}>
              <td className="px-4 py-3"><div className="font-medium text-gray-900 dark:text-white">{request.name}</div><div className="text-xs text-gray-500">{request.phone}</div></td>
              <td className="px-4 py-3"><div>{request.school_name || request.udise_code || '-'}</div><div className="text-xs text-gray-500">{request.vtp_name || request.vtp_id || '-'}</div></td>
              <td className="max-w-xs px-4 py-3 text-gray-600">{request.reason || '-'}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs capitalize ${badgeClass(request.hm_status)}`}>{request.hm_status}</span></td>
              <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs capitalize ${badgeClass(request.vtp_status)}`}>{request.vtp_status}</span></td>
              <td className="px-4 py-3 text-gray-500">{new Date(request.created_at).toLocaleString()}</td>
              <td className="px-4 py-3"><div className="flex gap-2">{request[ownStatusKey] !== 'approved' && <button disabled={actionId === request.id} onClick={() => openActionModal(request, 'approved')} className="rounded-lg bg-green-600 px-3 py-1.5 text-white disabled:opacity-50">Approve</button>}{request[ownStatusKey] !== 'rejected' && <button disabled={actionId === request.id} onClick={() => openActionModal(request, 'rejected')} className="rounded-lg bg-red-600 px-3 py-1.5 text-white disabled:opacity-50">Reject</button>}</div></td>
            </tr>)}
            {!loading && requests.length === 0 && <tr><td colSpan="7" className="px-4 py-10 text-center text-gray-500">No device change requests found.</td></tr>}
            {loading && <tr><td colSpan="7" className="px-4 py-10 text-center text-gray-500">Loading requests...</td></tr>}
          </tbody></table>
      </div>
      <Modal
        isOpen={actionModal.open}
        onClose={closeActionModal}
        title={`${actionModal.decision === 'approved' ? 'Approve' : 'Reject'} Device Change Request`}
        size="sm"
        closeOnOverlayClick={!actionId}
        footer={<><Button variant="ghost" onClick={closeActionModal} disabled={Boolean(actionId)}>Cancel</Button><Button variant={actionModal.decision === 'approved' ? 'success' : 'danger'} onClick={updateRequest} loading={Boolean(actionId)}>{actionModal.decision === 'approved' ? 'Approve Request' : 'Reject Request'}</Button></>}
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
            <p className="font-semibold text-gray-900 dark:text-white">{actionModal.request?.name}</p>
            <p className="text-sm text-gray-500">{actionModal.request?.phone}</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{actionModal.request?.school_name || actionModal.request?.udise_code || '-'}</p>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Remarks (optional)</span>
            <textarea autoFocus rows="4" maxLength="1000" value={remarks} onChange={(event) => setRemarks(event.target.value)} placeholder="Enter approval remarks" className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
            <span className="mt-1 block text-right text-xs text-gray-400">{remarks.length}/1000</span>
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default DeviceChangeRequests;
