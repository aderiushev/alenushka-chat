import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import {Button, Form, Select, SelectItem} from "@heroui/react";
import {Input} from "@heroui/input";
import Header from "@/components/Header.tsx"; // Ensure the correct API call for room creation

export default function CreateRoom() {
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string, name: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/auth/users'); // Assuming /users API returns a list of users
        setUsers(response.data);
      } catch (error) {
        setError('Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      setError('Пожалуйста, выберите пользователя');
      return;
    }

    if (!patientName) {
      setError('Пожалуйста, укажите имя клиента');
      return;
    }

    setLoading(true);
    try {
      await api.post('/rooms', { userId: Number(selectedUserId), patientName });

      // After successful room creation, navigate back to rooms list
      navigate('/rooms');
    } catch (error) {
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex sm:items-center justify-center flex-1">
          <Form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h2 className="text-2xl mb-4 font-semibold">Создать консультацию</h2>
              <Select
                  placeholder="Выберите врача"
                  items={users}
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
              >
                {(user) => <SelectItem>{user.name}</SelectItem>}
              </Select>

              <Input
                  label="Имя клиента"
                  type="text"
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Введите имя"
                  required
              />

            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            <Button
                type="submit"
                color="primary"
                disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </Form>
        </div>
      </div>
  );
}
