import {Outlet, useHref, useNavigate} from 'react-router-dom';
import { HeroUIProvider } from "@heroui/react";

export default function AppLayout() {
  const navigate = useNavigate();

  return (
      <HeroUIProvider navigate={navigate} useHref={useHref} className="hero-provider">
        <Outlet />
      </HeroUIProvider>
  );
}
