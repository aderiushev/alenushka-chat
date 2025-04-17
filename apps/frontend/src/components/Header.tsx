import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@heroui/react";
import { useUser } from "@/hooks/useUser.ts";
import {useNavigate} from "react-router-dom";

const Header = ()=>  {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const onLogout = () => {
    if (user) {
      logout();
      navigate('/login')
    }
  }

  return (
    <Navbar
        className="p-2"
        // @ts-ignore
        style={{ '--navbar-height': 'auto' }}
        classNames={{ wrapper: "flex flex-col sm:flex-row" }}
    >
      <NavbarBrand>
        {user && (
          <h3>
            {user.name} ({user.role})
          </h3>
        )}
        <Link href="/">Алёнушка :: Онлайн-консультации</Link>
      </NavbarBrand>
      {user && (
        <NavbarContent className="sm:flex gap-4" justify="center">
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

          {user.role === 'admin' && (
            <NavbarItem>
              <Button onPress={onLogout}>
                Выход
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>
      )}

      {!user && (
        <NavbarContent justify="end">
          <NavbarItem>
            <Button as={Link} color="primary" href="/login" variant="bordered">Вход</Button>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} color="primary" href="/register" variant="flat">
              Регистрация
            </Button>
          </NavbarItem>
        </NavbarContent>
      )}
    </Navbar>
  );
}

export default Header;
