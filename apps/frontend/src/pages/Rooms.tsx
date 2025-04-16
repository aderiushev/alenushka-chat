import { useEffect, useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { api } from "../api";
import { useUser } from "../hooks/useUser";
import {Button} from "@heroui/react";

interface Room {
  id: string;
  createdAt: string;
  messages: {
    id: string;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'FILE';
  }[];
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/rooms').then((res) => setRooms(res.data));
  }, []);

  const handleCreateRoom = () => {
    navigate('/rooms/create')
  };

  return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Rooms</h1>

        {/* Create Room Button */}
        <div className="mb-6 text-right">
          <Button
            color="primary"
            onPress={handleCreateRoom}
          >
            Create Room
          </Button>
        </div>

        {/* Rooms List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
              <div key={room.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-4 border-b">
                  <Link
                      to={`/room/${room.id}`}
                      className="text-xl font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Room {room.id}
                  </Link>
                </div>
                {room.messages[0] && (
                    <div className="p-4 bg-gray-50">
                      <p className="text-gray-500 text-sm truncate">
                        <span className="font-semibold">Last message:</span> {room.messages[0].content}
                      </p>
                    </div>
                )}
                <div className="p-4 bg-gray-100 text-center text-gray-600 text-xs">
                  Created on: {new Date(room.createdAt).toLocaleDateString()}
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}
