import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from "../api";
import { Button, Card, CardBody, CardFooter, CardHeader, Tooltip } from "@heroui/react";
import Header from "@/components/Header.tsx";

const CopyIcon = ({ fill = "#000000", height = "800px", width = "800px", ...props }) => {
  return (
      <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          fill={fill}
          height={height}
          width={width}
          version="1.1"
          id="Layer_1"
          viewBox="0 0 64 64"
          enableBackground="new 0 0 64 64"
          xmlSpace="preserve"
          {...props}
      >
        <g id="Text-files">
          <path
              d="M53.9791489,9.1429005H50.010849c-0.0826988,0-0.1562004,0.0283995-0.2331009,0.0469999V5.0228C49.7777481,2.253,47.4731483,0,44.6398468,0h-34.422596C7.3839517,0,5.0793519,2.253,5.0793519,5.0228v46.8432999c0,2.7697983,2.3045998,5.0228004,5.1378999,5.0228004h6.0367002v2.2678986C16.253952,61.8274002,18.4702511,64,21.1954517,64h32.783699c2.7252007,0,4.9414978-2.1725998,4.9414978-4.8432007V13.9861002C58.9206467,11.3155003,56.7043495,9.1429005,53.9791489,9.1429005z M7.1110516,51.8661003V5.0228c0-1.6487999,1.3938999-2.9909999,3.1062002-2.9909999h34.422596c1.7123032,0,3.1062012,1.3422,3.1062012,2.9909999v46.8432999c0,1.6487999-1.393898,2.9911003-3.1062012,2.9911003h-34.422596C8.5049515,54.8572006,7.1110516,53.5149002,7.1110516,51.8661003zM56.8888474,59.1567993c0,1.550602-1.3055,2.8115005-2.9096985,2.8115005h-32.783699c-1.6042004,0-2.9097996-1.2608986-2.9097996-2.8115005v-2.2678986h26.3541946c2.8333015,0,5.1379013-2.2530022,5.1379013-5.0228004V11.1275997c0.0769005,0.0186005,0.1504021,0.0469999,0.2331009,0.0469999h3.9682999c1.6041985,0,2.9096985,1.2609005,2.9096985,2.8115005V59.1567993z"
              // stroke={fill}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
          />
          <path
              d="M38.6031494,13.2063999H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0158005c0,0.5615997,0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4542999,1.0158997-1.0158997C39.6190491,13.6606998,39.16465,13.2063999,38.6031494,13.2063999z"
              stroke={fill}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
          />
          <path
              d="M38.6031494,21.3334007H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0157986c0,0.5615005,0.4544001,1.0159016,1.0159006,1.0159016h22.3491974c0.5615005,0,1.0158997-0.454401,1.0158997-1.0159016C39.6190491,21.7877007,39.16465,21.3334007,38.6031494,21.3334007z"
              stroke={fill}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
          />
          <path
              d="M38.6031494,29.4603004H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997s0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4543991,1.0158997-1.0158997S39.16465,29.4603004,38.6031494,29.4603004z"
              stroke={fill}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
          />
          <path
              d="M28.4444485,37.5872993H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997s0.4544001,1.0158997,1.0159006,1.0158997h12.1904964c0.5615025,0,1.0158005-0.4543991,1.0158005-1.0158997S29.0059509,37.5872993,28.4444485,37.5872993z"
              stroke={fill}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
          />
        </g>
      </svg>
  );
};

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const f = async () => {
      const response = await api.get('/rooms')
      setRooms(response.data)
    }

    f()
  }, []);

  const onCopyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.protocol}//${window.location.hostname}/room/${id}`)
  }

  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex sm:items-start justify-center flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {rooms.map((room) => (
                <Link to={`/room/${room.id}`} key={room.id}>
                  <Card>
                    <CardHeader className="gap-2 items-center">
                      <p className="flex-1">
                        Консультация {room.patientName}
                      </p>
                      <Tooltip content="Скопировать ссылку">
                        <Button isIconOnly color="primary" size="sm" onPress={() => onCopyLink(room.id)}>
                          <CopyIcon fill="#fff" width="16" height="24"/>
                        </Button>
                      </Tooltip>
                    </CardHeader>
                    <CardBody>
                      <CardBody>
                        <p>Консультирует: {room.user.name}</p>
                        {room.messages[0] && (
                          <p className="truncate">
                            Последнее сообщение: {room.messages[0].content}
                          </p>
                        )}
                      </CardBody>
                    </CardBody>
                  <CardFooter>
                    Дата создания: {new Date(room.createdAt).toLocaleDateString()}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
  );
}
