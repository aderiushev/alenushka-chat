import { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Chip,
  Avatar,
  Spinner,
  Switch,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure
} from "@heroui/react";
import { Input } from "@heroui/input";
import Header from "../components/Header";
import DoctorEditModal from "../components/DoctorEditModal";
import { useDoctors } from "../hooks/useDoctors";

/**
 * DoctorsManagement page component for admin-only doctor account management
 * Provides functionality to view, edit, and manage doctor status
 */
export default function DoctorsManagement() {
  const { doctors, isLoading, error, toggleDoctorStatus, updateDoctor, refetch } = useDoctors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);

  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();

  /**
   * Filter doctors based on search query
   */
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Handle doctor status toggle
   */
  const handleStatusToggle = async (doctor: Doctor) => {
    const newStatus = doctor.user.status === 'active' ? 'disabled' : 'active';

    try {
      setStatusUpdating(doctor.id);
      await toggleDoctorStatus(doctor.id, newStatus);
    } catch (err) {
      console.error('Failed to update doctor status:', err);
      // You might want to show a toast notification here
    } finally {
      setStatusUpdating(null);
    }
  };

  /**
   * Handle opening edit modal
   */
  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    onEditModalOpen();
  };

  /**
   * Handle doctor profile update
   */
  const handleUpdateDoctor = async (formData: DoctorEditForm) => {
    if (!selectedDoctor) return;

    try {
      setIsEditLoading(true);
      await updateDoctor(selectedDoctor.id, formData);
    } finally {
      setIsEditLoading(false);
    }
  };

  /**
   * Get status chip color based on user status
   */
  const getStatusChipColor = (status: string) => {
    return status === 'active' ? 'success' : 'danger';
  };

  /**
   * Get status display text
   */
  const getStatusText = (status: string) => {
    return status === 'active' ? 'Активен' : 'Заблокирован';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" label="Загрузка врачей..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardBody className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button color="primary" onPress={refetch}>
                Попробовать снова
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Управление врачами</h1>
          <p className="text-gray-600">Просмотр и управление учетными записями врачей</p>
        </div>

        {/* Search and Stats */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Поиск по имени, email или специализации..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              isClearable
              onClear={() => setSearchQuery('')}
              startContent={
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>

          <div className="flex gap-4 text-sm text-gray-600">
            <span>Всего врачей: <strong>{doctors.length}</strong></span>
            <span>Активных: <strong>{doctors.filter(d => d.user.status === 'active').length}</strong></span>
            <span>Заблокированных: <strong>{doctors.filter(d => d.user.status === 'disabled').length}</strong></span>
          </div>
        </div>

        {/* Doctors Table */}
        <Card>
          <CardBody className="p-0">
            <Table
              aria-label="Таблица врачей"
              classNames={{
                wrapper: "shadow-none",
                th: "bg-gray-50 text-gray-700 font-semibold",
                td: "py-4"
              }}
            >
              <TableHeader>
                <TableColumn>ВРАЧ</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>СПЕЦИАЛИЗАЦИЯ</TableColumn>
                <TableColumn>СТАТУС</TableColumn>
                <TableColumn>ДЕЙСТВИЯ</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Врачи не найдены">
                {filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={doctor.imageUrl}
                          name={doctor.name}
                          classNames={{ img: "object-contain", base: "min-w-10 min-h-10" }}
                        />
                        <div>
                          <p className="font-semibold">{doctor.name}</p>
                          <p className="text-sm text-gray-500">ID: {doctor.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{doctor.user.email}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{doctor.description || 'Не указана'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Chip
                          color={getStatusChipColor(doctor.user.status)}
                          size="sm"
                          variant="flat"
                        >
                          {getStatusText(doctor.user.status)}
                        </Chip>
                        <Switch
                          size="sm"
                          isSelected={doctor.user.status === 'active'}
                          onValueChange={() => handleStatusToggle(doctor)}
                          isDisabled={statusUpdating === doctor.id}
                          color="success"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        color="primary"
                        variant="light"
                        onPress={() => handleEditDoctor(doctor)}
                      >
                        Редактировать
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Edit Modal */}
        <DoctorEditModal
          isOpen={isEditModalOpen}
          onClose={onEditModalClose}
          doctor={selectedDoctor}
          onSubmit={handleUpdateDoctor}
          isLoading={isEditLoading}
        />
      </div>
    </div>
  );
}
