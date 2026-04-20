import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 px-4 py-4 dark:border-gray-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Copyright {currentYear} Kushal Chhattisgarh
        </p>
      </div>
    </footer>
  );
};

export default Footer;
