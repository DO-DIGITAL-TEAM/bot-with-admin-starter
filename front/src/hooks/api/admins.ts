import { notifications } from '@mantine/notifications';
import { Admin, AdminDto } from '@/api/entities';
import {
  createDeleteMutationHook,
  createGetQueryHook,
  createPaginationQueryHook,
  createPatchMutationHook,
  createPostMutationHook,
} from '@/api/helpers';

const QUERY_KEY = 'admins';
const BASE_ENDPOINT = 'admins';

export const useGetAdmins = createPaginationQueryHook<typeof Admin>({
  endpoint: BASE_ENDPOINT,
  dataSchema: Admin,
  rQueryParams: { queryKey: [QUERY_KEY] },
});

export const useOneAdmin = createGetQueryHook<typeof Admin>({
  endpoint: `${BASE_ENDPOINT}/one/:id`,
  responseSchema: Admin,
  rQueryParams: { queryKey: [QUERY_KEY] },
});

export const useCreateAdmin = createPostMutationHook<typeof AdminDto, typeof Admin>({
  endpoint: 'auth/register',
  bodySchema: AdminDto,
  responseSchema: Admin,
  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      notifications.show({ title: 'Created', message: 'Admin created successfully!' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useUpdateAdmin = createPatchMutationHook<typeof AdminDto, typeof Admin>({
  endpoint: `${BASE_ENDPOINT}/update/:id`,
  bodySchema: AdminDto,
  responseSchema: Admin,
  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      notifications.show({ title: 'Updated', message: 'Admin updated successfully!' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useDeleteAdmin = createDeleteMutationHook<typeof Admin>({
  endpoint: `${BASE_ENDPOINT}/:id`,
  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      notifications.show({ title: 'Deleted', message: 'Admin deleted successfully!' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});
