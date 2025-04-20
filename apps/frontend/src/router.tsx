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


const ProtectedRoute = () => {
  const { user, isLoading } = useUser();

  if (!isLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route path="/" element={<Login />} />
      <Route path="/room/:id" element={<Room />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/create" element={<CreateRoom />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);
