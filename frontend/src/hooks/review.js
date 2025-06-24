import { useQuery, useMutation } from '@tanstack/react-query';
import { reviewAPI } from '../api';

export const useReviewRequest = (id) =>
  useQuery({
    queryKey: ['reviewRequest', id],
    queryFn: () => reviewAPI.get(`/review-requests/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

export const useReplyReview = () =>
  useMutation(({ id, payload }) =>
    reviewAPI.post(`/review-requests/${id}/reply`, payload)
  );