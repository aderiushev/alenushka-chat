import { useEffect, useState } from 'react';
import { api } from '../api';

export function useRoom(id?: string) {
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/rooms/${id}`).then((res) => setRoom(res.data));
  }, [id]);

  return room;
}
