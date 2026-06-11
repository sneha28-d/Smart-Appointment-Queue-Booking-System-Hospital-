import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import type { RegisterPayload } from '../types';
import type { AxiosError } from 'axios';

const Signup = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterPayload & { confirmPassword: string }>();

  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch('password');

  const onSubmit = async (data: RegisterPayload & { confirmPassword: string }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _confirmPassword, ...payload } = data;
      const user = await registerUser(payload);
      toast.success('Account created successfully! 🎉');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ msg: string }>;
      toast.error(axiosErr.response?.data?.msg || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500 text-sm mt-1">Join DocQueue — book smarter</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="User_name"
                {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' },
                })}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                {...register('phone')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: v => v === password || 'Passwords do not match',
                })}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating account…</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;