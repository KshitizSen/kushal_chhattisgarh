import React from 'react';
import { motion } from 'framer-motion';
import vtpIcon from '../../assets/icons/vtp_icon.png';

const AuthCard = ({ title, subtitle, children, footer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card glow-border p-8 sm:p-10"
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-2xl font-heading font-bold text-white tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-white/45 mt-2 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl overflow-hidden shadow-glow-violet bg-white/5"
          >
            <img src={vtpIcon} alt="Platform Logo" className="w-full h-full object-cover p-1" />
          </motion.div>
        </div>
      )}

      {/* Body */}
      <div>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default AuthCard;
