import { useState, useRef } from "react";
import { Card, CardBody, Input, Textarea, Button } from "@heroui/react";
import ReCAPTCHA from "react-google-recaptcha";
import { api } from "../api";

const RECAPTCHA_SITE_KEY = "6LfrQ0MsAAAAAH_U1yoOh9rm1lJGp1If1p76E7qN";

export default function Landing() {
  const [phone, setPhone] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (token) {
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!phone && !contactMethod) {
      setError("Укажите телефон или способ связи");
      return;
    }

    if (!recaptchaToken) {
      setError("Пожалуйста, подтвердите, что вы не робот");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await api.post("/telegram/consultation-request", {
        phone: phone || undefined,
        contactMethod: contactMethod || undefined,
        recaptchaToken,
      });
      setIsSubmitted(true);
      setPhone("");
      setContactMethod("");
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Ошибка отправки. Попробуйте позвонить нам.";
      setError(message);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-16"
        style={{ background: 'linear-gradient(135deg, #52CABE 0%, #3db8ac 50%, #52CABE 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 bg-white animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full opacity-15 bg-white" />
        <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full opacity-10 bg-white" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Алёнушка
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4 font-medium">
            Онлайн-консультации с педиатрами
          </p>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Профессиональная медицинская помощь для вашего ребёнка — быстро, удобно и безопасно
          </p>

          {/* Scroll indicator */}
          <div className="mt-12 animate-bounce">
            <span className="text-white/70 text-3xl">↓</span>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Почему выбирают нас
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Мы заботимся о здоровье ваших детей с любовью и профессионализмом
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300 hover:-translate-y-1 transform">
              <CardBody className="text-center p-8">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: '#52CABE20' }}
                >
                  <span className="text-4xl">👨‍⚕️</span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#52CABE' }}>Опытные специалисты</h3>
                <p className="text-gray-600">
                  Наши врачи имеют многолетний опыт работы с детьми всех возрастов и постоянно повышают квалификацию
                </p>
              </CardBody>
            </Card>
            <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300 hover:-translate-y-1 transform">
              <CardBody className="text-center p-8">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: '#F9778420' }}
                >
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#F97784' }}>Удобный чат</h3>
                <p className="text-gray-600">
                  Общайтесь с врачом в формате онлайн-чата с возможностью отправки фото и документов
                </p>
              </CardBody>
            </Card>
            <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300 hover:-translate-y-1 transform">
              <CardBody className="text-center p-8">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: '#52CABE20' }}
                >
                  <span className="text-4xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#52CABE' }}>Конфиденциальность</h3>
                <p className="text-gray-600">
                  Все данные надёжно защищены и доступны только вам и вашему лечащему врачу
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section
        className="py-16 md:py-24 px-4 relative"
        style={{ backgroundColor: '#FFF5F6' }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Как это работает
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Три простых шага к консультации
          </p>
          <div className="space-y-8">
            <div className="flex items-start gap-6 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div
                className="flex-shrink-0 w-14 h-14 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg"
                style={{ backgroundColor: '#F97784' }}
              >
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Получите ссылку на консультацию</h3>
                <p className="text-gray-600">
                  Врач создаст для вас персональную комнату консультации и отправит ссылку через мессенджер или по телефону
                </p>
              </div>
            </div>
            <div className="flex items-start gap-6 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div
                className="flex-shrink-0 w-14 h-14 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg"
                style={{ backgroundColor: '#52CABE' }}
              >
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Перейдите по ссылке</h3>
                <p className="text-gray-600">
                  Откройте ссылку в браузере вашего телефона или компьютера и примите условия использования сервиса
                </p>
              </div>
            </div>
            <div className="flex items-start gap-6 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div
                className="flex-shrink-0 w-14 h-14 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg"
                style={{ backgroundColor: '#F97784' }}
              >
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Общайтесь с врачом</h3>
                <p className="text-gray-600">
                  Задавайте вопросы, отправляйте фото и получайте профессиональные рекомендации от специалиста
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-8 md:gap-16 flex-wrap">
            <div>
              <p className="text-4xl md:text-5xl font-bold" style={{ color: '#52CABE' }}>500+</p>
              <p className="text-gray-600 mt-2">Консультаций</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold" style={{ color: '#F97784' }}>10+</p>
              <p className="text-gray-600 mt-2">Врачей</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold" style={{ color: '#52CABE' }}>98%</p>
              <p className="text-gray-600 mt-2">Довольных родителей</p>
            </div>
          </div>
        </div>
      </section>

      {/* Request Consultation Section */}
      <section
        className="py-16 md:py-24 px-4"
        style={{ backgroundColor: '#F0FDFB' }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Запросить консультацию
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Свяжитесь с нами удобным способом, и мы организуем консультацию с педиатром
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Phone Option */}
            <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
              <CardBody className="p-8 text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: '#52CABE20' }}
                >
                  <span className="text-4xl">📞</span>
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#52CABE' }}>
                  Позвоните нам
                </h3>
                <a
                  href="tel:+73422067560"
                  className="text-2xl md:text-3xl font-bold hover:opacity-80 transition-opacity"
                  style={{ color: '#F97784' }}
                >
                  +7 (342) 206-75-60
                </a>
                <p className="text-gray-500 mt-4 text-sm">
                  Звоните в рабочее время
                </p>
              </CardBody>
            </Card>

            {/* Messenger Form Option */}
            <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
              <CardBody className="p-8">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: '#F9778420' }}
                >
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#F97784' }}>
                  Оставьте заявку
                </h3>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">✅</div>
                    <p className="text-lg font-semibold text-gray-800 mb-2">Заявка отправлена!</p>
                    <p className="text-gray-600">Мы свяжемся с вами в ближайшее время</p>
                    <Button
                      className="mt-4 font-semibold"
                      variant="light"
                      onPress={() => setIsSubmitted(false)}
                      style={{ color: '#52CABE' }}
                    >
                      Отправить ещё
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input
                      type="tel"
                      label="Номер телефона"
                      placeholder="+7 (___) ___-__-__"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      classNames={{
                        inputWrapper: "border-2 hover:border-[#52CABE] focus-within:border-[#52CABE]"
                      }}
                    />
                    <Textarea
                      label="Способ связи"
                      placeholder="Укажите ваш username в мессенджере или другой способ связи"
                      minRows={3}
                      value={contactMethod}
                      onChange={(e) => setContactMethod(e.target.value)}
                      classNames={{
                        inputWrapper: "border-2 hover:border-[#52CABE] focus-within:border-[#52CABE]"
                      }}
                    />
                    <div className="flex justify-center">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={RECAPTCHA_SITE_KEY}
                        onChange={handleRecaptchaChange}
                        onExpired={() => setRecaptchaToken(null)}
                        onErrored={() => setRecaptchaToken(null)}
                      />
                    </div>
                    {error && (
                      <p className="text-red-500 text-sm text-center">{error}</p>
                    )}
                    <Button
                      className="w-full font-semibold text-white"
                      style={{ backgroundColor: '#52CABE' }}
                      size="lg"
                      onPress={handleSubmit}
                      isLoading={isSubmitting}
                      isDisabled={isSubmitting || !recaptchaToken}
                    >
                      Отправить заявку
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="text-center mt-8 bg-white rounded-xl p-4 shadow-md">
            <p className="text-gray-600">
              ⏰ Администратор свяжется с вами в течение <strong>5-10 минут</strong> в рабочее время
            </p>
            <a
              href="https://alenushka-pediatr.ru/online-consultation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm hover:underline transition-colors"
              style={{ color: '#52CABE' }}
            >
              📋 Правила онлайн-консультаций
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-10 px-4 text-white"
        style={{ backgroundColor: '#3db8ac' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl font-bold mb-2">Алёнушка</p>
          <p className="text-white/80">
            Онлайн-консультации с педиатрами
          </p>
          <p className="text-white/60 text-sm mt-4">
            © 2024 Все права защищены
          </p>
        </div>
      </footer>
    </div>
  );
}

