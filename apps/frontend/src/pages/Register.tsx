import { useState } from 'react';
import {api} from "../api";
import {useNavigate} from "react-router-dom";
import Header from "../components/Header";
import {Button, Form} from "@heroui/react";
import {Input} from "@heroui/input";

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post('/auth/register', { email, password, name });
    localStorage.setItem('token', res.data.token);
    navigate('/rooms');
  };

  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex sm:items-center justify-center flex-1">
          <Form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h2 className="text-2xl mb-4 font-semibold">Регистрация</h2>
            <Input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={e => setName(e.target.value)}
            />
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
              Зарегистрироваться
            </Button>
          </Form>
        </div>
      </div>
  );
}
