import { useEffect, useState, useCallback } from 'react';
import { api } from '../api';

export function useRoom(id?: string) {
  const [room, setRoom] = useState<Room | null>(null);

  const fetchRoom = useCallback(async () => {
    if (!id) return;
    const response = await api.get(`/rooms/${id}`);
    setRoom(response.data);
  }, [id]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  return { room, refetch: fetchRoom };
}
