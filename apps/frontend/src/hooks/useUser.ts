import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

export function useUser(): { user: JwtPayload | null; logout: () => void } {
  const token = localStorage.getItem('token');

  let user: JwtPayload | null = null;

  try {
    if (token) {
      const decoded: JwtPayload = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp >= currentTime) {
        user = decoded;
      } else {
        localStorage.removeItem('token');
      }
    }
  } catch {
    localStorage.removeItem('token');
  }

  const logout = () => {
    localStorage.removeItem('token');
  };

  return { user, logout };
}
