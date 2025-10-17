import { useState, useEffect } from 'react';
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Button, Form, Card, CardBody, Divider, Snippet } from "@heroui/react";
import { Input } from "@heroui/input";
import ImagePreview from "../components/ImagePreview";
import LinkValidator from "../components/LinkValidator";

/**
 * Example data from existing doctors for form placeholders
 */
const EXAMPLE_DATA = {
  emails: [
    'ivanov@alenushka-pediatr.ru',
    'petrov@alenushka-pediatr.ru',
    'sidorov@alenushka-pediatr.ru'
  ],
  names: [
    'Иванов Иван Иванович',
    'Петрова Мария Сергеевна',
    'Сидоров Алексей Владимирович'
  ],
  descriptions: [
    'врач-педиатр',
    'врач-педиатр, неонатолог',
    'врач-педиатр, детский кардиолог'
  ],
  imageUrls: [
    'https://alenushka-pediatr.ru/static/images/doctors/karakulova.jpg',
    'https://alenushka-pediatr.ru/static/images/doctors/sidor.jpg',
    'https://alenushka-pediatr.ru/static/images/doctors/yakovleva.jpg'
  ],
  externalUrls: [
    'https://alenushka-pediatr.ru/staff?doctor=ivanov',
    'https://alenushka-pediatr.ru/staff?doctor=petrova',
    'https://alenushka-pediatr.ru/staff?doctor=sidorov'
  ]
};

/**
 * DoctorRegister component for admin-only doctor registration
 * Creates both User and Doctor records in a single transaction
 */
