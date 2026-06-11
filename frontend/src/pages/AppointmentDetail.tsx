import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const AppointmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (!id) return;
        const data = await appointmentService.getAppointmentById(id);
        setAppointment(data);
      } catch {
        toast.error('Could not load appointment details');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleCancel = async () => {
    if (!appointment || !confirm('Cancel this appointment?')) return;
    setIsCancelling(true);
    try {
      await appointmentService.cancelAppointment(appointment._id);
      toast.success('Appointment cancelled');
      setAppointment(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } catch {
      toast.error('Failed to cancel');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-14 space-y-4 animate-pulse">
        <div className="h-6 bg-slate-100 rounded-full w-1/3" />
        <div className="h-48 bg-slate-100 rounded-3xl" />
        <div className="h-32 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🔍</div>
        <p className="text-slate-500 font-medium">Appointment not found</p>
        <button onClick={() => navigate('/my-appointments')} className="text-blue-600 underline text-sm">Back to appointments</button>
      </div>
    );
  }

  const s = statusConfig[appointment.status] ?? statusConfig.pending;
  const isCancellable = appointment.status === 'pending' || appointment.status === 'confirmed';

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0 py-10">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition">
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Appointment Details</h1>

      {/* Doctor Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-6 mb-5">
        <div className="flex items-center gap-4 mb-5">
          {appointment.doctorImage ? (
            <img src={getImageUrl(appointment.doctorImage)} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
              {appointment.doctorName?.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-slate-900 text-lg">{appointment.doctorName}</p>
            <p className="text-slate-400 text-sm">{appointment.doctorSpeciality}</p>
            <span className={`mt-1 inline-flex text-xs font-semibold border px-3 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl divide-y divide-slate-100">
          {[
            ['📅 Date', new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
            ['🕐 Time', appointment.time],
            ['💰 Fee', `₨${appointment.fees}`],
            ['🪪 Ref ID', appointment._id],
            ['📋 Notes', appointment.notes || '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center px-5 py-3">
              <span className="text-slate-500 text-sm">{label}</span>
              <span className="text-slate-900 font-semibold text-sm text-right max-w-[60%] break-all">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate(`/qr/${appointment._id}`)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-violet-600/20 hover:from-violet-700 hover:to-purple-700 transition-all"
        >
          View QR Code
        </button>
        {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
          <button
            onClick={() => navigate(`/queue/${appointment._id}`)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Track Queue
          </button>
        )}
        {isCancellable && (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="px-5 py-2.5 rounded-full border border-red-300 text-red-500 font-semibold text-sm hover:bg-red-500 hover:text-white transition disabled:opacity-50"
          >
            {isCancelling ? 'Cancelling…' : 'Cancel Appointment'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetail;
