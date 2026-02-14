import { Admin } from '@/api/entities';
import { createGetQueryHook } from '@/api/helpers';

export const useGetAccountInfo = createGetQueryHook({
  endpoint: '/account',
  responseSchema: Admin,
  rQueryParams: { queryKey: ['account'] },
});
