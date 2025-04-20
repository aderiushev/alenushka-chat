import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import RecordRTC from 'recordrtc';
import { useSearchParams } from 'react-router-dom';
import { useSocketStore } from '../store/socketStore';
import { api } from '../api';
import {useUser} from "../hooks/useUser";
import {useRoom} from "../hooks/useRoom";
import {Textarea} from "@heroui/input";
import {Avatar, Button, Checkbox, Link} from "@heroui/react";
// @ts-ignore
import messageSound from '../../public/sounds/new-message.mp3';
import {useDoctor} from "@/hooks/useDoctor";
import {useNavigationBlock} from "@/hooks/useNavigationBlock.ts";

type IconProps = {
  width?: number;
  height?: number;
  fill?: string;
}

const SendIcon = (props: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
    <path d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376v103.3c0 18.1 14.6 32.7 32.7 32.7 9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.5-31.2s-23.3-7.5-34-1.4zm52.1 25.5L409.7 90.6 190.1 336l1.2 1zm335.1 139.7-166.6-69.5 214.1-239.3z"></path>
  </svg>
);

const FileIcon = (props: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
    <path d="M364.2 83.8c-24.4-24.4-64-24.4-88.4 0l-184 184c-42.1 42.1-42.1 110.3 0 152.4s110.3 42.1 152.4 0l152-152c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-152 152c-64 64-167.6 64-231.6 0s-64-167.6 0-231.6l184-184c46.3-46.3 121.3-46.3 167.6 0s46.3 121.3 0 167.6l-176 176c-28.6 28.6-75 28.6-103.6 0s-28.6-75 0-103.6l144-144c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-144 144c-6.7 6.7-6.7 17.7 0 24.4s17.7 6.7 24.4 0l176-176c24.4-24.4 24.4-64 0-88.4"></path>
  </svg>
);

const CloseIcon = (props: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" {...props}>
    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3l105.4 105.3c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256z"></path>
  </svg>
);

const StartRecordingIcon = (props: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" {...props}>
    <path d="M192 0c-53 0-96 43-96 96v160c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96M64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464h-48c-13.3 0-24 10.7-24 24s10.7 24 24 24h144c13.3 0 24-10.7 24-24s-10.7-24-24-24h-48v-33.6c85.8-11.7 152-85.3 152-174.4v-40c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128S64 326.7 64 256z"></path>
  </svg>
);

