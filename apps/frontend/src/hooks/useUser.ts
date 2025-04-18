import { useState, useEffect } from "react";
import { api } from "../api";

export function useUser() {
  const [user, setUser] = useState<null | User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
      })
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

  return { user, isLoading, logout };
}
