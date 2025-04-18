import { Card, CardBody } from "@heroui/react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="max-w-md text-center">
        <CardBody className="space-y-4">
          <h1 className="text-5xl font-bold text-red-500">404</h1>
          <p className="text-lg text-gray-700">Страница не найдена</p>
        </CardBody>
      </Card>
    </div>
  );
}

export default NotFound
