import { useState, useEffect, useCallback } from "react";
import {
  staffAPI,
  Staff,
  CreateStaffRequest,
  UpdateStaffRequest
} from "../api/staff";

import { StaffMember, UserRole } from "../types";

interface UseStaffReturn {

  staff: StaffMember[];

  loading: boolean;

  error: string | null;

  fetchStaff: () => Promise<void>;

  createStaff: (
    data: Omit<StaffMember, "id" | "createdAt" | "tenantId">
  ) => Promise<StaffMember>;

  updateStaff: (
    id: string,
    data: Partial<Omit<StaffMember, "id" | "createdAt" | "tenantId">>
  ) => Promise<StaffMember>;

  deleteStaff: (id: string) => Promise<void>;

}

export const useStaff = (): UseStaffReturn => {

  const [staff, setStaff] = useState<StaffMember[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const convert = (s: Staff): StaffMember => ({

    id: s.id,

    name: s.fullName,

    email: s.email,

    phone: s.phone,

    role: s.role as UserRole,

    permissions: [],

    tenantId: "",

    createdAt: s.createdAt,

  });

  const fetchStaff = useCallback(async () => {

    try {

      setLoading(true);

      const data = await staffAPI.getAll();

      setStaff(data.map(convert));

    }
    catch (err: any) {

      setError(
        err?.response?.data?.message ||
        "Failed to fetch staff"
      );

    }
    finally {

      setLoading(false);

    }

  }, []);

  const createStaff = useCallback(
    async (
      data: Omit<StaffMember, "id" | "createdAt" | "tenantId">
    ): Promise<StaffMember> => {

      try {

        setLoading(true);

        const dto: CreateStaffRequest = {

          fullName: data.name,

          email: data.email,

          phone: data.phone,

          role: data.role as unknown as 'OWNER' | 'CHEF' | 'CUSTOMER',

        };

        const created = await staffAPI.create(dto);

        const converted = convert(created);

        setStaff(prev => [...prev, converted]);

        return converted;

      }
      catch (err: any) {

        setError(
          err?.response?.data?.message ||
          "Failed to create staff"
        );

        throw err;

      }
      finally {

        setLoading(false);

      }

    },
    []
  );

  const updateStaff = useCallback(
    async (
      id: string,
      data: Partial<Omit<StaffMember, "id" | "createdAt" | "tenantId">>
    ): Promise<StaffMember> => {

      try {

        setLoading(true);

        const dto: UpdateStaffRequest = {

          fullName: data.name,

          email: data.email,

          phone: data.phone,

          role: data.role as unknown as 'OWNER' | 'CHEF' | 'CUSTOMER',
        };

        const updated = await staffAPI.update(id, dto);

        const converted = convert(updated);

        setStaff(prev =>
          prev.map(s =>
            s.id === id ? converted : s
          )
        );

        return converted;

      }
      catch (err: any) {

        setError(
          err?.response?.data?.message ||
          "Failed to update staff"
        );

        throw err;

      }
      finally {

        setLoading(false);

      }

    },
    []
  ); 

  const deleteStaff = useCallback(
    async (id: string) => {

      try {

        setLoading(true);

        await staffAPI.delete(id);

        setStaff(prev =>
          prev.filter(s => s.id !== id)
        );

      }
      catch (err: any) {

        setError(
          err?.response?.data?.message ||
          "Failed to delete staff"
        );

        throw err;

      }
      finally {

        setLoading(false);

      }

    },
    []
  );

  useEffect(() => {

    fetchStaff();

  }, [fetchStaff]);

  return {

    staff,

    loading,

    error,

    fetchStaff,

    createStaff,

    updateStaff,

    deleteStaff,

  };

};