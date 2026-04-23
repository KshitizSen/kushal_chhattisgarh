import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';

// ─── Validation schema ───
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      toast.success(`Reset link sent to ${data.email}`);
    } catch {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Back to login */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to login
        </Link>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <AuthCard
            key="form"
            title="Forgot password?"
            subtitle="Enter your email and we'll send you a link to reset your password."
            footer={
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Sign in
                </Link>
              </p>
            }
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <AuthInput
                label="Email address"
                type="email"
                icon={Mail}
                error={errors.email?.message}
                autoComplete="email"
                {...register('email')}
              />

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.015 }}
                whileTap={{ scale: isLoading ? 1 : 0.985 }}
                className={`
                  w-full h-12 rounded-xl font-semibold text-sm tracking-wide
                  flex items-center justify-center gap-2.5
                  transition-all duration-300
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                  ${isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                    : 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-500/20 hover:from-primary-700 hover:to-accent-700 cursor-pointer'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Reset Link
                  </>
                )}
              </motion.button>
            </form>
          </AuthCard>
        ) : (
          <AuthCard
            key="success"
            footer={
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need help?{' '}
                <a
                  href="mailto:support@kushalchhattisgarh.gov.in"
                  className="font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Contact support
                </a>
              </p>
            }
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center space-y-5"
            >
              <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <h2 className="mb-2 text-2xl font-heading font-bold text-gray-950 dark:text-white">
                  Check your email
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  We've sent a password reset link to your email address. Please check your inbox and spam folder.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setIsSubmitted(false)}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-sm font-semibold tracking-wide text-white shadow-lg shadow-primary-500/20 transition-all duration-300 hover:from-primary-700 hover:to-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
                >
                  Resend Email
                </motion.button>

                <Link to="/login" className="block">
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white text-sm font-semibold tracking-wide text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Back to Login
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </AuthCard>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ForgotPassword;
