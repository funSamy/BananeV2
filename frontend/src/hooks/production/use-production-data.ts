import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productionApi } from "@/lib/api/production";
import {
  PaginationParams,
  ProductionData,
  ProductionFilters,
} from "@/types/api";

const PRODUCTION_KEYS = {
  all: ["production"] as const,
  lists: () => [...PRODUCTION_KEYS.all, "list"] as const,
  list: (params: PaginationParams & ProductionFilters) =>
    [...PRODUCTION_KEYS.lists(), params] as const,
  details: () => [...PRODUCTION_KEYS.all, "detail"] as const,
  detail: (id: number) => [...PRODUCTION_KEYS.details(), id] as const,
};

export function useProductionList(
  params: PaginationParams & ProductionFilters
) {
  return useQuery({
    queryKey: PRODUCTION_KEYS.list(params),
    queryFn: () => productionApi.getList(params),
  });
}

export function useProductionDetails(id: number) {
  return useQuery({
    queryKey: PRODUCTION_KEYS.detail(id),
    queryFn: () => productionApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTION_KEYS.lists() });
    },
  });
}

export function useUpdateProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductionData> }) =>
      productionApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUCTION_KEYS.detail(id) });
    },
  });
}

export function useDeleteProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productionApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTION_KEYS.lists() });
    },
  });
}
