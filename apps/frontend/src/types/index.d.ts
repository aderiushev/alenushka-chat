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
    pending?: boolean;
    pendingDelete?: boolean;
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

  /**
   * Form data interface for doctor registration
   */
  interface DoctorRegistrationForm {
    email: string;
    password: string;
    name: string;
    description: string;
    imageUrl: string;
    externalUrl: string;
  }

  /**
   * Response interface for doctor registration
   */
  interface DoctorRegistrationResponse {
    user: {
      id: number;
      email: string;
      role: string;
    };
    doctor: {
      id: number;
      name: string;
      description: string;
      imageUrl: string;
      externalUrl: string;
      userId: number;
    };
    credentials: {
      email: string;
      password: string;
    };
  }

}

export {}
