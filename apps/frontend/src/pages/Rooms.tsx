import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import {I18nProvider} from "@react-aria/i18n";
import {today, getLocalTimeZone, ZonedDateTime, CalendarDate, DateValue} from "@internationalized/date";
import { api } from "../api";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Popover,
  PopoverContent,
  PopoverTrigger, RangeCalendar, RangeValue, Select, SelectItem,
} from "@heroui/react";
import Header from "@/components/Header.tsx";
import {useUser} from "@/hooks/useUser";
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
    <div className="rooms-layout">
      {/* Fixed Header */}
      <div className="rooms-header-fixed">
        <Header />
      </div>

      {/* Fixed Controls Section */}
      <div className="rooms-controls-fixed bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Консультации</h1>
            <p className="text-gray-600">Просмотр и управление консультациями</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                value={query}
                placeholder="Поиск по врачу или клиенту..."
                size="lg"
                color="primary"
                isClearable
                onClear={() => handleOnSearchChange('')}
                onChange={(e) => handleOnSearchChange(e.target.value)}
                startContent={
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-48">
                <Select
                  color="primary"
                  size="lg"
                  selectedKeys={[status]}
                  placeholder="Выберите статус"
                  items={FILTER_ITEMS}
                  onChange={(e) => handleOnStatusChange(e.target.value)}
                >
                  {(item) => <SelectItem key={item.value}>{item.label}</SelectItem>}
                </Select>
              </div>

              <div className="w-full sm:w-auto">
                <Popover placement="bottom-end">
                  <PopoverTrigger>
                    <Button
                      color="primary"
                      variant="bordered"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Выбрать период
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <I18nProvider locale="ru">
                      <RangeCalendar
                        firstDayOfWeek="mon"
                        // @ts-ignore
                        value={dateRange}
                        onChange={handleOnDateRangeChange}
                      />
                    </I18nProvider>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Rooms Grid Area */}
      <div className="rooms-grid-scrollable">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.length ? rooms.map((room) => (
              <Link to={`/room/${room.id}`} key={room.id}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardBody className="flex flex-col gap-2">
                    <p className="text-sm truncate">Врач: {room.doctor.name}</p>
                    <p className="text-sm truncate">
                      Клиент: {room.patientName}
                    </p>

                    {!isLoading && user?.role === 'admin' && (
                      <div className="flex gap-2 flex-col">
                        <Popover placement="right">
                          <PopoverTrigger>
                            <Button
                              color="primary"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
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
                              onClick={(e) => {
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
                      <p className="truncate gap-1 flex text-sm">
                        <span>Дата создания:</span><span>{moment(room.createdAt).format('DD.MM.YYYY')}</span>
                      </p>
                      <div className="truncate gap-1 flex">
                        <Chip className="text-white" size="sm" color={room.status === 'active' ? 'success' : 'danger'}>
                          {room.status === 'active' ? 'Активна' : 'Завершена'}
                        </Chip>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            )) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-gray-600 text-lg">У вас пока не было консультаций</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
