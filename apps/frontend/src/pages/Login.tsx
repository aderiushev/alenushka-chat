import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from "react-router-dom";
import {Input} from "@heroui/input";
import {Button, Form, Link} from "@heroui/react";
import Header from "../components/Header";
import { useUser } from "@/hooks/useUser";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const { user, login } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  useEffect(() => {
    if (user) {
      if (roomId) {
        navigate(`/room/${roomId}`);
      } else {
        navigate('/rooms');
      }
    }
  }, [user]);

  return (
      <div className="min-h-screen flex flex-col flex-1">
        <Header />
        <div className="flex sm:items-center justify-center flex-1">
          <Form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <div className="flex items-center flex-col self-center">
              {user && (
                <>
                  <Link className="text-2xl font-semibold" href="/rooms">Список консультаций</Link>
                  <div>или</div>
                </>
              )}
              <h2 className="text-2xl mb-4 font-semibold">Вход</h2>
            </div>
            <Input
              type="email"
              placeholder="Эл. почта"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button type="submit" color="primary">
              Войти
            </Button>
          </Form>
        </div>
      </div>
  );
}
