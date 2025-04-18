import { useState, useEffect } from "react";
import { api } from "../api";

export function useDoctor(id?: number) {
  const [doctor, setDoctor] = useState<null | Doctor>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api
        .get(`/auth/doctors/${id}`)
        .then((res) => {
          setDoctor(res.data);
        })
        .catch(() => {
          setDoctor(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  return { doctor, isLoading };
}
