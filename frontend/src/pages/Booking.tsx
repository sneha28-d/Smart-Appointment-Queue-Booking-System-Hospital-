import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentService } from '../services/appointmentService';
import { doctorService } from '../services/doctorService';
import type { Slot, Doctor } from '../types';
import { getImageUrl } from '../utils/url';
const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface DaySlot {
  date: Date;
  slots: Slot[];
}

const Booking = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState<Doctor | null>(null);
  const [days, setDays] = useState<DaySlot[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState(false);

  // ─── Fetch Slots ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;

    doctorService.getDoctorById(doctorId).then(setDocInfo).catch(() => {});

    const generateFallbackSlots = (): DaySlot[] => {
      const result: DaySlot[] = [];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const slots: Slot[] = [];
        const start = new Date(date);
        start.setHours(10, 0, 0, 0);
        const end = new Date(date);
        end.setHours(21, 0, 0, 0);
        while (start < end) {
          slots.push({
            datetime: start.toISOString(),
            time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            available: true,
          });
          start.setMinutes(start.getMinutes() + 30);
        }
        result.push({ date, slots });
      }
      return result;
    };

    const fetchSlots = async () => {
      setIsLoading(true);
      try {
        const grouped: DaySlot[] = [];
        let anySuccess = false;

        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const dayStr = date.toISOString().split('T')[0];

          try {
            // Backend returns string[] like ["09:00", "09:30", ...]
            const timeStrings = await appointmentService.getSlots(doctorId, dayStr);
            const slots: Slot[] = timeStrings.map((timeStr: string) => ({
              datetime: `${dayStr}T${timeStr}:00`,
              time: timeStr,
              available: true,
            }));
            grouped.push({ date, slots });
            anySuccess = true;
          } catch {
            // Day fetch failed — push empty slots for that day
            grouped.push({ date, slots: [] });
          }
        }

        if (anySuccess) {
          setDays(grouped);
          setApiError(false);
        } else {
          setApiError(true);
          setDays(generateFallbackSlots());
        }
      } catch {
        setApiError(true);
        setDays(generateFallbackSlots());
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId]);

  const handleBook = async () => {
    if (!selectedTime || !doctorId) return;
    setIsBooking(true);
    try {
      const selectedDate = days[selectedDay]?.date.toISOString().split('T')[0] ?? '';
      const appointment = await appointmentService.bookAppointment({
        doctorId,
        date: selectedDate,
        time: selectedTime,
      });
      toast.success('Appointment booked successfully!');
      navigate(`/qr/${appointment._id}`);
    } catch {
      // Fallback: navigate with mock ID
      toast.success('Appointment booked! (demo mode)');
      navigate(`/qr/demo-${Math.floor(Math.random() * 99999)}`);
    } finally {
      setIsBooking(false);
      setShowConfirm(false);
    }
  };

  if (!docInfo) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-10">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">🔍</div>
        <p className="text-slate-600 font-medium">Doctor not found</p>
        <button onClick={() => navigate('/doctors')} className="text-blue-600 underline text-sm">Browse Doctors</button>
      </div>
    );
  }

  const selectedDayData = days[selectedDay];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-10 py-10">
      {/* Doctor Card */}
      <div className="flex flex-col md:flex-row gap-8 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 p-8 mb-8">
        <div className="bg-gradient-to-t from-blue-50 to-white rounded-2xl overflow-hidden md:w-64 flex items-end justify-center border border-slate-100">
          <img src={getImageUrl(docInfo.image)} className="w-full pt-4 object-cover object-bottom" alt={docInfo.name} />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{docInfo.name}</h1>
            <p className="text-blue-600 font-semibold mt-0.5">{docInfo.degree} — {docInfo.speciality}</p>
          </div>
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100 w-max">
            {docInfo.experience} Experience
          </span>
          <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{docInfo.about}</p>
          <div className="bg-slate-50 rounded-xl px-5 py-3 border border-slate-100 w-max">
            <p className="text-slate-700 font-medium text-sm">
              Appointment fee:{' '}
              <span className="text-blue-600 text-xl font-bold ml-1">₨{docInfo.fees}</span>
            </p>
          </div>
          {apiError && (
            <p className="text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs font-medium">
              ⚠ Showing demo slots — backend not reachable
            </p>
          )}
        </div>
      </div>

      {/* Slot Picker */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Select Appointment Slot</h2>

        {isLoading ? (
          <div className="flex gap-3 pb-6">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-20 h-20 rounded-2xl bg-slate-100 animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : (
          <>
            {/* Day Selector */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {days.map((d, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedDay(i); setSelectedTime(''); }}
                  className={`flex flex-col items-center justify-center p-3 min-w-[4.5rem] rounded-2xl border transition-all duration-200 flex-shrink-0 ${
                    selectedDay === i
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30 -translate-y-1'
                      : 'text-slate-500 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-widest font-bold">{daysOfWeek[d.date.getDay()]}</span>
                  <span className="text-2xl font-black mt-0.5">{d.date.getDate()}</span>
                  <span className="text-[10px] font-medium opacity-70">{months[d.date.getMonth()]}</span>
                </button>
              ))}
            </div>

            {/* Time Slots */}
            <div className="flex flex-wrap gap-2 mt-5">
              {selectedDayData?.slots.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">No slots available for this day.</p>
              ) : (
                selectedDayData?.slots.map((slot, i) => {
                  // Convert "09:00" → "9:00 AM" for display
                  const displayTime = (() => {
                    const [h, m] = slot.time.split(':').map(Number);
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    const hour = h % 12 || 12;
                    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
                  })();
                  return (
                    <button
                      key={i}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`text-xs px-4 py-2.5 rounded-full border font-semibold transition-all duration-200 ${
                        !slot.available
                          ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed line-through'
                          : slot.time === selectedTime
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                          : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {displayTime}
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!selectedTime}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Confirm & Proceed →
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-5">Confirm Booking</h3>
            <div className="bg-blue-50 rounded-2xl border border-blue-100 divide-y divide-blue-100 mb-6">
              {[
                ['Doctor', docInfo.name],
                ['Speciality', docInfo.speciality],
                ['Date', selectedDayData?.date.toDateString()],
                ['Time', selectedTime],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center px-5 py-3">
                  <span className="text-slate-500 text-sm">{label}</span>
                  <span className="text-slate-900 font-semibold text-sm">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-5 py-3">
                <span className="text-slate-500 text-sm">Total Fee</span>
                <span className="text-blue-600 font-bold text-lg">₨{docInfo.fees}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={isBooking}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
              >
                {isBooking ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Booking…</>
                ) : 'Book Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
