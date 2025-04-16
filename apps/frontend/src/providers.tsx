import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      {children}
    </HeroUIProvider>
  );
}

export default Providers;
