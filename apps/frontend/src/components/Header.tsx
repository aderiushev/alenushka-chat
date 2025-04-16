import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Image} from "@heroui/react";
import {useUser} from "@/hooks/useUser.ts";

const Header = ()=>  {
  const { user } = useUser();

  return (
      <Navbar
          className="p-2"
          style={{ '--navbar-height': 'auto' }}
          classNames={{ wrapper: "flex flex-col sm:flex-row" }}
      >
        <NavbarBrand>
          <Link href="/">Алёнушка :: Онлайн-консультации</Link>
        </NavbarBrand>
        {user && (
          <NavbarContent className="hidden sm:flex gap-4" justify="center">
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
