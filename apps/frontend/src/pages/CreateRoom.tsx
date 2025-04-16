import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import {Button, Form} from "@heroui/react"; // Ensure the correct API call for room creation

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
      setError('Please select a user');
      return;
    }

    if (!patientName) {
      setError('Please select a patient name');
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
      <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">Create Room</h1>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <Form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userSelect" className="block text-gray-700 mb-2">
              Select User
            </label>
            <select
                id="userSelect"
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            >
              <option value="" disabled>Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="roomName" className="block text-gray-700 mb-2">
              Patient name
            </label>
            <input
                type="text"
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Patient name"
                required
            />
          </div>

          <Button
              type="submit"
              color="primary"
              disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Room'}
          </Button>
        </Form>
      </div>
  );
}
