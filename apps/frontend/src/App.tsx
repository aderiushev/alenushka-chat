import {Routes, Route, Navigate, Outlet} from 'react-router-dom';
import { HeroUIProvider } from "@heroui/react";
import Room from './pages/Room';
import Rooms from './pages/Rooms';
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateRoom from "./pages/CreateRoom";
import Index from "./pages/Index";
import {useUser} from "./hooks/useUser";

const ProtectedRoute = () => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
      <HeroUIProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/create" element={<CreateRoom />} />
          </Route>
        </Routes>
      </HeroUIProvider>
  );
}
