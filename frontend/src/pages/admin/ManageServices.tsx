import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import type { Service } from '../../types';

type ServiceForm = Omit<Service, '_id'>;

const ManageServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ServiceForm>({
    defaultValues: { isActive: true },
  });

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const data = await adminService.getServices();
      setServices(data);
    } catch {
      // demo fallback
      setServices([
        { _id: '1', name: 'General Consultation', description: 'Basic health checkup', duration: 30, fees: 50, isActive: true },
        { _id: '2', name: 'Specialist Visit', description: 'Specialist doctor appointment', duration: 45, fees: 120, isActive: true },
        { _id: '3', name: 'Follow-up', description: 'Follow-up consultation', duration: 15, fees: 30, isActive: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ServiceForm) => {
    try {
      const newService = await adminService.createService({ ...data, fees: Number(data.fees), duration: Number(data.duration) });
      setServices(prev => [...prev, newService]);
      toast.success('Service created!');
      reset();
      setShowForm(false);
    } catch {
      toast.error('Failed to create service');
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await adminService.updateService(id, { isActive: !isActive });
      setServices(prev => prev.map(s => s._id === id ? { ...s, isActive: !isActive } : s));
      toast.success('Service updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      await adminService.deleteService(id);
      setServices(prev => prev.filter(s => s._id !== id));
      toast.success('Service deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-10 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Services</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure available medical services</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          {showForm ? '✕ Cancel' : '+ Add Service'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 mb-6 space-y-4">
          <h2 className="font-bold text-slate-900 mb-2">New Service</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service Name</label>
              <input {...register('name', { required: 'Required' })} placeholder="e.g. General Consultation" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              {errors.name && <p className="text-red-500 text-xs mt-1">⚠ {errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
              <input {...register('description')} placeholder="Short description" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration (mins)</label>
              <input type="number" {...register('duration', { required: 'Required', min: 5 })} placeholder="30" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fee ($)</label>
              <input type="number" {...register('fees', { required: 'Required', min: 0 })} placeholder="50" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
            {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</> : 'Create Service'}
          </button>
        </form>
      )}

      {/* Service List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(s => (
            <div key={s._id} className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl">🏥</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900">{s.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{s.description} · {s.duration} mins · ₨{s.fees}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(s._id, s.isActive)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${s.isActive ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                >
                  {s.isActive ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => handleDelete(s._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageServices;
