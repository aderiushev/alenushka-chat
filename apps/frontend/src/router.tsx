import {
  createBrowserRouter,
  createRoutesFromElements, Navigate, Outlet,
  Route,
} from 'react-router-dom';
import AppLayout from './AppLayout';
import Room from './pages/Room';
import Rooms from './pages/Rooms';
import Login from './pages/Login';
import CreateRoom from './pages/CreateRoom';
import NotFound from './pages/NotFound';
import {useUser} from "@/hooks/useUser";
import DoctorRegister from "@/pages/DoctorRegister";
import DoctorsManagement from "@/pages/DoctorsManagement";

/**
 * ProtectedRoute component that enforces authentication and optional role-based access control
 * @param requiredRole - Optional role required to access the route ('admin' | 'doctor')
 */
const ProtectedRoute = ({ requiredRole }: { requiredRole?: 'admin' | 'doctor' }) => {
  const { user, isLoading } = useUser();

  // Show loading state while checking authentication
  if (isLoading || isLoading === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Redirect if user doesn't have required role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

/**
 * Wrapper component for general authenticated routes
 */
const AuthenticatedRoute = () => <ProtectedRoute />;

/**
 * Wrapper component for admin-only routes
 */
const AdminRoute = () => <ProtectedRoute requiredRole="admin" />;

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route path="/" element={<Login />} />
      <Route path="/room/:id" element={<Room />} />
      <Route element={<AuthenticatedRoute />}>
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/create" element={<CreateRoom />} />
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/auth/register" element={<DoctorRegister />} />
        <Route path="/doctors" element={<DoctorsManagement />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);
