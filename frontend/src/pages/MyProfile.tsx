import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

const MyProfile = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<ProfileForm>({
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' },
  });

  const onSubmit = async () => {
    try {
      // TODO: wire up PUT /api/users/profile when endpoint is ready
      await new Promise(r => setTimeout(r, 800)); // simulate
      toast.success('Profile updated successfully!');
      setEditMode(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

      {/* Avatar & Name */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-8 mb-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/30 uppercase">
            {user?.name?.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{user?.name}</p>
            <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-bold border ${
              user?.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {user?.role === 'admin' ? '🛡 Admin' : '👤 Customer'}
            </span>
          </div>
          <button
            onClick={() => setEditMode(v => !v)}
            className="ml-auto px-5 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { label: 'Full Name', key: 'name' as const, type: 'text', rules: { required: 'Required' } },
              { label: 'Email', key: 'email' as const, type: 'email', rules: { required: 'Required' } },
              { label: 'Phone', key: 'phone' as const, type: 'tel', rules: {} },
            ].map(({ label, key, type, rules }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
                <input
                  type={type}
                  {...register(key, rules)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                    errors[key] ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {errors[key] && <p className="text-red-500 text-xs mt-1">⚠ {errors[key]?.message}</p>}
              </div>
            ))}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
              ) : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div className="bg-slate-50 rounded-2xl divide-y divide-slate-100">
            {[
              ['Full Name', user?.name],
              ['Email', user?.email],
              ['Phone', user?.phone || 'Not provided'],
              ['Member Since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center px-5 py-3.5">
                <span className="text-slate-500 text-sm">{label}</span>
                <span className="text-slate-900 font-semibold text-sm">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-6">
        <h2 className="font-bold text-slate-900 mb-4">Account Actions</h2>
        <div className="flex flex-col gap-2">
          <button className="w-full text-left px-5 py-3.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-3 transition border border-transparent hover:border-slate-100">
            🔑 Change Password
          </button>
          <button className="w-full text-left px-5 py-3.5 rounded-xl hover:bg-red-50 text-sm font-medium text-red-500 flex items-center gap-3 transition border border-transparent hover:border-red-100">
            🗑 Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
