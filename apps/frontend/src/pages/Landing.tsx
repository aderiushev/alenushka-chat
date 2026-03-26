import { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Input, Textarea, Button, Checkbox } from "@heroui/react";
import { Helmet } from "react-helmet-async";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { api } from "../api";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

function LandingContent() {
  const [phone, setPhone] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [agreedToPersonalData, setAgreedToPersonalData] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Yandex.Metrika initialization
  useEffect(() => {
    // Check if already initialized
    if ((window as any).ym) return;

    (function(m: any, e: Document, t: string, r: string, i: string, k?: HTMLScriptElement, a?: HTMLScriptElement) {
      m[i] = m[i] || function() { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * (new Date() as any);
      for (let j = 0; j < e.scripts.length; j++) {
        if (e.scripts[j].src === r) return;
      }
      k = e.createElement(t) as HTMLScriptElement;
      a = e.getElementsByTagName(t)[0] as HTMLScriptElement;
      k.async = true;
      k.src = r;
      a.parentNode?.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=106305244', 'ym');

    (window as any).ym(106305244, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: "dataLayer",
      accurateTrackBounce: true,
      trackLinks: true
    });
  }, []);

  // Yandex.Metrika goal tracking helper
  const trackGoal = (goal: string) => {
    if ((window as any).ym) {
      (window as any).ym(106305244, 'reachGoal', goal);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!phone && !contactMethod) {
      setError("Укажите телефон или способ связи");
      return;
    }

    if (!agreedToPersonalData) {
      setError("Необходимо согласие на обработку персональных данных");
      return;
    }

    if (!executeRecaptcha) {
      setError("reCAPTCHA не загружена. Обновите страницу.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const recaptchaToken = await executeRecaptcha('consultation_request');

      await api.post("/telegram/consultation-request", {
        phone: phone || undefined,
        contactMethod: contactMethod || undefined,
        recaptchaToken,
      });
      trackGoal('chat_landing__contact_form_submit');
      setIsSubmitted(true);
      setPhone("");
      setContactMethod("");
      setAgreedToPersonalData(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Ошибка отправки. Попробуйте позвонить нам.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [phone, contactMethod, agreedToPersonalData, executeRecaptcha]);

  return (
    <>
      <Helmet>
        <title>Алёнушка — Онлайн-консультации педиатра в Перми | Детский врач онлайн</title>
        <meta name="description" content="Онлайн-консультации с опытными педиатрами клиники Алёнушка в Перми. Расшифровка анализов, рекомендации по лечению, ответы на вопросы о здоровье ребёнка. От 1500₽." />
      </Helmet>

      <main className="min-h-screen flex flex-col overflow-x-hidden" role="main">
        {/* Hero Section */}
        <section
          className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-16"
          style={{ background: 'linear-gradient(135deg, #52CABE 0%, #3db8ac 50%, #52CABE 100%)' }}
          aria-label="Главный баннер"
        >
          {/* Decorative circles - hidden from screen readers */}
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 bg-white animate-pulse" aria-hidden="true" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full opacity-15 bg-white" aria-hidden="true" />
          <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full opacity-10 bg-white" aria-hidden="true" />

          <header className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Алёнушка — онлайн-консультации педиатра
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-4 font-medium">
              Детский врач онлайн в Перми и по всей России
            </p>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Профессиональная медицинская помощь для вашего ребёнка — быстро, удобно и безопасно. Консультация от 1500₽.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a
                href="tel:+73422067560"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                style={{ color: '#52CABE' }}
                aria-label="Позвонить по телефону +7 342 206 75 60"
                onClick={() => trackGoal('chat_landing__phone_click')}
              >
                <span aria-hidden="true">📞</span>
                +7 (342) 206-75-60
              </a>
              <button
                onClick={() => {
                  document.getElementById('request-consultation')?.scrollIntoView({ behavior: 'smooth' });
                  trackGoal('chat_landing__hero_cta_click');
                }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                style={{ backgroundColor: '#F97784' }}
              >
                <span aria-hidden="true">💬</span>
                Записаться на консультацию
              </button>
            </div>

            {/* Scroll indicator */}
            <div className="mt-4 animate-bounce" aria-hidden="true">
              <span className="text-white/50 text-2xl">↓</span>
            </div>
          </header>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="presentation">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* When Chat is Enough Section */}
        <section className="py-12 md:py-16 px-4 bg-white" aria-labelledby="when-chat-heading">
          <div className="max-w-3xl mx-auto">
            <h2 id="when-chat-heading" className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
              Когда онлайн-консультация педиатра — это достаточно
            </h2>
            <ul className="space-y-4 mb-8" role="list" aria-label="Случаи для онлайн-консультации">
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#52CABE' }} aria-hidden="true">✓</span>
                <span className="text-lg text-gray-700">Нужно расшифровать анализы ребёнка</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#52CABE' }} aria-hidden="true">✓</span>
                <span className="text-lg text-gray-700">Остались вопросы после приёма у педиатра</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl" style={{ color: '#52CABE' }} aria-hidden="true">✓</span>
                <span className="text-lg text-gray-700">Есть сомнения, продолжать ли лечение</span>
              </li>
            </ul>
            <p className="text-center text-gray-600 text-lg">
              <span aria-hidden="true">👉</span> Если ситуация требует осмотра — детский врач честно скажет об этом.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 px-4 bg-white" aria-labelledby="features-heading">
          <div className="max-w-6xl mx-auto">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
              Почему выбирают онлайн-консультации в клинике Алёнушка
            </h2>
            <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
              Мы заботимся о здоровье ваших детей с любовью и профессионализмом
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
              <article className="contents" role="listitem">
                <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300 hover:-translate-y-1 transform">
                  <CardBody className="text-center p-8">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{ backgroundColor: '#52CABE20' }}
                      aria-hidden="true"
                    >
                      <span className="text-4xl">👨‍⚕️</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: '#52CABE' }}>Опытные педиатры</h3>
                    <p className="text-gray-600">
                      Наши детские врачи имеют многолетний опыт работы с детьми всех возрастов и постоянно повышают квалификацию
                    </p>
                  </CardBody>
                </Card>
              </article>
              <article className="contents" role="listitem">
                <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300 hover:-translate-y-1 transform">
                  <CardBody className="text-center p-8">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{ backgroundColor: '#F9778420' }}
                      aria-hidden="true"
                    >
                      <span className="text-4xl">💬</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: '#F97784' }}>Удобный онлайн-чат</h3>
                    <p className="text-gray-600">
                      Общайтесь с педиатром в формате онлайн-чата с возможностью отправки фото и документов
                    </p>
                  </CardBody>
                </Card>
              </article>
              <article className="contents" role="listitem">
                <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300 hover:-translate-y-1 transform">
                  <CardBody className="text-center p-8">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{ backgroundColor: '#52CABE20' }}
                      aria-hidden="true"
                    >
                      <span className="text-4xl">🔒</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: '#52CABE' }}>Конфиденциальность</h3>
                    <p className="text-gray-600">
                      Все медицинские данные надёжно защищены и доступны только вам и вашему лечащему врачу
                    </p>
                  </CardBody>
                </Card>
              </article>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section
          className="py-16 md:py-24 px-4 relative"
          style={{ backgroundColor: '#FFF5F6' }}
          aria-labelledby="how-it-works-heading"
        >
          <div className="max-w-4xl mx-auto">
            <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
              Как записаться на онлайн-консультацию педиатра
            </h2>
            <p className="text-center text-gray-500 mb-12">
              Три простых шага к консультации с детским врачом
            </p>
            <ol className="space-y-8" role="list">
              <li className="flex items-start gap-6 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div
                  className="flex-shrink-0 w-14 h-14 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg"
                  style={{ backgroundColor: '#F97784' }}
                  aria-hidden="true"
                >
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Получите ссылку на консультацию</h3>
                  <p className="text-gray-600">
                    Педиатр создаст для вас персональную комнату консультации и отправит ссылку через мессенджер или по телефону
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-6 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div
                  className="flex-shrink-0 w-14 h-14 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg"
                  style={{ backgroundColor: '#52CABE' }}
                  aria-hidden="true"
                >
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Перейдите по ссылке</h3>
                  <p className="text-gray-600">
                    Откройте ссылку в браузере вашего телефона или компьютера и примите условия использования сервиса
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-6 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div
                  className="flex-shrink-0 w-14 h-14 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg"
                  style={{ backgroundColor: '#F97784' }}
                  aria-hidden="true"
                >
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Общайтесь с детским врачом онлайн</h3>
                  <p className="text-gray-600">
                    Задавайте вопросы, отправляйте фото анализов и получайте профессиональные рекомендации от педиатра
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 px-4 bg-white" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Статистика клиники Алёнушка</h2>
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-8 md:gap-16 flex-wrap" role="list" aria-label="Наши достижения">
              <div role="listitem">
                <p className="text-4xl md:text-5xl font-bold" style={{ color: '#52CABE' }}>500+</p>
                <p className="text-gray-600 mt-2">Онлайн-консультаций</p>
              </div>
              <div role="listitem">
                <p className="text-4xl md:text-5xl font-bold" style={{ color: '#F97784' }}>10+</p>
                <p className="text-gray-600 mt-2">Педиатров</p>
              </div>
              <div role="listitem">
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
          aria-labelledby="request-heading"
          id="request-consultation"
        >
          <div className="max-w-4xl mx-auto">
            <h2 id="request-heading" className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
              Записаться на онлайн-консультацию педиатра
            </h2>
            <p className="text-center text-gray-500 mb-6 max-w-xl mx-auto">
              Свяжитесь с нами удобным способом, и мы организуем консультацию с детским врачом в Перми
            </p>

            <div className="text-center mb-10">
              <p className="text-2xl md:text-3xl font-bold" style={{ color: '#F97784' }}>
                <span aria-hidden="true">💬</span> Онлайн-консультация педиатра в чате — от 1 500 ₽
              </p>
              <p className="text-gray-500 mt-2">Без визита в клинику, из любой точки России</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Phone Option */}
              <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
                <CardBody className="p-8 text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: '#52CABE20' }}
                    aria-hidden="true"
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
                    aria-label="Позвонить по телефону +7 342 206 75 60"
                    onClick={() => trackGoal('chat_landing__phone_click')}
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
                    aria-hidden="true"
                  >
                    <span className="text-4xl">💬</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#F97784' }}>
                    Оставьте заявку на консультацию
                  </h3>
                  {isSubmitted ? (
                    <div className="text-center py-8" role="status" aria-live="polite">
                      <div className="text-5xl mb-4" aria-hidden="true">✅</div>
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
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} aria-label="Форма заявки на консультацию">
                      <Input
                        type="tel"
                        label="Номер телефона"
                        placeholder="+7 (___) ___-__-__"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        classNames={{
                          inputWrapper: "border-2 hover:border-[#52CABE] focus-within:border-[#52CABE]"
                        }}
                        aria-describedby="phone-hint"
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
                      <Checkbox
                        isSelected={agreedToPersonalData}
                        onValueChange={setAgreedToPersonalData}
                        size="sm"
                        classNames={{
                          label: "text-sm text-gray-600"
                        }}
                      >
                        Согласен на{" "}
                        <a
                          href="https://alenushka-pediatr.ru/personal-data-agreement"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                          style={{ color: '#52CABE' }}
                        >
                          обработку персональных данных
                        </a>
                      </Checkbox>
                      {error && (
                        <p className="text-red-500 text-sm text-center" role="alert">{error}</p>
                      )}
                      <Button
                        type="submit"
                        className="w-full font-semibold text-white"
                        style={{ backgroundColor: '#52CABE' }}
                        size="lg"
                        onPress={handleSubmit}
                        isLoading={isSubmitting}
                        isDisabled={isSubmitting || !agreedToPersonalData}
                      >
                        Отправить заявку на консультацию
                      </Button>
                      <p className="text-xs text-gray-400 text-center mt-2">
                        Защищено reCAPTCHA.{" "}
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                          Политика конфиденциальности
                        </a>{" "}и{" "}
                        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                          Условия использования
                        </a>{" "}Google.
                      </p>
                    </form>
                  )}
                </CardBody>
              </Card>
            </div>

            <div className="text-center mt-8 bg-white rounded-xl p-4 shadow-md">
              <p className="text-gray-600">
                <span aria-hidden="true">⏰</span> Администратор свяжется с вами в течение <strong>5-10 минут</strong> в рабочее время
              </p>
              <a
                href="https://alenushka-pediatr.ru/online-consultation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm hover:underline transition-colors"
                style={{ color: '#52CABE' }}
              >
                <span aria-hidden="true">📋</span> Правила онлайн-консультаций педиатра
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="py-10 px-4 text-white"
          style={{ backgroundColor: '#3db8ac' }}
          role="contentinfo"
        >
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-2xl font-bold mb-2">Клиника Алёнушка</p>
            <p className="text-white/80">
              Онлайн-консультации с педиатрами в Перми
            </p>
            <address className="not-italic text-white/70 mt-4">
              <a
                href="tel:+73422067560"
                className="hover:text-white transition-colors"
                onClick={() => trackGoal('chat_landing__phone_click')}
              >
                +7 (342) 206-75-60
              </a>
            </address>
            <nav className="mt-4" aria-label="Ссылки в подвале">
              <a
                href="https://alenushka-pediatr.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors text-sm"
              >
                alenushka-pediatr.ru
              </a>
            </nav>
            <p className="text-white/60 text-sm mt-4">
              © 2024-2026 Клиника Алёнушка. Все права защищены.
            </p>
            {/* Yandex.Metrika informer - hidden */}
            <div className="hidden">
              <a
                href="https://metrika.yandex.ru/stat/?id=106305244&from=informer"
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                <img
                  src="https://informer.yandex.ru/informer/106305244/3_1_FFFFFFFF_EFEFEFFF_0_pageviews"
                  style={{ width: 88, height: 31, border: 0 }}
                  alt="Яндекс.Метрика"
                  title="Яндекс.Метрика: данные за сегодня (просмотры, визиты и уникальные посетители)"
                  className="ym-advanced-informer"
                  data-cid="106305244"
                  data-lang="ru"
                />
              </a>
            </div>
          </div>
        </footer>
        {/* Yandex.Metrika noscript fallback */}
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/106305244" style={{ position: 'absolute', left: -9999 }} alt="" />
          </div>
        </noscript>
      </main>
    </>
  );
}

// Wrapper component with reCAPTCHA v3 provider
export default function Landing() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
      }}
    >
      {/* Hide reCAPTCHA badge - attribution is shown in the form */}
      <style>{`.grecaptcha-badge { visibility: hidden; }`}</style>
      <LandingContent />
    </GoogleReCaptchaProvider>
  );
}

