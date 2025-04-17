declare global {
  type User = {
    id: number;
    name: string;
  }

  type Message = {
    id: string;
    userId?: number;
    type: 'TEXT' | 'IMAGE' | 'FILE';
    content: string;
    createdAt: string;
    roomId: string;
    user?: User
  }

  type Room = {
    id: string;
    user: User;
    patientName: string;
    messages: Message[];
    createdAt: string;
  }
}

export {}
