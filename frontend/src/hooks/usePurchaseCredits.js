import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../api';

export function usePurchaseCredits(institutionId) {
  const qc = useQueryClient();
  return useMutation(
    (amount) =>
      userAPI.post(`/credits/institution/${institutionId}/add`, { credits: amount }),
    {
      onSuccess: () => qc.invalidateQueries(['institutionCredits']),
    }
  );
}