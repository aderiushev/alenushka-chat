declare global {
  type User = {
    id: number;
    email: string;
    role: 'doctor' | 'admin';
    doctor?: Doctor;
    doctorId?: number;
  }

  type Doctor = {
    id: number;
    name: string;
    userId: number;
    user: User;
    description: string;
    imageUrl: string;
    externalUrl: string;
  }

  type Message = {
    id: string;
    userId?: number;
    type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO';
    content: string;
    createdAt: string;
    roomId: string;
    doctor?: Doctor
    doctorId?: number
  }

  type Room = {
    id: string;
    doctor: Doctor;
    doctorId: number;
    patientName: string;
    messages: Message[];
    createdAt: string;
    status: 'active' | 'completed';
  }

}

export {}
