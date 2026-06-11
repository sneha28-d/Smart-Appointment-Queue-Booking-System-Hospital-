// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface AuthData extends User {
  token: string;
}

export interface AuthResponse {
  msg: string;
  sucess: boolean;
  data: AuthData;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Slot {
  _id?: string;
  datetime: string;      // ISO string
  time: string;          // "10:00 AM"
  available: boolean;
}

export interface Appointment {
  _id: string;
  user: User | string;
  patientName?: string;
  tokenNumber?: string | number;
  doctorId: string;
  doctorName: string;
  doctorImage?: string;
  doctorSpeciality?: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  fees: number;
  qrCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookAppointmentPayload {
  doctorId: string;
  date: string;
  time: string;
  notes?: string;
}

export interface UpdateAppointmentPayload {
  date?: string;
  time?: string;
  status?: AppointmentStatus;
  notes?: string;
}

// ─── Queue ────────────────────────────────────────────────────────────────────

export type QueueStatus =
  | 'Waiting' | 'Next' | 'Completed' | 'Skipped'   // display values (from backend mapper)
  | 'waiting' | 'in_progress' | 'completed' | 'skipped'; // raw backend values

export interface QueueEntry {
  _id: string;
  appointmentId: string;
  appointmentRef?: string;   // last 8 chars of appointmentId, uppercased
  userId: string;
  patientName?: string;
  doctorName?: string;
  time?: string;
  date?: string;
  tokenNumber: string | number;
  position: number;
  status: QueueStatus;
  estimatedWait: number; // minutes
  checkedInAt?: string;
}

// ─── Services & Schedule ─────────────────────────────────────────────────────

export interface Service {
  _id: string;
  name: string;
  description?: string;
  duration: number;   // minutes
  fees: number;
  isActive: boolean;
}

export interface WorkingHour {
  day: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface Schedule {
  _id?: string;
  doctorId: string;
  workingHours: WorkingHour[];
  slotDuration: number; // minutes
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface BookingTrend {
  date: string;
  count: number;
}

export interface PeakHour {
  hour: string;
  count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface Analytics {
  totalBookings: number;
  activeQueue: number;
  completedToday: number;
  cancelledToday: number;
  revenue: number;
  bookingTrends: BookingTrend[];
  peakHours: PeakHour[];
  statusDistribution: StatusDistribution[];
}

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  fees: number;
  image: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'booking' | 'cancellation' | 'queue' | 'system';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

// ─── API Response Wrapper ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  sucess: boolean;
  data: T;
  msg: string;
  error?: string;
}
