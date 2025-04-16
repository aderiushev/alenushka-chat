import { useState } from 'react';
import {api} from "../api";
import {useNavigate} from "react-router-dom";
import {Input} from "@heroui/input";
import {Button, Form } from "@heroui/react";
import Header from "../components/Header";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    navigate('/rooms')
  };

  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <Form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h2 className="text-2xl mb-4 font-semibold">Вход</h2>
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
