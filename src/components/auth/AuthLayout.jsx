import React from 'react';

const floatingOrbs = [
  { className: 'orb orb-1' },
  { className: 'orb orb-2' },
  { className: 'orb orb-3' },
];

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen auth-bg">
      {floatingOrbs.map((orb, index) => (
        <div key={index} className={orb.className} aria-hidden="true" />
      ))}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-[30rem]">
          {children}

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              (c) {new Date().getFullYear()} Department of Skill Development, Govt. of Chhattisgarh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
