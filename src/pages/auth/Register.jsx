import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import RoleSelector from '../../components/auth/RoleSelector';
import PasswordStrength from '../../components/auth/PasswordStrength';

// ─── Validation schema ───
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    role: z.enum(['admin', 'vtp', 'principal'], {
      required_error: 'Please select a role',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin',
    },
  });

  const passwordValue = useWatch({
    control,
    name: 'password',
    defaultValue: '',
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Simulate API call — replace with real authService.register()
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Account created for ${data.name}. Please sign in.`);
      navigate('/login');
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Create account"
        subtitle="Join the Kushal Chhattisgarh platform"
        footer={
          <p className="text-sm text-white/40">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Name */}
          <AuthInput
            label="Full name"
            type="text"
            icon={User}
            error={errors.name?.message}
            autoComplete="name"
            {...register('name')}
          />

          {/* Email */}
          <AuthInput
            label="Email address"
            type="email"
            icon={Mail}
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />

          {/* Password */}
          <div>
            <AuthInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              error={errors.password?.message}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/30 hover:text-white/60 transition-colors p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              {...register('password')}
            />
            <PasswordStrength password={passwordValue} />
          </div>

          {/* Confirm Password */}
          <AuthInput
            label="Confirm password"
            type={showConfirm ? 'text' : 'password'}
            icon={Lock}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-white/30 hover:text-white/60 transition-colors p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            {...register('confirmPassword')}
          />

          {/* Role Selector */}
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <RoleSelector
                value={field.value}
                onChange={field.onChange}
                error={errors.role?.message}
              />
            )}
          />

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.015 }}
            whileTap={{ scale: isLoading ? 1 : 0.985 }}
            className={`
              w-full h-12 rounded-xl font-semibold text-sm tracking-wide
              flex items-center justify-center gap-2.5
              transition-all duration-300 mt-2
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
                Creating account…
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </motion.button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default Register;
