import { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import type { Appointment } from '../../types';

type ViewMode = 'month' | 'week' | 'day';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  doctor: string;
  color: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const CalendarView = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await adminService.getAllAppointments();
        setAppointments(data || []);
      } catch (error) {
        console.error('Failed to fetch calendar appointments:', error);
      }
    };
    fetchApps();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const calendarCells = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const eventsByDay = useMemo(() => {
    const grouped: Record<number, CalendarEvent[]> = {};
    
    appointments.forEach(app => {
      if (!app.date) return;
      const d = new Date(app.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!grouped[day]) grouped[day] = [];
        
        let color = 'bg-slate-100 text-slate-700 border-slate-200';
        if (app.status === 'confirmed') color = 'bg-blue-100 text-blue-700 border-blue-200';
        else if (app.status === 'completed') color = 'bg-green-100 text-green-700 border-green-200';
        else if (app.status === 'cancelled') color = 'bg-rose-100 text-rose-700 border-rose-200';
        else if (app.status === 'pending') color = 'bg-amber-100 text-amber-700 border-amber-200';
        
        grouped[day].push({
          id: app._id,
          title: app.patientName || 'Unknown Patient',
          time: app.time,
          doctor: app.doctorName || 'Unknown Doctor',
          color
        });
      }
    });
    
    return grouped;
  }, [appointments, year, month]);

  const selectedEvents = selectedDay ? eventsByDay[selectedDay] ?? [] : [];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar View</h1>
          <p className="text-slate-500 text-sm mt-0.5">Appointment calendar overview</p>
        </div>
        {/* View Toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {(['month', 'week', 'day'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                viewMode === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        {/* Calendar Grid */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
          {/* Month Nav */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-bold text-slate-900 text-lg">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7">
            {calendarCells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-slate-50" />;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;
              const events = eventsByDay[day] ?? [];
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[80px] p-2 border-b border-r border-slate-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-sm font-bold mb-1 ${
                    isToday ? 'bg-blue-600 text-white' : isSelected ? 'text-blue-700' : 'text-slate-700'
                  }`}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {events.slice(0, 2).map(e => (
                      <div key={e.id} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border truncate ${e.color}`}>
                        {e.time} · {e.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <p className="text-[10px] text-slate-400 font-medium ml-1">+{events.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar — Selected Day Events */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-5 h-fit">
          <h3 className="font-bold text-slate-900 mb-1">
            {selectedDay
              ? `${MONTHS[month]} ${selectedDay}, ${year}`
              : 'Select a day'}
          </h3>
          <p className="text-slate-400 text-xs mb-4">{selectedEvents.length} appointment{selectedEvents.length !== 1 ? 's' : ''}</p>

          {selectedEvents.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-slate-400 text-sm">No appointments this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map(e => (
                <div key={e.id} className={`p-3 rounded-xl border ${e.color}`}>
                  <p className="font-bold text-sm">{e.title}</p>
                  <p className="text-xs opacity-70 mt-0.5">{e.time} · {e.doctor}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
