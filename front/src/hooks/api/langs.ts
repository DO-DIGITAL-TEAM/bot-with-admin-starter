import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import { Lang, LangDto } from '@/api/entities';
import {
  createDeleteMutationHook,
  createGetQueryHook,
  createPaginationQueryHook,
  createPatchMutationHook,
  createPostMutationHook,
} from '@/api/helpers';

const QUERY_KEY = 'langs';
const BASE_ENDPOINT = 'admin/langs';

export const useGetLangs = createPaginationQueryHook<typeof Lang>({
  endpoint: `${BASE_ENDPOINT}/chunk`,
  dataSchema: Lang,
  rQueryParams: { queryKey: [QUERY_KEY] },
});

export const useGetAllLangs = createGetQueryHook({
  endpoint: `${BASE_ENDPOINT}/all`,
  responseSchema: z.array(Lang),
  rQueryParams: { queryKey: [QUERY_KEY, { variant: 'all' }] },
});

export const useOneLang = createGetQueryHook<typeof Lang>({
  endpoint: `${BASE_ENDPOINT}/one/:id`,
  responseSchema: Lang,
  rQueryParams: { queryKey: [QUERY_KEY] },
});

export const useCreateLang = createPostMutationHook<typeof LangDto, typeof Lang>({
  endpoint: `${BASE_ENDPOINT}/create`,
  bodySchema: LangDto,
  responseSchema: Lang,
  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      notifications.show({ title: 'Created', message: 'Language created successfully!' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useUpdateLang = createPatchMutationHook<typeof LangDto, typeof Lang>({
  endpoint: `${BASE_ENDPOINT}/update/:id`,
  bodySchema: LangDto,
  responseSchema: Lang,
  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      notifications.show({ title: 'Updated', message: 'Language updated successfully!' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useDeleteLang = createDeleteMutationHook<typeof Lang>({
  endpoint: `${BASE_ENDPOINT}/delete/:id`,
  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      notifications.show({ title: 'Deleted', message: 'Language deleted successfully!' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useDeleteBulkLangs = createPostMutationHook<z.ZodType<{ ids: number[] }>, z.ZodType<any>>({
  endpoint: `${BASE_ENDPOINT}/delete-bulk`,
  bodySchema: z.object({ ids: z.array(z.number()) }),
  responseSchema: z.any(),
  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      notifications.show({ title: 'Deleted', message: 'Languages deleted successfully!' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});
