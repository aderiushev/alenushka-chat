import { Card, CardBody, Link } from "@heroui/react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 flex-1">
      <Card className="max-w-md text-center">
        <CardBody className="space-y-4">
          <h1 className="text-5xl font-bold text-red-500">404</h1>
          <p className="text-lg text-gray-700">Страница не найдена</p>
          <Link href="/">Вернуться на главную</Link>
        </CardBody>
      </Card>
    </div>
  );
}

export default NotFound
