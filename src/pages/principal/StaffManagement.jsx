import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Eye, Download, Mail, Phone, Calendar, Award, Users, BookOpen, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import principalService from '../../services/principalService';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedVtId, setSelectedVtId] = useState('');

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const response = await principalService.getVtList({
        date: selectedDate,
        vtId: selectedVtId || undefined
      });
      if (response.data.success) {
        // Map the backend data to the frontend format if necessary
        const mappedData = response.data.data.map(vt => ({
          ...vt,
          status: vt.today_status || 'not-marked',
          designation: 'Vocational Teacher', // Default for this list
          experience: vt.experience || 'N/A',
          department: 'Vocational',
          performance: vt.performance || Math.floor(Math.random() * 20) + 80 // Mocking performance for now as it's not in DB
        }));
        setStaffData(mappedData);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedVtId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Science', label: 'Science' },
    { value: 'English', label: 'English' },
    { value: 'Social Science', label: 'Social Science' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Physical Education', label: 'Physical Education' },
    { value: 'Vocational', label: 'Vocational' }
  ];

  const departmentStats = [
    { name: 'Mathematics', value: 8, color: '#FF6B6B' },
    { name: 'Science', value: 12, color: '#4ECDC4' },
    { name: 'English', value: 6, color: '#FFD166' },
    { name: 'Social Science', value: 7, color: '#06D6A0' },
    { name: 'Computer Science', value: 4, color: '#118AB2' },
    { name: 'Physical Education', value: 3, color: '#EF476F' },
    { name: 'Vocational', value: 5, color: '#7209B7' }
  ];

  const performanceData = [
    { name: 'Jan', performance: 85 },
    { name: 'Feb', performance: 88 },
    { name: 'Mar', performance: 90 },
    { name: 'Apr', performance: 87 },
    { name: 'May', performance: 92 },
    { name: 'Jun', performance: 94 },
    { name: 'Jul', performance: 91 },
    { name: 'Aug', performance: 93 },
    { name: 'Sep', performance: 95 },
    { name: 'Oct', performance: 96 },
    { name: 'Nov', performance: 94 },
    { name: 'Dec', performance: 97 }
  ];

  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = (staff.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (staff.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (staff.department?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || staff.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const handleViewStaff = (staff) => {
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  };

  const handleEditStaff = (staff) => {
    // In a real app, this would open edit modal
    console.log('Edit staff:', staff);
  };

  const handleDeleteStaff = (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setStaffData(prev => prev.filter(staff => staff.id !== staffId));
    }
  };

  const handleAddStaff = () => {
    setIsAddModalOpen(true);
  };

  const handleMarkAttendance = async (userId, status) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      await principalService.markVtAttendance({ user_id: userId, date, status });
      toast.success(`Attendance marked as ${status}`);
      fetchStaff();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  const handleUpdateAttendance = async (attendanceId, status) => {
    try {
      await principalService.updateVtAttendance(attendanceId, { status });
      toast.success(`Attendance updated to ${status}`);
      fetchStaff();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
    }
  };

  const handleExport = () => {
    // In a real app, this would export to CSV/Excel
    console.log('Exporting staff data...');
  };

  const tableColumns = [
    { key: 'name', label: 'Staff Name', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'designation', label: 'Designation', sortable: true },
    { key: 'experience', label: 'Experience', sortable: true },
    {
      key: 'performance', label: 'Performance', sortable: true, render: (value) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className={`h-2 rounded-full ${value >= 90 ? 'bg-green-500' : value >= 80 ? 'bg-blue-500' : 'bg-yellow-500'}`}
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{value}%</span>
        </div>
      )
    },
    {
      key: 'status', label: 'Attendance', sortable: true, render: (value, row) => (
        <div className="flex items-center space-x-2">
          {value === 'not-marked' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAttendance(row.id, 'present')}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAttendance(row.id, 'absent')}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Absent
              </Button>
            </>
          ) : (
            <div className="flex items-center">
              <StatusBadge status={value} />
              <select
                className="ml-2 text-xs border rounded p-1"
                value={value}
                onChange={(e) => handleUpdateAttendance(row.attendance_id, e.target.value)}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="on_leave">Leave</option>
                <option value="od">On Duty</option>
                <option value="half_day">Half Day</option>
              </select>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewStaff(row)}
            className="p-1"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditStaff(row)}
            className="p-1"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteStaff(row.id)}
            className="p-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage teaching and non-teaching staff, track performance, and handle leaves</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddStaff}>
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            <span>+2 this month</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">89%</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            <span>+3% from last month</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Teaching Staff</p>
              <p className="text-2xl font-bold text-gray-900">38</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <span>85% of total</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">On Leave Today</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-red-600">
            <span>2 more than usual</span>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-full md:w-48">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>
          <div className="w-full md:w-64">
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
          <div className="h-64">
            <PieChart
              data={departmentStats}
              dataKey="value"
              nameKey="name"
              colors={departmentStats.map(d => d.color)}
              showLegend={true}
              showLabel={true}
            />
          </div>
        </Card>

        {/* Performance Trend */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance Trend</h3>
          <div className="h-64">
            <BarChart
              data={performanceData}
              xKey="name"
              yKeys={[{ key: 'performance', label: 'Performance', color: '#4F46E5' }]}
              showGrid={true}
              showTooltip={true}
            />
          </div>
        </Card>
      </div>

      {/* Staff Table */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Staff Members</h3>
          <div className="flex items-center space-x-4">
            {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
            <p className="text-sm text-gray-600">{filteredStaff.length} staff members found</p>
          </div>
        </div>
        <Table
          columns={tableColumns}
          data={filteredStaff}
          keyExtractor={(item) => item.id}
          pagination={true}
          itemsPerPage={5}
        />
      </Card>

      {/* View Staff Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Staff Details"
        size="lg"
      >
        {selectedStaff && (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900">{selectedStaff.name}</h4>
                <p className="text-gray-600">{selectedStaff.designation}</p>
                <div className="flex items-center mt-2">
                  <StatusBadge status={selectedStaff.status} />
                  <span className="ml-3 text-sm text-gray-600">
                    Joined: {selectedStaff.joinDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h5 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <span>{selectedStaff.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-500 mr-2" />
                    <span>{selectedStaff.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span>Experience: {selectedStaff.experience}</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 text-gray-500 mr-2" />
                    <span>{selectedStaff.qualification}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h5 className="text-lg font-medium text-gray-900 mb-3">Performance Metrics</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Performance Rating:</span>
                    <span className="font-medium">{selectedStaff.performance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Leaves Taken:</span>
                    <span className="font-medium">{selectedStaff.leavesTaken} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Students:</span>
                    <span className="font-medium">{selectedStaff.students}</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => handleEditStaff(selectedStaff)}>
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff Member"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This demo project includes the staff management shell. Wire this modal to your real create-staff API or form flow next.
          </p>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffManagement;
