import { Avatar, Card, CardBody } from "@heroui/react";
import { Link } from "@heroui/link";

type DoctorProps = {
  doctor: Doctor;
};

const Doctor = (props: DoctorProps) => {
  return (
    <Card className="rounded-none">
      <CardBody className="flex flex-col justify-center items-center gap-2">
        <Avatar
          src={props.doctor.imageUrl}
          size="lg"
          className="w-40 h-40"
          classNames={{ img: "object-contain"}}
        />
        <div className="text-center">{props.doctor.name}</div>
        <div className="text-center">{props.doctor.description}</div>
        <Link color="primary" href={props.doctor.externalUrl} target="_blank">Описание</Link>
      </CardBody>
    </Card>
  )
}

export default Doctor;
