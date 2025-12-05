import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employeeApi';
import type { Employee } from '../types';

const EMPLOYEE_KEYS = {
  all: ['employees'] as const,
  list: () => [...EMPLOYEE_KEYS.all] as const,
  detail: (id: string) => [...EMPLOYEE_KEYS.all, id] as const,
};

export function useEmployees() {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.list(),
    queryFn: employeeApi.getAll,
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: id ? EMPLOYEE_KEYS.detail(id) : EMPLOYEE_KEYS.detail('unknown'),
    queryFn: () => (id ? employeeApi.getById(id) : Promise.reject('Missing id')),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Employee>) => employeeApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.list() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Employee> }) =>
      employeeApi.update(id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.list() });
    },
  });
}

export function useEmployeesByDepartment(departmentId: string | undefined) {
  return useQuery({
    queryKey: ['employees', 'department', departmentId],
    queryFn: () => (departmentId ? employeeApi.getByDepartment(departmentId) : Promise.resolve([])),
    enabled: Boolean(departmentId),
  });
}


