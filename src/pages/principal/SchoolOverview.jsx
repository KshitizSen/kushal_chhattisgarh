import React from 'react';
import { 
  School, 
  Users, 
  BookOpen, 
  Building, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import LineChart from '../../components/charts/LineChart';

const SchoolOverview = () => {
  // School information
  const schoolInfo = {
    name: 'Chhattisgarh Government Higher Secondary School',
    code: 'CGHS-2024',
    address: 'Rajpur Road, Raipur, Chhattisgarh 492001',
    phone: '+91 771 1234567',
    email: 'principal@cghss.edu.in',
    established: '1985',
    principal: 'Dr. Rajesh Kumar',
    affiliation: 'CBSE',
    campusArea: '5 acres',
    totalClasses: '24',
    labs: '8'
  };

  // Student distribution by class
  const classDistribution = [
    { name: 'Class 9', boys: 85, girls: 75 },
    { name: 'Class 10', boys: 78, girls: 72 },
    { name: 'Class 11 Science', boys: 45, girls: 35 },
    { name: 'Class 11 Commerce', boys: 30, girls: 28 },
    { name: 'Class 12 Science', boys: 42, girls: 38 },
    { name: 'Class 12 Commerce', boys: 28, girls: 25 }
  ];

  // Staff distribution
  const staffDistribution = [
    { name: 'Teaching', value: 48, color: '#3b82f6' },
    { name: 'Non-Teaching', value: 12, color: '#10b981' },
    { name: 'Administrative', value: 8, color: '#8b5cf6' },
    { name: 'Support', value: 6, color: '#f59e0b' }
  ];

  // Infrastructure data
  const infrastructure = [
    { facility: 'Classrooms', count: 24, status: 'Good' },
    { facility: 'Science Labs', count: 4, status: 'Excellent' },
    { facility: 'Computer Labs', count: 2, status: 'Good' },
    { facility: 'Library Books', count: 12500, status: 'Good' },
    { facility: 'Sports Ground', count: 1, status: 'Excellent' },
    { facility: 'Auditorium', count: 1, status: 'Good' }
  ];

  // Academic performance trend
  const performanceTrend = [
    { year: '2020', passPercentage: 92 },
    { year: '2021', passPercentage: 94 },
    { year: '2022', passPercentage: 95 },
    { year: '2023', passPercentage: 96 },
    { year: '2024', passPercentage: 97 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            School Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive view of school information, infrastructure, and statistics
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Edit School Info
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* School Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <School className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {schoolInfo.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">School Code: {schoolInfo.code}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">Address</span>
            </div>
            <p className="font-medium">{schoolInfo.address}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4 mr-2" />
              <span className="text-sm">Phone</span>
            </div>
            <p className="font-medium">{schoolInfo.phone}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4 mr-2" />
              <span className="text-sm">Email</span>
            </div>
            <p className="font-medium">{schoolInfo.email}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">Established</span>
            </div>
            <p className="font-medium">{schoolInfo.established}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Principal</p>
            <p className="font-semibold">{schoolInfo.principal}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Affiliation</p>
            <p className="font-semibold">{schoolInfo.affiliation}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Campus Area</p>
            <p className="font-semibold">{schoolInfo.campusArea}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Classes</p>
            <p className="font-semibold">{schoolInfo.totalClasses}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Student Distribution by Class
            </h2>
            <Users className="h-5 w-5 text-gray-500" />
          </div>
          <BarChart
            data={classDistribution}
            xKey="name"
            yKey={['boys', 'girls']}
            height={350}
            colors={['#3b82f6', '#ec4899']}
            title="Number of Students"
            stacked={true}
          />
          <div className="mt-4 flex justify-center space-x-6">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm">Boys</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 bg-pink-500 rounded mr-2"></div>
              <span className="text-sm">Girls</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Staff Distribution
            </h2>
            <PieChartIcon className="h-5 w-5 text-gray-500" />
          </div>
          <PieChart
            data={staffDistribution}
            height={350}
            innerRadius={70}
            outerRadius={120}
          />
          <div className="mt-6 grid grid-cols-2 gap-4">
            {staffDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Infrastructure and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              School Infrastructure
            </h2>
            <Building className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {infrastructure.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium">{item.facility}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {typeof item.count === 'number' && item.count > 1000 
                      ? `${(item.count / 1000).toFixed(1)}k` 
                      : item.count} {item.facility === 'Library Books' ? 'books' : 'units'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                  item.status === 'Good' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Academic Performance Trend
            </h2>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          <LineChart
            data={performanceTrend}
            xKey="year"
            yKey="passPercentage"
            height={300}
            color="#10b981"
            title="Pass Percentage"
          />
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center">
              <Award className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <p className="font-medium">Consistent Improvement</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  School has shown 5% improvement in pass percentage over 5 years
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Key Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">1,245</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Students</p>
          </div>
          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">94%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Average Attendance</p>
          </div>
          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">74</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total Staff</p>
          </div>
          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">97%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Pass Percentage (2024)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolOverview;