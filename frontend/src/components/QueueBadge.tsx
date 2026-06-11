type QueueStatus = 'Waiting' | 'Next' | 'Completed' | 'Cancelled';

interface QueueBadgeProps {
  status: QueueStatus;
}

const statusConfig: Record<QueueStatus, { label: string; color: string; dot: string }> = {
  Waiting:   { label: 'Waiting',   color: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  Next:      { label: 'Next Up',   color: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-500 animate-pulse' },
  Completed: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500' },
  Cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-500 border-red-200',        dot: 'bg-red-400' },
};

const QueueBadge = ({ status }: QueueBadgeProps) => {
  const config = statusConfig[status] ?? statusConfig.Waiting;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default QueueBadge;
