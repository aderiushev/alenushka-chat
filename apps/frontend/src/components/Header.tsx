import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Image} from "@heroui/react";

const Header = ()=>  {
  return (
      <Navbar>
        <NavbarBrand>
          <Link href="/">Алёнушка :: Онлайн-консультации</Link>
        </NavbarBrand>
        {/*<NavbarContent className="hidden sm:flex gap-4" justify="center">*/}
        {/*  <NavbarItem>*/}
        {/*    <Link color="foreground" href="#">*/}
        {/*      Features*/}
        {/*    </Link>*/}
        {/*  </NavbarItem>*/}
        {/*  <NavbarItem isActive>*/}
        {/*    <Link aria-current="page" href="#">*/}
        {/*      Customers*/}
        {/*    </Link>*/}
        {/*  </NavbarItem>*/}
        {/*  <NavbarItem>*/}
        {/*    <Link color="foreground" href="#">*/}
        {/*      Integrations*/}
        {/*    </Link>*/}
        {/*  </NavbarItem>*/}
        {/*</NavbarContent>*/}
        <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex">
            <Link href="/login">Вход</Link>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} color="primary" href="/register" variant="flat">
              Регистрация
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
  );
}

export default Header;
