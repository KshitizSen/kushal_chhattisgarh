import React from 'react';
import { motion } from 'framer-motion';

const AuthCard = ({ headerContent, title, subtitle, children, footer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[2rem] border border-gray-200/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-10 dark:border-gray-800 dark:bg-gray-900/90 dark:shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
    >
      {(headerContent || title || subtitle) && (
        <div className="mb-8">
          {headerContent && <div className="mb-6">{headerContent}</div>}

          {title && (
            <h2 className="text-3xl font-heading font-bold tracking-tight text-gray-950 dark:text-white">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div className="mt-8 border-t border-gray-200 pt-6 text-center dark:border-gray-800">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default AuthCard;
