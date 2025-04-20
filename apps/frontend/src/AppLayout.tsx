import {Outlet, useHref, useNavigate} from 'react-router-dom';
import { HeroUIProvider } from "@heroui/react";
import {UserProvider} from "@/hooks/useUser";

export default function AppLayout() {
  const navigate = useNavigate();

  return (
    <UserProvider>
      <HeroUIProvider navigate={navigate} useHref={useHref} className="hero-provider">
        <Outlet />
      </HeroUIProvider>
    </UserProvider>
  );
}
