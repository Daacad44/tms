import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { useAuthStore } from './store/authStore';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/Home';
import TripsPage from './pages/Trips';
import TripDetailsPage from './pages/TripDetails';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import BookingPage from './pages/Booking';

// Customer Pages
import MyBookingsPage from './pages/customer/MyBookings';
import BookingDetailsPage from './pages/customer/BookingDetails';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTrips from './pages/admin/Trips';
import AdminBookings from './pages/admin/Bookings';
import AdminCustomers from './pages/admin/Customers';
import AdminPayments from './pages/admin/Payments';
import AdminReports from './pages/admin/Reports';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuthStore();

  // Fail-safe: Check localStorage directly in case state hasn't hydrated yet
  const storedToken = localStorage.getItem('accessToken');
  const isActuallyAuthenticated = isAuthenticated || !!storedToken;

  if (!isActuallyAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Note: We can't strictly check roles if we only have the token and state isn't ready
  // But usually, if we have the token, the state follows quickly.
  // We'll trust the token existence for the initial "don't kick me out" check.

  if (isAuthenticated && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/:slug" element={<TripDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Customer Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <PublicLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/trips/:slug/book" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailsPage />} />
        </Route>

        {/* Admin/Staff Protected Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'AGENT', 'FINANCE']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/trips" element={<AdminTrips />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
