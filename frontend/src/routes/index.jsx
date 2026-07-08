import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { useAuth } from '../hooks/useAuth';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import Landing from '../pages/Landing';
import About from '../pages/About';
import TermsOfService from '../pages/TermsOfService';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Citizen Pages
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import SubmitIssue from '../pages/citizen/SubmitIssue';
import MySubmissions from '../pages/citizen/MySubmissions';
import CitizenProfile from '../pages/citizen/Profile';
import CitizenNotifications from '../pages/citizen/Notifications';

// Officer Pages
import OfficerDashboard from '../pages/officer/OfficerDashboard';
import OfficerAnalytics from '../pages/officer/OfficerAnalytics';
import OfficerProjects from '../pages/officer/OfficerProjects';
import OfficerMap from '../pages/officer/OfficerMap';
import OfficerAIInsights from '../pages/officer/OfficerAIInsights';
import OfficerSubmissions from '../pages/officer/OfficerSubmissions';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminProjects from '../pages/admin/AdminProjects';
import AdminModeration from '../pages/admin/AdminModeration';
import AdminReports from '../pages/admin/AdminReports';
import AdminDatasets from '../pages/admin/AdminDatasets';

// Shared Pages
import AccountManagement from '../pages/shared/AccountManagement';
import CityComplaintMap from '../pages/shared/CityComplaintMap';
import SubmissionDetail from '../pages/shared/SubmissionDetail';
import TenderList from '../pages/shared/TenderList';
import TenderDetail from '../pages/shared/TenderDetail';

// Department Pages
import DepartmentDashboard from '../pages/department/DepartmentDashboard';
import DepartmentTenders from '../pages/department/DepartmentTenders';

// NGO Pages
import NGODashboard from '../pages/ngo/NGODashboard';

const AppRoutes = () => {
  const { user } = useAuth();

  // Root redirect based on role
  const getRootRedirect = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'officer') return '/officer';
    if (user.role === 'department') return '/department';
    if (user.role === 'ngo') return '/ngo';
    return '/citizen';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={user ? <Navigate to={getRootRedirect()} replace /> : <Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={user ? <Navigate to={getRootRedirect()} replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={getRootRedirect()} replace /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        
        {/* Shared Dashboard Routes (accessible by multiple roles) */}
        <Route element={<DashboardLayout />}>
          <Route path="/city-map" element={<CityComplaintMap />} />
          <Route path="/submissions/:id" element={<SubmissionDetail />} />
          <Route path="/tenders" element={<TenderList />} />
          <Route path="/tenders/:id" element={<TenderDetail />} />
        </Route>

        {/* Citizen Routes */}
        <Route path="/citizen" element={<RoleRoute allowedRoles={['citizen']} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<CitizenDashboard />} />
            <Route path="submit" element={<SubmitIssue />} />
            <Route path="submissions" element={<MySubmissions />} />
            <Route path="track/:id" element={<SubmissionDetail />} />
            <Route path="profile" element={<CitizenProfile />} />
            <Route path="notifications" element={<CitizenNotifications />} />
          </Route>
        </Route>

        {/* Officer Routes */}
        <Route path="/officer" element={<RoleRoute allowedRoles={['officer', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<OfficerDashboard />} />
            <Route path="analytics" element={<OfficerAnalytics />} />
            <Route path="submissions" element={<OfficerSubmissions />} />
            <Route path="submit" element={<SubmitIssue />} />
            <Route path="projects" element={<OfficerProjects />} />
            <Route path="map" element={<OfficerMap />} />
            <Route path="ai-insights" element={<OfficerAIInsights />} />
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="profile" element={<CitizenProfile />} />
            <Route path="notifications" element={<CitizenNotifications />} />
          </Route>
        </Route>


        <Route path="/admin" element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="moderation" element={<AdminModeration />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="datasets" element={<AdminDatasets />} />
            <Route path="profile" element={<CitizenProfile />} />
          </Route>
        </Route>

        {/* Department Routes */}
        <Route path="/department" element={<RoleRoute allowedRoles={['department', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DepartmentDashboard />} />
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="submissions" element={<OfficerSubmissions />} />
            <Route path="submit" element={<SubmitIssue />} />
            <Route path="projects" element={<OfficerProjects />} />
            <Route path="tenders" element={<DepartmentTenders />} />
            <Route path="tenders/:action" element={<DepartmentTenders />} />
            <Route path="tenders/:action/:id" element={<DepartmentTenders />} />
            <Route path="analytics" element={<OfficerAnalytics />} />
            <Route path="profile" element={<CitizenProfile />} />
          </Route>
        </Route>

        {/* NGO Routes */}
        <Route path="/ngo" element={<RoleRoute allowedRoles={['ngo', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<NGODashboard />} />
            <Route path="submissions" element={<OfficerSubmissions />} />
            <Route path="submit" element={<SubmitIssue />} />
            <Route path="profile" element={<CitizenProfile />} />
            <Route path="notifications" element={<CitizenNotifications />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
