import { useState, useEffect, useCallback } from "react";
import { api } from "../api";

/**
 * Custom hook for managing doctors data with CRUD operations
 * Provides functionality to fetch, update status, and edit doctor profiles
 */
export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all doctors from the API
   */
  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/auth/doctors');
      setDoctors(response.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to fetch doctors');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Toggle doctor status between active and disabled
   * @param doctorId - The ID of the doctor to update
   * @param newStatus - The new status ('active' | 'disabled')
   * @returns Promise that resolves when the update is complete
   */
  const toggleDoctorStatus = useCallback(async (doctorId: number, newStatus: 'active' | 'disabled') => {
    try {
      const response = await api.patch(`/auth/doctors/${doctorId}/status`, {
        status: newStatus
      });

      // Update the local state immediately for better UX
      setDoctors(prevDoctors =>
        prevDoctors.map(doctor =>
          doctor.id === doctorId
            ? { ...doctor, user: { ...doctor.user, status: newStatus } }
            : doctor
        )
      );

      return response.data;
    } catch (err) {
      console.error('Error updating doctor status:', err);
      throw new Error('Failed to update doctor status');
    }
  }, []);

  /**
   * Update doctor profile information
   * @param doctorId - The ID of the doctor to update
   * @param updateData - The updated doctor information
   * @returns Promise that resolves when the update is complete
   */
  const updateDoctor = useCallback(async (doctorId: number, updateData: DoctorEditForm) => {
    try {
      const response = await api.put(`/auth/doctors/${doctorId}`, updateData);

      // Update the local state immediately for better UX
      setDoctors(prevDoctors =>
        prevDoctors.map(doctor =>
          doctor.id === doctorId
            ? {
                ...doctor,
                name: updateData.name,
                description: updateData.description,
                imageUrl: updateData.imageUrl,
                externalUrl: updateData.externalUrl,
                user: { ...doctor.user, email: updateData.email }
              }
            : doctor
        )
      );

      return response.data;
    } catch (err) {
      console.error('Error updating doctor:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { message: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to update doctor');
      }
      throw new Error('Failed to update doctor');
    }
  }, []);

  /**
   * Soft delete a doctor by setting their status to 'disabled'
   * @param doctorId - The ID of the doctor to delete
   * @returns Promise that resolves when the delete is complete
   */
  const deleteDoctor = useCallback(async (doctorId: number) => {
    try {
      await api.patch(`/auth/doctors/${doctorId}/delete`);

      // Remove from local state immediately for better UX
      setDoctors(prevDoctors =>
        prevDoctors.filter(doctor => doctor.id !== doctorId)
      );
    } catch (err) {
      console.error('Error deleting doctor:', err);
      throw new Error('Failed to delete doctor');
    }
  }, []);

  /**
   * Refresh the doctors list
   */
  const refetch = useCallback(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Initial fetch on mount
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    isLoading,
    error,
    toggleDoctorStatus,
    updateDoctor,
    deleteDoctor,
    refetch
  };
}
