import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import RecordRTC from 'recordrtc';
import { useSearchParams } from 'react-router-dom';
import { useSocketStore } from '../store/socketStore';
import { api } from '../api';
import {useUser} from "../hooks/useUser";
import {useRoom} from "../hooks/useRoom";
import {Textarea} from "@heroui/input";
import {
  Avatar,
  Button,
  Checkbox,
  Link,
  Modal,
  ModalBody,
  Image,
  ModalContent, Popover, PopoverContent, PopoverTrigger,
} from "@heroui/react";
// @ts-ignore
import messageSound from '../../public/sounds/new-message.mp3';
import {useDoctor} from "@/hooks/useDoctor";
import {useNavigationBlock} from "@/hooks/useNavigationBlock";
import moment from "moment";

type NotificationProps = {
  children?: React.ReactNode;
}
const Notification = (props: NotificationProps) => {
  return (
    <Modal isOpen={true} hideCloseButton>
      <ModalContent>
        <ModalBody className="p-10 flex items-center justify-center">
          {!!props.children && props.children}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

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

const MoreIcon = (props: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
      <path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512m-96-288a32 32 0 1 1 0 64 32 32 0 1 1 0-64m64 32a32 32 0 1 1 64 0 32 32 0 1 1-64 0m128-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64"></path>
    </svg>
);

type MessageProps = {
  item: Message;
  room: Room;
  onEdit: (message: Message) => void;
}

const Message = (props: MessageProps) => {
  const deleteMessage = useSocketStore((s) => s.deleteMessage);
  const [isMessagePopoverOpen, setIsMessagePopoverOpen] = useState(false)
  const { user } = useUser();

  const getSenderName = (user: User | null, message: Message): string => {
    if (user) {
      if (user.role === 'doctor') {
        return user.doctor?.id === message.doctorId ? 'Вы' : props.room.patientName;
      } else if (user.role === 'admin') {
        return props.room.doctor.id === message.doctorId ? props.room.doctor.name : props.room.patientName;
      }
    }

    return message.doctorId ? props.room.doctor.name : 'Вы';
  };

  const isMe = (user: User | null, message: Message): boolean => {
    if (user) {
      return user.doctor?.id === message.doctorId;
    }

    return !message.doctorId;
  };

  const onEdit = () => {
    setIsMessagePopoverOpen(false);
    props.onEdit(props.item);
  }

  const onDelete = () => {
    setIsMessagePopoverOpen(false);
    deleteMessage(props.item);
  }

  return (
    <div key={props.item.id} className={`border-b p-4 rounded-lg shadow-sm gap-2 flex flex-col ${isMe(user, props.item) ? 'bg-primary-50' : 'bg-secondary-50'} ${props.item.pending ? 'opacity-70' : ''}`}>
      <div className="flex gap-2 items-center">
        <div className="flex-1 flex items-center gap-2">
          {props.item.doctorId && (
            <Avatar src={props.item.doctor?.imageUrl} />
          )}
          <strong>{getSenderName(user, props.item)}:</strong>
          {props.item.pending && (
            <span className="text-xs text-amber-600">
              {props.item.pendingDelete ? 'Удаление...' : 'Отправка...'}
            </span>
          )}
        </div>

        <div className="flex flex-row gap-2 items-center">
          <span className="text-xs">{moment(props.item.createdAt).format('DD.MM.YYYY HH:mm')}</span>
          {isMe(user, props.item) && !props.item.pendingDelete && (
            <Popover placement="right" isOpen={isMessagePopoverOpen} disableAnimation onClose={() => setIsMessagePopoverOpen(false)}>
              <PopoverTrigger>
                <Button isIconOnly className="bg-inherit" onClick={() => setIsMessagePopoverOpen(true)}>
                  <MoreIcon width={20} height={20} />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="px-1 py-2 flex flex-col gap-2">
                  {props.item.type === 'TEXT' && (
                    <Button color="primary" className="text-small" onClick={onEdit}>Редактировать</Button>
                  )}
                  <Button color="danger" className="text-small" onClick={onDelete}>Удалить</Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {props.item.type === 'TEXT' && (
        <div className="whitespace-pre-wrap">{props.item.content}</div>
      )}
      {props.item.type === 'IMAGE' && (
        <Link
          href={props.item.content}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          <Image
            src={props.item.content}
            className="w-32 h-32 object-cover mt-1"
            alt="uploaded image"
          />
        </Link>
      )}
      {props.item.type === 'FILE' && (
        <Link
          href={props.item.content}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          Скачать файл
        </Link>
      )}

      {props.item.type === 'AUDIO' && (
        <audio controls className="mt-1">
          <source src={props.item.content} type="audio/mpeg" />
          <source src={props.item.content} type="audio/ogg" />
          <source src={props.item.content} type="audio/webm" />
        </audio>
      )}
    </div>
  )
}

export default function Room() {
  const { id } = useParams();
  const connect = useSocketStore((s) => s.connect);
  const messages = useSocketStore((s) => s.messages);
  const setCurrentUser = useSocketStore((s) => s.setCurrentUser);
  const [onlineUsers, setOnlineUsers] = useState<(string | number)[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTabFocused, setIsTabFocused] = useState(true);
  const originalTitle = useRef(document.title);
  const flickerInterval = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctorId');
  const editMessage = useSocketStore((s) => s.editMessage);
  const [messageEditingId, setMessageEditingId] = useState<string | null>(null);

  const socket = useSocketStore((state) => state.socket);
  const sendMessage = useSocketStore((s) => s.sendMessage);
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mediaRecorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();
  const { room, refetch } = useRoom(id);
  const { doctor } = useDoctor(room?.doctorId);
  const navigate = useNavigate();
  const [agree, setAgree] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false
  })
  const [isAgreed, setIsAgreed] = useState<boolean>(!!localStorage.getItem('isAgreed'));
  const [isMobileKeyboardVisible, setIsMobileKeyboardVisible] = useState(false);
  const isReady = !!user || isAgreed;

  useNavigationBlock(textareaRef);

  useEffect(() => {
    if (isUserLoaded) {
      if (room && doctorId && !user) {
        navigate(`/?roomId=${room.id}&doctorId=${doctorId}`);
      }

      if (room && user && doctorId && user.role !== 'admin') {
        // Only redirect if user has a doctor profile and it doesn't match the doctorId
        if (user.doctor?.id && Number(doctorId) !== user.doctor.id) {
          navigate(`/?roomId=${room.id}`);
        }
      }
    }
  }, [doctorId, user, room, isUserLoaded]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const onEdit = (item: Message) => {
    setText(item.content)
    setMessageEditingId(item.id);
    if (textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(item.content.length, item.content.length);
        }
      }, 250)
    }
  }

  useEffect(() => {
    if (id) connect(id);
  }, [id, connect]);

  // Update current user in socket store when user changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user, setCurrentUser]);

  // Effect 1: Set up event listeners (runs when socket changes)
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

    // socket.on('edited-message', ({ clientId }) => {
    //   const event = new CustomEvent('new-message-received');
    //   window.dispatchEvent(event);
    // });
    //
    // socket.on('deleted-message', ({ clientId }) => {
    //   const event = new CustomEvent('new-message-received');
    //   window.dispatchEvent(event);
    // });

    return () => {
      // Only remove listeners, DON'T disconnect
      socket.off('online-users');
      socket.off('user-online');
      socket.off('user-offline');
      socket.off('new-message');
    };
  }, [socket]);

  // Effect 2: Disconnect ONLY on component unmount (empty deps)
  useEffect(() => {
    return () => {
      // Access socket from store directly to avoid stale closure
      const currentSocket = useSocketStore.getState().socket;
      if (currentSocket) {
        console.log('Room unmounting, disconnecting socket');
        currentSocket.disconnect();
      }
    };
  }, []); // Empty deps = only runs on mount/unmount

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mobile-optimized auto-scroll for textarea changes
  useEffect(() => {
    // Only scroll if there are messages and user is ready
    if (messages.length > 0 && isReady) {
      // Debounced scroll to prevent excessive scrolling during typing
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [text.length > 0 ? Math.ceil(text.length / 50) : 0, isReady, messages.length]); // Less frequent updates

  // Mobile virtual keyboard handling with Visual Viewport API
  useEffect(() => {
    let keyboardTimeout: NodeJS.Timeout;

    const handleVisualViewportChange = () => {
      if (!window.visualViewport) return;

      const viewport = window.visualViewport;
      const isKeyboardNowVisible = viewport.height < window.innerHeight * 0.75;

      if (isKeyboardNowVisible !== isMobileKeyboardVisible) {
        setIsMobileKeyboardVisible(isKeyboardNowVisible);

        // Clear previous timeout
        clearTimeout(keyboardTimeout);

        // Only scroll when keyboard appears and there are messages
        if (isKeyboardNowVisible && messages.length > 0 && isReady) {
          keyboardTimeout = setTimeout(() => {
            scrollToBottom();
          }, 600); // Longer delay for keyboard animations
        }
      }
    };

    // Use Visual Viewport API for better mobile keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    }

    return () => {
      clearTimeout(keyboardTimeout);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
    };
  }, [messages.length, isReady, isMobileKeyboardVisible]);

  // useEffect(() => {
  //   if (textareaRef.current) {
  //     textareaRef.current.style.height = 'auto';
  //     textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  //   }
  // }, [text]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    mediaRecorderRef.current = new RecordRTC(stream, {
      type: 'audio'
    });

    mediaRecorderRef.current.startRecording();
    setIsRecording(true);
  }

  const handleStopRecordingAndCancel = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stopRecording(() => {
        mediaRecorderRef.current = null;
        setIsRecording(false);
      });
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleStopRecordingAndSend = async () => {
    if (mediaRecorderRef.current) {
      await mediaRecorderRef.current.stopRecording(async () => {
        if (mediaRecorderRef.current) {
          const blob = await mediaRecorderRef.current.getBlob();

          const file = new File([blob], `voice-message.webm`, {
            type: 'audio/webm'
          });

          const formData = new FormData();
          formData.append('file', file);

          const res = await api.post('/upload/file', formData);
          const url = res.data.url;

          if (id) {
            sendMessage({
              roomId: id,
              doctorId: user ? user.doctor?.id : undefined,
              type: 'AUDIO',
              content: url,
            });
          }

          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }

          setIsRecording(false);
        }
      });
    }
  }

  const onCancelEditing = () => {
    setMessageEditingId(null);
    setText('');
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

    if (messageEditingId) {
      // For editing, we need to include the message ID
      editMessage(messageEditingId, {
        content: text
      }, user);
      setMessageEditingId(null);
    } else {
      // For new messages, we don't include an ID
      sendMessage({
        roomId: id,
        doctorId: user ? user.doctor?.id : undefined,
        type: 'TEXT',
        content: text
      });
    }
    setText('');

    // Scroll to bottom after sending message (textarea will shrink back to 4 rows)
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/upload/file', formData);
    const url = res.data.url;

    const type = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
    sendMessage({ roomId: id, doctorId: user ? user.doctor?.id : undefined, type, content: url });

    setIsUploading(false);
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

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      setIsTyping(true);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        typingTimeoutRef.current = null;
      }, 3000);
    });

    return () => {
      socket.off('typing');
      // Clear timeout on cleanup
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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
          document.title = visible ? '(Новое сообщение)' : originalTitle.current;
          visible = !visible;
        }, 1000);
      }
    };

    window.addEventListener('new-message-received', handleNewMessage);
    return () => {
      window.removeEventListener('new-message-received', handleNewMessage);
    };
  }, [isTabFocused]);

  if (!room) return null

  // Check if doctor is online (by userId)
  const isDoctorOnline = onlineUsers.some(id => String(id) === String(room.doctor.userId));

  // Check if client is online (any online user that is NOT the doctor)
  const isClientOnline = onlineUsers.some(id => {
    // If the ID matches doctor's userId, it's the doctor
    if (String(id) === String(room.doctor.userId)) return false;
    // Otherwise, it's a client (socket.id is a string that doesn't match doctor's userId)
    return true;
  });

  // Determine what to show based on current user's role
  let isPatientConnected: boolean;
  if (user) {
    // Current user is doctor or admin - check if client is online
    isPatientConnected = isClientOnline;
  } else {
    // Current user is client - check if their own socket is in the online list
    isPatientConnected = socket ? onlineUsers.some(id => String(id) === socket.id) : false;
  }

  const isCanEnd = user && (user.role === 'admin' || user.id === room.doctor.userId);
  const isAdmin = user?.role === 'admin';
  const isAgree = Object.values(agree).every((item) => item)

  return (
    <div className={`fixed inset-0 w-full h-full overflow-hidden chat-layout ${isMobileKeyboardVisible ? 'mobile-keyboard-visible' : ''}`}>
      {isRecording && (
        <Notification>
          <p>Происходит запись голосового сообщения...</p>
          <div className="flex gap-2 items-center">
            <Button color="success" className="text-white" onPress={handleStopRecordingAndSend}>
              Отправить
            </Button>
            <Button color="danger" onPress={handleStopRecordingAndCancel}>
              Отменить
            </Button>
          </div>
        </Notification>
      )}
      {isUploading && (
          <Notification>
            <p className="text-gray-500 text-lg">
              Файл загружается...
            </p>
          </Notification>
      )}

      {/* Desktop Header - Fixed */}
      <div
        className={`chat-header-fixed hidden md:block p-4 border-b shadow z-50 ${user?.doctor ? 'bg-yellow-300' : 'bg-white'}`}
      >
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 flex-col">
              <div className="gap-2 flex justify-between flex-col sm:flex-row flex-1">
                <div className="flex justify-between items-center gap-2">
                  {user && (
                    <Link href="/rooms">Назад</Link>
                  )}
                  <span className="text-center text-xl font-semibold">Он-лайн консультация</span>
                </div>

                <span className="flex flex-col gap-2 sm:flex-row">
                  <span className="flex items-center gap-1">
                    <span className={`flex w-3 h-3 rounded-full ${isPatientConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>{user ? room.patientName : 'Вы'}</span>
                  </span>
                  {!isAdmin && (
                    <span className="flex items-center gap-1">
                      <span className={`flex w-3 h-3 rounded-full ${isDoctorOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{user ? `Вы` : room.doctor.name}</span>
                    </span>
                  )}
                </span>
              </div>
              {doctor && (
                <div className="flex gap-2 items-center">
                  <div className="flex gap-2 flex-1">
                    <Avatar className="w-[60px] h-[60px]" src={doctor.imageUrl} />
                    <div className="flex flex-col gap-0.5">
                      <div className="text-xs">{doctor.name}</div>
                      <div className="text-xs">{doctor.description}</div>
                      <Link className="text-xs" target="_blank" href={doctor.externalUrl}>Описание</Link>
                    </div>
                  </div>
                  {isCanEnd && (
                    <Button
                      isIconOnly
                      color="danger"
                      onPress={handleEnd}
                    >
                      <CloseIcon width={20} height={20} fill="#fff" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Scrollable Content Area - includes header on mobile */}
      <div className="chat-messages-area bg-gray-100">
        {isReady ? (
          <div className="flex flex-col min-h-full">
            {/* Mobile Header - Scrollable */}
            <div
              className={`md:hidden p-4 border-b shadow ${user?.doctor ? 'bg-yellow-300' : 'bg-white'}`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 flex-col">
                  <div className="gap-2 flex justify-between flex-col sm:flex-row flex-1">
                    <div className="flex justify-between items-center gap-2">
                      {user && (
                        <Link href="/rooms">Назад</Link>
                      )}
                      <span className="text-center text-xl font-semibold">Он-лайн консультация</span>
                    </div>

                    <span className="flex flex-col gap-2 sm:flex-row">
                      <span className="flex items-center gap-1">
                        <span className={`flex w-3 h-3 rounded-full ${isPatientConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>{user ? room.patientName : 'Вы'}</span>
                      </span>
                      {!isAdmin && (
                        <span className="flex items-center gap-1">
                          <span className={`flex w-3 h-3 rounded-full ${isDoctorOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span>{user ? `Вы` : room.doctor.name}</span>
                        </span>
                      )}
                    </span>
                  </div>
                  {doctor && (
                    <div className="flex gap-2 items-center">
                      <div className="flex gap-2 flex-1">
                        <Avatar className="w-[60px] h-[60px]" src={doctor.imageUrl} />
                        <div className="flex flex-col gap-0.5">
                          <div className="text-xs">{doctor.name}</div>
                          <div className="text-xs">{doctor.description}</div>
                          <Link className="text-xs" target="_blank" href={doctor.externalUrl}>Описание</Link>
                        </div>
                      </div>
                      {isCanEnd && (
                        <Button
                          isIconOnly
                          color="danger"
                          onPress={handleEnd}
                        >
                          <CloseIcon width={20} height={20} fill="#fff" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Content */}
            <div className="flex flex-col gap-1 px-4 py-2 flex-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                    <div className="text-4xl mb-3">👋</div>
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      Добро пожаловать в чат!
                    </h3>
                    <p className="text-blue-600">
                      Начните ваш разговор здесь
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((item) => (
                    <Message key={item.id} item={item} room={room} onEdit={onEdit} />
                  ))}
                  {isTyping && (
                    <div className="min-h-[20px] flex py-2">
                        <span className="text-sm text-gray-500">
                          {user ? `${room.patientName} печатает...` : `${room.doctor.name} печатает...`}
                        </span>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-h-full bg-white">
            {/* Mobile Header - Scrollable (Agreement Page) */}
            <div
              className={`md:hidden p-4 border-b shadow ${user?.doctor ? 'bg-yellow-300' : 'bg-white'}`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 flex-col">
                  <div className="gap-2 flex justify-between flex-col sm:flex-row flex-1">
                    <div className="flex justify-between items-center gap-2">
                      {user && (
                        <Link href="/rooms">Назад</Link>
                      )}
                      <span className="text-center text-xl font-semibold">Он-лайн консультация</span>
                    </div>

                    <span className="flex flex-col gap-2 sm:flex-row">
                      <span className="flex items-center gap-1">
                        <span className={`flex w-3 h-3 rounded-full ${isPatientConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>{user ? room.patientName : 'Вы'}</span>
                      </span>
                      {!isAdmin && (
                        <span className="flex items-center gap-1">
                          <span className={`flex w-3 h-3 rounded-full ${onlineUsers.includes(room.doctor.userId) ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span>{user ? `Вы` : room.doctor.name}</span>
                        </span>
                      )}
                    </span>
                  </div>
                  {doctor && (
                    <div className="flex gap-2 items-center">
                      <div className="flex gap-2 flex-1">
                        <Avatar className="w-[60px] h-[60px]" src={doctor.imageUrl} />
                        <div className="flex flex-col gap-0.5">
                          <div className="text-xs">{doctor.name}</div>
                          <div className="text-xs">{doctor.description}</div>
                          <Link className="text-xs" target="_blank" href={doctor.externalUrl}>Описание</Link>
                        </div>
                      </div>
                      {isCanEnd && (
                        <Button
                          isIconOnly
                          color="danger"
                          onPress={handleEnd}
                        >
                          <CloseIcon width={20} height={20} fill="#fff" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Agreement Content */}
            <div className="flex flex-col gap-1 p-4 flex-1">
              <h1 className="text-xl text-primary">Соглашение</h1>
              <p>Я согласен на онлайн-консультацию и понимаю, что она проводится <strong>БЕЗ ОСМОТРА ПАЦИЕНТА ВРАЧОМ</strong> в целях:</p>
              <div>
                <p>1. сбора, анализа жалоб пациента и данных анамнеза, оценки эффективности лечебно-диагностических мероприятий, медицинского наблюдения за состоянием здоровья пациента, профилактики;</p>
                <p>2. принятия решения о необходимости проведения очного приема (осмотра, консультации) или госпитализации пациента;</p>
                <p>3. коррекции ранее назначенного лечения при условии установления  диагноза и назначения лечения на очном приеме (осмотре, консультации).</p>
              </div>
              <div className="mt-2">
                <Checkbox onChange={() => handleChangeAgree(1)} classNames={{ hiddenInput: 'z-[0]' }}>
                  Я согласен на <Link target="_blank" href="https://alenushka-pediatr.ru/personal-data-agreement">обработку персональных данных</Link>. С <Link target="_blank" href="https://alenushka-pediatr.ru/static/docs/politika-personalnyh-dannyh.pdf"> Политикой конфиденциальности и защиты персональных данных</Link> ознакомлен.
                </Checkbox>
                <Checkbox onChange={() => handleChangeAgree(2)} classNames={{ hiddenInput: 'z-[0]' }}>
                  С <Link target="_blank" href="https://alenushka-pediatr.ru/static/docs/dogovor-oferta-na-distkonsultaciu.pdf">Договором-офертой</Link> на возмездное оказание медицинских услуг с использованием дистанционного взаимодействия ознакомлен.
                </Checkbox>
                <Checkbox onChange={() => handleChangeAgree(3)} classNames={{ hiddenInput: 'z-[0]' }}>
                  С <Link target="_blank" href="https://alenushka-pediatr.ru/static/docs/ids-na-chatperepisku.pdf"> Информированным добровольным согласием</Link> на проведение дистанционной консультации врача-специалиста ознакомлен.
                </Checkbox>

                <p className="mt-2">Клиника Алёнушка</p>
              </div>
              <div className="mt-4 flex justify-center">
                <Button color={isAgree ? "primary" : "default"} onPress={handleSubmitAgree} disabled={!isAgree}>Согласен</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Footer */}
      {isReady && (
        <div className="chat-footer-dynamic border-t bg-white z-40">
          {room && room.status === 'active' ? (
            <div className="flex flex-row items-end gap-2 min-h-[80px]">
              {!isAdmin && (
                <>
                  <input
                    type="file"
                    id="file"
                    accept="*/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <label
                    htmlFor="file"
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center whitespace-nowrap cursor-pointer bg-blue-600 text-white rounded-[12px] hover:bg-blue-500 transition flex-shrink-0 mb-2"
                  >
                    <FileIcon width={20} height={20} fill="#fff" />
                  </label>
                </>
              )}

              {!isAdmin && (
                <Textarea
                  minRows={4}
                  maxRows={20}
                  isClearable={!!messageEditingId}
                  onClear={onCancelEditing}
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    handleTyping();
                    // Removed immediate scroll trigger to prevent mobile keyboard conflicts
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  onFocus={() => {
                    // Gentle scroll when textarea is focused on mobile
                    if (messages.length > 0) {
                      setTimeout(() => {
                        scrollToBottom();
                      }, 800); // Longer delay to allow keyboard animation
                    }
                  }}
                  placeholder="Введите сообщение"
                  size="lg"
                  classNames={{
                    base: "flex-1",
                    inputWrapper: "min-h-[60px]",
                    input: "resize-none"
                  }}
                />
              )}

              <div className="flex flex-col gap-2 justify-end flex-shrink-0 mb-2">
                {text && (
                  <Button
                    isIconOnly
                    color="primary"
                    onPress={handleSend}
                  >
                    <SendIcon width={20} height={20} fill="#fff" />
                  </Button>
                )}

                {!isAdmin && !isRecording && (
                  <Button color="warning" isIconOnly onPress={handleStartRecording}>
                    <StartRecordingIcon width={20} height={20} fill="#fff" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-2 min-h-[80px] items-center">
              <p className="text-center">Консультация завершена</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
