// UserContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";

const UserContext = createContext(null as any);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | User>(null);
  const [isLoading, setIsLoading] = useState<boolean | null>(null);

  const isLoaded = isLoading === false;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        setUser(null);
        localStorage.removeItem("token");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    const me = await api.get('/auth/me');
    setUser(me.data);

    return me.data;
  };

  return (
    <UserContext.Provider value={{ user, isLoaded, logout, login }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
