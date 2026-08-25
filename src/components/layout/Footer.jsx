import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 px-3 py-2.5 dark:border-gray-800 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Copyright {currentYear} Kushal Chhattisgarh
        </p>
      </div>
    </footer>
  );
};

export default Footer;
