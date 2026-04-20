import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Code, Shield, Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                <span className="text-lg font-bold text-white">K</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Kushal Chhattisgarh</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vocational Education Management</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Empowering youth through skill development and vocational training across Chhattisgarh.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/admin/dashboard" className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400">Dashboard</Link></li>
              <li><Link to="/admin/manage-users" className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400">User Management</Link></li>
              <li><Link to="/admin/reports" className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400">Reports</Link></li>
              <li><Link to="/admin/settings" className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400">Settings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400">Documentation</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400">API Reference</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400">Support Center</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400">Community Forum</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Globe className="h-4 w-4" />
                <span>Department of Skill Development, Chhattisgarh</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="h-4 w-4" />
                <span>ISO 27001 Certified</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Code className="h-4 w-4" />
                <span>Built with React & Tailwind CSS</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-gray-200 pt-8 dark:border-gray-700 md:flex-row">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Copyright {currentYear} Kushal Chhattisgarh. All rights reserved.
          </div>
          <div className="mt-4 flex items-center gap-6 md:mt-0">
            <a href="#" className="text-sm text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400">Cookie Policy</a>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              Made with <Heart className="h-4 w-4 text-danger-500" /> in India
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
