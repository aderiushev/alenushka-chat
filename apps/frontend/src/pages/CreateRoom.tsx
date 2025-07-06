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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch users from the backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/auth/doctors'); // Assuming /users API returns a list of users
        setDoctors(response.data);
      } catch (error) {
        setError('Failed to fetch users');
      }
    };
    fetchDoctors();
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
      await api.post('/rooms', { userId: Number(selectedUserId), patientName: patientName.trim() });

      // After successful room creation, navigate back to rooms list
      navigate('/rooms');
    } catch (error) {
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <Form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
            <h2 className="text-2xl mb-4 font-semibold">Создать консультацию</h2>
              <Select
                placeholder="Выберите врача"
                items={doctors}
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
              >
                {(doctor) => <SelectItem>{doctor.name}</SelectItem>}
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
