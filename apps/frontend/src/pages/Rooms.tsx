import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import {today, getLocalTimeZone, ZonedDateTime, CalendarDate, DateValue} from "@internationalized/date";
import { api } from "../api";
import {
  Button,
  Card,
  CardBody,
  CardFooter, Chip,
  Popover,
  PopoverContent,
  PopoverTrigger, RangeCalendar, RangeValue, Select, SelectItem,
} from "@heroui/react";
import Header from "@/components/Header.tsx";
import {useUser} from "@/hooks/useUser.ts";
import {Input} from "@heroui/input";
import moment from "moment";

const FILTER_ITEMS = [
  { label: 'Все', value: 'all' },
  { label: 'Активные', value: 'active' },
  { label: 'Завершенные', value: 'completed' }
]

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const { isLoading, user } = useUser();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState<RangeValue<DateValue>>({
    start: today(getLocalTimeZone()).subtract({ weeks: 1 }),
    end: today(getLocalTimeZone()).add({ weeks: 1 })
  });

  useEffect(() => {
    // @ts-ignore
    fetchRooms(query, status, dateRange);
  }, []);

  const onCopyDoctorLink = (id: string, doctorId: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${id}?doctorId=${doctorId}`)
  }

  const onCopyClientLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${id}`)
  }

  const fetchRooms = async (query?: string, status?: string, dateRange?: RangeValue<ZonedDateTime>) => {
    const response = await api.get('/rooms', {
      params: { query, status, dateRange },
    });
    setRooms(response.data);
  };

  const debouncedFetchRooms = useCallback(
    _.debounce((query: string, status: string, dateRange) => {
      fetchRooms(query, status, dateRange);
    }, 500),
    []
  );

  const handleOnSearchChange = (value: string) => {
    setQuery(value);
    debouncedFetchRooms(value, status, dateRange);
  };

  const handleOnStatusChange = (value: string) => {
    setStatus(value);
    debouncedFetchRooms(query, value, dateRange);
  };

  const handleOnDateRangeChange = (value: RangeValue<CalendarDate>) => {
    setDateRange(value);
    debouncedFetchRooms(query, status, value);
  };

  return (
    <div className="min-h-screen flex flex-col flex-1">
      <Header />

      <div className="flex gap-2 flex-col sm:flex-row overflow-y-auto">
        <div className="flex sm:items-start flex-col flex-1 order-2 sm:order-1">
        <p className="px-4 text-xl font-semibold">Консультации</p>
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
                      <span>Дата создания:</span><span>{moment(room.createdAt).format('DD.MM.YYYY')}</span>
                    </p>
                    <div className="truncate gap-1 flex">
                      <span>Статус:</span>
                      <Chip className="text-white" size="sm" color={room.status === 'active' ? 'success' : 'danger'}>{room.status === 'active' ? 'Активна' : 'Завершена'}</Chip>
                    </div>
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

        <div className="m-4 flex flex-col gap-1 order-1 sm:order-2">
          <Input
            value={query}
            placeholder="Поиск ..."
            size="lg"
            color="primary"
            isClearable
            onClear={() => handleOnSearchChange('')}
            onChange={(e) => handleOnSearchChange(e.target.value)}
          />
          <Select
            color="primary"
            label="Статус"
            size="sm"
            value={status}
            placeholder="Выберите статус"
            items={FILTER_ITEMS}
            onChange={(e) => handleOnStatusChange(e.target.value)}
          >
            {(item) => <SelectItem key={item.value} >{item.label}</SelectItem>}
          </Select>
          <RangeCalendar
            // @ts-ignore
            value={dateRange}
            onChange={handleOnDateRangeChange}
          />
        </div>
      </div>
    </div>
  );
}
