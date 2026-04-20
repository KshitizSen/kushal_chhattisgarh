import React from 'react';
import { motion } from 'framer-motion';

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
        <div className="mb-8">
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
