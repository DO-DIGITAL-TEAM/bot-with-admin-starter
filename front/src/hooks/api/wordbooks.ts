import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import { Wordbook, WordbookDto } from '@/api/entities';
import {
  createDeleteMutationHook,
  createGetQueryHook,
  createPaginationQueryHook,
  createPatchMutationHook,
  createPostMutationHook,
} from '@/api/helpers';

const QUERY_KEY = 'wordbooks';
const BASE_ENDPOINT = 'admin/wordbooks';

export const useGetWordbooks = createPaginationQueryHook<typeof Wordbook>({
  endpoint: `${BASE_ENDPOINT}/chunk`,
  dataSchema: Wordbook,
  rQueryParams: { queryKey: [QUERY_KEY] },
});

export const useOneWordbook = createGetQueryHook<typeof Wordbook>({
  endpoint: `${BASE_ENDPOINT}/one/:id`,
  responseSchema: Wordbook,
  rQueryParams: { queryKey: [QUERY_KEY] },
});

export const useCreateWordbook = createPostMutationHook<typeof WordbookDto, typeof Wordbook>({
  endpoint: `${BASE_ENDPOINT}/create`,
  bodySchema: WordbookDto,
  responseSchema: Wordbook,
  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      notifications.show({ title: 'Created', message: 'Wordbook created successfully!' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useUpdateWordbook = createPatchMutationHook<typeof WordbookDto, typeof Wordbook>({
  endpoint: `${BASE_ENDPOINT}/update/:id`,
  bodySchema: WordbookDto,
  responseSchema: Wordbook,
  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      notifications.show({ title: 'Updated', message: 'Wordbook updated successfully!' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useDeleteWordbook = createDeleteMutationHook<typeof Wordbook>({
  endpoint: `${BASE_ENDPOINT}/delete/:id`,
  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      notifications.show({ title: 'Deleted', message: 'Wordbook deleted successfully!' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useDeleteBulkWordbooks = createPostMutationHook<z.ZodType<{ ids: number[] }>, z.ZodType<any>>({
  endpoint: `${BASE_ENDPOINT}/delete-bulk`,
  bodySchema: z.object({ ids: z.array(z.number()) }),
  responseSchema: z.any(),
  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      notifications.show({ title: 'Deleted', message: 'Wordbooks deleted successfully!' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});
