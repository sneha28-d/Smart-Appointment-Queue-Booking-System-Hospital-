import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getUserAppointments();
        setAppointments(data);
      } catch {
        toast.error('Failed to load appointments');
        // Demo fallback
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const stats = [
    { label: 'Total', value: appointments.length, icon: '📅', color: 'from-blue-500 to-indigo-600' },
    { label: 'Upcoming', value: appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length, icon: '⏳', color: 'from-amber-400 to-orange-500' },
    { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, icon: '✅', color: 'from-green-500 to-emerald-600' },
    { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, icon: '❌', color: 'from-red-400 to-rose-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 py-10">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Good day, <span className="text-blue-600">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Here's your appointment overview</p>
        </div>
        <button
          onClick={() => navigate('/doctors')}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all w-max"
        >
          + Book Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/30 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl shadow-md`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Recent Appointments</h2>
          <button
            onClick={() => navigate('/my-appointments')}
            className="text-blue-600 text-sm font-semibold hover:underline"
          >
            View all →
          </button>
        </div>

        {isLoading ? (
          <div className="divide-y">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded-full animate-pulse w-1/3" />
                  <div className="h-3 bg-slate-100 rounded-full animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-3">🗓</div>
            <p className="text-slate-500 font-medium">No appointments yet</p>
            <button
              onClick={() => navigate('/doctors')}
              className="mt-4 text-blue-600 text-sm font-semibold hover:underline"
            >
              Book your first appointment
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-slate-50/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Doctor</span>
              <span>Date & Time</span>
              <span>Fee</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>
            {appointments.slice(0, 5).map((app) => {
              const s = statusConfig[app.status] ?? statusConfig.pending;
              return (
                <div key={app._id} className="grid sm:grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-blue-50/20 transition">
                  <div className="flex items-center gap-3">
                    {app.doctorImage ? (
                      <img src={getImageUrl(app.doctorImage)} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {app.doctorName?.replace(/^Dr\.\s*/i, '').charAt(0)}
                      </div>
                    )}
                    <div className="hidden md:block">
                      <p className="font-semibold text-slate-900 text-sm">{app.doctorName}</p>
                      <p className="text-slate-400 text-xs">{app.doctorSpeciality}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium text-sm">{new Date(app.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="text-slate-400 text-xs">{app.time}</p>
                  </div>
                  <p className="text-slate-700 font-semibold text-sm">₨{app.fees}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border w-max ${s.color}`}>
                    {s.label}
                  </span>
                  <div className="flex justify-end gap-2">
                    {(app.status === 'confirmed' || app.status === 'pending') && (
                      <button
                        onClick={() => navigate(`/queue/${app._id}`)}
                        className="px-3 py-1.5 rounded-full border border-blue-500 text-blue-600 text-xs font-semibold hover:bg-blue-600 hover:text-white transition"
                      >
                        Queue
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/appointment/${app._id}`)}
                      className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;