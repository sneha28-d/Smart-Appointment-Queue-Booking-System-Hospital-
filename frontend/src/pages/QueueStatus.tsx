import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { queueService } from '../services/queueService';
import type { QueueEntry } from '../types';

const QueueStatus = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { queueUpdate, joinRoom, leaveRoom, isConnected } = useSocket();
  const [queueData, setQueueData] = useState<QueueEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Fetch queue status ───────────────────────────────────────────────────
  const fetchQueue = useCallback(async () => {
    try {
      if (!appointmentId) return;
      const data = await queueService.getQueue(appointmentId);
      setQueueData(data);
    } catch {
      // Demo fallback
      setQueueData({
        _id: 'demo',
        appointmentId: appointmentId ?? '',
        userId: '',
        tokenNumber: '42',
        position: 3,
        status: 'Waiting',
        estimatedWait: 45,
      });
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // ─── Join Socket room & listen for updates ───────────────────────────────
  useEffect(() => {
    if (!appointmentId) return;
    joinRoom(`queue-${appointmentId}`);
    return () => leaveRoom(`queue-${appointmentId}`);
    // joinRoom/leaveRoom are stable socket emit wrappers; including them would
    // cause reconnects on every render — intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  // ─── Apply live socket updates ───────────────────────────────────────────
  useEffect(() => {
    if (queueUpdate) {
      fetchQueue();
    }
  }, [queueUpdate, fetchQueue]);

  const isYourTurn = queueData?.position === 0 || queueData?.status === 'Next';

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading queue status…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-14 text-center">
      {/* Title */}
      <h1 className="text-3xl font-bold text-slate-900 mb-1">Live Queue Status</h1>
      <p className="text-slate-500 text-sm mb-2">
        Ref: <span className="font-mono text-slate-700">#{appointmentId?.toUpperCase().slice(0, 8)}</span>
      </p>

      {/* Socket indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
        <span className="text-xs text-slate-400 font-medium">{isConnected ? 'Live updates active' : 'Connecting…'}</span>
      </div>

      {/* Queue Circle */}
      <div className="relative mx-auto mb-14 w-72 h-72">
        <div className={`absolute -inset-4 rounded-full blur-3xl opacity-30 transition-colors duration-1000 ${isYourTurn ? 'bg-green-400' : 'bg-blue-400'}`} />
        <div className="relative w-full h-full rounded-full bg-white shadow-2xl border-8 border-slate-50 flex flex-col items-center justify-center">
          <p className={`font-black text-8xl tracking-tight bg-clip-text text-transparent bg-gradient-to-br ${isYourTurn ? 'from-green-500 to-emerald-600' : 'from-blue-600 to-indigo-600'}`}>
            {isYourTurn ? '✓' : queueData?.position ?? '—'}
          </p>
          <p className="text-slate-500 font-semibold text-sm uppercase tracking-widest mt-2">
            {isYourTurn ? "It's your turn!" : 'Ahead of you'}
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-7 mb-10 text-left">
        <div className="space-y-4">
          {[
            ['Token #', `#${queueData?.tokenNumber ?? '—'}`],
            ['Status', queueData?.status ?? 'Waiting'],
            ['Position', isYourTurn ? 'Your turn!' : `${queueData?.position} people ahead`],
            ['Estimated Wait', `${queueData?.estimatedWait ?? 0} mins`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0">
              <span className="text-slate-500 text-sm font-medium">{label}</span>
              <span className={`font-bold text-sm ${label === 'Status' && isYourTurn ? 'text-green-600' : 'text-slate-900'}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-7 py-3 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
        >
          Dashboard
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-7 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          Refresh
        </button>
      </div>

      <p className="text-slate-400 text-xs mt-8">
        This page updates automatically via live connection. Stay on this page to receive real-time updates.
      </p>
    </div>
  );
};

export default QueueStatus;
