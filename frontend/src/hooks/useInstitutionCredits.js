// src/hooks/useInstitutionCredits.js
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../api';

export function useInstitutionCredits(institutionId) {
  return useQuery({
    queryKey: ['institutionCredits', institutionId],
    queryFn: () => userAPI.get(`/credits/institution/${institutionId}`).then(r => r.data),
    enabled: !!institutionId,
  });
}