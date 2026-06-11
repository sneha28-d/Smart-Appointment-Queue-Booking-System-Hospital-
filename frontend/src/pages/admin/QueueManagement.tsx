import { useState, useEffect, useCallback } from 'react';
import { queueService } from '../../services/queueService';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';
import type { QueueEntry } from '../../types';
import type { AxiosError } from 'axios';

const statusColors: Record<string, string> = {
  Waiting:   'bg-amber-50 text-amber-700 border-amber-200',
  Next:      'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
  Skipped:   'bg-slate-50 text-slate-400 border-slate-200',
};

const statusDot: Record<string, string> = {
  Waiting:   'bg-amber-400',
  Next:      'bg-blue-500 animate-pulse',
  Completed: 'bg-green-500',
  Skipped:   'bg-slate-300',
};

const DEMO_QUEUE: QueueEntry[] = [
  { _id: 'q1', appointmentId: 'a1', appointmentRef: 'A1B2C3D4', userId: 'u1', patientName: 'Rahul Sharma', doctorName: 'Dr. Aarav Mehta', time: '09:00', tokenNumber: '1', position: 0, status: 'Next', estimatedWait: 0 },
  { _id: 'q2', appointmentId: 'a2', appointmentRef: 'B2C3D4E5', userId: 'u2', patientName: 'Priya Singh', doctorName: 'Dr. Aarav Mehta', time: '09:30', tokenNumber: '2', position: 1, status: 'Waiting', estimatedWait: 15 },
  { _id: 'q3', appointmentId: 'a3', appointmentRef: 'C3D4E5F6', userId: 'u3', patientName: 'Amit Patel', doctorName: 'Dr. Aarav Mehta', time: '10:00', tokenNumber: '3', position: 2, status: 'Waiting', estimatedWait: 30 },
  { _id: 'q4', appointmentId: 'a4', appointmentRef: 'D4E5F6G7', userId: 'u4', patientName: 'Sneha Rao', doctorName: 'Dr. Aarav Mehta', time: '10:30', tokenNumber: '4', position: 3, status: 'Waiting', estimatedWait: 45 },
  { _id: 'q5', appointmentId: 'a5', appointmentRef: 'E5F6G7H8', userId: 'u5', patientName: 'Kiran Joshi', doctorName: 'Dr. Aarav Mehta', time: '11:00', tokenNumber: '5', position: 4, status: 'Completed', estimatedWait: 0 },
];

