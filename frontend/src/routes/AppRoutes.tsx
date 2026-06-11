import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Public pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Doctors from '../pages/Doctors';

// Customer pages
import Dashboard from '../pages/Dashboard';
import Booking from '../pages/Booking';
import MyAppointments from '../pages/MyAppointments';
import AppointmentDetail from '../pages/AppointmentDetail';
import QRCodeView from '../pages/QRCodeView';
import QueueStatus from '../pages/QueueStatus';
import MyProfile from '../pages/MyProfile';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageServices from '../pages/admin/ManageServices';
import ManageSchedule from '../pages/admin/ManageSchedule';
import ManageAppointments from '../pages/admin/ManageAppointments';
import QueueManagement from '../pages/admin/QueueManagement';
import CalendarView from '../pages/admin/CalendarView';
import NotificationsPanel from '../pages/admin/NotificationsPanel';
import ManageDoctors from '../pages/admin/ManageDoctors';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ─── Public ─────────────────────────────────────────────────────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/doctors" element={<Doctors />} />

      {/* ─── Customer (Protected) ────────────────────────────────────────────── */}
      <Route path="/dashboard" element={<ProtectedRoute role="customer"><Dashboard /></ProtectedRoute>} />
      <Route path="/booking/:doctorId" element={<ProtectedRoute role="customer"><Booking /></ProtectedRoute>} />
      <Route path="/my-appointments" element={<ProtectedRoute role="customer"><MyAppointments /></ProtectedRoute>} />
      <Route path="/appointment/:id" element={<ProtectedRoute role="customer"><AppointmentDetail /></ProtectedRoute>} />
      <Route path="/qr/:appointmentId" element={<ProtectedRoute role="customer"><QRCodeView /></ProtectedRoute>} />
      <Route path="/queue/:appointmentId" element={<ProtectedRoute role="customer"><QueueStatus /></ProtectedRoute>} />
      <Route path="/my-profile" element={<ProtectedRoute role="customer"><MyProfile /></ProtectedRoute>} />

      {/* ─── Admin (Protected) ───────────────────────────────────────────────── */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/doctors" element={<ProtectedRoute role="admin"><ManageDoctors /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute role="admin"><ManageServices /></ProtectedRoute>} />
      <Route path="/admin/schedule" element={<ProtectedRoute role="admin"><ManageSchedule /></ProtectedRoute>} />
      <Route path="/admin/appointments" element={<ProtectedRoute role="admin"><ManageAppointments /></ProtectedRoute>} />
      <Route path="/admin/queue" element={<ProtectedRoute role="admin"><QueueManagement /></ProtectedRoute>} />
      <Route path="/admin/calendar" element={<ProtectedRoute role="admin"><CalendarView /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><NotificationsPanel /></ProtectedRoute>} />

      {/* ─── Fallback ────────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
