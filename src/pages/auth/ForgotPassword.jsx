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
      toast.success('Reset link sent to your email!');
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
          className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors font-medium"
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
              <p className="text-sm text-white/40">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
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
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                  ${isLoading
                    ? 'bg-violet-600/50 text-white/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-glow-violet cursor-pointer'
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
              <p className="text-sm text-white/40">
                Need help?{' '}
                <a
                  href="mailto:support@kushalchhattisgarh.gov.in"
                  className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-2">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>

              <div>
                <h2 className="text-2xl font-heading font-bold text-white mb-2">
                  Check your email
                </h2>
                <p className="text-sm text-white/45 leading-relaxed">
                  We've sent a password reset link to your email address. Please check your inbox and spam folder.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setIsSubmitted(false)}
                  className="w-full h-12 rounded-xl font-semibold text-sm tracking-wide
                    bg-gradient-to-r from-violet-600 to-indigo-600 text-white 
                    hover:shadow-glow-violet transition-all duration-300 cursor-pointer
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                >
                  Resend Email
                </motion.button>

                <Link to="/login" className="block">
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    className="w-full h-12 rounded-xl font-semibold text-sm tracking-wide
                      bg-white/[0.06] border border-white/[0.1] text-white/70 
                      hover:bg-white/[0.1] hover:text-white transition-all duration-300 cursor-pointer
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
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