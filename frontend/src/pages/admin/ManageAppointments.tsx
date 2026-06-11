import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { appointmentService } from '../../services/appointmentService';
import toast from 'react-hot-toast';
import type { Appointment, AppointmentStatus } from '../../types';

type AppointmentWithPatient = Appointment & { patientName?: string };

const statusConfig: Record<AppointmentStatus, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-500 border-red-200' },
};

const DEMO: Appointment[] = [
  { _id: 'a1', user: 'u1', doctorId: 'd1', doctorName: 'Dr. Richard James', doctorSpeciality: 'General Physician', date: new Date().toISOString(), time: '10:00 AM', status: 'confirmed', fees: 700, createdAt: new Date().toISOString() },
  { _id: 'a2', user: 'u2', doctorId: 'd2', doctorName: 'Dr. Emily Larson', doctorSpeciality: 'Gynecologist', date: new Date().toISOString(), time: '11:30 AM', status: 'pending', fees: 800, createdAt: new Date().toISOString() },
  { _id: 'a3', user: 'u3', doctorId: 'd3', doctorName: 'Dr. Sarah Patel', doctorSpeciality: 'Dermatologist', date: new Date().toISOString(), time: '2:00 PM', status: 'completed', fees: 600, createdAt: new Date().toISOString() },
  { _id: 'a4', user: 'u4', doctorId: 'd1', doctorName: 'Dr. Richard James', doctorSpeciality: 'General Physician', date: new Date().toISOString(), time: '3:30 PM', status: 'cancelled', fees: 700, createdAt: new Date().toISOString() },
];

type FilterStatus = 'all' | AppointmentStatus;

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await adminService.getAllAppointments() as AppointmentWithPatient[];
        setAppointments(data.length ? data : DEMO);
      } catch {
        setAppointments(DEMO);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentService.updateAppointment(id, { status: newStatus });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = appointments
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a =>
      searchQuery === '' ||
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a._id.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Manage Appointments</h1>
        <p className="text-slate-500 text-sm mt-0.5">View and update all system appointments</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by doctor or ID…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        {/* Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                filter === f.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-slate-600 border-slate-200 hover:border-blue-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1.5fr] px-6 py-3 bg-slate-50/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
          <span>Doctor</span>
          <span>Patient / Ref</span>
          <span>Date & Time</span>
          <span>Fee</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {isLoading ? (
          <div className="divide-y">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 px-6 py-5 animate-pulse items-center">
                <div className="w-9 h-9 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No appointments found</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(app => {
              const s = statusConfig[app.status];
              return (
                <div key={app._id} className="grid sm:grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1.5fr] gap-2 px-6 py-4 items-center hover:bg-slate-50/50 transition">
                  {/* Doctor */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {app.doctorName?.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div className="hidden md:block min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{app.doctorName}</p>
                      <p className="text-xs text-slate-400 truncate">{app.doctorSpeciality}</p>
                    </div>
                  </div>

                  {/* Ref + Patient */}
                  <div>
                    <p className="text-xs font-mono text-slate-500 truncate">#{app._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-slate-700 font-semibold mt-0.5">{app.patientName || 'Patient'}</p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-sm text-slate-700 font-medium">{new Date(app.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-slate-400">{app.time}</p>
                  </div>

                  {/* Fee */}
                  <p className="text-sm font-semibold text-slate-800">₨{app.fees}</p>

                  {/* Status Badge */}
                  <span className={`inline-flex text-xs font-bold border px-2.5 py-1 rounded-full w-max ${s.color}`}>{s.label}</span>

                  {/* Action Dropdown */}
                  <div className="flex gap-1.5 flex-wrap">
                    {app.status !== 'completed' && app.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(app._id, 'completed')}
                          className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200 hover:bg-green-100 transition"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app._id, 'cancelled')}
                          className="px-3 py-1.5 rounded-full bg-red-50 text-red-500 text-xs font-semibold border border-red-200 hover:bg-red-100 transition"
                        >
                          Cancel
                        </button>
                      </>
                    )}
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

export default ManageAppointments;
