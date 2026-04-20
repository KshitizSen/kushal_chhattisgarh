import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Plus,
  Filter,
  Search,
  Download
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const courseSchema = z.object({
  name: z.string().min(3, 'Course name must be at least 3 characters'),
  code: z.string().min(2, 'Course code is required'),
  duration: z.string().min(1, 'Duration is required'),
  maxStudents: z.number().min(1, 'Must have at least 1 student'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'upcoming'])
});

const MyCourses = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filter, setFilter] = useState('all');

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: '',
      code: '',
      duration: '',
      maxStudents: 20,
      description: '',
      status: 'active'
    }
  });

  // Mock courses data
  const courses = [
    {
      id: 1,
      name: 'Electrician Training',
      code: 'ELEC-101',
      duration: '6 months',
      students: 45,
      maxStudents: 50,
      startDate: '2024-01-15',
      endDate: '2024-07-15',
      status: 'active',
      progress: 85,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Plumbing Fundamentals',
      code: 'PLUM-102',
      duration: '4 months',
      students: 38,
      maxStudents: 40,
      startDate: '2024-02-01',
      endDate: '2024-05-31',
      status: 'active',
      progress: 92,
      rating: 4.7
    },
    {
      id: 3,
      name: 'Welding Techniques',
      code: 'WELD-103',
      duration: '5 months',
      students: 32,
      maxStudents: 35,
      startDate: '2024-03-10',
      endDate: '2024-08-10',
      status: 'active',
      progress: 78,
      rating: 4.3
    },
    {
      id: 4,
      name: 'Carpentry Advanced',
      code: 'CARP-104',
      duration: '8 months',
      students: 28,
      maxStudents: 30,
      startDate: '2024-04-01',
      endDate: '2024-11-30',
      status: 'active',
      progress: 65,
      rating: 4.2
    },
    {
      id: 5,
      name: 'Masonry Construction',
      code: 'MASN-105',
      duration: '3 months',
      students: 25,
      maxStudents: 30,
      startDate: '2024-05-15',
      endDate: '2024-08-15',
      status: 'upcoming',
      progress: 0,
      rating: 0
    },
    {
      id: 6,
      name: 'Painting & Decorating',
      code: 'PAINT-106',
      duration: '4 months',
      students: 22,
      maxStudents: 25,
      startDate: '2023-11-01',
      endDate: '2024-02-29',
      status: 'inactive',
      progress: 100,
      rating: 4.6
    }
  ];

  const columns = [
    { key: 'name', header: 'Course Name' },
    { key: 'code', header: 'Code' },
    { key: 'duration', header: 'Duration' },
    { 
      key: 'students', 
      header: 'Enrollment',
      render: (value, row) => (
        <div>
          <div className="text-sm font-medium">{value}/{row.maxStudents}</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${(value / row.maxStudents) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <Badge 
          variant={
            value === 'active' ? 'success' :
            value === 'upcoming' ? 'warning' : 'secondary'
          }
        >
          {value === 'active' ? 'Active' : 
           value === 'upcoming' ? 'Upcoming' : 'Completed'}
        </Badge>
      )
    },
    { 
      key: 'progress', 
      header: 'Progress',
      render: (value) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm font-medium">{value}%</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewCourse(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleEditCourse(row)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleDeleteCourse(row.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const handleAddCourse = (data) => {
    console.log('Adding course:', data);
    setShowAddModal(false);
    reset();
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleViewCourse = (course) => {
    console.log('Viewing course:', course);
    // Navigate to course details
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      console.log('Deleting course:', id);
    }
  };

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(course => course.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your vocational training courses and track progress
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Add New Course
          </Button>
          <Button
            variant="secondary"
            icon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">6</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">190</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Ongoing Classes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">14</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">78%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm"
              >
                <option value="all">All Courses</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="inactive">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredCourses.length} of {courses.length} courses
            </span>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <Table
          data={filteredCourses}
          columns={columns}
          itemsPerPage={10}
          searchable={false}
        />
      </div>

      {/* Add Course Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          reset();
        }}
        title="Add New Course"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleAddCourse)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Course Name"
              {...register('name')}
              error={errors.name?.message}
              required
            />
            <Input
              label="Course Code"
              {...register('code')}
              error={errors.code?.message}
              required
            />
            <Input
              label="Duration"
              {...register('duration')}
              error={errors.duration?.message}
              placeholder="e.g., 6 months"
              required
            />
            <Input
              label="Maximum Students"
              type="number"
              {...register('maxStudents', { valueAsNumber: true })}
              error={errors.maxStudents?.message}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
            >
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
              placeholder="Course description..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Course"
        size="lg"
      >
        {selectedCourse && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Name
                </label>
                <Input defaultValue={selectedCourse.name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Code
                </label>
                <Input defaultValue={selectedCourse.code} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <Input defaultValue={selectedCourse.duration} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Students
                </label>
                <Input 
                  type="number" 
                  defaultValue={selectedCourse.maxStudents} 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Students
              </label>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ 
                      width: `${(selectedCourse.students / selectedCourse.maxStudents) * 100}%` 
                    }}
                  />
                </div>
                <span className="ml-2 text-sm font-medium">
                  {selectedCourse.studers}/{selectedCourse.maxStudents}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary">
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyCourses;