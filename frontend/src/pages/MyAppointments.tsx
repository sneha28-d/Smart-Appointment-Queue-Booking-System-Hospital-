import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import toast from 'react-hot-toast';
import type { Appointment } from '../types';
import { getImageUrl } from '../utils/url';

const statusConfig = {
  pending:   { label: 'Pending',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-500 border-red-200' },
};

type FilterStatus = 'all' | Appointment['status'];

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getUserAppointments();
      setAppointments(data);
    } catch {
      toast.error('Could not load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(id);
    try {
      await appointmentService.cancelAppointment(id);
      toast.success('Appointment cancelled');
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
    } catch {
      toast.error('Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-10 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">Your full appointment history</p>
        </div>
        <button
          onClick={() => navigate('/doctors')}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          + New
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              filter === f.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({f.value === 'all' ? appointments.length : appointments.filter(a => a.status === f.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse flex gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-4xl mb-3">🗓</div>
          <p className="text-slate-500 font-medium">No {filter !== 'all' ? filter : ''} appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const s = statusConfig[app.status] ?? statusConfig.pending;
            const isCancellable = app.status === 'pending' || app.status === 'confirmed';
            return (
              <div key={app._id} className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/20 p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {app.doctorImage ? (
                    <img src={getImageUrl(app.doctorImage)} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                      {app.doctorName?.charAt(0)}
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-slate-900">{app.doctorName}</p>
                        <p className="text-slate-400 text-xs">{app.doctorSpeciality}</p>
                      </div>
                      <span className={`text-xs font-semibold border px-3 py-1 rounded-full ${s.color}`}>{s.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-slate-500">
                      <span>📅 {new Date(app.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>🕐 {app.time}</span>
                      <span>💰 ₨{app.fees}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50 flex-wrap">
                  <button
                    onClick={() => navigate(`/appointment/${app._id}`)}
                    className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    View Details
                  </button>
                  {(app.status === 'confirmed' || app.status === 'pending') && (
                    <button
                      onClick={() => navigate(`/queue/${app._id}`)}
                      className="px-4 py-2 rounded-full border border-blue-500 text-blue-600 text-xs font-semibold hover:bg-blue-600 hover:text-white transition"
                    >
                      Track Queue
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/qr/${app._id}`)}
                    className="px-4 py-2 rounded-full border border-violet-500 text-violet-600 text-xs font-semibold hover:bg-violet-600 hover:text-white transition"
                  >
                    QR Code
                  </button>
                  {isCancellable && (
                    <button
                      onClick={() => handleCancel(app._id)}
                      disabled={cancellingId === app._id}
                      className="px-4 py-2 rounded-full border border-red-300 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition disabled:opacity-50 ml-auto"
                    >
                      {cancellingId === app._id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
