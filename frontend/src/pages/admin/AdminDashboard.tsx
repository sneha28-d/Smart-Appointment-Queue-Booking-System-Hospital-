import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import type { Analytics } from '../../types';
import { useSocket } from '../../hooks/useSocket';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const data = await adminService.getAnalytics() as any;
      setAnalytics({
        totalBookings: data.totalAppointments || 0,
        activeQueue: data.bookedAppointments || 0,
        completedToday: data.completedAppointments || 0,
        cancelledToday: data.cancelledAppointments || 0,
        revenue: data.revenue || 0,
        bookingTrends: data.bookingTrends || [],
        peakHours: data.peakHours || [],
        statusDistribution: data.statusDistribution || [],
      });
    } catch (_err: unknown) {
      console.error('Failed to fetch analytics:', _err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ─── Real-Time Updates ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    
    const handleUpdate = () => {
      console.log('Real-time update received: Refreshing analytics...');
      fetchAnalytics();
    };

    socket.on('admin-notification', handleUpdate);
    socket.on('queue-update', handleUpdate);
    socket.on('queue:update', handleUpdate);

    return () => {
      socket.off('admin-notification', handleUpdate);
      socket.off('queue-update', handleUpdate);
      socket.off('queue:update', handleUpdate);
    };
  }, [socket]);

  const stats = [
    { label: 'Total Bookings', value: analytics?.totalBookings || 0, icon: '📅', color: 'from-blue-500 to-indigo-600', delta: 'lifetime' },
    { label: 'Active Queue', value: analytics?.activeQueue || 0, icon: '⏳', color: 'from-amber-400 to-orange-500', delta: 'live' },
    { label: 'Completed Today', value: analytics?.completedToday || 0, icon: '✅', color: 'from-green-500 to-emerald-600', delta: 'today' },
    { label: 'Revenue', value: `₨${(analytics?.revenue || 0).toLocaleString()}`, icon: '💰', color: 'from-violet-500 to-purple-600', delta: 'total' },
  ];

  const adminLinks = [
    { label: 'Manage Doctors', path: '/admin/doctors', icon: '👨‍⚕️' },
    { label: 'Manage Services', path: '/admin/services', icon: '🏥' },
    { label: 'Manage Schedule', path: '/admin/schedule', icon: '⏰' },
    { label: 'Appointments', path: '/admin/appointments', icon: '📋' },
    { label: 'Queue Panel', path: '/admin/queue', icon: '🔢' },
    { label: 'Calendar', path: '/admin/calendar', icon: '📆' },
    { label: 'Notifications', path: '/admin/notifications', icon: '🔔' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">System overview & analytics</p>
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {adminLinks.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/20 p-4 flex flex-col items-center gap-2 hover:border-blue-300 hover:shadow-blue-100 transition-all group"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-600 transition text-center">{link.label}</span>
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/30 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl shadow-md`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
              <span className="text-xs text-green-600 font-semibold">{s.delta}</span>
            </div>
          </div>
        ))}
      </div>


      {/* Bar Chart — Peak Hours */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-6">
        <h2 className="font-bold text-slate-900 mb-5 text-base">Peak Hours Analysis</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={analytics?.peakHours || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.08)', fontSize: 12 }} />
            <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;