const formatTime = (t: string) => {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const QueueManagement = () => {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { queueUpdate, isConnected } = useSocket();

  const loadQueue = useCallback(async () => {
    try {
      const data = await queueService.getQueue('all');
      setQueue(Array.isArray(data) ? data as unknown as QueueEntry[] : DEMO_QUEUE);
    } catch {
      setQueue(DEMO_QUEUE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  useEffect(() => {
    if (queueUpdate) loadQueue();
  }, [queueUpdate, loadQueue]);

  const callNext = async () => {
    try {
      await queueService.callNext();
      toast.success('Called next patient!');
    } catch (error: unknown) {
      const axiosErr = error as AxiosError;
      if (axiosErr.response?.status === 404) {
        toast.error('No more patients waiting');
      } else {
        const errorMsg = (axiosErr.response?.data as any)?.error || (axiosErr.response?.data as any)?.msg || 'Failed to call next patient';
        toast.error(errorMsg);
      }
    } finally {
      await loadQueue();
    }
  };

  const skipToken = async (appointmentId: string) => {
    try {
      await queueService.skipQueueItem(appointmentId);
      toast('Token skipped', { icon: '⏭' });
      await loadQueue();
    } catch {
      toast.error('Failed to skip token');
    }
  };

  const completeToken = async (appointmentId: string) => {
    try {
      await queueService.completeQueueItem(appointmentId);
      toast.success('Marked as completed');
      await loadQueue();
    } catch {
      toast.error('Failed to complete token');
    }
  };

  const currentToken = queue.find(q => q.status === 'Next' || q.status === 'in_progress');
  const waitingCount = queue.filter(q => q.status === 'Waiting' || q.status === 'waiting').length;
  const completedToday = queue.filter(q => q.status === 'Completed' || q.status === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Queue Management</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
            <p className="text-slate-500 text-sm">{isConnected ? 'Live updates active' : 'Connecting…'}</p>
          </div>
        </div>
        <button
          onClick={callNext}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
        >
          <span>▶</span> Call Next
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Waiting', value: waitingCount, color: 'from-amber-400 to-orange-500', icon: '⏳' },
          { label: 'Serving Now', value: currentToken ? `#${currentToken.tokenNumber}` : '—', color: 'from-blue-500 to-indigo-600', icon: '🔔' },
          { label: 'Completed', value: completedToday, color: 'from-green-500 to-emerald-600', icon: '✓' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-lg shadow-md`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Now Serving Banner */}
      {currentToken && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 mb-6 flex items-center justify-between text-white shadow-xl shadow-blue-600/20">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Now Serving</p>
            <p className="text-4xl font-black mt-1">Token #{currentToken.tokenNumber}</p>
            <div className="flex items-center gap-4 mt-2">
              {currentToken.patientName && (
                <span className="text-blue-100 text-sm font-medium flex items-center gap-1">
                  👤 {currentToken.patientName}
                </span>
              )}
              {currentToken.doctorName && (
                <span className="text-blue-100 text-sm font-medium flex items-center gap-1">
                  🩺 {currentToken.doctorName}
                </span>
              )}
              {currentToken.time && (
                <span className="text-blue-100 text-sm font-medium flex items-center gap-1">
                  🕐 {formatTime(currentToken.time)}
                </span>
              )}
              {currentToken.appointmentRef && (
                <span className="text-blue-200/70 text-xs font-mono">
                  #{currentToken.appointmentRef}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => completeToken(currentToken.appointmentId)} className="px-5 py-2 rounded-full bg-white text-blue-700 font-bold text-xs shadow hover:bg-blue-50 transition">
              ✓ Done
            </button>
            <button onClick={() => skipToken(currentToken.appointmentId)} className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition">
              ⏭ Skip
            </button>
          </div>
        </div>
      )}

      {/* Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">

        {/* Table Header */}
        <div className="grid grid-cols-[56px_1fr_1fr_100px_90px_130px] px-6 py-3.5 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
          <span>#</span>
          <span>Patient</span>
          <span>Doctor / Time</span>
          <span>Position</span>
          <span>Wait</span>
          <span>Status</span>
        </div>

        {isLoading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse border-b border-slate-50 bg-slate-50/50" />
            ))}
          </div>
        ) : queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <span className="text-4xl">🗓</span>
            <p className="font-medium text-sm">No queue entries for today</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {queue.map(q => {
              const isActive = q.status === 'Next' || q.status === 'in_progress';
              const isDone = q.status === 'Completed' || q.status === 'completed' || q.status === 'Skipped' || q.status === 'skipped';
              const statusKey = q.status === 'in_progress' ? 'Next' : q.status === 'waiting' ? 'Waiting' : q.status === 'completed' ? 'Completed' : q.status === 'skipped' ? 'Skipped' : q.status as string;

              return (
                <div
                  key={q._id}
                  className={`grid grid-cols-[56px_1fr_1fr_100px_90px_130px] items-center px-6 py-4 gap-3 transition-all ${
                    isActive ? 'bg-blue-50/40' : isDone ? 'opacity-50' : 'hover:bg-slate-50/50'
                  }`}
                >
                  {/* Token Badge */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm border flex-shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30'
                      : isDone
                      ? 'bg-slate-100 text-slate-400 border-slate-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {q.tokenNumber}
                  </div>

                  {/* Patient Info */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {q.patientName || 'Unknown Patient'}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Ref: #{q.appointmentRef || q.appointmentId.slice(-8).toUpperCase()}
                    </p>
                  </div>

                  {/* Doctor / Time */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {q.doctorName || '—'}
                    </p>
                    {q.time && (
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        🕐 {formatTime(q.time)}
                      </p>
                    )}
                  </div>

                  {/* Position */}
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {isDone ? '—' : isActive ? 'Now' : `+${q.position}`}
                    </p>
                    {!isDone && !isActive && (
                      <p className="text-[11px] text-slate-400">in queue</p>
                    )}
                  </div>

                  {/* Est. Wait */}
                  <p className="text-sm text-slate-600 font-medium">
                    {isDone ? '—' : q.estimatedWait === 0 ? 'Now' : `${q.estimatedWait}m`}
                  </p>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`flex items-center gap-1.5 text-[11px] font-bold border px-2.5 py-1 rounded-full ${statusColors[statusKey] || statusColors['Waiting']}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[statusKey] || 'bg-amber-400'}`} />
                      {statusKey}
                    </span>
                    {(q.status === 'Waiting' || q.status === 'waiting') && (
                      <button
                        onClick={() => skipToken(q.appointmentId)}
                        className="text-[11px] text-slate-400 hover:text-amber-600 transition font-semibold"
                      >
                        Skip
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer summary */}
        {!isLoading && queue.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {queue.length} total · {waitingCount} waiting · {completedToday} completed today
            </p>
            <button
              onClick={loadQueue}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition"
            >
              ↻ Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueManagement;
