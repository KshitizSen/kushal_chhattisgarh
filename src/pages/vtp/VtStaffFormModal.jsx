import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const emptyForm = {
  vt_name: '', vt_email: '', vt_mob: '', district_name: '', block_name: '',
  school_name: '', udise_code: '', vt_aadhar: '', vtp_pan: '', trade: '', remarks: '',
  district_cd: '', block_cd: '', cluster_cd: '', vtp_name: '',
};

const SelectField = ({ label, value, onChange, disabled, required, children }) => (
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    {label}{required && <span className="ml-1 text-danger-500">*</span>}
    <select value={value} onChange={onChange} disabled={disabled} required={required}
      className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
      {children}
    </select>
  </label>
);

const VtStaffFormModal = ({ isOpen, mode, staffId, onClose, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [options, setOptions] = useState({ districts: [], blocks: [], clusters: [], schools: [], trades: [], vtp: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');

  const loadOptions = async (type, params = {}) => {
    const res = await api.get('/vtp/vt-staff/options', { params: { type, ...params } });
    setOptions((previous) => ({ ...previous, [type]: res.data?.data || [] }));
    return res.data?.data || [];
  };

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const initialise = async () => {
      setLoading(true);
      setSchoolSearch('');
      try {
        const [districts, trades, vtp] = await Promise.all([
          loadOptions('districts'), loadOptions('trades'), loadOptions('vtp'),
        ]);
        if (!active) return;
        if (mode === 'edit' && staffId) {
          const detail = (await api.get(`/vtp/vt-staff/${staffId}`)).data?.data;
          if (!detail) throw new Error('VT details not found.');
          const next = { ...emptyForm, ...detail, vt_mob: String(detail.vt_mob || ''), vt_aadhar: String(detail.vt_aadhar || ''), udise_code: String(detail.udise_code || '') };
          setForm(next);
          const blocks = await loadOptions('blocks', { district_cd: next.district_cd });
          const clusters = await loadOptions('clusters', { district_cd: next.district_cd, block_cd: next.block_cd });
          await loadOptions('schools', { district_cd: next.district_cd, block_cd: next.block_cd, cluster_cd: next.cluster_cd });
          setOptions((old) => ({ ...old, districts, trades, vtp, blocks, clusters }));
        } else {
          setForm({ ...emptyForm, vtp_name: vtp[0]?.vtp_name || '', trade: trades[0]?.trade || '' });
          setOptions((old) => ({ ...old, districts, trades, vtp, blocks: [], clusters: [], schools: [] }));
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message || 'Unable to load VT form.');
        onClose();
      } finally { if (active) setLoading(false); }
    };
    initialise();
    return () => { active = false; };
  }, [isOpen, mode, staffId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen || !form.cluster_cd) return;
    const timer = setTimeout(() => loadOptions('schools', {
      district_cd: form.district_cd, block_cd: form.block_cd, cluster_cd: form.cluster_cd, search: schoolSearch,
    }).catch(() => toast.error('Unable to search schools.')), 300);
    return () => clearTimeout(timer);
  }, [schoolSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const change = (key) => (event) => setForm((old) => ({ ...old, [key]: event.target.value }));
  const changeDistrict = async (event) => {
    const district_cd = event.target.value;
    const district = options.districts.find((item) => String(item.district_cd) === district_cd);
    setForm((old) => ({ ...old, district_cd, district_name: district?.district_name || '', block_cd: '', block_name: '', cluster_cd: '', school_name: '', udise_code: '' }));
    setOptions((old) => ({ ...old, blocks: [], clusters: [], schools: [] }));
    if (district_cd) await loadOptions('blocks', { district_cd });
  };
  const changeBlock = async (event) => {
    const block_cd = event.target.value;
    const block = options.blocks.find((item) => String(item.block_cd) === block_cd);
    setForm((old) => ({ ...old, block_cd, block_name: block?.block_name || '', cluster_cd: '', school_name: '', udise_code: '' }));
    setOptions((old) => ({ ...old, clusters: [], schools: [] }));
    if (block_cd) await loadOptions('clusters', { district_cd: form.district_cd, block_cd });
  };
  const changeCluster = async (event) => {
    const cluster_cd = event.target.value;
    setForm((old) => ({ ...old, cluster_cd, school_name: '', udise_code: '' }));
    setOptions((old) => ({ ...old, schools: [] }));
    if (cluster_cd) await loadOptions('schools', { district_cd: form.district_cd, block_cd: form.block_cd, cluster_cd });
  };
  const changeSchool = (event) => {
    const udise_code = event.target.value;
    const school = options.schools.find((item) => String(item.udise_code) === udise_code);
    setForm((old) => ({ ...old, udise_code, school_name: school?.school_name || '' }));
  };

  const submit = async () => {
    if (!form.vt_name.trim() || !form.vt_email.trim() || !form.vt_mob || !form.udise_code || !form.trade) {
      toast.error('Please fill all required fields.'); return;
    }
    setSaving(true);
    try {
      const payload = { vt_name: form.vt_name, vt_email: form.vt_email, vt_mob: form.vt_mob, district_name: form.district_name, block_name: form.block_name, school_name: form.school_name, udise_code: form.udise_code, vt_aadhar: form.vt_aadhar || null, vtp_pan: form.vtp_pan || null, trade: form.trade, remarks: form.remarks };
      const res = mode === 'edit' ? await api.patch(`/vtp/vt-staff/${staffId}`, payload) : await api.post('/vtp/vt-staff', payload);
      toast.success(res.data?.message || 'VT details saved successfully.');
      onSaved();
    } catch (error) { toast.error(error?.response?.data?.message || 'Unable to save VT details.'); }
    finally { setSaving(false); }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title={mode === 'edit' ? 'Update VT' : 'Add VT'} size="xl" closeOnOverlayClick={!saving}
    footer={<><Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button><Button variant="primary" onClick={submit} loading={saving}>{mode === 'edit' ? 'Update' : 'Add VT'}</Button></>}>
    {loading ? <div className="py-12 text-center text-gray-500">Loading VT details...</div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input label="Name" required value={form.vt_name} onChange={change('vt_name')} maxLength={150} />
      <Input label="Email" type="email" required value={form.vt_email} onChange={change('vt_email')} maxLength={150} />
      <Input label="Mobile" required inputMode="numeric" value={form.vt_mob} onChange={change('vt_mob')} maxLength={10} />
      <Input label="VTP" value={form.vtp_name || options.vtp[0]?.vtp_name || ''} disabled />
      <SelectField label="District" required value={String(form.district_cd || '')} onChange={changeDistrict}><option value="">Select district</option>{options.districts.map((x) => <option key={x.district_cd} value={x.district_cd}>{x.district_name}</option>)}</SelectField>
      <SelectField label="Block" required value={String(form.block_cd || '')} onChange={changeBlock} disabled={!form.district_cd}><option value="">Select block</option>{options.blocks.map((x) => <option key={x.block_cd} value={x.block_cd}>{x.block_name}</option>)}</SelectField>
      <SelectField label="Cluster" required value={String(form.cluster_cd || '')} onChange={changeCluster} disabled={!form.block_cd}><option value="">Select cluster</option>{options.clusters.map((x) => <option key={x.cluster_cd} value={x.cluster_cd}>{x.cluster_name}</option>)}</SelectField>
      <div><Input label="Search School / UDISE" value={schoolSearch} onChange={(e) => setSchoolSearch(e.target.value)} disabled={!form.cluster_cd} /><div className="mt-2"><SelectField label="School / UDISE" required value={String(form.udise_code || '')} onChange={changeSchool} disabled={!form.cluster_cd}><option value="">Select school</option>{options.schools.map((x) => <option key={x.udise_code} value={x.udise_code}>{x.udise_code} - {x.school_name}</option>)}</SelectField></div></div>
      <Input label="Aadhaar" inputMode="numeric" value={form.vt_aadhar} onChange={change('vt_aadhar')} maxLength={12} />
      <Input label="PAN" value={form.vtp_pan || ''} onChange={change('vtp_pan')} maxLength={10} className="uppercase" />
      <SelectField label="Trade" required value={form.trade || ''} onChange={change('trade')}><option value="">Select trade</option>{options.trades.map((x) => <option key={x.trade} value={x.trade}>{x.trade}</option>)}</SelectField>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-2">Remarks<textarea value={form.remarks || ''} onChange={change('remarks')} maxLength={1000} rows={3} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800 dark:text-white" /></label>
    </div>}
  </Modal>;
};

export default VtStaffFormModal;
