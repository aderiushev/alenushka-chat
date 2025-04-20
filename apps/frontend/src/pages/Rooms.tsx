import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from "../api";
import {
  Button,
  Card,
  CardBody,
  CardFooter, Chip,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import Header from "@/components/Header.tsx";
import {useUser} from "@/hooks/useUser.ts";

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const { isLoading, user } = useUser();

  useEffect(() => {
    const f = async () => {
      const response = await api.get('/rooms')
      setRooms(response.data)
    }

    f()
  }, []);

  const onCopyDoctorLink = (id: string, doctorId: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${id}?doctorId=${doctorId}`)
  }

  const onCopyClientLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${id}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex sm:items-start justify-center overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-4 w-full overflow-y-auto">
          {rooms.length ? rooms.map((room) => (
            <Link to={`/room/${room.id}`} key={room.id}>
              <Card>
                <CardBody>
                  <CardBody className="flex flex-col gap-2">
                    <p>Врач: {room.doctor.name}</p>
                    <p className="flex-1">
                      Клиент: {room.patientName}
                    </p>
                    {room.messages[0] && (
                      <p className="truncate gap-1">
                        <span>Последнее сообщение: </span><span>{room.messages[0].content}</span>
                      </p>
                    )}
                  </CardBody>
                </CardBody>
                <CardFooter className="gap-2 flex flex-col">
                  {!isLoading && user?.role === 'admin' && (
                    <div className="flex gap-2 flex-col">
                      <Popover placement="right">
                        <PopoverTrigger>
                          <Button
                              color="primary"
                              size="sm"
                              onClick={(e) =>  {
                                e.preventDefault();
                                onCopyDoctorLink(room.id, room.doctor.id);
                              }}
                          >
                            Скопировать ссылку для доктора
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small">Ссылка скопирована</div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Popover placement="right">
                        <PopoverTrigger>
                          <Button
                            color="primary"
                            size="sm"
                            onClick={(e) =>  {
                              e.preventDefault();
                              onCopyClientLink(room.id);
                            }}
                          >
                            Скопировать ссылку для клиента
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small">Ссылка скопирована</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                  <div className="flex gap-1 flex-col items-center justify-center">
                    <p className="truncate gap-1 flex">
                      <span>Дата создания:</span><span>{new Date(room.createdAt).toLocaleDateString()}</span>
                    </p>
                    <p className="truncate gap-1 flex">
                      <span>Статус:</span>
                      <Chip className="text-white" size="sm" color={room.status === 'active' ? 'success' : 'danger'}>{room.status === 'active' ? 'Активна' : 'Завершена'}</Chip>
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          )) : (
            <div>
              <h3>У вас пока не было консультаций</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
