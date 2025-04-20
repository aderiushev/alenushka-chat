import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@heroui/react";
import { useUser } from "@/hooks/useUser.ts";
import {useNavigate} from "react-router-dom";

const Header = ()=>  {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const onLogout = () => {
    if (user) {
      logout();
      navigate('/')
    }
  }

  return (
    <Navbar
      className="p-2 flex"
      // @ts-ignore
      style={{ '--navbar-height': 'auto' }}
      classNames={{ wrapper: "flex flex-col sm:flex-row max-w-none" }}
    >
      <NavbarBrand className="gap-2 flex-col sm:flex-row">
        {user && (
          <h3>
            {user.doctor? user.doctor.name : user.email}
          </h3>
        )}
        <Link href="/login">Алёнушка :: Онлайн-консультации</Link>
      </NavbarBrand>
      {user && (
        <NavbarContent className="flex gap-4 flex-col sm:flex-row" justify="center">
          {user.role === 'admin' && (
            <>
              <NavbarItem>
                <Link color="success" href="/rooms">
                  Список консультаций
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link color="danger" href="/rooms/create">
                   Создать консультацию
                </Link>
              </NavbarItem>
            </>
          )}

          {user.role && (
            <NavbarItem>
              <Button onPress={onLogout}>
                Выход
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>
      )}
    </Navbar>
  );
}

export default Header;