const StopRecordingIcon = (props: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
    <path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512m-64-352h128c17.7 0 32 14.3 32 32v128c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V192c0-17.7 14.3-32 32-32"></path>
  </svg>
);

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
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctorId');

  const socket = useSocketStore((state) => state.socket);
  const sendMessage = useSocketStore((s) => s.sendMessage);
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mediaRecorderRef = useRef<RecordRTC | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const { user } = useUser();
  const { room, refetch } = useRoom(id);
  const { doctor } = useDoctor(room?.doctorId);
  const navigate = useNavigate();
  const [agree, setAgree] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false
  })
  const [isAgreed, setIsAgreed] = useState<boolean>(!!localStorage.getItem('isAgreed'));

  useNavigationBlock(textareaRef);

  useEffect(() => {
    if (room && doctorId && !user) {
      navigate(`/login?roomId=${room.id}`);
    }

    if (room && user && doctorId && Number(doctorId) !== user.doctorId && user.role !== 'admin') {
      navigate(`/login?roomId=${room.id}`);
    }
  }, [doctorId, user, room]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();

  }, []);

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


  // const handleStartRecording = async () => {
  //   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //
  //   const mimeType = MediaRecorder.isTypeSupported('audio/mp4')
  //       ? 'audio/mp4'
  //       : MediaRecorder.isTypeSupported('audio/webm')
  //           ? 'audio/webm'
  //           : '';
  //
  //   const mediaRecorder = new MediaRecorder(stream, {
  //     mimeType
  //   });
  //   const audioChunks: Blob[] = [];
  //
  //   mediaRecorderRef.current = mediaRecorder;
  //   mediaRecorder.ondataavailable = (event) => {
  //     audioChunks.push(event.data);
  //   };
  //   mediaRecorder.onstop = async () => {
  //     const audioBlob = new Blob(audioChunks, { type:mimeType });
  //     const file = new File([audioBlob], 'voice-message.webm');
  //
  //     const formData = new FormData();
  //     formData.append('file', file);
  //
  //     const res = await api.post('/upload/file', formData);
  //     const url = res.data.url;
  //
  //     if (id) {
  //       sendMessage({ roomId: id, doctorId: doctor ? doctor.id : undefined, type: 'AUDIO', content: url });
  //     }
  //   };
  //
  //   mediaRecorder.start();
  //   setIsRecording(true);
  // };

  // const handleStopRecording = () => {
  //   if (mediaRecorderRef.current) {
  //     mediaRecorderRef.current.stop();
  //     setIsRecording(false);
  //   }
  // };

  useEffect(() => {
    const initRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new RecordRTC(stream, { type: 'audio', mimeType: "audio/webm;codecs=pcm" });

      // @ts-ignore
      window.mediaRecorderRef = mediaRecorderRef
    };

    initRecording();


    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.destroy();
        mediaRecorderRef.current = null;
      }
    };
  }, []);

  const handleStartRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.startRecording();
      setIsRecording(true);
    }
  }

  const handleStopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stopRecording(async () => {
        if (mediaRecorderRef.current) {
          const blob = mediaRecorderRef.current.getBlob();
          const file = new File([blob], `voice-message.webm`);

          const audioUrl = URL.createObjectURL(blob);
          window.audioUrl = audioUrl;
          const audioElement = new Audio(audioUrl);

          // Play the audio
          audioElement.play();

          const formData = new FormData();
          formData.append('file', file);

          const res = await api.post('/upload/file', formData);
          const url = res.data.url;

          if (id) {
            sendMessage({
              roomId: id,
              doctorId: doctor ? doctor.id : undefined,
              type: 'AUDIO',
              content: url,
            });
          }

          setIsRecording(false);
        }
      })
    }
  }

  const handleChangeAgree = (id: number) => {
    setAgree((state) => ({
      ...state,
      [id]: !state[id],
    }));
  };

  const handleSubmitAgree = () => {
    localStorage.setItem('isAgreed', '1')
    setIsAgreed(true);
  }

  const handleSend = () => {
    if (!text.trim() || !id) return;

    sendMessage({ roomId: id, doctorId: user ? user.doctor?.id : undefined, type: 'TEXT', content: text });
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
    sendMessage({ roomId: id, doctorId: doctor ? doctor.id : undefined, type, content: url });
  };

  const handleTyping = () => {
    if (socket && id) {
      socket.emit('typing', id);
    }
  };

  const handleEnd = async () => {
    if (room) {
      const isConfirm = window.confirm('Вы действительно хотите завершить консультацию?');
      if (isConfirm) {
        await api.post(`/rooms/${room.id}/end`);
        refetch();
      }
    }
  }

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

  const getSenderName = (user: User | null, message: Message, room: Room): string => {
    if (user) {
      return user.doctor?.id === message.doctorId ? 'Вы' : room.patientName;
    }

    return message.doctorId ? room.doctor.name : 'Вы';
  };

  const isMe = (user: User | null, message: Message): boolean => {
    if (user) {
      return user.doctor?.id === message.doctorId;
    }

    return !message.doctorId;
  };

  if (!room) return null

  const isPatientConnected = ((typeof socket?.id === 'string' || typeof socket?.id === 'number') && onlineUsers.includes(socket.id))
      || (onlineUsers.length > 1 && onlineUsers.includes(room.doctor.userId));

  const isReady = !!user || isAgreed;
  const isCanEnd = user && (user.role === 'admin' || user.id === room.doctor.userId);
  const isCanEdit = isReady && (!user || user.role !== 'admin');
  const isAgree = Object.values(agree).every((item) => item)

  console.log('debug msg', messages)

  return (
    <div className="flex gap-1 flex-1">
      <div className="flex flex-col flex-1">
        <div className="p-4 border-b bg-white shadow z-10">
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 flex-col">
              <div className="gap-2 flex justify-between flex-col sm:flex-row flex-1">
                <div className="flex justify-between items-center gap-2">
                  {user && (
                    <Link href="/rooms">Назад</Link>
                  )}
                  <span className="text-center text-xl font-semibold">Он-лайн консультация</span>
                </div>

                <span className="flex flex-col gap-1 sm:flex-row">
                  <span className="flex items-center gap-1">
                    <span className={`flex w-3 h-3 rounded-full ${isPatientConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>{user ? room.patientName : 'Вы'}</span>
                  </span>
                  {isCanEdit && (
                    <span className="flex items-center gap-1">
                      <span className={`flex w-3 h-3 rounded-full ${onlineUsers.includes(room.doctor.userId) ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{user ? `Вы` : room.doctor.name}</span>
                    </span>
                  )}
                </span>
              </div>
              {doctor && (
                <div className="flex gap-2 items-center">
                  <Avatar className="w-[60px] h-[60px]" src={doctor.imageUrl} />
                  <div className="flex flex-col gap-0.5">
                    <div className="text-xs">{doctor.name}</div>
                    <div className="text-xs">{doctor.description}</div>
                    <Link className="text-xs" target="_blank" href={doctor.externalUrl}>Описание</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isReady ? (
          <div className="flex-1 overflow-y-auto gap-1 flex flex-col px-4 pt-4">
          {messages.map((m) => (
            <div key={m.id} className={`border-b p-2 rounded-lg shadow-sm gap-2 flex flex-col ${isMe(user, m) && 'bg-primary-50'}`}>
              <div className="flex gap-2 items-center">
                {m.doctorId && (
                  <Avatar src={m.doctor?.imageUrl} />
                )}
                <strong>{getSenderName(user, m, room)}:</strong>
              </div>

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

              {m.type === 'AUDIO' && (
                <>
                  <div>not working on ios</div>
                  <audio controls src="https://storage.googleapis.com/alenushka-chat-eaa6a.firebasestorage.app/4d9badf3-bc4c-49e2-b2b1-fc6cc53b7599-voice-message.webm" className="mt-1" />
                  <div>works</div>
                  <audio controls src="https://storage.googleapis.com/alenushka-chat-eaa6a.firebasestorage.app/676d0b4a-6c91-446a-a87b-05a319ad5f56-voice-message.webm" className="mt-1" />
                </>
              )}
            </div>
          ))}
          <div className="min-h-[20px] flex">
            {isTyping && (
              <span className="text-sm text-gray-500">Пользователь печатает...</span>
            )}
          </div>
          <div ref={messagesEndRef} className="h-0" />
        </div>
        ) : (
          <div className="flex-1 overflow-y-auto gap-1 flex flex-col p-4 bg-white">
            <h1 className="text-xl text-primary">Соглашение</h1>
            <p>Я согласен на онлайн-консультацию и понимаю, что она проводится <strong>БЕЗ ОСМОТРА ПАЦИЕНТА ВРАЧОМ</strong> в целях:</p>
            <div>
              <p>1. профилактики, сбора, анализа жалоб пациента и данных анамнеза, оценки эффективности лечебно-диагностических мероприятий, медицинского наблюдения за состоянием здоровья пациента;</p>
              <p>2. принятия решения о необходимости проведения очного приема (осмотра, консультации);</p>
              <p>3. коррекции ранее назначенного лечения при условии установления  диагноза и назначения лечения на очном приеме (осмотре, консультации).</p>
            </div>
            <div className="mt-4">
              <div>
                <Checkbox onChange={() => handleChangeAgree(1)} />Я согласен на <Link target="_blank" href="https://alenushka-pediatr.ru/static/docs/soglasie-na-chat-perepisku.docx">обработку персональных данных</Link>. С <Link target="_blank" href="https://alenushka-pediatr.ru/personal-data-agreement"> Политикой конфиденциальности и защиты персональных данных</Link> ознакомлен.
              </div>
              <div>
                <Checkbox onChange={() => handleChangeAgree(2)} />С <Link target="_blank" href="https://alenushka-pediatr.ru/static/docs/dogovor-oferta-na-distkonsultaciu.docx">Договором-офертой</Link> на возмездное оказание медицинских услуг с использованием дистанционного взаимодействия ознакомлен.
              </div>
              <div>
                <Checkbox onChange={() => handleChangeAgree(3)} />С <Link target="_blank" href="https://alenushka-pediatr.ru/static/docs/ids-na-chatperepisku.docx">Информированным добровольным согласием</Link> на проведение дистанционной консультации врача-специалиста ознакомлен.
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Button color={isAgree ? "primary" : "default"} onPress={handleSubmitAgree} disabled={!isAgree}>Согласен</Button>
            </div>
          </div>
        )}

        {isCanEdit && (
          <>
            {room && room.status === 'active' ? (
              <div className="flex flex-row items-start sm:items-center gap-2 p-2 border-t-1">
                <input
                    type="file"
                    id="file"
                    accept="*/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <label
                  htmlFor="file"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center whitespace-nowrap cursor-pointer bg-blue-600 text-white rounded-[12px] hover:bg-blue-500 transition"
                >
                  <FileIcon width={20} height={20} fill="#fff" />
                </label>

                <Textarea
                  classNames={{ input: "max-h-[200px]", inputWrapper: "rounded-none" }}
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={4}
                  placeholder="Введите сообщение"
                  size="lg"
                  disableAutosize
                />

                  <div className="flex gap-2 justify-end w-auto">
                    {textareaRef.current?.value && (
                      <Button
                        isIconOnly
                        color="primary"
                        onPress={handleSend}
                      >
                        <SendIcon width={20} height={20} fill="#fff" />
                      </Button>
                    )}

                    {isCanEnd && (
                      <Button
                        isIconOnly
                        color="danger"
                        onPress={handleEnd}
                      >
                        <CloseIcon width={20} height={20} fill="#fff" />
                      </Button>
                    )}

                    {isRecording ? (
                      <Button color="danger" isIconOnly onPress={handleStopRecording}>
                        <StopRecordingIcon width={20} height={20} fill="#fff" />
                      </Button>
                    ) : (
                      <Button color="warning" isIconOnly onPress={handleStartRecording}>
                        <StartRecordingIcon width={20} height={20} fill="#fff" />
                      </Button>
                    )}
                  </div>
              </div>
            ) : (
              <div className="p-4 border-t bg-white flex flex-col sm:flex-row justify-center gap-2">
                <p className="text-center">Консультация завершена</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