export default function DoctorRegister() {
  const [formData, setFormData] = useState<DoctorRegistrationForm>({
    email: '',
    password: '',
    name: '',
    description: '',
    imageUrl: '',
    externalUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<DoctorRegistrationResponse | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);
  const navigate = useNavigate();

  /**
   * Cycle through example data every 3 seconds for demonstration
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setExampleIndex((prev) => (prev + 1) % EXAMPLE_DATA.emails.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Handle form field changes
   */
  const handleInputChange = (field: keyof DoctorRegistrationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user starts typing
  };

  /**
   * Fill form with example data for quick testing
   */
  const fillWithExample = () => {
    setFormData({
      email: EXAMPLE_DATA.emails[exampleIndex],
      password: 'TempPassword123!',
      name: EXAMPLE_DATA.names[exampleIndex],
      description: EXAMPLE_DATA.descriptions[exampleIndex],
      imageUrl: EXAMPLE_DATA.imageUrls[exampleIndex],
      externalUrl: EXAMPLE_DATA.externalUrls[exampleIndex]
    });
  };

  /**
   * Validate form data before submission
   */
  const validateForm = (): string | null => {
    if (!formData.email.trim()) return 'Email обязателен';
    if (!formData.password.trim()) return 'Пароль обязателен';
    if (!formData.name.trim()) return 'Имя обязательно';
    if (!formData.description.trim()) return 'Описание обязательно';
    if (!formData.imageUrl.trim()) return 'URL изображения обязателен';
    if (!formData.externalUrl.trim()) return 'Внешняя ссылка обязательна';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Некорректный формат email';

    // Password validation
    if (formData.password.length < 8) return 'Пароль должен содержать минимум 8 символов';

    // URL validation
    try {
      new URL(formData.imageUrl);
      new URL(formData.externalUrl);
    } catch {
      return 'Некорректный формат URL';
    }

    return null;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register-doctor', formData);
      setSuccess(response.data);

      // Reset form
      setFormData({
        email: '',
        password: '',
        name: '',
        description: '',
        imageUrl: '',
        externalUrl: ''
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { message: string } } };
        setError(axiosError.response?.data?.message || 'Ошибка при регистрации врача');
      } else {
        setError('Ошибка при регистрации врача');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="register-layout">
      {/* Fixed Header */}
      <div className="register-header-fixed">
        <Header />
      </div>

      {/* Fixed Page Title Section */}
      <div className="register-title-fixed bg-white">
        <div className="container mx-auto px-4 lg:px-8 xl:px-12" style={{ maxWidth: '1600px' }}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Регистрация врача</h2>
              <p className="text-sm text-gray-600 mt-1">Создание новой учетной записи врача в системе</p>
            </div>
            {!success && (
              <Button
                type="button"
                color="secondary"
                variant="bordered"
                size="sm"
                onClick={fillWithExample}
                className="self-start sm:self-auto"
              >
                Заполнить примером
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Form Area */}
      <div className="register-form-scrollable">
        <div className="w-full px-4 lg:px-8 xl:px-12 py-6 mx-auto" style={{ maxWidth: '1600px' }}>
          {success ? (
            <Card className="bg-green-50 border-green-200">
              <CardBody className="space-y-4">
                <h2 className="text-2xl font-semibold text-green-800">
                  ✅ Врач успешно зарегистрирован!
                </h2>

                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Информация о пользователе:</h3>
                    <p><strong>ID:</strong> {success.user.id}</p>
                    <p><strong>Email:</strong> {success.user.email}</p>
                    <p><strong>Роль:</strong> {success.user.role}</p>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Информация о враче:</h3>
                    <p><strong>ID:</strong> {success.doctor.id}</p>
                    <p><strong>Имя:</strong> {success.doctor.name}</p>
                    <p><strong>Описание:</strong> {success.doctor.description}</p>
                  </div>
                </div>

                <Divider />

                <div>
                  <h3 className="font-semibold mb-2">Данные для входа (скопируйте и сохраните):</h3>
                  <div className="flex flex-col gap-2">
                    <Snippet
                      symbol="📧"
                      color="primary"
                      onCopy={() => copyToClipboard(success.credentials.email)}
                    >
                      {success.credentials.email}
                    </Snippet>
                    <Snippet
                      symbol="🔑"
                      color="secondary"
                      onCopy={() => copyToClipboard(success.credentials.password)}
                    >
                      {success.credentials.password}
                    </Snippet>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    color="primary"
                    onClick={() => setSuccess(null)}
                    className="flex-1"
                  >
                    Зарегистрировать еще одного врача
                  </Button>
                  <Button
                    color="secondary"
                    variant="bordered"
                    onClick={() => navigate('/rooms')}
                    className="flex-1"
                  >
                    Вернуться к консультациям
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded mb-6">
                  <p className="font-semibold">Ошибка</p>
                  <p>{error}</p>
                </div>
              )}

              <Form onSubmit={handleSubmit} className="space-y-6">
                {/* First Row: Sections 1 & 2 - 50/50 split on desktop */}
                <div className="w-full flex flex-col lg:flex-row gap-6">
                  {/* Section 1: Account Credentials */}
                  <div className="flex-1">
                    <Card>
                      <CardBody className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                            1
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">Учетные данные</h3>
                        </div>
                        <p className="text-sm text-gray-600 -mt-2">Данные для входа в систему</p>

                        <Input
                          type="email"
                          label="Email"
                          placeholder={`Пример: ${EXAMPLE_DATA.emails[exampleIndex]}`}
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          description="Будет использоваться для входа в систему"
                          size="lg"
                        />

                        <Input
                          type="password"
                          label="Пароль"
                          placeholder="Минимум 8 символов"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                          description="Временный пароль для первого входа"
                          size="lg"
                        />
                      </CardBody>
                    </Card>
                  </div>

                  {/* Section 2: Doctor Profile */}
                  <div className="flex-1">
                    <Card>
                      <CardBody className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                            2
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">Профиль врача</h3>
                        </div>
                        <p className="text-sm text-gray-600 -mt-2">Основная информация о враче</p>

                        <Input
                          type="text"
                          label="Полное имя"
                          placeholder={`Пример: ${EXAMPLE_DATA.names[exampleIndex]}`}
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          description="ФИО врача полностью"
                          size="lg"
                        />

                        <Input
                          type="text"
                          label="Специализация"
                          placeholder={`Пример: ${EXAMPLE_DATA.descriptions[exampleIndex]}`}
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          required
                          description="Специализация и квалификация врача"
                          size="lg"
                        />
                      </CardBody>
                    </Card>
                  </div>
                </div>

                {/* Second Row: Section 3 - Max 50% width on desktop */}
                <div className="w-full lg:max-w-[50%]">
                  <Card>
                    <CardBody className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                          3
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Медиа и ссылки</h3>
                      </div>
                      <p className="text-sm text-gray-600 -mt-2">Фотография и дополнительная информация</p>

                      {/* Image URL */}
                      <div className="space-y-3">
                        <Input
                          type="url"
                          label="URL фотографии врача"
                          placeholder={`Пример: ${EXAMPLE_DATA.imageUrls[exampleIndex]}`}
                          value={formData.imageUrl}
                          onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                          required
                          description="Прямая ссылка на фотографию врача"
                          size="lg"
                        />
                        {formData.imageUrl && (
                          <div className="pl-1">
                            <p className="text-sm font-medium text-gray-700 mb-2">Предпросмотр:</p>
                            <ImagePreview
                              imageUrl={formData.imageUrl}
                              alt={formData.name || 'Фото врача'}
                              className="w-32 h-32 rounded-lg border-2 border-gray-200"
                            />
                          </div>
                        )}
                      </div>

                      {/* External URL */}
                      <div className="space-y-3">
                        <Input
                          type="url"
                          label="Ссылка на профиль врача"
                          placeholder={`Пример: ${EXAMPLE_DATA.externalUrls[exampleIndex]}`}
                          value={formData.externalUrl}
                          onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                          required
                          description="Ссылка на страницу врача на сайте клиники"
                          size="lg"
                        />
                        {formData.externalUrl && (
                          <div className="pl-1">
                            <LinkValidator
                              url={formData.externalUrl}
                              label="Страница врача"
                            />
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </Form>
            </>
          )}
        </div>
      </div>

      {/* Fixed Footer with Action Buttons */}
      {!success && (
        <div className="register-footer-fixed">
          <div className="container mx-auto px-4 lg:px-8 xl:px-12" style={{ maxWidth: '1600px' }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                color="primary"
                isLoading={isLoading}
                onClick={handleSubmit}
                className="flex-1 sm:flex-initial sm:min-w-[200px]"
                size="lg"
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрировать врача'}
              </Button>
              <Button
                type="button"
                color="default"
                variant="bordered"
                onClick={() => navigate('/rooms')}
                size="lg"
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
