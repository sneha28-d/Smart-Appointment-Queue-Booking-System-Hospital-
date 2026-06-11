import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import type { WorkingHour } from '../../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ScheduleForm {
  slotDuration: number;
  workingHours: WorkingHour[];
}

const DEFAULT_HOURS: WorkingHour[] = DAYS.map(day => ({
  day,
  startTime: '09:00',
  endTime: '17:00',
  isWorking: day !== 'Sunday',
}));

const ManageSchedule = () => {
  const [isSaved, setIsSaved] = useState(false);

  const { register, handleSubmit, control, watch, formState: { isSubmitting, isDirty } } = useForm<ScheduleForm>({
    defaultValues: {
      slotDuration: 30,
      workingHours: DEFAULT_HOURS,
    },
  });

  const { fields } = useFieldArray({ control, name: 'workingHours' });
  // eslint-disable-next-line react-hooks/incompatible-library
  const workingHours = watch('workingHours');

  const onSubmit = async (data: ScheduleForm) => {
    try {
      await adminService.createSchedule({
        doctorId: 'default',
        slotDuration: Number(data.slotDuration),
        workingHours: data.workingHours,
      });
      toast.success('Schedule saved successfully!');
      setIsSaved(true);
    } catch {
      toast.error('Failed to save schedule');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-10 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Manage Schedule</h1>
        <p className="text-slate-500 text-sm mt-0.5">Set working hours and slot durations</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Slot Duration */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
          <h2 className="font-bold text-slate-900 mb-4">Slot Duration</h2>
          <div className="flex gap-3 flex-wrap">
            {[15, 20, 30, 45, 60].map(mins => (
              <label key={mins} className="cursor-pointer">
                <input type="radio" value={mins} {...register('slotDuration')} className="sr-only peer" />
                <span className="px-5 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 peer-checked:shadow-lg peer-checked:shadow-blue-600/30 transition-all hover:border-blue-400 block">
                  {mins} min
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
          <h2 className="font-bold text-slate-900 mb-5">Working Hours</h2>
          <div className="space-y-3">
            {fields.map((field, index) => {
              const isWorking = workingHours[index]?.isWorking;
              return (
                <div
                  key={field.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    isWorking ? 'border-blue-100 bg-blue-50/40' : 'border-slate-100 bg-slate-50/40 opacity-60'
                  }`}
                >
                  {/* Day Toggle */}
                  <label className="flex items-center gap-2.5 cursor-pointer min-w-[140px]">
                    <input type="checkbox" {...register(`workingHours.${index}.isWorking`)} className="sr-only peer" />
                    <div className="w-9 h-5 rounded-full bg-slate-200 peer-checked:bg-blue-600 relative transition-colors after:content-[''] after:absolute after:w-3.5 after:h-3.5 after:rounded-full after:bg-white after:top-0.5 after:left-0.5 peer-checked:after:translate-x-4 after:transition-transform after:shadow-sm" />
                    <span className="text-sm font-semibold text-slate-800">{field.day}</span>
                  </label>

                  {/* Time Range */}
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      {...register(`workingHours.${index}.startTime`)}
                      disabled={!isWorking}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-500 disabled:opacity-40 w-28"
                    />
                    <span className="text-slate-400 text-sm font-medium">to</span>
                    <input
                      type="time"
                      {...register(`workingHours.${index}.endTime`)}
                      disabled={!isWorking}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-500 disabled:opacity-40 w-28"
                    />
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${isWorking ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                    {isWorking ? 'Open' : 'Closed'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3">
          {isSaved && !isDirty && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 flex items-center gap-2 transition-all"
          >
            {isSubmitting
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
              : 'Save Schedule'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageSchedule;
