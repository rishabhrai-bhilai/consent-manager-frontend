import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Signup from './components/Signup';
import Dashboard from './pages/Dashboard';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import Request from './pages/Request';
import Documents from './pages/Documents';
import ConsentHistory from './pages/ConsentHistory';
import NotificationPage from './pages/NotificationPage';
import Unauthorized from './pages/Unauthorized';
import Missing from './pages/Missing';
import Admin from './pages/Admin';
import { useAuth } from './context/AuthProvider';
import RegistrationPending from './pages/RegistrationPending';
import RequestorConsentHistory from './pages/RequestorConsentHistory';
import RequestorDashboard from './pages/RequestorDashboard';

const ROLES = {
  individual: 'individual',
  requestor: 'requestor',
  admin: 'admin',
};

function App() {
  const { auth } = useAuth();
  const role = auth?.role;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/registration-pending" element={<RegistrationPending />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Redirect unauthenticated users to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected routes */}
      <Route path="/" element={<Layout role={role} />}>
        {/* Protected routes for providers */}
        <Route element={<RequireAuth allowedRole={ROLES.individual} />}>
          <Route path="/individual/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          {/* <Route path="/request" element={<Request />} /> */}
          <Route path="/history" element={<ConsentHistory />} />
          <Route path="/notification" element={<NotificationPage />} />
        </Route>

        {/* Protected routes for requestors */}
        <Route element={<RequireAuth allowedRole={ROLES.requestor} />}>
          <Route path="/requestor/dashboard" element={<RequestorDashboard />} />
          <Route path="/requestor/request" element={<Request />} />
          <Route path="/requestor/history" element={<RequestorConsentHistory />} />
          {/* Add requestor-specific routes here */}
        </Route>

        {/* Protected routes for admins */}
        <Route element={<RequireAuth allowedRole={ROLES.admin} />}>
          <Route path="/admin/dashboard" element={<Admin />} />
        </Route>
      </Route>

      {/* Catch-all route for 404 (moved outside Layout) */}
      <Route path="*" element={<Missing />} />
    </Routes>
  );
}

export default App;