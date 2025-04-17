import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useSocketStore } from '../store/socketStore';
import { api } from '../api';
import {useUser} from "../hooks/useUser";
import {useRoom} from "../hooks/useRoom";
import {Textarea} from "@heroui/input";
import {Button, Link} from "@heroui/react";
// @ts-ignore
import messageSound from '../../public/sounds/new-message.mp3';
import {JwtPayload} from "jwt-decode";

export default function Room() {
  const { id } = useParams();
  const connect = useSocketStore((s) => s.connect);
  const messages = useSocketStore((s) => s.messages);
  const [onlineUsers, setOnlineUsers] = useState<(string | number)[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isTabFocused, setIsTabFocused] = useState(true);
  const originalTitle = useRef(document.title);
  const flickerInterval = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const socket = useSocketStore((state) => state.socket);
  const sendMessage = useSocketStore((s) => s.sendMessage);
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useUser();
  const room = useRoom(id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (id) connect(id);
  }, [id, connect]);

  useEffect(() => {
    if (!socket) return;

    socket.on('online-users', (users: string[]) => {
      setOnlineUsers(users);
    });

    socket.on('user-online', ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    socket.on('user-offline', ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.on('new-message', ({ clientId }) => {
      if (socket.id === clientId) return;
      const event = new CustomEvent('new-message-received');
      window.dispatchEvent(event);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || !id) return;

    sendMessage({ roomId: id, userId: user.user ? Number(user.user.sub) : undefined, type: 'TEXT', content: text });
    setText('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/upload/file', formData);
    const url = res.data.url;

    const type = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
    sendMessage({ roomId: id, userId: user.user ? Number(user.user.sub) : undefined, type, content: url });
  };

  const handleTyping = () => {
    if (socket && id) {
      socket.emit('typing', id);
    }
  };

  useEffect(() => {
    if (!socket || !id) return;

    socket.on('typing', (clientId: string) => {
      if (socket.id === clientId) return;
      setIsTyping(true);
      const timeout = setTimeout(() => setIsTyping(false), 3000);
      return () => clearTimeout(timeout);
    });

    return () => {
      socket.off('typing');
    };
  }, [socket, id]);

  useEffect(() => {
    const handleFocus = () => {
      setIsTabFocused(true);
      document.title = originalTitle.current;
      if (flickerInterval.current) {
        clearInterval(flickerInterval.current);
        flickerInterval.current = null;
      }
    };

    const handleBlur = () => {
      setIsTabFocused(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleNewMessage = () => {
      if (!isTabFocused) {
        if (!audioRef.current) {
          audioRef.current = new Audio(messageSound);
        }
        audioRef.current.play().catch((err) => {
          console.warn('Sound not played:', err.message);
        });

        let visible = false;
        flickerInterval.current = setInterval(() => {
          document.title = visible ? '(New message)' : originalTitle.current;
          visible = !visible;
        }, 1000);
      }
    };

    window.addEventListener('new-message-received', handleNewMessage);
    return () => {
      window.removeEventListener('new-message-received', handleNewMessage);
    };
  }, [isTabFocused]);

  const getSenderName = (user: JwtPayload | null, message: Message, room: Room): string => {
    const currentUserId = Number(user?.sub);

    if (user) {
      return currentUserId === message.userId ? 'Вы' : room.patientName;
    }

    return message.userId ? room.user.name : 'Вы';
  };

  const isMe = (user: JwtPayload | null, message: Message): boolean => {
    const currentUserId = Number(user?.sub);

    if (user) {
      return currentUserId === message.userId;
    }

    return !message.userId;
  };

  if (!room) return null

  const isPatientConnected = ((typeof socket?.id === 'string' || typeof socket?.id === 'number') && onlineUsers.includes(socket.id))
      || (onlineUsers.length > 1 && onlineUsers.includes(room.user.id));

  return (
      <div className="flex flex-col h-screen">
        <div className="p-4 border-b bg-white shadow z-10">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold items-center gap-2 flex justify-between flex-col sm:flex-row">
              {user.user && user.user.role === 'admin' && (
                <Link href="/rooms">Назад к списку</Link>
              )}
              <span>Он-лайн консультация</span>
              <span className="flex flex-col gap-4 sm:flex-row">
                <span className="flex items-center gap-1">
                  <span className={`flex w-3 h-3 rounded-full ${isPatientConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{room.patientName}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className={`flex w-3 h-3 rounded-full ${onlineUsers.includes(room.user.id) ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Вы ({room.user.name})</span>
                </span>
              </span>
            </h1>
            {isTyping && (
              <span className="text-sm text-gray-500">Пользователь печатает...</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto gap-1 flex flex-col p-4 bg-gray-50">
          {messages.map((m) => (
            <div key={m.id} className={`border-b p-2 rounded-lg shadow-sm ${isMe(user.user, m) && 'bg-primary-50'}`}>
              <strong>{getSenderName(user.user, m, room)}:</strong>

              {m.type === 'TEXT' && (
                <div className="whitespace-pre-wrap">{m.content}</div>
              )}
              {m.type === 'IMAGE' && (
                <>
                  <img src={m.content} className="w-32 mt-1" alt="uploaded" />
                  <Link
                    href={m.content}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Открыть
                  </Link>
                </>
              )}
              {m.type === 'FILE' && (
                <Link
                  href={m.content}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  Скачать файл
                </Link>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-white flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                handleSend();
              }
            }}
            rows={3}
            placeholder="Введите сообщение"
          />

          <div className="flex gap-2 justify-between w-full md:w-auto">
            <Button
              color="primary"
              onPress={handleSend}
            >
              Отправить
            </Button>

            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
                htmlFor="file"
                className="whitespace-nowrap inline-block cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-[12px] px-[16px] hover:bg-blue-500 transition"
            >
              Прикрепить файл
            </label>
          </div>
        </div>
      </div>
  );
}
