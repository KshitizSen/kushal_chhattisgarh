import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const getStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
  if (score === 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
  if (score === 3) return { score: 3, label: 'Good', color: '#eab308' };
  if (score >= 4) return { score: 4, label: 'Strong', color: '#22c55e' };

  return { score: 0, label: '', color: '' };
};

const PasswordStrength = ({ password = '' }) => {
  const strength = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-1.5">
      {/* Bar segments */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className="h-1 flex-1 rounded-full overflow-hidden bg-white/[0.08]"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: strength.score >= seg ? '100%' : '0%' }}
              transition={{ duration: 0.35, delay: seg * 0.05, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: strength.score >= seg ? strength.color : 'transparent' }}
            />
          </div>
        ))}
      </div>

      {/* Label */}
      <motion.p
        key={strength.label}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: strength.color }}
      >
        {strength.label}
      </motion.p>
    </div>
  );
};

export default PasswordStrength;
