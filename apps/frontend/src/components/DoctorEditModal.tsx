import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  Divider
} from "@heroui/react";
import { Input } from "@heroui/input";
import ImagePreview from "./ImagePreview";
import LinkValidator from "./LinkValidator";

/**
 * Props interface for DoctorEditModal component
 */
interface DoctorEditModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Doctor data to edit */
  doctor: Doctor | null;
  /** Function called when form is submitted */
  onSubmit: (data: DoctorEditForm) => Promise<void>;
  /** Function called when delete is requested */
  onDelete?: (doctor: Doctor) => Promise<void>;
  /** Whether the form is currently submitting */
  isLoading?: boolean;
}

/**
 * Modal component for editing doctor profile information
 * Provides form validation and handles doctor data updates
 */
export default function DoctorEditModal({
  isOpen,
  onClose,
  doctor,
  onSubmit,
  onDelete,
  isLoading = false
}: DoctorEditModalProps) {
  const [formData, setFormData] = useState<DoctorEditForm>({
    name: '',
    description: '',
    imageUrl: '',
    externalUrl: '',
    email: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Initialize form data when doctor changes
   */
  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name,
        description: doctor.description || '',
        imageUrl: doctor.imageUrl,
        externalUrl: doctor.externalUrl,
        email: doctor.user.email
      });
    }
  }, [doctor]);

  /**
   * Handle form field changes
   */
  const handleInputChange = (field: keyof DoctorEditForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user starts typing
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctor) return;

    // Basic validation
    if (!formData.name.trim()) {
      setError('Имя врача обязательно');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email обязателен');
      return;
    }
    if (!formData.description.trim()) {
      setError('Специализация обязательна');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Введите корректный email адрес');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при обновлении данных врача');
      }
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setError(null);
    setIsDeleting(false);
    onClose();
  };

  /**
   * Handle doctor deletion
   */
  const handleDelete = async () => {
    if (!doctor || !onDelete) return;

    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить врача "${doctor.name}"? Это действие скроет врача из списка.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await onDelete(doctor);
      onClose();
    } catch (err) {
      console.error('Failed to delete doctor:', err);
      setError('Не удалось удалить врача. Попробуйте снова.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!doctor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b-2 shadow-md">
          <h2 className="text-xl font-semibold">Редактирование врача</h2>
          <p className="text-sm text-gray-600">ID: {doctor.id}</p>
        </ModalHeader>

        <Form onSubmit={handleSubmit} className="overflow-y-auto">
          <ModalBody className="w-full">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Учетные данные</h3>

                <Input
                  type="email"
                  label="Email"
                  placeholder="doctor@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  description="Email для входа в систему"
                />
              </div>

              <Divider className="my-6" />

              {/* Doctor Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Данные врача</h3>

                <Input
                  type="text"
                  label="Полное имя"
                  placeholder="Иванов Иван Иванович"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  description="ФИО врача"
                />

                <Input
                  type="text"
                  label="Специализация"
                  placeholder="врач-педиатр"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  description="Специализация и квалификация"
                />
              </div>

              <Divider className="my-6" />

              {/* Media Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Медиа и ссылки</h3>

                <div className="space-y-2">
                  <Input
                    type="url"
                    label="URL изображения"
                    placeholder="https://example.com/doctor-photo.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    description="Ссылка на фотографию врача"
                  />
                  {formData.imageUrl && <ImagePreview imageUrl={formData.imageUrl} alt="Предварительный просмотр фото врача" />}
                </div>

                <div className="space-y-2">
                  <Input
                    type="url"
                    label="Внешняя ссылка"
                    placeholder="https://clinic.com/doctor-profile"
                    value={formData.externalUrl}
                    onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                    description="Ссылка на профиль врача на сайте клиники"
                  />
                  {formData.externalUrl && <LinkValidator url={formData.externalUrl} />}
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="border-t-2 shadow-md flex justify-between w-full">
            <div className="flex flex-1">
              {onDelete && (
                <Button
                  color="danger"
                  variant="flat"
                  onPress={handleDelete}
                  isLoading={isDeleting}
                  disabled={isLoading || isDeleting}
                >
                  {isDeleting ? 'Удаление...' : 'Удалить врача'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                color="danger"
                variant="light"
                onPress={handleClose}
                disabled={isLoading || isDeleting}
              >
                Отмена
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isLoading}
                disabled={isLoading || isDeleting}
              >
                {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </div>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
}
